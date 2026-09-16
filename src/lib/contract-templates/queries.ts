import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { CONTRACT_TEMPLATE_SELECT_COLUMNS, type ContractTemplate } from "./types";

export async function listContractTemplatesFull(companyId: string): Promise<ContractTemplate[]> {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("contract_templates")
    .select(CONTRACT_TEMPLATE_SELECT_COLUMNS)
    .eq("company_id", companyId)
    .order("name", { ascending: true });

  return (data as ContractTemplate[]) ?? [];
}

export async function getContractTemplateById(id: string): Promise<ContractTemplate | null> {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("contract_templates")
    .select(CONTRACT_TEMPLATE_SELECT_COLUMNS)
    .eq("id", id)
    .single();

  return data as ContractTemplate | null;
}
