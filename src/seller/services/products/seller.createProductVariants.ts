import { Transaction } from "sequelize";
import Products from "../../../sequelize/models/products";
import ProductVariants from "../../../sequelize/models/productvariants";
import { CreateProductPayload } from "../../../types/products";
import { Request } from "express";
import { BadRequestError } from "../../../errors/errors";
import { s3 } from "../../../app";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getRandomImageName } from "../../../constants/constants";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
export async function CreateProductVariantsService(
  data: CreateProductPayload,
  createdProduct: Products,
  req: Request,
  transaction: Transaction
) {
  const { variantsMetadata = [], variantImagesMap = {} } = data;

  const baseUrl = `${req.protocol}://${req.get("host")}/uploads/`;
  const variantsToCreate = variantsMetadata.map(async (variant, index) => {
    const variantImages = variantImagesMap[index] || [];
    const primaryImage = variantImages.find((img) => img.isPrimary);

    if (!primaryImage) {
      throw new BadRequestError(
        `Variant ${index} must have at least one image`
      );
    }
    const imageName = getRandomImageName();
    const params = {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: imageName,
      Body: primaryImage.file?.buffer,
      ContentType: primaryImage.file?.mimetype,
    };
    // Upload to S3
    const command = new PutObjectCommand(params);

    await s3.send(command);
    // get Signed URl
    const getObjectParams = {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: imageName,
    };
    const getObjectCommand = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3, getObjectCommand, { expiresIn: 3600 });
    // refactor needed. store s3_key instead of url in DB.

    return {
      variant_name: variant.variantName,
      variant_price: variant.variantPrice,
      variant_quantity: variant.variantQuantity,
      variant_discount: variant.variantDiscount,
      product_id: createdProduct.id,
      image: `${baseUrl}${primaryImage.file?.filename}`,
    };
  });
  const variantsToCreateResolved = await Promise.all(variantsToCreate);
  const createdVariants = await ProductVariants.bulkCreate(
    variantsToCreateResolved,
    {
      returning: true,
      transaction,
    }
  );

  // Add primary Variant to Products table for listings
  if (createdVariants.length > 0) {
    createdProduct.primary_variant_id = createdVariants[0].id;
    await createdProduct.save({ transaction });
  }

  // Do NOT commit here - controller manages transaction
  return createdVariants;
}
