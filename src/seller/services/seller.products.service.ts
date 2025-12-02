import { Op } from "sequelize";
import sequelize from "../../db";
import Categories from "../../sequelize/models/categories";
import ProductImages from "../../sequelize/models/productimages";
import Products from "../../sequelize/models/products";
import ProductVariants from "../../sequelize/models/productvariants";
import SubCategories from "../../sequelize/models/subcategories";
import {
  CreateProductPayload,
  ProductUpdatePayload,
} from "../../types/products";
import { Request, Response } from "express";
import { ProductStatus } from "../../constants/enums";

export async function CreateProductService(
  data: CreateProductPayload,
  req: Request,
  res: Response
) {
  const transaction = await sequelize.transaction();
  try {
    const shop = req.shop;
    const {
      productDescription,
      productCategoryId,
      subCategoryId,
      variantsMetadata,
      variantImagesMap = {},
      userId,
    } = data;
    // Validate category & subcategory
    const category = await Categories.findByPk(productCategoryId);

    const subCategory = await SubCategories.findOne({
      where: { id: subCategoryId, category_id: productCategoryId },
    });

    if (!category || !subCategory) {
      return res.status(400).json({
        success: false,
        message: "Invalid category or subcategory",
      });
    }
    // Base URL for images
    const baseUrl = `${req.protocol}://${req.get("host")}/uploads/`;
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

    if (variantsMetadata && variantsMetadata.length > 0) {
      const variantsToCreate = variantsMetadata.map((variant, index) => {
        const variantImages = variantImagesMap[variant.index] || [];
        const primaryImage = variantImages[0]; // First image for THIS variant
        if (!primaryImage) {
          throw new Error(`Variant ${index} must have at least one image`);
        }

        return {
          variant_name: variant.variantName,
          variant_price: variant.variantPrice,
          variant_quantity: variant.variantQuantity,
          variant_discount: variant.variantDiscount,
          product_id: createdProduct.id,
          image: `${baseUrl}${primaryImage.filename}`, // ✅ Correct image per variant
        };
      });
      const createdVariants = await ProductVariants.bulkCreate(
        variantsToCreate,
        {
          returning: true,
          transaction,
        }
      );

      // Add primary Variant to Products table for listings
      createdProduct.primary_variant_id = createdVariants[0].id;
      await createdProduct.save({ transaction });

      // 4️⃣ Insert variant images into ProductImages table
      const images: any[] = [];
      createdVariants.forEach((createdVariant, index) => {
        const variantMeta = variantsMetadata[index];
        const variantImages = variantImagesMap[variantMeta.index] || [];

        if (variantImages.length > 0) {
          variantImages.forEach((image) => {
            images.push({
              image: `${baseUrl}${image.filename}`,
              product_id: createdVariant.product_id,
              variant_id: createdVariant.id, // Use the actual variant ID from database
            });
          });
        }
      });
      if (images.length > 0) {
        await ProductImages.bulkCreate(images, { transaction });
        console.log(`Inserted ${images.length} variant images`);
      }
      await transaction.commit();
      return {
        product: createdProduct,
        variants: {
          data: createdVariants,
          images,
        },
      };
    }
    return {
      product: createdProduct,
      variants: {
        data: [],
        images: [],
      },
    };
  } catch (error) {
    await transaction.rollback();
    console.error("CreateProductService error:", error);
    throw new Error("Unable to create product");
  }
}

