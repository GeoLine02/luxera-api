import { getImageBaseUrl } from "../../../constants/constants";
import ProductImages from "../../../sequelize/models/productimages";
import { ProductUpdatePayload } from "../../../types/products";
import { Request } from "express";
import { Transaction } from "sequelize";

export async function updateProductImagesService(
  req: Request,
  data: ProductUpdatePayload,
  createdVariants: Array<{ id: number; _originalIndex: number }>,
  updatedVariants: Array<{ id: number; _originalIndex: number }>,
  transaction: Transaction
) {
  const { deletedImageIds, variantImagesMap = {}, productId } = data;
  const results = { deleted: 0, created: 0 };

  // 1. Delete marked images (user explicitly deleted them)
  if (deletedImageIds && deletedImageIds?.length > 0) {
    results.deleted = await ProductImages.destroy({
      where: { id: deletedImageIds, product_id: productId },
      transaction,
    });
  }

  // 2. Add new images (for both new and existing variants)
  const allNewImages: any[] = [];

  const allVariants = [...(createdVariants || []), ...(updatedVariants || [])];

  for (const variant of allVariants) {
    const originalIndex = variant._originalIndex;
    const images = variantImagesMap[originalIndex];

    if (images?.length > 0) {
      images.forEach((image) => {
        allNewImages.push({
          image: `${getImageBaseUrl(req)}${image.filename}`,
          product_id: productId,
          variant_id: variant.id,
        });
      });
    }
  }

  if (allNewImages.length > 0) {
    await ProductImages.bulkCreate(allNewImages, { transaction });
    results.created = allNewImages.length;
  }

  return results;
}
