import { createClient } from "@/lib/supabase/server";
import { COMPANY_SELECT_COLUMNS, type Company } from "./types";

export async function getCompanyById(
  companyId: string
): Promise<Company | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("companies")
    .select(COMPANY_SELECT_COLUMNS)
    .eq("id", companyId)
    .single();

  return data as Company | null;
}
