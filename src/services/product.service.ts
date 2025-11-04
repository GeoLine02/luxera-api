import { Op } from "sequelize";
import sequelize from "../db";
import {
  Categories,
  Products,
  SubCategories,
} from "../sequelize/models/associate";
import ProductImages from "../sequelize/models/productimages";
import { Request } from "express";
import ProductVariants from "../sequelize/models/productvariants";

export async function AllProductsService() {
  try {
    sequelize.authenticate();

    const products = await Products.findAll();

    return products;
  } catch (error) {
    console.log(error);
    throw new Error("Unable to fetch products");
  }
}

export async function VipProductsService() {
  try {
    sequelize.authenticate();

    const vipProducts = await Products.findAll({
      where: {
        product_status: "vip",
      },
    });

    return vipProducts;
  } catch (error) {
    console.log(error);
    throw new Error("Unable to fetch vip products");
  }
}

export async function FeaturedProductsService() {
  try {
    sequelize.authenticate();
    const featuredProducts = await Products.findAll({
      where: {
        product_price: {
          [Op.gt]: 100,
        },
      },
    });

    return featuredProducts;
  } catch (error) {
    console.log(error);
    throw new Error("Unable to fetch featured products");
  }
}

interface VariantsMetadata {
  index: number;
  variantName: string;
  variantPrice: number;
  variantQuantity: number;
  variantDiscount: number;
  product_id: number;
}

interface ProductPayload {
  productCategoryId: number;
  subCategoryId: number;
  productDescription: string;
  productPreviewImages: Express.Multer.File[];
  productQuantity: number;
  productDiscount: number;
  productName: string;
  productPrice: number;
  variantsMetadata: VariantsMetadata[];
  userId: number;
}

export async function CreateProductService(
  data: ProductPayload,
  req: Request,
  variantImagesMap: Record<string, Express.Multer.File[]> = {}
) {
  try {
    const shop = req.shop;
    const {
      productName,
      productDescription,
      productCategoryId,
      subCategoryId,
      productPrice,
      productQuantity,
      productPreviewImages,
      productDiscount,
      variantsMetadata,
      userId,
    } = data;

    // Validate category & subcategory
    const category = await Categories.findByPk(productCategoryId);
    const subCategory = await SubCategories.findOne({
      where: { id: subCategoryId, categoryId: productCategoryId },
    });

    if (!category || !subCategory) {
      throw new Error("Invalid category or subcategory");
    }

    // Base URL for images
    const baseUrl = `${req.protocol}://${req.get("host")}/uploads/`;

    // 1️⃣ Create the main product
    const createdProduct = await Products.create({
      product_name: productName,
      product_description: productDescription,
      product_price: productPrice || 0,
      product_quantity: productQuantity || 0,
      product_discount: productDiscount || 0,
      product_rating: 0,
      product_status: "active",
      product_subcategory_id: subCategory.id,
      product_owner_id: userId,
      product_image: `${baseUrl}${productPreviewImages[0].filename}`,
      shop_id: shop!.id,
    });

    if (!createdProduct) {
      throw new Error("Failed to create product");
    }

    const images = productPreviewImages.map((image, index) => ({
      image: `${baseUrl}${image.filename}`,
      productId: createdProduct.id,
      variant_id: index + 1,
    }));

    await ProductImages.bulkCreate(images);

    if (variantsMetadata && variantsMetadata.length > 0) {
      const variantsToCreate = variantsMetadata.map((variant) => ({
        variantName: variant.variantName,
        variantPrice: variant.variantPrice,
        variantQuantity: variant.variantQuantity,
        variantDiscount: variant.variantDiscount,
        product_id: createdProduct.id,
      }));

      const createdVariants = await ProductVariants.bulkCreate(
        variantsToCreate,
        {
          returning: true, // Important: Get the created variants with their IDs
        }
      );

      // 4️⃣ Insert variant images into ProductImages table
      const allVariantImages: any[] = [];

      createdVariants.forEach((createdVariant, index) => {
        const variantMeta = variantsMetadata[index];
        const variantImages = variantImagesMap[variantMeta.index] || [];

        if (variantImages.length > 0) {
          variantImages.forEach((image) => {
            allVariantImages.push({
              image: `${baseUrl}${image.filename}`,
              productId: createdProduct.id,
              variant_id: createdVariant.id, // Use the actual variant ID from database
            });
          });
        }
      });

      if (allVariantImages.length > 0) {
        await ProductImages.bulkCreate(allVariantImages);
        console.log(`Inserted ${allVariantImages.length} variant images`);
      }
    }

    return createdProduct;
  } catch (error) {
    console.error("CreateProductService error:", error);
    throw new Error("Unable to create product");
  }
}

