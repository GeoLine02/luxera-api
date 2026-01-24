import { Request } from "express";
import crypto from "crypto";
const PAGE_SIZE = 15;
const S3_ENDPOINT = "https://hel1.your-objectstorage.com/";


function getRandomImageName(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

export { PAGE_SIZE,  S3_ENDPOINT, getRandomImageName };
