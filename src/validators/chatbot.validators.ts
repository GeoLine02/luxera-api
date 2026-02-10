import z from "zod";

const userPromptSchema = z.object({
  userPrompt: z
    .string()
    .min(1, "userPrompt is required")
    .max(1000, "userPrompt must be less than 1000 characters"),
});
export { userPromptSchema };
