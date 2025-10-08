import { z } from "zod";

export const registerShopSchema = z.object({
  shopName: z
    .string()
    .min(3, "Shop name must be at least 3 characters long")
    .max(50, "Shop name must be at most 50 characters long"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const loginShopSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
