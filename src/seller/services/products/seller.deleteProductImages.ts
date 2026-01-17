import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import ProductImages from "../../../sequelize/models/productimages";
import { s3 } from "../../../app";
import logger from "../../../logger";
import { Transaction } from "sequelize";

export async function deleteProductImagesService(
  productId: number,
  deletedImageIds: number[],
  t: Transaction,
) {
  if (deletedImageIds.length > 0) {
    const deletedImages = await ProductImages.findAll({
      where: { id: deletedImageIds, product_id: productId },
      transaction: t,
    });
    await Promise.all(
      deletedImages.map(async (img) => {
        try {
          await s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.S3_BUCKET_NAME!,
              Key: img.s3_key,
            }),
          );
        } catch (err) {
          logger.warn(`Failed to delete S3 object ${img.s3_key}`, err);
        }
      }),
    );
    const deleted = await ProductImages.destroy({
      where: { id: deletedImageIds },
      transaction: t,
    });
    console.log(`deleted ${deleted} images for product ${productId}`);
    return deleted;
  }
}
