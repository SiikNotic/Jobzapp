import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { JOB_CONTRACT_SELECT_COLUMNS, type JobContract, type PublicContract } from "./types";

export async function getJobContract(jobId: string): Promise<JobContract | null> {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("job_contracts")
    .select(JOB_CONTRACT_SELECT_COLUMNS)
    .eq("job_id", jobId)
    .maybeSingle();

  return data as JobContract | null;
}

export async function getPublicContract(token: string): Promise<PublicContract | null> {
  const supabase = await createSupabaseClient();
  const { data } = await supabase.rpc("get_contract_by_token", { p_token: token });

  const row = Array.isArray(data) ? data[0] : data;
  return (row as PublicContract | undefined) ?? null;
}
