import { Request, Response } from "express";
import ProductVariants from "../../../sequelize/models/productvariants";
import Products from "../../../sequelize/models/products";
import ProductImages from "../../../sequelize/models/productimages";
import { s3 } from "../../../app";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PAGE_SIZE } from "../../../constants/constants";
import { ValidationError } from "../../../errors/errors";
import { paginatedResponse } from "../../../utils/responseHandler";

export async function GetSellerProductsService(req: Request, res: Response) {
  try {
    const shop = req.shop;
    if (!shop?.id) {
      throw new ValidationError(
        [
          {
            field: "shop",
            message: "Shop not found",
          },
        ],
        "Shop not found"
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
        shop_id: shop.id,
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
      where: { shop_id: shop.id },
    });

    const hasMore = totalCount > page * PAGE_SIZE;

    return paginatedResponse(
      res,
      "Fetched seller products",
      productsWithImages,
      hasMore,
      page
    );
  } catch (error) {
    console.log("GetSellerProductsService error:", error);
    throw error;
  }
}
