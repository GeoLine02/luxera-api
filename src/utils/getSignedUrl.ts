import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../app";

export async function GetSignedUrlFromS3(key: string) {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
  };
  const signedUrl = await getSignedUrl(s3, new GetObjectCommand(params), {
    expiresIn: 3600,
  });
  return signedUrl;
}
