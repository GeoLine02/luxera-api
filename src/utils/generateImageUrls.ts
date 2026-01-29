import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../app";
import logger from "../logger";

export async function generateSignedImageUrls(images: any[]) {
  if (!images || images.length === 0) {
    return [];
  }

  return Promise.all(
    images.map(async (img) => {
      try {
        // If no S3 key, return null URL
        if (!img.s3_key) {
          return {
            id: img.id,
            imageUrl: null,
            isPrimary: img.is_primary || false,
          };
        }

        // Generate signed URL valid for 1 hour
        const signedUrl = await getSignedUrl(
          s3,
          new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: img.s3_key,
          }),
          { expiresIn: 3600 }, // 1 hour
        );

        return {
          id: img.id,
          imageUrl: signedUrl,
          isPrimary: img.is_primary || false,
        };
      } catch (error) {
        logger.error(
          `Failed to generate signed URL for image ${img.id}:`,
          error,
        );
        return {
          id: img.id,
          imageUrl: null,
          isPrimary: img.is_primary || false,
        };
      }
    }),
  );
}
