import { Request, Response } from "express";
import sequelize from "../db";
import ProductImages from "../sequelize/models/productimages";

import { Transaction } from "sequelize";
import { CreateProductPayload } from "../types/products";
import ProductVariants from "../sequelize/models/productvariants";

export async function CreateProductImagesService(
  data: CreateProductPayload,
  createdVariants: ProductVariants[],
  req: Request,
  transaction: Transaction
) {
  const { variantImagesMap = {} } = data;
  const images: any[] = [];
  createdVariants.forEach((createdVariant, index) => {
    const baseUrl = `${req.protocol}://${req.get("host")}/uploads/`;
    const variantImages = variantImagesMap[index] || [];

    variantImages.forEach((image) => {
      images.push({
        image: `${baseUrl}${image.filename}`,
        product_id: createdVariant.product_id,
        variant_id: createdVariant.id,
      });
    });
  });

  if (images.length > 0) {
    await ProductImages.bulkCreate(images, { transaction });
  }

  // Do NOT commit here - controller manages transaction
  return images;
}

export async function deleteVariantImages(req: Request, res: Response) {
  const transaction = await sequelize.transaction();

  try {
    const { deletedImageIds } = req.body;

    if (!Array.isArray(deletedImageIds) || deletedImageIds.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "deletedImageIds must be a non-empty array",
      });
    }

    await ProductImages.destroy({
      where: {
        id: deletedImageIds,
      },
      transaction,
    });

    await transaction.commit();

    return res.json({
      success: true,
      message: "Variant image records deleted successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete variant image records",
    });
  }
}
