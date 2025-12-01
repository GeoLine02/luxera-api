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
import { Response, Request } from "express";
import { ProductStatus } from "../constants/enums";
import { PAGE_SIZE } from "../constants/constants";
import { success } from "zod";
export async function AllProductsService(page: number, res: Response) {
  try {
    const offset = PAGE_SIZE * page;
    const products = await Products.findAll({
      order: [["id", "ASC"]],
      where: {
        // product_status:{
        //   [Op.ne]:'pending'
        // },
      },
      offset: offset,
      limit: PAGE_SIZE,
      include: [
        {
          model: ProductVariants,
          as: "primaryVariant",
        },
      ],
    });
    const totalCount = await Products.count();
    const hasMore = totalCount > page * PAGE_SIZE + products.length;
    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
      page: page,
      pageSize: PAGE_SIZE,
      hasMore: hasMore,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch all products",
      error,
    });
  }
}

export async function GetProductByIdService(req: Request, res: Response) {
  try {
    const productId = req.params.id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
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

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${productId} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch product",
      error,
    });
  }
}

export async function VipProductsService(res: Response) {
  try {
    const vipProducts = await Products.findAll({
      where: {
        product_status: ProductStatus.Vip,
      },
      order: [["id", "ASC"]],
      include: [
        {
          model: ProductVariants,
          as: "primaryVariant",
        },
      ],
    });
    return res.status(200).json({
      success: true,
      message: "Vip products fetched successfully",
      data: vipProducts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Unable to fetch vip products",
    });
  }
}

export async function FeaturedProductsService(res: Response) {
  try {
    const featuredProducts = await Products.findAll({
      where: {
        "$primaryVariant.variant_price$": {
          [Op.gt]: 100,
        },
      },
      order: [["id", "ASC"]],
      include: [
        {
          model: ProductVariants,
          as: "primaryVariant",
        },
      ],
    });
    return res.status(200).json({
      message: "Featured products fetched successfully",
      success: true,
      data: featuredProducts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Unable to fetch featured products",
    });
  }
}
export async function SearchProductsService(query: string) {
  try {
    sequelize.authenticate();
    const searchResults = await Products.findAll({
      where: {
        [Op.or]: [
          {
            "$primaryVariant.variant_name$": { [Op.iLike]: `%${query}%` },
          },

          {
            "$subCategory.sub_category_name$": { [Op.iLike]: `%${query}%` },
          },
          {
            "$subCategory.category.category_name$": {
              [Op.iLike]: `%${query}%`,
            },
          },
        ],
      },
      include: [
        {
          model: SubCategories,
          as: "subCategory",
          attributes: ["id", "sub_category_name"],
          include: [
            {
              model: Categories,
              as: "category",
              attributes: ["id", "category_name"],
            },
          ],
        },
        {
          model: ProductVariants,
          as: "primaryVariant",
        },
      ],
    });

    return searchResults;
  } catch (error) {
    console.log(error);
    throw new Error("Unable to search products");
  }
}
