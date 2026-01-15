// import { success } from "zod";

// import { Request } from "express";
// import Products from "../../../sequelize/models/products";
// import {
//   CreateProductPayload,
//   VariantsMetadata,
// } from "../../../types/products";
// import ProductVariants from "../../../sequelize/models/productvariants";
// import ProductImages from "../../../sequelize/models/productimages";
// import { Transaction } from "sequelize";
// import logger from "../../../logger";
// import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
// import { getRandomImageName } from "../../../constants/constants";
// import { s3 } from "../../../app";
// export async function CreateProductImagesService(
//   data: CreateProductPayload,
//   variantsMetaData: VariantsMetadata[],
//   req: Request,
//   transaction: Transaction
// ) {
//   const { variantImagesMap = {} } = data;
//   const imagesToInsert: any[] = [];

//   // Use Promise.all to handle all variants concurrently
//   await Promise.all(
//     variantsMetaData.map(async (variant) => {
//       // Better: use tempId as key, not array index

//       if (!variant.tempId) {
//         throw new Error("Each variant must have a temporary ID");
//       }
//       const variantImages = variantImagesMap[variant.tempId] || [];

//       if (variantImages.length === 0) return;

//       const primaryImage = variantImages.find((img: any) => img.isPrimary);

//       // Process all images for this variant in parallel
//       const uploadedImages = await Promise.all(
//         variantImages.map(async (image: any) => {
//           // If this image is the primary one and already uploaded (e.g. from product level), skip upload
//           if (
//             primaryImage &&
//             image.s3_key &&
//             image.s3_key === primaryImage.s3_key
//           ) {
//             return {
//               s3_key: primaryImage.s3_key,
//               product_id: createdVariant.product_id,
//               variant_id: createdVariant.id,
//             };
//           }

//           // Only upload if we have a file buffer (new upload)
//           if (!image.file?.buffer) {
//             // If no buffer but has s3_key, maybe it's already uploaded? Handle accordingly.
//             return {
//               s3_key: image.s3_key,
//               product_id: createdVariant.product_id,
//               variant_id: createdVariant.id,
//             };
//           }

//           const s3key = getRandomImageName();
//           const params = {
//             Bucket: process.env.S3_BUCKET_NAME!,
//             Key: s3key,
//             Body: image.file.buffer,
//             ContentType: image.file.mimetype,
//           };

//           const command = new PutObjectCommand(params);
//           await s3.send(command);

//           return {
//             s3_key: s3key,
//             product_id: createdVariant.product_id,
//             variant_id: createdVariant.id,
//           };
//         })
//       );

//       // Add all results for this variant to the master list
//       imagesToInsert.push(...uploadedImages);
//     })
//   );

//   // Now safely bulk insert AFTER all uploads are done
//   if (imagesToInsert.length > 0) {
//     await ProductImages.bulkCreate(imagesToInsert, { transaction });
//     logger.info(`Inserted ${imagesToInsert.length} variant images`);
//   }

//   return imagesToInsert;
// }
