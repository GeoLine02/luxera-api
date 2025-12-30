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

export async function UpdateProductVariantsService(
  data: ProductUpdatePayload,
  req: Request,
  res: Response,
  transaction: Transaction
) {
  const {
    variantImagesMap = {},
    variantsMetadata = [],
    productId,
    deletedVariantIds,
  } = data;
  const results = {
    updated: 0,
    deleted: 0,
    created: 0,
  };

  // Attach original indices to avoid object identity issues
  const variantsWithIndex = variantsMetadata.map((v, i) => ({
    ...v,
    _originalIndex: i,
  }));
  const toCreate = variantsWithIndex.filter((v) => !v.id);
  const toUpdate = variantsWithIndex.filter((v) => v.id);

  // Ownership & product existence check (within the same transaction)
  const product = await Products.findOne({
    where: { id: productId, product_owner_id: req.user!.id },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  if (!product) {
    throw new BadRequestError("Product not found or you don't have permission");
  }

  // handle deleted variants (use transaction)
  if (deletedVariantIds && deletedVariantIds.length > 0) {
    const deletedCount = await ProductVariants.destroy({
      where: {
        product_id: productId,
        id: deletedVariantIds,
      },
      transaction,
    });
    results.deleted = deletedCount;
  }

  // handle created ones
  const productVariantPayload = toCreate.map((variant) => {
    const index = variant._originalIndex;
    const variantImages = variantImagesMap[index];
    if (!variantImages || variantImages.length === 0) {
      throw new ValidationError(
        [
          {
            field: `variants[${index}].images`,
            message: "At least one image required for new variant",
          },
        ],
        "Missing images"
      );
    }
    const primaryImage = variantImages[0]; // First image for THIS variant
    return {
      image: `${getImageBaseUrl(req)}${primaryImage.filename}`,
      product_id: productId,
      variant_discount: variant.variantDiscount,
      variant_name: variant.variantName,
      variant_price: variant.variantPrice,
      variant_quantity: variant.variantQuantity,
    } as any;
  });
  let createdWithIndices: any[] = [];
  if (productVariantPayload.length > 0) {
    const createdVariants = await ProductVariants.bulkCreate(
      productVariantPayload,
      {
        returning: true,
        transaction,
      }
    );
    results.created = createdVariants.length;
    createdWithIndices = createdVariants.map((v, i) => ({
      ...v.toJSON(),
      _originalIndex: toCreate[i]._originalIndex,
    }));
  }

  // handle updated ones (use row-level locks and transaction)
  const updatedWithIndices: any[] = [];
  for (const variant of toUpdate) {
    const index = variant._originalIndex;
    const existingVariant = await ProductVariants.findOne({
      where: { id: variant.id, product_id: productId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!existingVariant) {
      throw new NotFoundError("Variant Not Found");
    }

    let primaryImageUrl = existingVariant.image;
    if (variantImagesMap[index] && variantImagesMap[index].length > 0) {
      primaryImageUrl = `${getImageBaseUrl(req)}${
        variantImagesMap[index][0].filename
      }`;
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
    updatedWithIndices.push({
      id: existingVariant.id,
      _originalIndex: variant._originalIndex,
    });
  }

  // Do NOT commit here - controller should manage transaction
  return {
    createdVariants: createdWithIndices,
    updatedVariants: updatedWithIndices,
    results,
  };
}
