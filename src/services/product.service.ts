import { BaseError, Op, Transaction } from "sequelize";
import sequelize from "../db";
import {
  Categories,
  Cities,
  Products,
  Shop,
  SubCategories,
  User,
} from "../sequelize/models/associate";
import ProductImages from "../sequelize/models/productimages";
import ProductVariants from "../sequelize/models/productvariants";
import { Response, Request } from "express";
import { ProductStatus } from "../constants/enums";
import { PAGE_SIZE } from "../constants/constants";
import { BadRequestError, NotFoundError } from "../errors/errors";
import { paginatedResponse } from "../utils/responseHandler";
import { ProductUpdatePayload } from "../types/products";

export async function AllProductsService(req: Request, res: Response) {
  try {
    const {
      page,
      subcategory,
      priceDirection,
      priceFrom = 0,
      priceTo = Infinity,
      search,
    } = req.query;
    const integerPage = Number(page);
    if (isNaN(integerPage) || integerPage < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid page number",
      });
    }

    const productWhere: any = {};
    const variantWhere: any = {};

    const subcategoryId = (subcategory as string)?.split("-")[1];
    console.log("subcategoryId", subcategoryId);

    if (subcategory) {
      productWhere.product_subcategory_id = subcategoryId;
    }

    if (priceFrom) {
      variantWhere.variant_price = {
        [Op.gt]: Number(priceFrom),
      };
    }

    if (priceTo) {
      variantWhere.variant_price = {
        ...(variantWhere.variant_price ?? {}),
        [Op.lt]: Number(priceTo),
      };
    }

    let order: any[] = [["id", "ASC"]]; // default

    if (priceDirection === "asc") {
      order = [
        [
          { model: ProductVariants, as: "primaryVariant" },
          "variant_price",
          "ASC",
        ],
      ];
    }

    if (priceDirection === "desc") {
      order = [
        [
          { model: ProductVariants, as: "primaryVariant" },
          "variant_price",
          "DESC",
        ],
      ];
    }

    if (search && typeof search === "string") {
      variantWhere.variant_name = {
        [Op.iLike]: `%${search}%`,
      };
    }

    const offset = PAGE_SIZE * (integerPage - 1);
    const products = await Products.findAll({
      where: productWhere,
      order,
      offset: offset,
      limit: PAGE_SIZE,
      include: [
        {
          model: ProductVariants,
          as: "primaryVariant",
          where: Object.keys(variantWhere).length ? variantWhere : undefined,
        },
      ],
    });

    const totalCount = await Products.count();
    const hasMore = totalCount > integerPage * PAGE_SIZE + products.length;
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

export async function getSellerProductsService(req: Request, res: Response) {
  try {
    const shopId = Number(req.query.shopId);
    const page = Number(req.query.page);

    const offest = PAGE_SIZE * (page - 1);
    const hasMore = await Products.count({
      where: { shop_id: shopId },
    });
    const sellerProducts = await Products.findAll({
      where: {
        shop_id: shopId,
      },
      offset: offest,
      include: [
        {
          model: ProductVariants,
          as: "primaryVariant",
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: sellerProducts,
      page: page,
      hasMore: hasMore,
    });
  } catch (error) {
    console.log(error);
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
        {
          model: ProductVariants,
          as: "variants",
          include: [{ model: ProductImages, as: "images" }],
        },
        {
          model: User,
          as: "owner",
          attributes: { exclude: ["password", "createdAt", "updatedAt"] },
        },
        {
          model: Shop,
          as: "shop",
          include: [{ model: Cities, as: "city" }],
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
      success: false,
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
      success: false,
      message: "Unable to fetch featured products",
    });
  }
}
export async function SearchProductsService(query: string, res: Response) {
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

    return res.status(200).json({
      success: true,
      message: "Products search completed successfully",
      data: searchResults,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Unable to search products",
    });
  }
}

export async function GetProductsBySubCategoryService(
  categoryName: string,
  page: number,
  res: Response
) {
  const offset = PAGE_SIZE * (page - 1);

  const subCategory = await SubCategories.findOne({
    where: {
      sub_category_name: categoryName,
    },
    attributes: ["id"],
  });

  if (!subCategory) {
    throw new NotFoundError(`Subcategory '${categoryName}' not found`);
  }

  const { count, rows: products } = await Products.findAndCountAll({
    where: {
      product_subcategory_id: subCategory.id,
    },
    order: [["id", "ASC"]],
    offset: offset,
    limit: PAGE_SIZE,
  });

  // Handle edge case: requested page beyond available data
  if (products.length === 0 && page > 1) {
    throw new NotFoundError(`No products found on page ${page}`);
  }

  const hasMore = offset + products.length < count; // ✅ CORRECT

  return paginatedResponse(
    res,
    "Successfully fetched products",
    products,
    hasMore,
    page
  );
}

// TODO: recreate product create service
export async function CreateProductService(req: Request, res: Response) {}

export async function UpdateSingleProductService(
  data: ProductUpdatePayload,
  req: Request,
  res: Response,
  transaction: Transaction
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
  if (existingProduct.product_owner_id !== userId) {
    throw new BadRequestError(
      "You don't have permission to update this product"
    );
  }

  // Prepare fields to update
  const fieldsToUpdate: any = {
    product_description: productDescription,
    product_category_id: productCategoryId,
    sub_category_id: productSubCategoryId,
    user_id: userId,
  };

  // Update product info
  if (Object.keys(fieldsToUpdate).length > 0) {
    await existingProduct.update(fieldsToUpdate, { transaction });
  }
  // Do NOT commit here - controller manages the transaction
  return { existingProduct };
}
