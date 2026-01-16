import { BaseError, Op } from "sequelize";
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
import { NotFoundError, ValidationError } from "../errors/errors";
import { paginatedResponse } from "../utils/responseHandler";
import { s3 } from "../app";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { HomePageProduct, ProductDetails } from "../types/products";

export async function AllProductsService(req: Request, res: Response) {
  const {
    page,
    subcategory,
    priceDirection,
    priceFrom = 0,
    priceTo,
    search,
  } = req.query;
  const integerPage = Number(page);
  if (isNaN(integerPage) || integerPage < 1) {
    throw new ValidationError(
      [
        {
          field: "page",
          message: "Invalid page number",
        },
      ],
      "Invalid page number"
    );
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
  const products = (await Products.findAll({
    where: productWhere,
    order,
    offset: offset,
    limit: PAGE_SIZE,
    include: [
      {
        model: ProductVariants,
        as: "primaryVariant",
        where: Object.keys(variantWhere).length ? variantWhere : undefined,
        include: [
          {
            model: ProductImages,
            where: { is_primary: true },
            as: "images",
            required: true, // ensure we get the primary image
            attributes: ["id", "s3_key"], // only fetch what we need
          },
        ],
      },
    ],
  })) as HomePageProduct[];
  const plainProducts = products.map((p) => p.get({ plain: true })) as any[];
  const productsWithImages = await Promise.all(
    plainProducts.map(async (product) => {
      const primaryVariant = product.primaryVariant;
      const primaryImage = primaryVariant?.images[0];

      if (primaryImage) {
        const params = {
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: primaryImage.s3_key,
        };

        const signedUrl = await getSignedUrl(s3, new GetObjectCommand(params), {
          expiresIn: 3600,
        });
        return {
          ...product,
          primaryVariant: {
            ...primaryVariant,
            images: [
              {
                id: primaryImage.id,
                imageUrl: signedUrl,
              },
            ],
          },
        };
      }

      return product;
    })
  );

  const totalCount = await Products.count();
  const hasMore = totalCount > integerPage * PAGE_SIZE + products.length;
  return { hasMore, integerPage, productsWithImages };
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

    const product = (await Products.findOne({
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
    })) as ProductDetails;
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${productId} not found`,
      });
    }
    const productData = product.toJSON() as ProductDetails;
    await Promise.all(
      productData.variants.map(async (variant: any) => {
        if (!variant.images || variant.images.length === 0) {
          variant.images = [];
          return;
        }
        variant.images = await Promise.all(
          variant.images.map(async (img: ProductImages) => {
            if (!img.s3_key) {
              return { id: img.id, imageUrl: null };
            }

            const signedUrl = await getSignedUrl(
              s3,
              new GetObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: img.s3_key,
              }),
              { expiresIn: 3600 }
            );

            return {
              id: img.id,
              imageUrl: signedUrl,
              isPrimary: img.is_primary,
            };
          })
        );
      })
    );

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: productData,
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

export async function VipProductsService(req: Request, res: Response) {
  try {
    const page = Number(req.query.page) || 1;
    if (isNaN(page) || page < 1) {
      throw new ValidationError(
        [
          {
            field: "page",
            message: "Invalid page number",
          },
        ],
        "Invalid page number"
      );
    }

    const offset = PAGE_SIZE * (page - 1);

    const products = (await Products.findAll({
      where: {
        product_status: ProductStatus.Vip,
      },
      order: [["id", "ASC"]],
      offset: offset,
      limit: PAGE_SIZE,
      include: [
        {
          model: ProductVariants,
          as: "primaryVariant",
          required: false,
          include: [
            {
              model: ProductImages,
              required: false,
              as: "images",
              attributes: ["id", "s3_key"],
            },
          ],
        },
      ],
    })) as any[];

    const plainProducts = products.map((p) => p.get({ plain: true })) as any[];

    const productsWithImages = await Promise.all(
      plainProducts.map(async (product) => {
        const primaryVariant = product.primaryVariant;
        const primaryImage = primaryVariant?.images?.[0];

        if (primaryImage) {
          const params = {
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: primaryImage.s3_key,
          };

          const signedUrl = await getSignedUrl(
            s3,
            new GetObjectCommand(params),
            {
              expiresIn: 3600,
            }
          );
          return {
            ...product,
            primaryVariant: {
              ...primaryVariant,
              images: [
                {
                  id: primaryImage.id,
                  imageUrl: signedUrl,
                },
              ],
            },
          };
        }

        return product;
      })
    );

    const totalCount = await Products.count({
      where: { product_status: ProductStatus.Vip },
    });

    const hasMore = totalCount > page * PAGE_SIZE;

    return res.status(200).json({
      success: true,
      message: "Vip products fetched successfully",
      data: productsWithImages,
      page: page,
      pageSize: PAGE_SIZE,
      hasMore: hasMore,
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function FeaturedProductsService(req: Request, res: Response) {
  try {
    const page = Number(req.query.page) || 1;
    if (isNaN(page) || page < 1) {
      throw new ValidationError(
        [
          {
            field: "page",
            message: "Invalid page number",
          },
        ],
        "Invalid page number"
      );
    }

    const offset = PAGE_SIZE * (page - 1);

    const products = (await Products.findAll({
      where: {
        "$primaryVariant.variant_price$": {
          [Op.gt]: 100,
        },
      },
      order: [["id", "ASC"]],
      offset: offset,
      limit: PAGE_SIZE,
      include: [
        {
          model: ProductVariants,
          as: "primaryVariant",
          required: true,
          include: [
            {
              model: ProductImages,
              required: false,
              as: "images",
              attributes: ["id", "s3_key"],
            },
          ],
        },
      ],
    })) as any[];

    const plainProducts = products.map((p) => p.get({ plain: true })) as any[];

    const productsWithImages = await Promise.all(
      plainProducts.map(async (product) => {
        const primaryVariant = product.primaryVariant;
        const primaryImage = primaryVariant?.images?.[0];

        if (primaryImage) {
          const params = {
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: primaryImage.s3_key,
          };

          const signedUrl = await getSignedUrl(
            s3,
            new GetObjectCommand(params),
            {
              expiresIn: 3600,
            }
          );
          return {
            ...product,
            primaryVariant: {
              ...primaryVariant,
              images: [
                {
                  id: primaryImage.id,
                  imageUrl: signedUrl,
                },
              ],
            },
          };
        }

        return product;
      })
    );

    const totalCount = await Products.count({
      where: {
        "$primaryVariant.variant_price$": {
          [Op.gt]: 100,
        },
      },
    });

    const hasMore = totalCount > page * PAGE_SIZE;

    return res.status(200).json({
      success: true,
      message: "Featured products fetched successfully",
      data: productsWithImages,
      page: page,
      pageSize: PAGE_SIZE,
      hasMore: hasMore,
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function SearchProductsService(req: Request, res: Response) {
  try {
    const query = req.query.q as string;

    if (!query || query.trim().length === 0) {
      throw new ValidationError(
        [
          {
            field: "q",
            message: "Search query is required",
          },
        ],
        "Search query is required"
      );
    }

    const page = Number(req.query.page) || 1;
    if (isNaN(page) || page < 1) {
      throw new ValidationError(
        [
          {
            field: "page",
            message: "Invalid page number",
          },
        ],
        "Invalid page number"
      );
    }

    const offset = PAGE_SIZE * (page - 1);

    const products = (await Products.findAll({
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
      order: [["id", "ASC"]],
      offset: offset,
      limit: PAGE_SIZE,
      include: [
        {
          model: SubCategories,
          as: "subCategory",
          attributes: ["id", "sub_category_name"],
          required: true,
          include: [
            {
              required: true,
              model: Categories,
              as: "category",
              attributes: ["id", "category_name"],
            },
          ],
        },
        {
          model: ProductVariants,
          as: "primaryVariant",
          required: true,
          include: [
            {
              model: ProductImages,
              required: false,
              as: "images",
              attributes: ["id", "s3_key"],
            },
          ],
        },
      ],
    })) as any[];

    const plainProducts = products.map((p) => p.get({ plain: true })) as any[];

    const productsWithImages = await Promise.all(
      plainProducts.map(async (product) => {
        const primaryVariant = product.primaryVariant;
        const primaryImage = primaryVariant?.images?.[0];

        if (primaryImage) {
          const params = {
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: primaryImage.s3_key,
          };

          const signedUrl = await getSignedUrl(
            s3,
            new GetObjectCommand(params),
            {
              expiresIn: 3600,
            }
          );
          return {
            ...product,
            primaryVariant: {
              ...primaryVariant,
              images: [
                {
                  id: primaryImage.id,
                  imageUrl: signedUrl,
                },
              ],
            },
          };
        }

        return product;
      })
    );

    const totalCount = await Products.count({
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
          required: false,
          include: [
            {
              model: Categories,
              as: "category",
              required: false,
            },
          ],
        },
        {
          model: ProductVariants,
          as: "primaryVariant",
          required: true,
        },
      ],
      distinct: true,
    });

    const hasMore = totalCount > page * PAGE_SIZE;

    return res.status(200).json({
      success: true,
      message: "Products search completed successfully",
      data: productsWithImages,
      page: page,
      pageSize: PAGE_SIZE,
      hasMore: hasMore,
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

interface ProductVariantTypePayload {
  variantName: string;
  variantPrice: number;
  variantQuantity: number;
  variantDiscount: number;
}

export async function CreateProductService(req: Request, res: Response) {
  try {
    const {
      productDescription,
      productVariants,
      ownerId,
      productSubCategoryId,
    } = req.body;
    const shop = req.shop;
    const images = req.files as Express.Multer.File[];
    const parsedProductVariants = JSON.parse(productVariants);

    if (!images || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images uploaded",
      });
    }

    const createdProduct = await Products.create({
      product_rating: 0,
      product_owner_id: ownerId,
      product_status: "pending",
      product_subcategory_id: productSubCategoryId,
      shop_id: shop?.id as number,
      product_description: productDescription,
    });

    if (createdProduct) {
      const createdProductVariantsArray = parsedProductVariants.map(
        (variant: ProductVariantTypePayload) => ({
          variant_name: variant.variantName,
          product_id: Number(createdProduct.id),
          variant_price: Number(variant.variantPrice),
          variant_quantity: Number(variant.variantQuantity),
          variant_discount: Number(variant.variantDiscount),
        })
      );

      const createdVariants = await ProductVariants.bulkCreate(
        createdProductVariantsArray
      );

      if (createdVariants && createdVariants.length > 0) {
        // Group images by fieldname and map to variant IDs
        const productImagesArray: any[] = [];

        images.forEach((file) => {
          // Extract variant index from fieldname (e.g., "variant-1-image" -> 1)
          const variantIndexMatch = file.fieldname.match(/variant-(\d+)-image/);

          if (variantIndexMatch) {
            const variantIndex = parseInt(variantIndexMatch[1]) - 1; // Convert to 0-based index

            // Make sure the variant exists
            if (createdVariants[variantIndex]) {
              const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
                file.filename
              }`;

              productImagesArray.push({
                image: imageUrl,
                product_id: createdProduct.id,
                variant_id: createdVariants[variantIndex].id,
              });
            }
          }
        });

        // Create all product images
        const createdProductImages = await ProductImages.bulkCreate(
          productImagesArray
        );

        return res.status(201).json({
          success: true,
          message: "Product created successfully",
          data: {
            product: createdProduct,
            variants: createdVariants,
            images: createdProductImages,
          },
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Unable to create product",
      error,
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
