import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null));

export const lineItemInputSchema = z.object({
  kind: z.enum(["material", "labor", "other"]),
  description: z.string().trim().min(1).max(200),
  quantity: z.coerce.number().min(0).max(1000000),
  unit_cost: z.coerce.number().min(0).max(1000000),
});

export const quoteSchema = z.object({
  client_address: optionalText(500),
  description: optionalText(4000),
  line_items: z.string().transform((value, ctx) => {
    try {
      const parsed = JSON.parse(value || "[]");
      return z.array(lineItemInputSchema).parse(parsed);
    } catch {
      ctx.addIssue({ code: "custom", message: "invalid_line_items" });
      return z.NEVER;
    }
  }),
  terms: optionalText(4000),
});

export type QuoteInput = z.infer<typeof quoteSchema>;
