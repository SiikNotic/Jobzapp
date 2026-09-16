"use server";

import { revalidatePath } from "next/cache";

import { requireOwnerCompany } from "@/lib/auth/require-owner";
import { clientSchema } from "@/lib/clients/schema";
import {
  CLIENT_SELECT_COLUMNS,
  CLIENT_SUMMARY_COLUMNS,
  type Client,
  type ClientSummary,
} from "@/lib/clients/types";
import type { Locale } from "@/i18n/routing";

export type ClientActionResult =
  | { success: true; client: Client }
  | { success: false; error: string };

function parseClientForm(formData: FormData) {
  return clientSchema.safeParse({
    type: String(formData.get("type") ?? "individual"),
    full_name: String(formData.get("full_name") ?? ""),
    company_name: String(formData.get("company_name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    address_line1: String(formData.get("address_line1") ?? ""),
    address_line2: String(formData.get("address_line2") ?? ""),
    city: String(formData.get("city") ?? ""),
    state_province: String(formData.get("state_province") ?? ""),
    postal_code: String(formData.get("postal_code") ?? ""),
    country: String(formData.get("country") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  });
}

export async function createClientRecord(
  locale: Locale,
  formData: FormData
): Promise<ClientActionResult> {
  const { supabase, companyId, userId } = await requireOwnerCompany();
  if (!companyId) return { success: false, error: "forbidden" };

  const parsed = parseClientForm(formData);
  if (!parsed.success) return { success: false, error: "validation" };

  const { data, error } = await supabase
    .from("clients")
    .insert({ ...parsed.data, company_id: companyId, created_by: userId })
    .select(CLIENT_SELECT_COLUMNS)
    .single();

  if (error || !data) return { success: false, error: "save_failed" };

  revalidatePath(`/${locale}/owner/clients`);

  return { success: true, client: data as Client };
}

export async function updateClientRecord(
  locale: Locale,
  clientId: string,
  formData: FormData
): Promise<ClientActionResult> {
  const { supabase, companyId } = await requireOwnerCompany();
  if (!companyId) return { success: false, error: "forbidden" };

  const parsed = parseClientForm(formData);
  if (!parsed.success) return { success: false, error: "validation" };

  const { data, error } = await supabase
    .from("clients")
    .update(parsed.data)
    .eq("id", clientId)
    .eq("company_id", companyId)
    .select(CLIENT_SELECT_COLUMNS)
    .single();

  if (error || !data) return { success: false, error: "save_failed" };

  revalidatePath(`/${locale}/owner/clients`);
  revalidatePath(`/${locale}/owner/clients/${clientId}`);

  return { success: true, client: data as Client };
}

export type PotentialDuplicate = Pick<Client, "id" | "display_name" | "type">;

export async function findPotentialDuplicates(
  email: string,
  phone: string,
  excludeId?: string
): Promise<PotentialDuplicate[]> {
  const { supabase, companyId } = await requireOwnerCompany();
  if (!companyId) return [];

  const normalizedEmail = email.trim().toLowerCase().replace(/[,()]/g, "");
  const normalizedPhone = phone.trim().replace(/[,()]/g, "");

  if (!normalizedEmail && !normalizedPhone) return [];

  const conditions: string[] = [];
  if (normalizedEmail) conditions.push(`email.ilike.${normalizedEmail}`);
  if (normalizedPhone) conditions.push(`phone.eq.${normalizedPhone}`);

  let query = supabase
    .from("clients")
    .select("id, display_name, type")
    .eq("company_id", companyId)
    .or(conditions.join(","))
    .limit(5);

  if (excludeId) query = query.neq("id", excludeId);

  const { data } = await query;
  return (data as PotentialDuplicate[]) ?? [];
}

export async function searchClients(query: string): Promise<ClientSummary[]> {
  const { supabase, companyId } = await requireOwnerCompany();
  if (!companyId) return [];

  const term = query.trim().replace(/[,()]/g, "");
  if (!term) return [];

  const { data } = await supabase
    .from("clients")
    .select(CLIENT_SUMMARY_COLUMNS)
    .eq("company_id", companyId)
    .or(`display_name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%`)
    .order("display_name", { ascending: true })
    .limit(8);

  return (data as ClientSummary[]) ?? [];
}
