import { z } from "zod";

import { JOB_CODE_PATTERN_REGEX } from "./job-code";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null));

export const companySettingsSchema = z.object({
  name: z.string().trim().min(1, "required").max(200),
  trade_name: optionalText(200),
  contact_email: optionalText(200),
  contact_phone: optionalText(30),
  address_line1: optionalText(200),
  address_line2: optionalText(200),
  city: optionalText(120),
  state_province: optionalText(120),
  postal_code: optionalText(20),
  country: z.enum(["US", "PR"]),
  tax_id: optionalText(60),
  default_locale: z.enum(["es", "en"]),
  theme_preference: z.enum(["light", "dark", "system"]),
  document_notes: optionalText(2000),
  job_code_pattern: z
    .string()
    .trim()
    .min(1, "required")
    .max(40)
    .regex(JOB_CODE_PATTERN_REGEX, "invalid_pattern")
    .transform((value) => value.toUpperCase()),
});

export type CompanySettingsInput = z.infer<typeof companySettingsSchema>;
