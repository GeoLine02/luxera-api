import { Op } from "sequelize";
import sequelize from "../db";
import {Categories,Products,SubCategories} from "../sequelize/models/associate"
import ProductImages from "../sequelize/models/productimages";
import { Request } from "express";

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

interface ProductPayload {
  productId: number;
  productCategoryId: number;
  subCategoryId: number;
  productDescription: string;
  productImages: Express.Multer.File[];
  productStatus: string;
  productName: string;
  productPrice: number;
  userId: number;
}

export async function CreateProductService(data: ProductPayload, req: Request) {
  try {
    const {
      productCategoryId,
      subCategoryId,
      productDescription,
      productImages,
      productName,
      productPrice,
      productStatus,
      userId,
    } = data;

    const productCategory = await Categories.findByPk(productCategoryId);
    const subCategory = await SubCategories.findOne({
      where: { id: subCategoryId, categoryId: productCategory?.id },
    });

    if (!productCategory || !subCategory) {
      throw new Error("Invalid category or subcategory");
    }

    const baseUrl = `${req.protocol}://${req.get("host")}/uploads/`;

    // ✅ Step 1: Create the product
    const createdProduct = await Products.create({
      product_name: productName,
      product_price: productPrice,
      product_category_id: productCategory.id,
      product_owner_id: userId,
      product_description: productDescription,
      product_status: productStatus,
      product_image: `${baseUrl}${productImages[0].filename}`,
    });

    // ✅ Step 2: Create image records
    if (createdProduct && productImages && productImages.length > 0) {
      const imageRecords = productImages.map((file) => ({
        image: `${baseUrl}${file.filename}`,
        productId: createdProduct.id,
      }));

      await ProductImages.bulkCreate(imageRecords);
    }

    return createdProduct;
  } catch (error) {
    console.log(error);
    throw new Error("Unable to create product");
  }
}

export async function UpdateProductService(data: ProductPayload, req: Request) {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}/uploads/`;

    const imageUrls = data.productImages.map(
      (file) => `${baseUrl}${file.filename}`
    );

    const fieldsToUpdate = {
      product_name: data.productName,
      product_description: data.productDescription,
      product_price: data.productPrice,
      product_status: data.productStatus,
      product_category_id: data.productCategoryId,
      sub_category_id: data.subCategoryId,
      product_image: `${baseUrl}${data.productImages[0].filename}`,
      user_id: data.userId,
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach((key) => {
      if (fieldsToUpdate[key as keyof typeof fieldsToUpdate] === undefined) {
        delete fieldsToUpdate[key as keyof typeof fieldsToUpdate];
      }
    });

    // ✅ Update product info and return updated row
    const [updatedCount, updatedRows] = await Products.update(fieldsToUpdate, {
      where: { id: data.productId },
      returning: true,
    });

    if (updatedCount === 0) {
      throw new Error("Product not found");
    }

    // ✅ Replace old product images with new ones
    if (imageUrls.length > 0) {
      await ProductImages.destroy({ where: { productId: data.productId } });

      await ProductImages.bulkCreate(
        imageUrls.map((url) => ({
          productId: data.productId,
          image: url,
        }))
      );
    }

    // ✅ Return updated product with its new images
    const updatedProduct = updatedRows[0];
    const updatedImages = await ProductImages.findAll({
      where: { productId: data.productId },
    });

    return {
      message: "Product updated successfully",
      product: updatedProduct,
      images: updatedImages,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Unable to update product");
  }
}

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
export async function SearchProductsService(query:string){
  try {
   sequelize.authenticate();
const searchResults = await Products.findAll({
  where: {
    [Op.or]: [
      {
        product_name: { [Op.iLike]: `%${query}%` }
      },
      {
        '$subCategory.subCategoryName$': { [Op.iLike]: `%${query}%` }
      },
    { '$subCategory.category.categoryName$': { [Op.iLike]: `%${query}%` }
    }
    
    ]
  },
  include: [
    {
      model: SubCategories,
      as: "subCategory",
      attributes: ["id", "subCategoryName"],
include:[
  {
     model:Categories,
        as:"category",
        attributes:["id","categoryName"]
  }
       
      
],
    
    }
      
  ],
});

console.log("Search Results:", searchResults);
return searchResults
  } catch (error) {
    console.log(error);
    throw new Error("Unable to search products");
  }
}