import { Request, Response } from "express";
import Products from "../../../sequelize/models/products";
import ProductImages from "../../../sequelize/models/productimages";
import ProductVariants from "../../../sequelize/models/productvariants";
import { s3 } from "../../../app";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NotFoundError } from "../../../errors/errors";

export async function getSellerProductByIdService(req: Request, res: Response) {
  try {
    const productId = Number(req.params.id);

    if (isNaN(productId)) {
      throw new NotFoundError("Invalid product ID");
    }

    const product = await Products.findOne({
      where: { id: productId },
      include: [
        {
          model: ProductVariants,
          as: "variants",
          include: [
            {
              model: ProductImages,
              as: "images",
              attributes: ["id", "s3_key"],
            },
          ],
        },
      ],
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    const plainProduct = product.get({ plain: true }) as any;

    // Add signed URLs for all variant images
    if (plainProduct.variants && Array.isArray(plainProduct.variants)) {
      plainProduct.variants = await Promise.all(
        plainProduct.variants.map(async (variant: any) => {
          if (variant.images && Array.isArray(variant.images)) {
            variant.images = await Promise.all(
              variant.images.map(async (image: any) => {
                const params = {
                  Bucket: process.env.S3_BUCKET_NAME!,
                  Key: image.s3_key,
                };

                const signedUrl = await getSignedUrl(
                  s3,
                  new GetObjectCommand(params),
                  {
                    expiresIn: 3600,
                  }
                );

                return {
                  ...image,
                  imageUrl: signedUrl,
                };
              })
            );
          }
          return variant;
        })
      );
    }

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: plainProduct,
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}
