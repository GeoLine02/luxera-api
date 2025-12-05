import { success } from "zod";
import sequelize from "../../db";
import ProductImages from "../../sequelize/models/productimages";
import ProductVariants from "../../sequelize/models/productvariants";
import { CreateProductPayload } from "../../types/products";
import { Request, Response } from "express";
import Products from "../../sequelize/models/products";

export async function CreateProductImagesService(
  data: CreateProductPayload,
  createdVariants: ProductVariants[],
  createdProduct: Products,
  req: Request,
  res: Response,
  isForUpdate: boolean = false
) {
  const { variantImagesMap = {} } = data;

  const transaction = await sequelize.transaction();

  try {
    const images: any[] = [];
    createdVariants.forEach((createdVariant, index) => {
      const baseUrl = `${req.protocol}://${req.get("host")}/uploads/`;
      const variantImages = variantImagesMap[index] || [];

      if (variantImages.length > 0) {
        variantImages.forEach((image) => {
          images.push({
            image: `${baseUrl}${image.filename}`,
            product_id: createdVariant.product_id,
            variant_id: createdVariant.id, // Use the actual variant ID from database
          });
        });
      }
    });

    if (images.length > 0) {
      await ProductImages.bulkCreate(images, { transaction });
      console.log(`Inserted ${images.length} variant images`);
    }
    await transaction.commit();
    return res.status(201).json({
      success: true,
      message: isForUpdate
        ? "Product Updated Sucessfully"
        : "Product Created Sucessfully",
      data: {
        product: createdProduct,
        variants: {
          data: createdVariants,
          images,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to create product images",
    });
  }
}
