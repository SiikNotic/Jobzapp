import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import {
  CLIENT_SELECT_COLUMNS,
  CLIENT_SUMMARY_COLUMNS,
  type Client,
  type ClientSummary,
  type ClientType,
} from "./types";

export type ClientListFilters = {
  q?: string;
  type?: ClientType | "all";
};

export async function listClients(
  companyId: string,
  filters: ClientListFilters = {}
): Promise<ClientSummary[]> {
  const supabase = await createSupabaseClient();

  let query = supabase
    .from("clients")
    .select(CLIENT_SUMMARY_COLUMNS)
    .eq("company_id", companyId)
    .order("display_name", { ascending: true });

  if (filters.type && filters.type !== "all") {
    query = query.eq("type", filters.type);
  }

  if (filters.q) {
    // Strip characters that are syntactically significant in PostgREST's
    // `.or()` filter grammar (`,` separates conditions, `(` `)` group them)
    // so user input can never escape the intended ilike conditions.
    const term = filters.q.trim().replace(/[,()]/g, "");
    if (term) {
      query = query.or(
        `display_name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%`
      );
    }
  }

  const { data } = await query;
  return (data as ClientSummary[]) ?? [];
}

export async function getClientById(id: string): Promise<Client | null> {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("clients")
    .select(CLIENT_SELECT_COLUMNS)
    .eq("id", id)
    .single();

  return data as Client | null;
}
