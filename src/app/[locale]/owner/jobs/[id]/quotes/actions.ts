"use server";

import { revalidatePath } from "next/cache";

import { requireOwnerCompany } from "@/lib/auth/require-owner";
import { getJobDetail } from "@/lib/jobs/queries";
import { quoteSchema } from "@/lib/quotes/schema";
import { QUOTE_SELECT_COLUMNS, type Quote } from "@/lib/quotes/types";
import { getQuoteById } from "@/lib/quotes/queries";
import { INVOICE_SELECT_COLUMNS, type Invoice } from "@/lib/invoices/types";
import { lineItemsTotal } from "@/lib/documents/types";
import type { Locale } from "@/i18n/routing";

export type QuoteActionResult = { success: true; quote: Quote } | { success: false; error: string };
export type InvoiceActionResult =
  | { success: true; invoice: Invoice }
  | { success: false; error: string };

function parseQuoteForm(formData: FormData) {
  return quoteSchema.safeParse({
    client_address: String(formData.get("client_address") ?? ""),
    description: String(formData.get("description") ?? ""),
    line_items: String(formData.get("line_items") ?? "[]"),
    terms: String(formData.get("terms") ?? ""),
  });
}

export async function createQuote(
  locale: Locale,
  jobId: string,
  formData: FormData
): Promise<QuoteActionResult> {
  const { supabase, companyId, userId } = await requireOwnerCompany();
  if (!companyId) return { success: false, error: "forbidden" };

  const job = await getJobDetail(jobId);
  if (!job || job.company_id !== companyId) return { success: false, error: "not_found" };

  const parsed = parseQuoteForm(formData);
  if (!parsed.success) return { success: false, error: "validation" };

  const { data: quoteNumber, error: numberError } = await supabase.rpc("generate_quote_number", {
    p_company_id: companyId,
  });
  if (numberError || !quoteNumber) return { success: false, error: "number_generation_failed" };

  const { data, error } = await supabase
    .from("quotes")
    .insert({
      job_id: jobId,
      client_id: job.client?.id,
      quote_number: quoteNumber,
      client_name: job.client?.display_name ?? "",
      client_address: parsed.data.client_address,
      description: parsed.data.description,
      line_items: parsed.data.line_items,
      terms: parsed.data.terms,
      total: lineItemsTotal(parsed.data.line_items),
      created_by: userId,
    })
    .select(QUOTE_SELECT_COLUMNS)
    .single();

  if (error || !data) return { success: false, error: "save_failed" };

  revalidatePath(`/${locale}/owner/jobs/${jobId}`);

  return { success: true, quote: data as Quote };
}

export async function updateQuote(
  locale: Locale,
  jobId: string,
  quoteId: string,
  formData: FormData
): Promise<QuoteActionResult> {
  const { supabase, companyId } = await requireOwnerCompany();
  if (!companyId) return { success: false, error: "forbidden" };

  const parsed = parseQuoteForm(formData);
  if (!parsed.success) return { success: false, error: "validation" };

  const { data, error } = await supabase
    .from("quotes")
    .update({
      client_address: parsed.data.client_address,
      description: parsed.data.description,
      line_items: parsed.data.line_items,
      terms: parsed.data.terms,
      total: lineItemsTotal(parsed.data.line_items),
    })
    .eq("id", quoteId)
    .eq("company_id", companyId)
    .eq("status", "draft")
    .select(QUOTE_SELECT_COLUMNS)
    .single();

  if (error || !data) return { success: false, error: "save_failed" };

  revalidatePath(`/${locale}/owner/jobs/${jobId}`);
  revalidatePath(`/${locale}/owner/jobs/${jobId}/quotes/${quoteId}`);

  return { success: true, quote: data as Quote };
}

export async function sendQuote(
  locale: Locale,
  jobId: string,
  quoteId: string
): Promise<QuoteActionResult> {
  const { supabase, companyId } = await requireOwnerCompany();
  if (!companyId) return { success: false, error: "forbidden" };

  const { data, error } = await supabase
    .from("quotes")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", quoteId)
    .eq("company_id", companyId)
    .select(QUOTE_SELECT_COLUMNS)
    .single();

  if (error || !data) return { success: false, error: "save_failed" };

  revalidatePath(`/${locale}/owner/jobs/${jobId}`);
  revalidatePath(`/${locale}/owner/jobs/${jobId}/quotes/${quoteId}`);

  return { success: true, quote: data as Quote };
}

export async function decideQuote(
  locale: Locale,
  jobId: string,
  quoteId: string,
  decision: "accepted" | "rejected"
): Promise<QuoteActionResult> {
  const { supabase, companyId } = await requireOwnerCompany();
  if (!companyId) return { success: false, error: "forbidden" };

  const { data, error } = await supabase
    .from("quotes")
    .update({ status: decision, decided_at: new Date().toISOString() })
    .eq("id", quoteId)
    .eq("company_id", companyId)
    .select(QUOTE_SELECT_COLUMNS)
    .single();

  if (error || !data) return { success: false, error: "save_failed" };

  revalidatePath(`/${locale}/owner/jobs/${jobId}`);
  revalidatePath(`/${locale}/owner/jobs/${jobId}/quotes/${quoteId}`);

  return { success: true, quote: data as Quote };
}

export async function convertQuoteToInvoice(
  locale: Locale,
  jobId: string,
  quoteId: string
): Promise<InvoiceActionResult> {
  const { supabase, companyId, userId } = await requireOwnerCompany();
  if (!companyId) return { success: false, error: "forbidden" };

  const quote = await getQuoteById(quoteId);
  if (!quote || quote.company_id !== companyId) return { success: false, error: "not_found" };
  if (quote.status !== "accepted") return { success: false, error: "quote_not_accepted" };

  const { data: invoiceNumber, error: numberError } = await supabase.rpc("generate_invoice_number", {
    p_company_id: companyId,
  });
  if (numberError || !invoiceNumber) return { success: false, error: "number_generation_failed" };

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      job_id: jobId,
      client_id: quote.client_id,
      quote_id: quote.id,
      invoice_number: invoiceNumber,
      client_name: quote.client_name,
      client_address: quote.client_address,
      description: quote.description,
      line_items: quote.line_items,
      terms: quote.terms,
      total: quote.total,
      created_by: userId,
    })
    .select(INVOICE_SELECT_COLUMNS)
    .single();

  if (error || !data) return { success: false, error: "save_failed" };

  revalidatePath(`/${locale}/owner/jobs/${jobId}`);

  return { success: true, invoice: data as Invoice };
}
