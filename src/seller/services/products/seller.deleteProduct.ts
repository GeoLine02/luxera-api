import { Request, Response } from "express";
import Products from "../../../sequelize/models/products";
import sequelize from "../../../db";

export async function DeleteProductService(productId: number, res: Response) {
  if (!productId) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }
  const transaction = await sequelize.transaction();
  try {
    const deletedProduct = await Products.destroy({
      where: { id: productId },
      transaction,
    });
    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    await transaction.commit();
    return res.status(204).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete product",
    });
  }
}
