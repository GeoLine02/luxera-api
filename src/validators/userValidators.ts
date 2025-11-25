// schemas/userSchema.ts
import { z } from "zod";

export const registerUserSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters long")
    .max(50, "Full name must be at most 50 characters long"),
  email: z.email({ pattern: z.regexes.rfc5322Email }),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password must be at most 100 characters long"),
});


// TypeScript type inferred from schema
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
