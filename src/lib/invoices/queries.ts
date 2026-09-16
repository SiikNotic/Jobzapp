import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { INVOICE_SELECT_COLUMNS, type Invoice } from "./types";

export async function listInvoicesForJob(jobId: string): Promise<Invoice[]> {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("invoices")
    .select(INVOICE_SELECT_COLUMNS)
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });

  return (data as Invoice[]) ?? [];
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("invoices")
    .select(INVOICE_SELECT_COLUMNS)
    .eq("id", id)
    .single();

  return data as Invoice | null;
}

export async function listPaidInvoicesForCompany(companyId: string, limit = 20): Promise<Invoice[]> {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("invoices")
    .select(INVOICE_SELECT_COLUMNS)
    .eq("company_id", companyId)
    .eq("status", "paid")
    .order("paid_at", { ascending: false })
    .limit(limit);

  return (data as Invoice[]) ?? [];
}
