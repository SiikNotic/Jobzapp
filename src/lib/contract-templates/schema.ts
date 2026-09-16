import { z } from "zod";

export const contractTemplateSchema = z.object({
  name: z.string().trim().min(1, "required").max(200),
  body: z.string().trim().min(1, "required").max(20000),
});

export type ContractTemplateInput = z.infer<typeof contractTemplateSchema>;
