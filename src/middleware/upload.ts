import multer from "multer";
import path from "path";
import fs from "fs";

import { AllowedMimeTypes } from "../constants/enums";
import { fileTypeFromBuffer, fileTypeFromFile } from "file-type";
import { NextFunction, Request, Response } from "express";
import { ValidationError } from "../errors/errors";
import logger from "../logger";
const ALLOWED_TYPES = Object.values(AllowedMimeTypes);

// Create uploads folder if not exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
  fileFilter: async function (req, file, callback) {
    if (!ALLOWED_TYPES.includes(file.mimetype as AllowedMimeTypes)) {
      return callback(
        new ValidationError(
          [
            {
              field: "File",
              message: "Invalid MIME type",
            },
          ],
          "Invalid File type"
        )
      );
    }

    const ext = path.extname(file.originalname).toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
      return callback(
        new ValidationError([
          {
            field: "File",
            message: "Invalid File Extenstion",
          },
        ])
      );
    }
    callback(null, true);
  },
});

export const validateUploadedFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    return next(); // No files to validate
  }

  try {
    for (const file of files) {
      // Check actual file type from magic bytes
      const detectedType = await fileTypeFromBuffer(file.buffer);

      if (!detectedType) {
        throw new Error(`Unable to detect file type for ${file.originalname}`);
      }

      if (!ALLOWED_TYPES.includes(detectedType.mime as AllowedMimeTypes)) {
        throw new Error(
          `File ${file.originalname} is not a valid image. Detected: ${detectedType.mime}`
        );
      }
    }
    // All files valid, continue to controller
    next();
  } catch (error) {
    // Clean up uploaded files on validation failure
    for (const file of files) {
      await fs.unlink(file.path, (err) => {
        if (err) throw err;
        logger.warn(file.path, "was deleted");
      });
    }

    // Return error response
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "File validation failed",
    });
  }
};
export default upload;
