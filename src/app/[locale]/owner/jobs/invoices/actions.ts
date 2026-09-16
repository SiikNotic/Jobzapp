import { requireOwnerCompany } from "@/lib/auth/require-owner";
import { INVOICE_SELECT_COLUMNS, type Invoice } from "@/lib/invoices/types";

export type InvoiceActionResult =
  | { success: true; invoice: Invoice }
  | { success: false; error: string };

export async function sendInvoice(invoiceId: string): Promise<InvoiceActionResult> {
  const { supabase, companyId } = await requireOwnerCompany();
  if (!companyId) return { success: false, error: "forbidden" };

  const { data, error } = await supabase
    .from("invoices")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", invoiceId)
    .eq("company_id", companyId)
    .select(INVOICE_SELECT_COLUMNS)
    .single();

  if (error || !data) return { success: false, error: "save_failed" };

  return { success: true, invoice: data as Invoice };
}

export async function markInvoicePaid(
  invoiceId: string,
  paymentNotes: string
): Promise<InvoiceActionResult> {
  const { supabase, companyId } = await requireOwnerCompany();
  if (!companyId) return { success: false, error: "forbidden" };

  const { data, error } = await supabase
    .from("invoices")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      payment_notes: paymentNotes.trim() || null,
    })
    .eq("id", invoiceId)
    .eq("company_id", companyId)
    .select(INVOICE_SELECT_COLUMNS)
    .single();

  if (error || !data) return { success: false, error: "save_failed" };

  return { success: true, invoice: data as Invoice };
}
