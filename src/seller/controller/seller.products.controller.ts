import { Request, Response } from "express";

import {
  CreateProductPayload,
  ProductUpdatePayload,
  ProductUpdateStatusPayload,
  VariantImagesMap,
  VariantsMetadata,
} from "../../types/products";

import { CreateSingleProductService } from "../services/products/seller.createSingleProduct";
import { CreateProductImagesService } from "../services/products/seller.createProductImages";
import ProductVariants from "../../sequelize/models/productvariants";
import { CreateProductVariantsService } from "../services/products/seller.createProductVariants";
import Products from "../../sequelize/models/products";
import { UpdateSingleProductService } from "../services/products/seller.updateSingleProduct";
import { UpdateProductVariantsService } from "../services/products/seller.updateProductVariants";
import { GetSellerProductsService } from "../services/products/seller.getProducts";
import { DeleteProductService } from "../services/products/seller.deleteProduct";
import { UpdateSingleProductStatusService } from "../services/products/seller.updateSingleProductStatus";
import { tr } from "zod/v4/locales";
import { getSellerProductByIdService } from "../services/products/seller.getProductById";
import { Transaction } from "sequelize";
import sequelize from "../../db";
import { successfulResponse } from "../../utils/responseHandler";
import { ValidationError } from "../../errors/errors";
import { ZodError } from "zod";
import { ProductVariantSchema } from "../../validators/productValidators";
import logger from "../../logger";
import ProductImages from "../../sequelize/models/productimages";
import { updateProductImagesService } from "../services/products/seller.updateProductImages";
export async function getSellerProductsController(req: Request, res: Response) {
  await GetSellerProductsService(req, res);
}

export async function getSellerProductByIdController(
  req: Request,
  res: Response
) {
  try {
    const product = await getSellerProductByIdService(req, res);
    return product;
  } catch (error) {
    console.log(error);
  }
}

export async function CreateProductController(req: Request, res: Response) {
  const body = req.body;

  const files = req.files as Express.Multer.File[];
  console.log("Files received in controller:", files);
  // Validate Files

  // Parse variants metadata from JSON

  const variantsMetadata: VariantsMetadata[] = JSON.parse(
    body.variantsMetadata || "[]"
  );
  // validate
  if (variantsMetadata.length === 0) {
    throw new ValidationError(
      [
        {
          field: "variantsMetadata",
          message: "No variants provided",
        },
      ],
      "No variants provided"
    );
  }
  // validate inside variantsMetaData
  const variantImagesMap: VariantImagesMap = {};
  for (const [index, variant] of variantsMetadata.entries()) {
    try {
      ProductVariantSchema.parse(variant);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue) => {
          return {
            field: issue.path.join("."),
            message: issue.message,
          };
        });
        throw new ValidationError(formattedErrors, "Invalid variantsMetaData");
      }
    }
    // validate images

    const imageFiles = files.filter(
      (file) => file.fieldname == `variantImages_${index}`
    );

    if (!imageFiles) {
      throw new ValidationError([
        {
          field: `variantImages_${index}`,
          message: `Image not found for variant ${index}`,
        },
      ]);
    }

    const variantImagesEntry = imageFiles.map((file) => {
      return {
        file: file,
        isPrimary: file.filename === variant.primaryImageField,
      };
    });
    variantImagesMap[index] = variantImagesEntry;
  }

  const parsedBody = {
    productCategoryId: Number(body.productCategoryId),
    productSubCategoryId: body.productSubCategoryId,
    productDescription: body.productDescription,
    productName: body.productName,
    variantsMetadata: variantsMetadata,
    userId: Number(body.userId),
    variantImagesMap: variantImagesMap,
  } as CreateProductPayload;
  // 1. create product
  let transaction: Transaction | undefined;
  let createdProduct: Products | undefined;
  let createdVariants: ProductVariants[] | undefined;
  let createdImages: ProductImages[] | undefined;

  try {
    transaction = await sequelize.transaction();

    const result = await CreateSingleProductService(
      parsedBody,
      req,
      res,
      transaction
    );
    createdProduct = result.createdProduct;

    createdVariants = await CreateProductVariantsService(
      parsedBody,
      createdProduct as Products,
      req,
      transaction as Transaction
    );

    createdImages = await CreateProductImagesService(
      parsedBody,
      createdVariants as ProductVariants[],
      req,
      transaction as Transaction
    );

    if (transaction) {
      await transaction.commit();
    }
  } catch (error) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rbErr) {
        logger.error("Transaction rollback failed:", rbErr);
      }
    }
    logger.error("CreateProductController error:", error);
    throw error;
  }

  return successfulResponse(res, "Product Created Successfully", {
    product: createdProduct,
    variants: createdVariants,
    images: createdImages,
  });
}

