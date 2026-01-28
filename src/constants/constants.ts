import { Request } from "express";
import crypto from "crypto";
const PAGE_SIZE = 15;
const S3_ENDPOINT = "https://hel1.your-objectstorage.com/";
const OTP_LENGTH = 4;

function getRandomImageName(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}
function generateOTP(length = 6) {
  return crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
}

export { PAGE_SIZE, S3_ENDPOINT, getRandomImageName, generateOTP, OTP_LENGTH };