export async function UpdateProductService(
  data: ProductUpdatePayload,
  req: Request,
  res: Response
) {
  // 1️⃣ Validate required data BEFORE any DB operations
  const {
    productCategoryId,
    subCategoryId,
    productDescription,
    productStatus,
    productName,
    productId,
    userId,
    variantsMetadata,
    variantImagesMap = {},
  } = data;

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: "Product ID is required",
    });
  }

  // 2️⃣ Validate category & subcategory if provided (read-only, no transaction)
  if (productCategoryId && subCategoryId) {
    const category = await Categories.findByPk(productCategoryId);
    const subCategory = await SubCategories.findOne({
      where: { id: subCategoryId, category_id: productCategoryId },
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
    const baseUrl = `${req.protocol}://${req.get("host")}/uploads/`;

    // Prepare fields to update
    const fieldsToUpdate: any = {
      product_name: productName,
      product_description: productDescription,
      product_status: productStatus,
      product_category_id: productCategoryId,
      sub_category_id: subCategoryId,
      user_id: userId,
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach((key) => {
      if (fieldsToUpdate[key as keyof typeof fieldsToUpdate] === undefined) {
        delete fieldsToUpdate[key as keyof typeof fieldsToUpdate];
      }
    });

    // Update product info
    if (Object.keys(fieldsToUpdate).length > 0) {
      await Products.update(fieldsToUpdate, {
        where: { id: productId },
        transaction,
      });
    }

    // Handle variants update
    if (variantsMetadata && variantsMetadata.length > 0) {
      // Validate each variant has images
      variantsMetadata.forEach((variant, index) => {
        const variantImages = variantImagesMap[variant.index] || [];
        if (!variantImages[0]) {
          throw new Error(`Variant ${index + 1} must have at least one image`);
        }
      });

      // Delete all existing variants (cascade will delete variant images)
      await ProductVariants.destroy({
        where: { product_id: productId },
        transaction,
      });

      // Create new variants with primary images
      const variantsToCreate = variantsMetadata.map((variant, index) => {
        const variantImages = variantImagesMap[variant.index] || [];
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

      // Handle variant images
      if (Object.keys(variantImagesMap).length > 0) {
        const images: any[] = [];

        newVariants.forEach((newVariant, index) => {
          const variantMeta = variantsMetadata[index];
          const variantImages = variantImagesMap[variantMeta.index] || [];

          variantImages.forEach((image) => {
            images.push({
              image: `${baseUrl}${image.filename}`,
              product_id: productId,
              variant_id: newVariant.id,
            });
          });
        });

        if (images.length > 0) {
          await ProductImages.bulkCreate(images, { transaction });
        }
      }

      // ✅ Commit transaction
      await transaction.commit();

      console.log("Product updated successfully:", {
        productId,
        variantCount: newVariants.length,
      });

      // Fetch updated data
      const updatedProduct = await Products.findByPk(productId);
      const updatedImages = await ProductImages.findAll({
        where: { product_id: productId },
      });

      return {
        product: updatedProduct,

        variants: {
          data: newVariants,
          images: await ProductImages.findAll({
            where: { product_id: productId, variant_id: { [Op.ne]: null } },
          }),
        },
      };
    }

    // No variants to update, just commit product changes
    await transaction.commit();

    console.log("Product updated successfully (no variants):", { productId });

    // Fetch updated data
    const updatedProduct = await Products.findByPk(productId);
    return {
      product: updatedProduct,

      variants: {
        data: [],
        images: [],
      },
    };
  } catch (error) {
    // ✅ CRITICAL: Rollback transaction on error
    await transaction.rollback();

    console.error("UpdateProductService error:", error);

    // ✅ Throw original error
    throw error;
  }
}

export async function DeleteProductService(productId: number, res: Response) {
  try {
    const deletedProduct = await Products.destroy({ where: { id: productId } });
    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    return deletedProduct;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function GetSellerProductsService(req: Request) {
  try {
    sequelize.authenticate();
    const shop = req.shop;
    if (!shop!.id) {
      throw new Error("Shop not found");
    }
    const sellerProducts = await Products.findAll({
      where: {
        shop_id: shop!.id,
      },
      attributes: [
        "id",
        "product_status",
        "product_name",
        "product_description",
        "product_rating",
      ],
      include: [
        {
          model: ProductVariants,
          as: "variants",
          attributes: [
            "id",
            "variant_name",
            "variant_price",
            "variant_quantity",
            "variant_discount",
            "image",
          ],
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
    });
    return sellerProducts;
  } catch (error) {
    console.log("GetSellerProductsService error:", error);
    throw error;
  }
}
