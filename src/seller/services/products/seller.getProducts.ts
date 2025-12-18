import { Request, Response } from "express";
import ProductVariants from "../../../sequelize/models/productvariants";
import sequelize from "../../../db";
import Products from "../../../sequelize/models/products";
import ProductImages from "../../../sequelize/models/productimages";

export async function GetSellerProductsService(req: Request, res: Response) {
  const transaction = await sequelize.transaction();
  try {
    const shop = req.shop;
    if (!shop!.id) {
      throw new Error("Shop not found");
    }
    const sellerProducts = await Products.findAll({
      where: {
        shop_id: shop!.id,
      },
      order: [["id", "ASC"]],

      include: [
        {
          model: ProductVariants,
          as: "primaryVariant",

          required: false,
          include: [
            {
              model: ProductImages,
              required: false,
              as: "images",
              attributes: ["id", "image"],
            },
          ],
        },
      ],
      transaction,
    });
    await transaction.commit();
    return res.status(200).json({
      success: true,
      data: sellerProducts,
    });
  } catch (error) {
    console.log("GetSellerProductsService error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch seller products",
    });
  }
}
