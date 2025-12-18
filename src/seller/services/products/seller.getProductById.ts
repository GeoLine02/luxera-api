import { Request, Response } from "express";
import Products from "../../../sequelize/models/products";
import ProductImages from "../../../sequelize/models/productimages";
import ProductVariants from "../../../sequelize/models/productvariants";

export async function getSellerProductByIdService(req: Request, res: Response) {
  try {
    const productId = Number(req.params.id);
    const product = await Products.findOne({
      where: { id: productId },
      include: [
        {
          model: ProductVariants,
          as: "variants",
          include: [{ model: ProductImages, as: "images" }],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
