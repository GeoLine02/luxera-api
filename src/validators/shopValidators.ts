import { z } from "zod";
const regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
export const registerShopSchema = z.object({
  shopName: z
    .string()
    .min(3, "Shop name must be at least 3 characters long")
    .max(50, "Shop name must be at most 50 characters long"),
  password: z.string().min(8).regex(regex,"Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character"),
});



export const loginShopSchema = z.object({
 
  password: z.string().min(8).regex(regex,"Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character"),

});
