import { Transaction } from "sequelize";
import Products from "../../../sequelize/models/products";
import ProductVariants from "../../../sequelize/models/productvariants";
import {
  ProductUpdatePayload,
  VariantImageInput,
} from "../../../types/products";
import { Request, Response } from "express";
import {
  NotFoundError,
  ValidationError,
  BadRequestError,
} from "../../../errors/errors";
import {
  getImageBaseUrl,
  getRandomImageName,
} from "../../../constants/constants";
import logger from "../../../logger";
import { log } from "console";
import ProductImages from "../../../sequelize/models/productimages";
import { s3 } from "../../../app";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function UpdateProductVariantsService(
  data: ProductUpdatePayload, // assume variantsMetadata: Array<{ id?: number; id?: string; ... }>
  req: Request,
  transaction: Transaction,
) {
  const { variantsMetadata = [], variantImagesMap = {}, productId } = data;

  const results = {
    created: 0,
    updated: 0,
    deleted: 0,
  };

  // 1. Early ownership + product existence check (with lock)
  const product = await Products.findOne({
    where: { id: productId, product_owner_id: req.user!.id },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!product) {
    throw new BadRequestError("Product not found or you don't have permission");
  }

  // 2. Get existing variants
  const existingVariants = await ProductVariants.findAll({
    where: { product_id: productId },
    transaction,
  });

  const existingVariantIds = existingVariants.map((v) => v.id); // these are numbers (DB PKs)

  // 2. Get IDs of variants that are being updated (i.e., existing ones sent from frontend)
  const sentExistingIds = variantsMetadata
    .filter((v) => !v.isNew && typeof v.id === "number") // only existing ones
    .map((v) => v.id as number);

  // 3. Find variants to delete (were in DB but not sent back)
  const toDeleteIds = existingVariantIds.filter(
    (id) => !sentExistingIds.includes(id),
  );

  // 3. Delete removed variants + their images
  if (toDeleteIds.length > 0) {
    // Delete images first
    await ProductImages.destroy({
      where: { variant_id: toDeleteIds },
      transaction,
    });

    // Then delete variants
    results.deleted = await ProductVariants.destroy({
      where: { id: toDeleteIds },
      transaction,
    });
  }

  // 4. Separate create / update
  const toCreate = variantsMetadata.filter(
    (v) => v.isNew && typeof v.id === "string",
  );
  const toUpdate = variantsMetadata.filter(
    (v) => v.isNew === false && typeof v.id === "number",
  );
  console.log("to create variants: ", toCreate);
  console.log("to update variants", toUpdate);

  let createdVariants: ProductVariants[] = [];

  // 5. CREATE new variants
  if (toCreate.length > 0) {
    const payload = toCreate.map((variant) => {
      if (!variant.id) {
        throw new ValidationError([
          {
            field: "id",
            message: "id is required for new variants",
          },
        ]);
      }
      logger.info(`Creating new variant ${variant.id} `);

      return {
        product_id: productId,
        variant_name: variant.variantName,
        variant_price: variant.variantPrice,
        variant_quantity: variant.variantQuantity,
        variant_discount: variant.variantDiscount,
      };
    });

    createdVariants = await ProductVariants.bulkCreate(payload, {
      returning: true,
      transaction,
    });

    results.created += createdVariants.length;
  }

  // 6. UPDATE existing variants
  if (toUpdate.length > 0) {
    await Promise.all(
      toUpdate.map(async (variant) => {
        const existingVariant = await ProductVariants.findOne({
          where: { id: variant.id, product_id: productId },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!existingVariant) {
          throw new NotFoundError(`Variant with id ${variant.id} not found`);
        }
        logger.info(`Updating  variant ${variant.id} `);

        await existingVariant.update(
          {
            variant_name: variant.variantName,
            variant_price: variant.variantPrice,
            variant_quantity: variant.variantQuantity,
            variant_discount: variant.variantDiscount,
          },
          { transaction },
        );

        results.updated += 1;
      }),
    );
  }

  const imagesToInsert: any[] = [];

  for (let i = 0; i < toCreate.length; i++) {
    const metadata = toCreate[i];
    const id = metadata.id!;
    const dbVariant = createdVariants[i]; // same order

    const newImages = variantImagesMap[id];
    if (newImages?.length) {
      const uploaded = await uploadAndMapImages(
        newImages,
        productId,
        dbVariant.id,
      );
      imagesToInsert.push(...uploaded);
    }
  }

  // Process EXISTING (updated) variants (use id)
  for (const metadata of toUpdate) {
    const variantId = metadata.id!;
    const dbVariant = await ProductVariants.findOne({
      where: { id: variantId, product_id: productId },
      transaction,
    });

    if (!dbVariant) continue;

    const newImages = variantImagesMap[variantId];
    console.log(`new images for variant ${dbVariant.id}  `, newImages);
    if (newImages?.length) {
      const uploaded = await uploadAndMapImages(
        newImages,
        productId,
        dbVariant.id,
      );

      imagesToInsert.push(...uploaded);
    }
  }
  console.log("Images to insert", imagesToInsert);
  if (imagesToInsert.length > 0) {
    const images = await ProductImages.bulkCreate(imagesToInsert, {
      transaction,
    });
    results.created += images.length;
  }
  return results;
}
async function uploadAndMapImages(
  images: VariantImageInput[],
  productId: number,
  variantId: number,
) {
  return await Promise.all(
    images.map(async (img) => {
      const s3key = getRandomImageName();
      if (!img.file?.buffer) {
        throw new BadRequestError(`Missing file buffer for image upload`);
      }

      try {
        await s3.send(
          new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: s3key,
            Body: img.file.buffer,
            ContentType: img.file.mimetype,
          }),
        );
        logger.info(`created new image for variant ${variantId}`);
      } catch (error) {
        throw new Error("Failed to Upload Images to S3 bucket");
      }

      return {
        s3_key: s3key,
        product_id: productId,
        variant_id: variantId,
        is_primary: img.isPrimary,
      };
    }),
  );
}

// Final insert
