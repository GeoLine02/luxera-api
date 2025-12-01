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
export async function AllProductsService(req: Request, res: Response) {
  try {
    const page = Number(req.query.page) || 1; // default page = 0
    const limit = 20;
    const offset = limit * (page - 1);
    const products = await Products.findAll({
      where: {
        product_status: {
          [Op.not]: ProductStatus.Pending, // NOT equal to pending
        },
      },
      offset: offset,
      limit: 20,

      include: [
        {
          model: ProductVariants,
          as: "variants",
          separate: true,
          limit: 1,
          order: [["id", "ASC"]],

          include: [
            {
              model: ProductImages,
              as: "images",
              required: false,
            },
          ],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: products,
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
    throw new Error("Unable to fetch product by ID");
  }
}

export async function VipProductsService(req: Request, res: Response) {
  try {
    const vipProducts = await Products.findAll({
      where: {
        product_status: ProductStatus.Vip,
      },
      limit: 10,
      include: [
        {
          model: ProductVariants,
          as: "variants",
          separate: true,
          order: [["id", "ASC"]],
          limit: 1,
          include: [
            {
              model: ProductImages,
              as: "images",
            },
          ],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: vipProducts,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch vip products",
    });
  }
}

export async function FeaturedProductsService(req: Request, res: Response) {
  try {
    const featuredProducts = await Products.findAll({
      where: {
        product_status: ProductStatus.Featured,
      },
      limit: 10,
      include: [
        {
          model: ProductVariants,
          as: "variants",
          separate: true,
          order: [["id", "ASC"]],
          limit: 1,
          include: [{ model: ProductImages, as: "images" }],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: featuredProducts,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch featured products",
      error,
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

    console.log("Search Results:", searchResults);
    return searchResults;
  } catch (error) {
    console.log(error);
    throw new Error("Unable to search products");
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
