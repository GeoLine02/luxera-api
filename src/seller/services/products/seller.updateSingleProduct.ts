import { Transaction } from "sequelize";
import { BadRequestError, NotFoundError } from "../../../errors/errors";
import Categories from "../../../sequelize/models/categories";
import Products, {
  ProductUpdateAttributes,
} from "../../../sequelize/models/products";
import SubCategories from "../../../sequelize/models/subcategories";
import { ProductUpdatePayload } from "../../../types/products";
import { Request, Response } from "express";
import { ProductStatus } from "../../../constants/enums";
export async function UpdateSingleProductService(
  data: ProductUpdatePayload,
  req: Request,
  res: Response,
  transaction: Transaction,
) {
  const userId = req.user!.id;
  const {
    productCategoryId,
    productSubCategoryId,
    productDescription,
    productId,
  } = data;

  // 2️⃣ Validate category & subcategory if provided (read-only, no transaction)

  const category = await Categories.findByPk(productCategoryId);
  const subCategory = await SubCategories.findOne({
    where: { id: productSubCategoryId, category_id: productCategoryId },
  });

  if (!category || !subCategory) {
    throw new NotFoundError("Invalid category or subcategory");
  }

  // 3️⃣ Check if product exists BEFORE transaction
  const existingProduct = await Products.findByPk(productId);
  if (!existingProduct) {
    throw new NotFoundError("Product not found");
  }

  // 4️⃣ Validate ownership (security check)
  if (
    existingProduct.product_owner_id !== userId ||
    existingProduct.shop_id !== req.shop!.id
  ) {
    throw new BadRequestError(
      "You don't have permission to update this product",
    );
  }

  // Prepare fields to update
  const fieldsToUpdate: ProductUpdateAttributes = {
    product_description: productDescription,
    product_subcategory_id: productSubCategoryId,
    product_status: ProductStatus.Pending,
  };

  // Update product info
  if (Object.keys(fieldsToUpdate).length > 0) {
    await existingProduct.update(fieldsToUpdate, { transaction });
  }
  // Do NOT commit here - controller manages the transaction
  return { existingProduct };
}
