import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { expenseRequestSchema } from "./schema";
import type { ExpenseRequestStatus } from "./types";

export type ExpenseRequestActionResult =
  | { success: true }
  | { success: false; error: string };

export async function createExpenseRequest(
  jobId: string,
  formData: FormData
): Promise<ExpenseRequestActionResult> {
  const supabase = createSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "unauthenticated" };

  const parsed = expenseRequestSchema.safeParse({
    job_id: jobId,
    material_name: String(formData.get("material_name") ?? ""),
    reason: String(formData.get("reason") ?? ""),
    quantity: String(formData.get("quantity") ?? ""),
    estimated_cost: String(formData.get("estimated_cost") ?? ""),
    additional_info: String(formData.get("additional_info") ?? ""),
  });

  if (!parsed.success) return { success: false, error: "validation" };

  const { error } = await supabase.from("expense_requests").insert({
    ...parsed.data,
    requested_by: user.id,
  });

  if (error) return { success: false, error: "save_failed" };

  return { success: true };
}

export async function reviewExpenseRequest(
  requestId: string,
  decision: Extract<ExpenseRequestStatus, "approved" | "rejected">,
  notes: string
): Promise<ExpenseRequestActionResult> {
  const supabase = createSupabaseClient();

  const { error } = await supabase.rpc("review_expense_request", {
    p_request_id: requestId,
    p_decision: decision,
    p_notes: notes.trim() || null,
  });

  if (error) return { success: false, error: "not_allowed" };

  return { success: true };
}
