import sequelize from "../../../db";
import Categories from "../../../sequelize/models/categories";
import Products from "../../../sequelize/models/products";
import SubCategories from "../../../sequelize/models/subcategories";
import { ProductUpdatePayload } from "../../../types/products";
import { Request, Response } from "express";
export async function UpdateSingleProductService(
  data: ProductUpdatePayload,
  req: Request,
  res: Response
) {
  const userId = req.user!.id;
  const {
    productCategoryId,
    productSubCategoryId,
    productDescription,
    productId,
  } = data;

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: "Product ID is required",
    });
  }

  // 2️⃣ Validate category & subcategory if provided (read-only, no transaction)
  if (productCategoryId && productSubCategoryId) {
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
  }

  // 3️⃣ Check if product exists BEFORE transaction
  const existingProduct = await Products.findByPk(productId);
  if (!existingProduct) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  // 4️⃣ Validate ownership (security check)
  if (existingProduct.product_owner_id !== userId) {
    return res.status(403).json({
      success: false,
      message: "You don't have permission to update this product",
    });
  }

  // 5️⃣ NOW start transaction - all validations passed
  const transaction = await sequelize.transaction();

  try {
    // Prepare fields to update
    const fieldsToUpdate: any = {
      product_description: productDescription,
      product_category_id: productCategoryId,
      sub_category_id: productSubCategoryId,
      user_id: userId,
    };

    // Update product info
    if (Object.keys(fieldsToUpdate).length > 0) {
      await Products.update(fieldsToUpdate, {
        where: { id: productId },
        transaction,
      });
    }
    const updatedProduct = await Products.findByPk(productId);
    await transaction.commit();
    return updatedProduct;
  } catch (error) {
    await transaction.rollback();
    console.error("UpdateProductService error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update product",
    });
  }
}
