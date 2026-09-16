import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null));

export const jobMaterialSchema = z.object({
  name: z.string().trim().min(1).max(200),
  quantity: z.string().trim().max(50),
});

export const jobSchema = z.object({
  client_id: z.string().uuid("client_required"),
  address_line1: optionalText(200),
  address_line2: optionalText(200),
  city: optionalText(120),
  state_province: optionalText(120),
  postal_code: optionalText(20),
  country: optionalText(120),
  scheduled_date: z.string().min(1, "date_required"),
  scheduled_time: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null)),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  description: optionalText(4000),
  materials: z
    .string()
    .transform((value, ctx) => {
      try {
        const parsed = JSON.parse(value || "[]");
        return z.array(jobMaterialSchema).parse(parsed);
      } catch {
        ctx.addIssue({ code: "custom", message: "invalid_materials" });
        return z.NEVER;
      }
    }),
  additional_info: optionalText(4000),
  contract_template_id: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null)),
  employee_ids: z
    .string()
    .transform((value, ctx) => {
      try {
        const parsed = JSON.parse(value || "[]");
        return z.array(z.string().uuid()).parse(parsed);
      } catch {
        ctx.addIssue({ code: "custom", message: "invalid_employees" });
        return z.NEVER;
      }
    })
    .optional(),
});

export type JobInput = z.infer<typeof jobSchema>;
