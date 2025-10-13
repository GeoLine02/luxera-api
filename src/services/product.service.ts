import { Op } from "sequelize";
import sequelize from "../db";
import Products from "../sequelize/models/products";
import Categories from "../sequelize/models/categories";
import SubCategories from "../sequelize/models/subcategories";
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

interface ProductCreationPayload {
  productCategoryId: number;
  subCategoryId: number;
  productDescription: string;
  productImages: Express.Multer.File[];
  productStatus: string;
  productName: string;
  productPrice: number;
  userId: number;
}

export async function CreateProductService(
  data: ProductCreationPayload,
  req: Request
) {
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
