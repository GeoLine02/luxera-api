import { Transaction } from "sequelize";
import Products from "../../../sequelize/models/products";
import ProductVariants from "../../../sequelize/models/productvariants";
import { ProductUpdatePayload } from "../../../types/products";
import { Request, Response } from "express";
import {
  NotFoundError,
  ValidationError,
  BadRequestError,
} from "../../../errors/errors";
import { getImageBaseUrl } from "../../../constants/constants";
import logger from "../../../logger";
import { log } from "console";

export async function UpdateProductVariantsService(
  data: ProductUpdatePayload,
  req: Request,
  res: Response,
  transaction: Transaction
) {
  const { variantImagesMap = {}, variantsMetadata = [], productId } = data;
  const results = {
    updated: 0,
    deleted: 0,
    created: 0,
  };

  // Separate toCreate and toUpdate
  const existingVariants = await ProductVariants.findAll({
    where: { product_id: productId },
    transaction,
  });
  const existingVariantIds = existingVariants.map((v) => v.id);
  const sentIds = variantsMetadata
    .filter((v) => v.id)
    .map((v) => v.id!) as number[];
  const toDeleteIds = existingVariantIds.filter((id) => !sentIds.includes(id));

  // Delete variants that were removed
  if (toDeleteIds.length > 0) {
    results.deleted = await ProductVariants.destroy({
      where: { id: toDeleteIds, product_id: productId },
      transaction,
    });
  }
  const toCreate = variantsMetadata.filter((v) => v.id == undefined);
  const toUpdate = variantsMetadata.filter((v) => v.id !== undefined);

  // Ownership & product existence check (within the same transaction)
  const product = await Products.findOne({
    where: { id: productId, product_owner_id: req.user!.id },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  if (!product) {
    throw new BadRequestError("Product not found or you don't have permission");
  }

  // handle created ones
  const productVariantPayload = toCreate.map((variant) => {
    const variantImages = variantImagesMap[variant.tempId!] || [];
    if (variantImages.length === 0) {
      throw new ValidationError([
        {
          field: `variantImage_${variant.tempId}`,
          message: `Images not found for variant ${variant.tempId}`,
        },
      ]);
    }

    const primaryImage = variantImages.find((img) => img.isPrimary);
    if (!primaryImage) {
      throw new ValidationError([
        {
          field: `primaryImage_${variant.tempId}`,
          message: `Primary image not found for variant ${variant.tempId}`,
        },
      ]);
    }

    return {
      tempId: variant.tempId,
      image: `${getImageBaseUrl(req)}${primaryImage.file?.filename}`,
      product_id: productId,
      variant_discount: variant.variantDiscount,
      variant_name: variant.variantName,
      variant_price: variant.variantPrice,
      variant_quantity: variant.variantQuantity,
    } as any;
  });

  let createdVariantMappings: { id: number; tempId?: string }[] = [];
  if (productVariantPayload.length > 0) {
    const createdVariants = await ProductVariants.bulkCreate(
      productVariantPayload,
      {
        returning: true,
        transaction,
      }
    );

    results.created = createdVariants.length;
    createdVariantMappings = createdVariants.map((variant, index) => ({
      id: variant.id,
      tempId: productVariantPayload[index].tempId,
    }));
  }

  // handle updated ones (use row-level locks and transaction)

  for (const variant of toUpdate) {
    const existingVariant = await ProductVariants.findOne({
      where: { id: variant.id, product_id: productId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!existingVariant) {
      throw new NotFoundError("Variant Not Found");
    }

    let primaryImageUrl = existingVariant.image;

    if (
      variantImagesMap[variant.id!] &&
      variantImagesMap[variant.id!].length > 0
    ) {
      const primaryImage = variantImagesMap[variant.id!].find(
        (img) => img.isPrimary
      );
      if (primaryImage) {
        primaryImageUrl = `${getImageBaseUrl(req)}${
          primaryImage?.file?.filename
        }`;
      }
    }

    const toUpdatePayload = {
      image: primaryImageUrl,
      product_id: productId,
      variant_discount: variant.variantDiscount,
      variant_name: variant.variantName,
      variant_price: variant.variantPrice,
      variant_quantity: variant.variantQuantity,
    };
    await existingVariant.update(toUpdatePayload, { transaction });
    results.updated += 1;
  }

  // Do NOT commit here - controller should manage transaction
  return {
    createdVariants: createdVariantMappings,
    updatedVariants: toUpdate,
    results,
  };
}
