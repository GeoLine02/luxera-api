import { Transaction } from "sequelize";
import Products from "../../../sequelize/models/products";
import ProductVariants from "../../../sequelize/models/productvariants";
import { CreateProductPayload } from "../../../types/products";
import { Request } from "express";
import { BadRequestError } from "../../../errors/errors";

export async function CreateProductVariantsService(
  data: CreateProductPayload,
  createdProduct: Products,
  req: Request,
  transaction: Transaction
) {
  const { variantsMetadata = [], variantImagesMap = {} } = data;

  const baseUrl = `${req.protocol}://${req.get("host")}/uploads/`;
  const variantsToCreate = variantsMetadata.map((variant, index) => {
    const variantImages = variantImagesMap[index] || [];
    const primaryImage = variantImages[0]; // First image for THIS variant
    if (!primaryImage) {
      throw new BadRequestError(
        `Variant ${index} must have at least one image`
      );
    }

    return {
      variant_name: variant.variantName,
      variant_price: variant.variantPrice,
      variant_quantity: variant.variantQuantity,
      variant_discount: variant.variantDiscount,
      product_id: createdProduct.id,
      image: `${baseUrl}${primaryImage.filename}`,
    };
  });

  const createdVariants = await ProductVariants.bulkCreate(variantsToCreate, {
    returning: true,
    transaction,
  });

  // Add primary Variant to Products table for listings
  if (createdVariants.length > 0) {
    createdProduct.primary_variant_id = createdVariants[0].id;
    await createdProduct.save({ transaction });
  }

  // Do NOT commit here - controller manages transaction
  return createdVariants;
}
