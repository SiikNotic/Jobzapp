"use server";

import { requireOwnerCompany } from "@/lib/auth/require-owner";
import type { GlobalSearchResults, SearchResultItem } from "./types";

const EMPTY_RESULTS: GlobalSearchResults = {
  jobs: [],
  clients: [],
  employees: [],
  quotes: [],
  invoices: [],
};

function sanitize(term: string): string {
  // Strip characters that are syntactically significant in PostgREST's
  // `.or()` filter grammar (`,` separates conditions, `(` `)` group them).
  return term.trim().replace(/[,()]/g, "");
}

export async function globalSearch(term: string): Promise<GlobalSearchResults> {
  const { supabase, companyId } = await requireOwnerCompany();
  if (!companyId) return EMPTY_RESULTS;

  const q = sanitize(term);
  if (q.length < 2) return EMPTY_RESULTS;

  const like = `%${q}%`;

  const [clientsRes, jobsRes, employeesRes, quotesRes, invoicesRes] = await Promise.all([
    supabase
      .from("clients")
      .select("id, display_name, phone, email")
      .eq("company_id", companyId)
      .or(`display_name.ilike.${like},phone.ilike.${like},email.ilike.${like}`)
      .limit(5),
    supabase
      .from("jobs")
      .select("id, job_code, client:clients(display_name)")
      .eq("company_id", companyId)
      .ilike("job_code", like)
      .limit(5),
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("company_id", companyId)
      .eq("role", "employee")
      .ilike("full_name", like)
      .limit(5),
    supabase
      .from("quotes")
      .select("id, job_id, quote_number, client_name")
      .eq("company_id", companyId)
      .or(`quote_number.ilike.${like},client_name.ilike.${like}`)
      .limit(5),
    supabase
      .from("invoices")
      .select("id, job_id, invoice_number, client_name")
      .eq("company_id", companyId)
      .or(`invoice_number.ilike.${like},client_name.ilike.${like}`)
      .limit(5),
  ]);

  const clients: SearchResultItem[] = (clientsRes.data ?? []).map((c) => ({
    id: c.id,
    primary: c.display_name,
    secondary: c.phone ?? c.email ?? null,
    href: `/owner/clients/${c.id}`,
  }));

  const jobs: SearchResultItem[] = ((jobsRes.data as unknown as Record<string, unknown>[]) ?? []).map((j) => {
    const client = j.client as { display_name: string } | null;
    return {
      id: j.id as string,
      primary: j.job_code as string,
      secondary: client?.display_name ?? null,
      href: `/owner/jobs/${j.id}`,
    };
  });

  const employees: SearchResultItem[] = (employeesRes.data ?? []).map((e) => ({
    id: e.id,
    primary: e.full_name ?? "",
    secondary: null,
    href: `/owner/employees/${e.id}`,
  }));

  const quotes: SearchResultItem[] = (quotesRes.data ?? []).map((q2) => ({
    id: q2.id,
    primary: q2.quote_number,
    secondary: q2.client_name,
    href: `/owner/jobs/${q2.job_id}/quotes/${q2.id}`,
  }));

  const invoices: SearchResultItem[] = (invoicesRes.data ?? []).map((i) => ({
    id: i.id,
    primary: i.invoice_number,
    secondary: i.client_name,
    href: `/owner/jobs/${i.job_id}/invoices/${i.id}`,
  }));

  return { jobs, clients, employees, quotes, invoices };
}
