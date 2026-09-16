import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null));

export const expenseRequestSchema = z.object({
  job_id: z.string().uuid(),
  material_name: z.string().trim().min(1, "required").max(200),
  reason: z.string().trim().min(1, "required").max(1000),
  quantity: z.string().trim().min(1, "required").max(50),
  estimated_cost: z.coerce.number().min(0, "invalid_cost").max(1000000, "invalid_cost"),
  additional_info: optionalText(2000),
});

export type ExpenseRequestInput = z.infer<typeof expenseRequestSchema>;
