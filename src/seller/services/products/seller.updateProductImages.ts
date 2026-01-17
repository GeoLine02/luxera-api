// import { Transaction } from "sequelize";
// import { getImageBaseUrl } from "../../../constants/constants";
// import ProductImages from "../../../sequelize/models/productimages";
// import {
//   ProductUpdatePayload,
//   VariantsMetadata,
// } from "../../../types/products";
// import { Request } from "express";
// export async function updateProductImagesService(
//   req: Request,
//   data: ProductUpdatePayload,
//   createdVariants: { tempId?: string | number; id: number }[],
//   updatedVariants: VariantsMetadata[], // simplified
//   transaction: Transaction
// ) {
//   const { variantImagesMap = {}, productId, deletedImageIds = [] } = data;
//   const baseUrl = getImageBaseUrl(req);
//   const results = { deleted: 0, created: 0 };

//   // 1. Delete only explicitly removed images (scoped to product)
//   if (deletedImageIds.length > 0) {
//     const deleted = await ProductImages.destroy({
//       where: {
//         id: deletedImageIds,
//         product_id: productId,
//       },
//       transaction,
//     });
//     results.deleted += deleted;
//   }

//   // 2. Add new images for created variants
//   const newImages: any[] = [];

//   for (const variant of createdVariants) {
//     const images = variantImagesMap[variant.tempId!] || [];
//     images.forEach((img: any) => {
//       newImages.push({
//         product_id: productId,
//         variant_id: variant.id,
//         image: `${baseUrl}${img.filename}`,
//       });
//     });
//   }

//   // 3. Add new images for updated variants
//   for (const variant of updatedVariants) {
//     const images = variantImagesMap[variant.id!] || [];
//     images.forEach((img: any) => {
//       newImages.push({
//         product_id: productId,
//         variant_id: variant.id,
//         image: `${baseUrl}${img.filename}`,
//       });
//     });
//   }

//   if (newImages.length > 0) {
//     await ProductImages.bulkCreate(newImages, { transaction });
//     results.created += newImages.length;
//   }

//   return results;
// }