export async function UpdateProductController(req: Request, res: Response) {
  const body = req.body;
  const files = req.files as Express.Multer.File[];
  logger.info("Files recieved in update product controller", files);

  const variantMetadata: VariantsMetadata[] = JSON.parse(
    body.variantsMetadata || "[]"
  );

  const deletedImageIds: number[] = JSON.parse(body.deletedImageIds || "[]");

  const variantImagesMap: VariantImagesMap = {};
  // validate variantsMetaData

  if (variantMetadata.length > 0) {
    for (const variant of variantMetadata) {
      try {
        ProductVariantSchema.parse(variant);
      } catch (error) {
        if (error instanceof ZodError) {
          const formattedErrors = error.issues.map((issue) => {
            return {
              field: issue.path.join("."),
              message: issue.message,
            };
          });
          throw new ValidationError(
            formattedErrors,
            "Invalid variantsMetaData"
          );
        }
      }
      // validate images
      if (variant.id === undefined && variant.tempId) {
        if (variant.imageFields && variant.imageFields.length > 0) {
          const imageFiles = files.filter((file) =>
            variant.imageFields?.includes(file.fieldname)
          );

          if (!imageFiles || imageFiles.length === 0) {
            throw new ValidationError([
              {
                field: `variantImage_${variant.tempId}`,
                message: `Images not found for variant ${variant.tempId}`,
              },
            ]);
          }
          const variantImagesMapEntry = imageFiles.map((file) => {
            return {
              file: file,
              isPrimary: file.filename === variant.primaryImageField,
            };
          });
          variantImagesMap[variant.tempId!] = variantImagesMapEntry;
        }
      }
      // for existing variants
      if (
        variant.id &&
        variant.tempId == undefined &&
        variant.imageFields &&
        variant.imageFields.length > 0
      ) {
        const imageFiles = files.filter((file) =>
          variant.imageFields?.includes(file.fieldname)
        );
        if (!imageFiles || imageFiles.length === 0) {
          throw new ValidationError([
            {
              field: `variantImage_${variant.id}`,
              message: `Images not found for variant ${variant.id}`,
            },
          ]);
        }
        const variantImagesMapEntry = imageFiles.map((file) => {
          return {
            file: file,
            isPrimary: file.filename === variant.primaryImageField,
          };
        });
        variantImagesMap[variant.id] = variantImagesMapEntry;
      }
    }
    const parsedData = {
      productCategoryId: Number(body.productCategoryId),
      productSubCategoryId: Number(body.productSubCategoryId),
      productDescription: body.productDescription,
      userId: Number(body.userId),
      productId: Number(body.productId),
      productStatus: body.productStatus,
      variantsMetadata: variantMetadata,
      variantImagesMap: variantImagesMap,

      deletedImageIds: deletedImageIds,
    } as ProductUpdatePayload;

    let transaction: Transaction | undefined;
    try {
      transaction = await sequelize.transaction();

      const { existingProduct } = await UpdateSingleProductService(
        parsedData,
        req,
        res,
        transaction
      );

      const { createdVariants, updatedVariants, results } =
        await UpdateProductVariantsService(parsedData, req, res, transaction);

      const imageResults = await updateProductImagesService(
        req,
        parsedData,
        createdVariants,
        updatedVariants,
        transaction
      );
      const totalResults = {
        created: results.created + imageResults.created,
        updated: results.updated,
        deleted: results.deleted + imageResults.deleted,
      };

      await transaction.commit();
      return successfulResponse(res, "Product updated", {
        existingProduct,
        results: totalResults,
      });
    } catch (error) {
      if (transaction) {
        try {
          await transaction.rollback();
        } catch (rbErr) {
          logger.error("Transaction rollback failed:", rbErr);
        }
      }
      logger.error("UpdateProductController error:", error);
      throw error;
    }
  }
}
export async function DeleteProductController(req: Request, res: Response) {
  const productId = req.params.id as string;

  await DeleteProductService(Number(productId), res);
}
export async function UpdateProductStatusController(
  req: Request,
  res: Response
) {
  const parsedData = {
    productId: Number(req.body.productId),
    status: req.body.status as string,
  } as ProductUpdateStatusPayload;

  await UpdateSingleProductStatusService(
    parsedData as ProductUpdateStatusPayload,
    req,
    res
  );
}