// export async function UpdateProductService(data: ProductPayload, req: Request) {
//   try {
//     const baseUrl = `${req.protocol}://${req.get("host")}/uploads/`;

//     const imageUrls = data.productImages.map(
//       (file) => `${baseUrl}${file.filename}`
//     );

//     const fieldsToUpdate = {
//       product_name: data.productName,
//       product_description: data.productDescription,
//       product_price: data.productPrice,
//       product_status: data.productStatus,
//       product_category_id: data.productCategoryId,
//       sub_category_id: data.subCategoryId,
//       product_image: `${baseUrl}${data.productImages[0].filename}`,
//       user_id: data.userId,
//     };

//     // Remove undefined fields
//     Object.keys(fieldsToUpdate).forEach((key) => {
//       if (fieldsToUpdate[key as keyof typeof fieldsToUpdate] === undefined) {
//         delete fieldsToUpdate[key as keyof typeof fieldsToUpdate];
//       }
//     });

//     // ✅ Update product info and return updated row
//     const [updatedCount, updatedRows] = await Products.update(fieldsToUpdate, {
//       where: { id: data.productId },
//       returning: true,
//     });

//     if (updatedCount === 0) {
//       throw new Error("Product not found");
//     }

//     // ✅ Replace old product images with new ones
//     if (imageUrls.length > 0) {
//       await ProductImages.destroy({ where: { productId: data.productId } });

//       await ProductImages.bulkCreate(
//         imageUrls.map((url) => ({
//           productId: data.productId,
//           image: url,
//         }))
//       );
//     }

//     // ✅ Return updated product with its new images
//     const updatedProduct = updatedRows[0];
//     const updatedImages = await ProductImages.findAll({
//       where: { productId: data.productId },
//     });

//     return {
//       message: "Product updated successfully",
//       product: updatedProduct,
//       images: updatedImages,
//     };
//   } catch (error) {
//     console.error(error);
//     throw new Error("Unable to update product");
//   }
// }

export async function DeleteProductService(productId: string) {
  try {
    const deletedProduct = await Products.destroy({ where: { id: productId } });

    if (deletedProduct) {
      return { deleted: true };
    } else {
      return { deleted: false };
    }
  } catch (error) {
    console.log(error);
    throw new Error("Unable to delete product");
  }
}
export async function SearchProductsService(query: string) {
  try {
    sequelize.authenticate();
    const searchResults = await Products.findAll({
      where: {
        [Op.or]: [
          {
            product_name: { [Op.iLike]: `%${query}%` },
          },
          {
            "$subCategory.subCategoryName$": { [Op.iLike]: `%${query}%` },
          },
          {
            "$subCategory.category.categoryName$": { [Op.iLike]: `%${query}%` },
          },
        ],
      },
      include: [
        {
          model: SubCategories,
          as: "subCategory",
          attributes: ["id", "subCategoryName"],
          include: [
            {
              model: Categories,
              as: "category",
              attributes: ["id", "categoryName"],
            },
          ],
        },
      ],
    });

    console.log("Search Results:", searchResults);
    return searchResults;
  } catch (error) {
    console.log(error);
    throw new Error("Unable to search products");
  }
}
