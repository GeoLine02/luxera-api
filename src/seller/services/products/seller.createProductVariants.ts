import { Transaction } from "sequelize";
import logger from "../../../logger";
import ProductImages from "../../../sequelize/models/productimages";
import Products from "../../../sequelize/models/products";
import { CreateProductPayload } from "../../../types/products";
import { BadRequestError } from "../../../errors/errors";
import ProductVariants from "../../../sequelize/models/productvariants";
import { getRandomImageName } from "../../../constants/constants";
import { s3 } from "../../../app";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function CreateProductVariantsService(
  data: CreateProductPayload,
  createdProduct: Products,
  transaction: Transaction,
) {
  const { variantsMetadata = [], variantImagesMap = {} } = data;

  if (variantsMetadata.length === 0) {
    return { createdVariants: [], imagesInserted: 0 };
  }

  // Phase 1: Prepare and create variants (no images yet)
  const variantsToCreate = variantsMetadata.map((variant) => {
    if (!variant.tempId) {
      throw new BadRequestError(
        "Each variant must have a temporary ID (tempId)",
      );
    }

    return {
      variant_name: variant.variantName,
      variant_price: variant.variantPrice,
      variant_quantity: variant.variantQuantity,
      variant_discount: variant.variantDiscount,
      product_id: createdProduct.id,
    };
  });

  const createdVariants = await ProductVariants.bulkCreate(variantsToCreate, {
    returning: true,
    transaction,
  });

  // Phase 2: Upload ALL images (primary + additional) using index matching
  const imagesToInsert: any[] = [];

  await Promise.all(
    createdVariants.map(async (createdVariant, index) => {
      const originalVariant = variantsMetadata[index];
      if (!originalVariant?.tempId) return;

      const variantImages = variantImagesMap[originalVariant.tempId] || [];
      if (variantImages.length === 0) return;

      // Upload every image for this variant
      const uploadedImages = await Promise.all(
        variantImages.map(async (image) => {
          // Only upload if there's actual file data
          if (!image.file?.buffer) {
            throw new BadRequestError(
              `Missing file buffer for variant ${originalVariant.tempId}`,
            );
          }

          const s3key = getRandomImageName();
          const params = {
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: s3key,
            Body: image.file.buffer,
            ContentType: image.file.mimetype,
          };

          await s3.send(new PutObjectCommand(params));
          return {
            s3_key: s3key,
            product_id: createdProduct.id,
            variant_id: createdVariant.id,
            is_primary: image.isPrimary || false,
          };
        }),
      );
      imagesToInsert.push(...uploadedImages);
    }),
  );

  // Bulk insert all images
  if (imagesToInsert.length > 0) {
    await ProductImages.bulkCreate(imagesToInsert, { transaction });
    logger.info(`Inserted ${imagesToInsert.length} variant images`);
  }

  // Set first variant as primary for product preview
  if (createdVariants.length > 0) {
    createdProduct.primary_variant_id = createdVariants[0].id;
    await createdProduct.save({ transaction });
  }

  return { createdVariants, imagesInserted: imagesToInsert.length };
}
