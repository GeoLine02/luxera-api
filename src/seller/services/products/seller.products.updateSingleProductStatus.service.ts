import { Request, Response } from "express";
import { ProductStatus } from "../../../constants/enums";
import { ProductUpdateStatusPayload } from "../../../types/products";
import sequelize from "../../../db";
import Products from "../../../sequelize/models/products";
export async function UpdateSingleProductStatusService(
  data: ProductUpdateStatusPayload,
  req: Request,
  res: Response
) {
  const { productId, status } = data;

  console.log(Object.values(ProductStatus));
  // validate status
  if (!Object.values(ProductStatus).includes(status as any)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product status",
    });
  }

  const transaction = await sequelize.transaction();
  try {
    const userId = req.user!.id;
    // validate ownership
    const productOwner = await Products.findOne({
      where: { id: productId, product_owner_id: userId },
      transaction,
    });
    if (!productOwner) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this product",
      });
    }
    const product = await Products.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    // update product status
    await Products.update(
      { product_status: status },
      { where: { id: productId }, transaction }
    );
    await transaction.commit();
    return res.status(200).json({
      success: true,
      message: "Product status updated successfully",
      data: [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to update product status",
    });
  }
}
