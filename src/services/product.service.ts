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
import { Response,Request } from "express";
import { ProductStatus } from "../constants/enums";
import { PAGE_SIZE } from "../constants/constants";
export async function AllProductsService(page:number,pageSize:number) {
  try {
    sequelize.authenticate();
    const offset = page * pageSize;
    const limit = pageSize;
    const products = await Products.findAll({
      order: [["id", "ASC"]],
      where:{

          // product_status:{
          //   [Op.ne]:'pending'
          // },
         
      },
  
      offset: offset,
      limit: limit,
      include:[
        {
          model:ProductVariants,
          as:"primaryVariant",
      
        }
      ]
    });
    console.log(products)
    return products;
  } catch (error) {
    console.log(error);
    throw new Error("Unable to fetch products");
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
    throw new Error("Unable to fetch product by ID");
  }
}

export async function VipProductsService(page:number,res: Response) {
  
  try {
    const vipProducts = await Products.findAll({
      where: {
        product_status:ProductStatus.Vip,
      },
      order: [["id", "ASC"]],
      offset: page * PAGE_SIZE,
      limit: PAGE_SIZE,
      include:[
        {
          model:ProductVariants,
          as:"primaryVariant",
        }
      ]
    });
    return vipProducts
  } catch (error) {
    console.log(error);
   throw new Error("Unable to fetch vip products")
  }
}

export async function FeaturedProductsService(page:number,res: Response) {
  try {
    const featuredProducts = await Products.findAll({
      where: {
        product_status: ProductStatus.Featured,   
      },
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
      include:[
        {
          model:ProductVariants,
          as:"primaryVariant",
        }
      ]
    });
    return featuredProducts;
  } catch (error) {
    console.log(error);
   throw new Error("Unable to fetch featured products")
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
            model:ProductVariants,
            as:"primaryVariant",
          }
      ],
    });

    console.log("Search Results:", searchResults);
    return searchResults;
  } catch (error) {
    console.log(error);
    throw new Error("Unable to search products");
  }
}
