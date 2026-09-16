import { requireOwnerCompany } from "@/lib/auth/require-owner";
import { jobSchema } from "@/lib/jobs/schema";
import { JOB_SELECT_COLUMNS, type Job } from "@/lib/jobs/types";

export type JobActionResult = { success: true; job: Job } | { success: false; error: string };

function parseJobForm(formData: FormData) {
  return jobSchema.safeParse({
    client_id: String(formData.get("client_id") ?? ""),
    address_line1: String(formData.get("address_line1") ?? ""),
    address_line2: String(formData.get("address_line2") ?? ""),
    city: String(formData.get("city") ?? ""),
    state_province: String(formData.get("state_province") ?? ""),
    postal_code: String(formData.get("postal_code") ?? ""),
    country: String(formData.get("country") ?? ""),
    scheduled_date: String(formData.get("scheduled_date") ?? ""),
    scheduled_time: String(formData.get("scheduled_time") ?? ""),
    priority: String(formData.get("priority") ?? "medium"),
    description: String(formData.get("description") ?? ""),
    materials: String(formData.get("materials") ?? "[]"),
    additional_info: String(formData.get("additional_info") ?? ""),
    contract_template_id: String(formData.get("contract_template_id") ?? ""),
    employee_ids: String(formData.get("employee_ids") ?? "[]"),
  });
}

export async function createJob(formData: FormData): Promise<JobActionResult> {
  const { supabase, companyId, userId } = await requireOwnerCompany();
  if (!companyId) return { success: false, error: "forbidden" };

  const parsed = parseJobForm(formData);
  if (!parsed.success) return { success: false, error: "validation" };

  const { employee_ids: employeeIds, ...jobFields } = parsed.data;

  const { data: code, error: codeError } = await supabase.rpc("generate_job_code", {
    p_company_id: companyId,
  });
  if (codeError || !code) return { success: false, error: "code_generation_failed" };

  const { data: job, error } = await supabase
    .from("jobs")
    .insert({
      ...jobFields,
      company_id: companyId,
      job_code: code,
      created_by: userId,
    })
    .select(JOB_SELECT_COLUMNS)
    .single();

  if (error || !job) return { success: false, error: "save_failed" };

  if (employeeIds && employeeIds.length > 0) {
    await supabase.from("job_assignments").insert(
      employeeIds.map((employeeId) => ({
        job_id: job.id,
        employee_id: employeeId,
        assigned_by: userId,
      }))
    );
  }

  return { success: true, job: job as Job };
}

export async function updateJob(jobId: string, formData: FormData): Promise<JobActionResult> {
  const { supabase, companyId } = await requireOwnerCompany();
  if (!companyId) return { success: false, error: "forbidden" };

  const parsed = parseJobForm(formData);
  if (!parsed.success) return { success: false, error: "validation" };

  const jobFields = { ...parsed.data };
  delete jobFields.employee_ids;

  const { data: job, error } = await supabase
    .from("jobs")
    .update(jobFields)
    .eq("id", jobId)
    .eq("company_id", companyId)
    .select(JOB_SELECT_COLUMNS)
    .single();

  if (error || !job) return { success: false, error: "save_failed" };

  return { success: true, job: job as Job };
}

export async function assignEmployee(jobId: string, employeeId: string): Promise<{ success: boolean }> {
  const { supabase, companyId, userId } = await requireOwnerCompany();
  if (!companyId) return { success: false };

  const { error } = await supabase
    .from("job_assignments")
    .insert({ job_id: jobId, employee_id: employeeId, assigned_by: userId });

  if (error) return { success: false };

  return { success: true };
}

export async function unassignEmployee(jobId: string, employeeId: string): Promise<{ success: boolean }> {
  const { supabase, companyId } = await requireOwnerCompany();
  if (!companyId) return { success: false };

  const { error } = await supabase
    .from("job_assignments")
    .delete()
    .eq("job_id", jobId)
    .eq("employee_id", employeeId);

  if (error) return { success: false };

  return { success: true };
}
