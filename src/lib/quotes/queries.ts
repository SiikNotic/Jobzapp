import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { QUOTE_SELECT_COLUMNS, type Quote } from "./types";

export async function listQuotesForJob(jobId: string): Promise<Quote[]> {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("quotes")
    .select(QUOTE_SELECT_COLUMNS)
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });

  return (data as Quote[]) ?? [];
}

export async function getQuoteById(id: string): Promise<Quote | null> {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("quotes")
    .select(QUOTE_SELECT_COLUMNS)
    .eq("id", id)
    .single();

  return data as Quote | null;
}

export async function getInvoiceIdForQuote(quoteId: string): Promise<string | null> {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("invoices")
    .select("id")
    .eq("quote_id", quoteId)
    .maybeSingle();

  return data?.id ?? null;
}
