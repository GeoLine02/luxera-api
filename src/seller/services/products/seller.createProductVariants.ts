import sequelize from "../../../db";
import Products from "../../../sequelize/models/products";
import ProductVariants from "../../../sequelize/models/productvariants";
import { CreateProductPayload } from "../../../types/products";
import { Request, Response } from "express";

export async function CreateProductVariantsService(
  data: CreateProductPayload,
  createdProduct: Products,
  req: Request,
  res: Response
) {
  const { variantsMetadata, variantImagesMap = {} } = data;

  if (
    !variantsMetadata ||
    variantsMetadata.length === 0 ||
    Object.keys(variantImagesMap).length === 0 ||
    !variantImagesMap
  ) {
    return res.status(400).json({
      success: false,
      message: "No variants provided",
    });
  }
  const transaction = await sequelize.transaction();
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}/uploads/`;
    const variantsToCreate = variantsMetadata.map((variant, index) => {
      const variantImages = variantImagesMap[index] || [];
      const primaryImage = variantImages[0]; // First image for THIS variant
      if (!primaryImage) {
        throw new Error(`Variant ${index} must have at least one image`);
      }

      return {
        variant_name: variant.variantName,
        variant_price: variant.variantPrice,
        variant_quantity: variant.variantQuantity,
        variant_discount: variant.variantDiscount,
        product_id: createdProduct.id,
        image: `${baseUrl}${primaryImage.filename}`, // ✅ Correct image per variant
      };
    });

    const createdVariants = await ProductVariants.bulkCreate(variantsToCreate, {
      returning: true,
      transaction,
    });

    // Add primary Variant to Products table for listings
    createdProduct.primary_variant_id = createdVariants[0].id;
    await createdProduct.save({ transaction });
    await transaction.commit();
    return createdVariants;
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to create product variants",
    });
  }
}
