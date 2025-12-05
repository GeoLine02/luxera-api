import sequelize from "../../db";
import Products from "../../sequelize/models/products";
import ProductVariants from "../../sequelize/models/productvariants";
import { ProductUpdatePayload } from "../../types/products";
import { Request, Response } from "express";
export async function UpdateProductVariantsService(
  data: ProductUpdatePayload,
  req: Request,
  res: Response
) {
  const { variantImagesMap = {}, variantsMetadata, productId } = data;
  if (!variantsMetadata && !variantImagesMap) {
    return res.status(400).json({
      success: false,
      message: "No variants provided",
    });
  }
  const transaction = await sequelize.transaction();

  // Validate each variant has images
  try {
    variantsMetadata.forEach((_, index) => {
      const variantImages = variantImagesMap[index] || [];
      if (!variantImages[0]) {
        throw new Error(`Variant ${index} must have at least one image`);
      }
    });

    // Delete all existing variants (cascade will delete variant images)
    await ProductVariants.destroy({
      where: { product_id: productId },
      transaction,
    });

    // Create new variants with primary images
    const variantsToCreate = variantsMetadata.map((variant, index) => {
      const baseUrl = `${req.protocol}://${req.get("host")}/uploads/`;
      const variantImages = variantImagesMap[index] || [];
      const primaryImage = variantImages[0];

      return {
        variant_name: variant.variantName,
        variant_price: variant.variantPrice,
        variant_quantity: variant.variantQuantity,
        variant_discount: variant.variantDiscount || 0,
        product_id: productId,
        image: `${baseUrl}${primaryImage.filename}`,
      };
    });

    const newVariants = await ProductVariants.bulkCreate(variantsToCreate, {
      returning: true,
      transaction,
    });

    // Update primary variant
    await Products.update(
      { primary_variant_id: newVariants[0].id },
      { where: { id: productId }, transaction }
    );
    await transaction.commit();

    return newVariants;
  } catch (error) {
    await transaction.rollback();
    console.error("UpdateProductVariants error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update product variants",
    });
  }
}
