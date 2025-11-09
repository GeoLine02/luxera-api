import { Op } from "sequelize";
import sequelize from "../db";
import {
  Categories,
  Products,
  SubCategories,
  User,
} from "../sequelize/models/associate";
import ProductImages from "../sequelize/models/productimages";
import ProductVariants from "../sequelize/models/productvariants";
import { Response } from "express";
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

export async function GetProductByIdService(productId: number, res: Response) {
  try {
    if (!productId) {
      return res.status(400).json({
        message: "product id is required",
      });
    }

    const product = await Products.findOne({
      where: { id: productId },
      include: [
        { model: ProductImages, as: "images" },
        { model: ProductVariants, as: "variants" },
        {
          model: User,
          as: "owner",
          attributes: { exclude: ["password", "createdAt", "updatedAt"] },
        },
      ],
    });

    if (!product)
      return res
        .status(400)
        .json({ message: `Product with id ${productId} doesn't exist` });

    return res.status(200).json(product);
  } catch (error) {
    console.log(error);
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




