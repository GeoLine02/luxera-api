import { Op } from "sequelize";
import sequelize from "../db";
import {
  Categories,
  Products,
  SubCategories,
} from "../sequelize/models/associate";



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




