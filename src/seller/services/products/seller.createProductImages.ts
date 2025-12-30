import { success } from "zod";

import { Request } from "express";
import Products from "../../../sequelize/models/products";
import { CreateProductPayload } from "../../../types/products";
import ProductVariants from "../../../sequelize/models/productvariants";
import ProductImages from "../../../sequelize/models/productimages";
import { Transaction } from "sequelize";
import logger from "../../../logger";

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
    logger.info(`Inserted ${images.length} variant images`);
  }

  // Do NOT commit here - controller manages transaction
  return images;
}
