import { Request, Response } from "express";

import {
  CreateProductPayload,
  ProductUpdatePayload,
  ProductUpdateStatusPayload,
  VariantImagesMap,
  VariantsMetadata,
} from "../../types/products";

import { CreateSingleProductService } from "../services/products/seller.createSingleProduct";
// import { CreateProductImagesService } from "../services/products/seller.createProductImages";
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
import {
  CreateProductVariantSchema,
  UpdateProductVariantSchema,
} from "../../validators/productValidators";
import logger from "../../logger";
import ProductImages from "../../sequelize/models/productimages";
// import { updateProductImagesService } from "../services/products/seller.updateProductImages";
import { deleteProductImagesService } from "../services/products/seller.deleteProductImages";
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
  for (const variant of variantsMetadata) {
    try {
      CreateProductVariantSchema.parse(variant);
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
    if (variant.tempId === undefined) {
      throw new ValidationError([
        {
          field: `variantImage_${variant.tempId}`,
          message: `tempId is required for variant images mapping`,
        },
      ]);
    }

    const expectedFieldName = `variantImage_${variant.tempId}`;

    // Find all files uploaded for this variant
    const imageFiles = files.filter(
      (file) => file.fieldname === expectedFieldName
    );

    if (imageFiles.length === 0) {
      throw new ValidationError([
        {
          field: expectedFieldName,
          message: `No images found for variant ${variant.tempId}`,
        },
      ]);
    }
    // Map files: first one is primary, others are additional
    const variantImagesEntry = imageFiles.map((file, index) => ({
      file,
      isPrimary: index === 0, // First uploaded image becomes primary
    }));

    variantImagesMap[variant.tempId] = variantImagesEntry;
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
  let createdImages: number = 0;

  try {
    transaction = await sequelize.transaction();

    const result = await CreateSingleProductService(
      parsedBody,
      req,
      res,
      transaction
    );
    createdProduct = result.createdProduct;

    const { createdVariants, imagesInserted } =
      await CreateProductVariantsService(
        parsedBody,
        createdProduct as Products,
        transaction as Transaction
      );
    createdImages = imagesInserted;

    // createdImages = await CreateProductImagesService(
    //   parsedBody,
    //   variantsMetadata,

    //   req,
    //   transaction as Transaction
    // );

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

  const variantMetadata: VariantsMetadata[] = JSON.parse(
    body.variantsMetadata || "[]"
  );
  console.log("files", files);

  const deletedImageIds: number[] = JSON.parse(body.deletedImageIds || "[]");
  const variantImagesMap: VariantImagesMap = {};
  // validate variantsMetaData

  if (variantMetadata.length > 0) {
    for (const variant of variantMetadata) {
      try {
        UpdateProductVariantSchema.parse(variant);
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
        const imageFiles = files.filter(
          (file) => file.fieldname === `variantImage_${variant.tempId}`
        );

        if (!imageFiles || imageFiles.length === 0) {
          throw new ValidationError([
            {
              field: `variantImage_${variant.tempId}`,
              message: `Images not found for variant ${variant.tempId}`,
            },
          ]);
        }

        const variantImagesMapEntry = imageFiles.map((file, index) => {
          return {
            file: file,
            isPrimary: index === 0,
          };
        });
        variantImagesMap[variant.tempId] = variantImagesMapEntry;
      }
      // for existing variants
      if (variant.id) {
        const imageFiles = files.filter(
          (file) => file.fieldname === `variantImage_${variant.id}`
        );
        if (imageFiles.length > 0) {
          const variantImagesMapEntry = imageFiles.map((file, index) => {
            return {
              file: file,
              isPrimary: index === 0,
            };
          });
          variantImagesMap[variant.id] = variantImagesMapEntry;
        }
      }
    }
    console.log("variantImagesMap: ", variantImagesMap);
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
      const totalResults = {
        created: 0,
        updated: 0,
        deleted: 0,
      };
      const { existingProduct } = await UpdateSingleProductService(
        parsedData,
        req,
        res,
        transaction
      );
      // delete product images that are removed
      if (deletedImageIds.length > 0) {
        const deleted = await deleteProductImagesService(
          parsedData.productId,
          deletedImageIds,
          transaction
        );
        if (deleted) {
          totalResults.deleted += deleted;
        }
      }
      const results = await UpdateProductVariantsService(
        parsedData,
        req,
        transaction
      );
      totalResults.created += results.created;
      totalResults.updated += results.updated;
      totalResults.deleted += results.deleted;
      // const imageResults = await updateProductImagesService(
      //   req,
      //   parsedData,
      //   createdVariants,
      //   updatedVariants,
      //   transaction
      // );

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
