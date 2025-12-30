import { ProductStatus } from "../../../constants/enums";
import { NotFoundError } from "../../../errors/errors";
import Categories from "../../../sequelize/models/categories";
import Products from "../../../sequelize/models/products";
import SubCategories from "../../../sequelize/models/subcategories";
import { CreateProductPayload } from "../../../types/products";
import { Request, Response } from "express";
import { Transaction } from "sequelize";

export async function CreateSingleProductService(
  data: CreateProductPayload,
  req: Request,
  res: Response,
  transaction: Transaction
) {
  const shop = req.shop;
  const userId = req.user!.id;
  const { productDescription, productCategoryId, productSubCategoryId } = data;
  // Validate category & subcategory
  const category = await Categories.findByPk(productCategoryId);
  const subCategory = await SubCategories.findOne({
    where: { id: productSubCategoryId, category_id: productCategoryId },
    transaction,
  });

  if (!category || !subCategory) {
    throw new NotFoundError("Invalid category or subcategory");
  }

  // 1️⃣ Create the main product
  if (shop!.id == undefined) {
    throw new NotFoundError("Shop not found");
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

  // Do NOT commit here - controller will commit/rollback
  return { createdProduct };
}
