import { Request, Response } from "express";
import sequelize from "../db";
import ProductVariants from "../sequelize/models/productvariants";

export async function createProductVarintsService(req: Request, res: Response) {
  const transaction = await sequelize.transaction();
  try {
    const { product_variants } = req.body;

    const productVariants = await ProductVariants.bulkCreate(product_variants);

    return res.status(201).json({
      success: true,
      data: productVariants,
    });
  } catch (error) {
    await transaction.rollback();
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Unable to Create product variant",
    });
  }
}

export async function updateProductVariantsService(
  req: Request,
  res: Response
) {
  const transaction = await sequelize.transaction();

  try {
    const { product_variants, id: productId } = req.body;

    if (!Array.isArray(product_variants)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "product_variants must be an array",
      });
    }

    for (const variant of product_variants) {
      // 🔒 update ONLY existing variants
      if (typeof variant.id !== "number") continue;

      await ProductVariants.update(
        {
          variant_name: variant.variant_name,
          variant_price: variant.variant_price,
          variant_quantity: variant.variant_quantity,
          variant_discount: variant.variant_discount,
        },
        {
          where: {
            id: variant.id,
            product_id: productId, // security check
          },
          transaction,
        }
      );
    }

    await transaction.commit();

    return res.json({
      success: true,
      message: "Product variants updated successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to update product variants",
    });
  }
}

export async function deleteProductVariantsService(
  req: Request,
  res: Response
) {
  const transaction = await sequelize.transaction();
  try {
    const deletedVariantIds = req.body.deletedVariantIds;

    const deletedVariants = await ProductVariants.destroy({
      where: deletedVariantIds,
    });
    return res.status(200).json({
      success: true,
      data: deletedVariants,
    });
  } catch (error) {
    await transaction.rollback();
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete product variants",
    });
  }
}
