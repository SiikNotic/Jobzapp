import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null));

export const clientSchema = z
  .object({
    type: z.enum(["individual", "company"]),
    full_name: optionalText(200),
    company_name: optionalText(200),
    phone: optionalText(30),
    email: optionalText(200),
    address_line1: optionalText(200),
    address_line2: optionalText(200),
    city: optionalText(120),
    state_province: optionalText(120),
    postal_code: optionalText(20),
    country: optionalText(120),
    notes: optionalText(2000),
  })
  .refine(
    (data) =>
      data.type === "individual" ? Boolean(data.full_name) : Boolean(data.company_name),
    {
      message: "name_required",
      path: ["full_name"],
    }
  );

export type ClientInput = z.infer<typeof clientSchema>;
