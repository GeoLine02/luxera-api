import { ProductStatus } from "../../constants/enums";
import sequelize from "../../db";
import Categories from "../../sequelize/models/categories";
import Products from "../../sequelize/models/products";
import SubCategories from "../../sequelize/models/subcategories";
import { CreateProductPayload } from "../../types/products";
import { Request, Response } from "express";

export async function CreateSingleProductService(
  data: CreateProductPayload,
  req: Request,
  res: Response
) {
  const transaction = await sequelize.transaction();
  try {
    const shop = req.shop;
    const userId = req.user!.id;
    const { productDescription, productCategoryId, productSubCategoryId } =
      data;
    // Validate category & subcategory
    const category = await Categories.findByPk(productCategoryId);
    const subCategory = await SubCategories.findOne({
      where: { id: productSubCategoryId, category_id: productCategoryId },
    });

    if (!category || !subCategory) {
      return res.status(400).json({
        success: false,
        message: "Invalid category or subcategory",
      });
    }

    // 1️⃣ Create the main product
    if (shop!.id == undefined) {
      return res.status(400).json({
        success: false,
        message: "Shop not found",
      });
    }

    const createdProduct = await Products.create(
      {
        product_description: productDescription,
        product_rating: 0,
        product_status: ProductStatus.Pending,
        product_subcategory_id: subCategory.id,
        product_owner_id: userId,
        shop_id: shop!.id,
      },
      { transaction }
    );
    await transaction.commit();
    return createdProduct;
  } catch (e) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: "Unable to create product",
    });
  }
}
