import { z } from "zod";

export const payRateSchema = z.object({
  employee_id: z.string().uuid(),
  hourly_rate: z.coerce.number().min(0, "invalid_rate").max(10000, "invalid_rate"),
});

export const timeEntrySchema = z.object({
  employee_id: z.string().uuid(),
  work_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "invalid_date"),
  hours: z.coerce.number().gt(0, "invalid_hours").max(24, "invalid_hours"),
  notes: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null)),
});

export const issueReceiptSchema = z.object({
  employee_id: z.string().uuid(),
  week_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "invalid_date"),
});

export type PayRateInput = z.infer<typeof payRateSchema>;
export type TimeEntryInput = z.infer<typeof timeEntrySchema>;
export type IssueReceiptInput = z.infer<typeof issueReceiptSchema>;
