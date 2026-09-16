import { requireOwnerCompany } from "@/lib/auth/require-owner";
import { contractTemplateSchema } from "@/lib/contract-templates/schema";
import {
  CONTRACT_TEMPLATE_SELECT_COLUMNS,
  type ContractTemplate,
} from "@/lib/contract-templates/types";

export type ContractTemplateActionResult =
  | { success: true; template: ContractTemplate }
  | { success: false; error: string };

function parseForm(formData: FormData) {
  return contractTemplateSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    body: String(formData.get("body") ?? ""),
  });
}

export async function createContractTemplate(formData: FormData): Promise<ContractTemplateActionResult> {
  const { supabase, companyId } = await requireOwnerCompany();
  if (!companyId) return { success: false, error: "forbidden" };

  const parsed = parseForm(formData);
  if (!parsed.success) return { success: false, error: "validation" };

  const { data, error } = await supabase
    .from("contract_templates")
    .insert({ ...parsed.data, company_id: companyId })
    .select(CONTRACT_TEMPLATE_SELECT_COLUMNS)
    .single();

  if (error || !data) return { success: false, error: "save_failed" };

  return { success: true, template: data as ContractTemplate };
}

export async function updateContractTemplate(
  templateId: string,
  formData: FormData
): Promise<ContractTemplateActionResult> {
  const { supabase, companyId } = await requireOwnerCompany();
  if (!companyId) return { success: false, error: "forbidden" };

  const parsed = parseForm(formData);
  if (!parsed.success) return { success: false, error: "validation" };

  const { data, error } = await supabase
    .from("contract_templates")
    .update(parsed.data)
    .eq("id", templateId)
    .eq("company_id", companyId)
    .select(CONTRACT_TEMPLATE_SELECT_COLUMNS)
    .single();

  if (error || !data) return { success: false, error: "save_failed" };

  return { success: true, template: data as ContractTemplate };
}

export async function deleteContractTemplate(templateId: string): Promise<{ success: boolean }> {
  const { supabase, companyId } = await requireOwnerCompany();
  if (!companyId) return { success: false };

  const { error } = await supabase
    .from("contract_templates")
    .delete()
    .eq("id", templateId)
    .eq("company_id", companyId);

  if (error) return { success: false };

  return { success: true };
}
