// validators/userRegisterSchema.ts
import { body } from "express-validator";

export const userRegisterSchema = [
  body("fullName")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];
