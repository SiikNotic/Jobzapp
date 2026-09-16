"use server";

import { revalidatePath } from "next/cache";

import { requireOwnerCompany } from "@/lib/auth/require-owner";
import { getJobDetail } from "@/lib/jobs/queries";
import { getCompanyById } from "@/lib/company/get-company";
import { getContractTemplateById } from "@/lib/contract-templates/queries";
import { renderContractTemplate } from "@/lib/contract-templates/render";
import { formatAddress } from "@/lib/documents/format-address";
import { JOB_CONTRACT_SELECT_COLUMNS, type JobContract } from "@/lib/job-contracts/types";
import type { Locale } from "@/i18n/routing";

export type JobContractActionResult =
  | { success: true; contract: JobContract }
  | { success: false; error: string };

export async function generateJobContract(
  locale: Locale,
  jobId: string,
  templateId: string
): Promise<JobContractActionResult> {
  const { supabase, companyId } = await requireOwnerCompany();
  if (!companyId) return { success: false, error: "forbidden" };

  const [job, company, template] = await Promise.all([
    getJobDetail(jobId),
    getCompanyById(companyId),
    getContractTemplateById(templateId),
  ]);

  if (!job || job.company_id !== companyId) return { success: false, error: "not_found" };
  if (!company) return { success: false, error: "not_found" };
  if (!template || template.company_id !== companyId) return { success: false, error: "not_found" };

  const companyAddress = formatAddress(company) ?? "";
  const clientAddress =
    [job.address_line1, job.address_line2, [job.city, job.state_province, job.postal_code].filter(Boolean).join(", "), job.country]
      .filter(Boolean)
      .join("\n") || "";

  const renderedContent = renderContractTemplate(template.body, {
    company_name: company.trade_name || company.name,
    company_address: companyAddress,
    company_phone: company.contact_phone ?? "",
    company_email: company.contact_email ?? "",
    client_name: job.client?.display_name ?? "",
    client_address: clientAddress,
    job_code: job.job_code,
    job_description: job.description ?? "",
    job_date: new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
      new Date(`${job.scheduled_date}T00:00:00`)
    ),
    total: "",
    today: new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date()),
  });

  const { data, error } = await supabase
    .from("job_contracts")
    .insert({
      job_id: jobId,
      contract_template_id: templateId,
      rendered_content: renderedContent,
    })
    .select(JOB_CONTRACT_SELECT_COLUMNS)
    .single();

  if (error || !data) return { success: false, error: "save_failed" };

  revalidatePath(`/${locale}/owner/jobs/${jobId}`);

  return { success: true, contract: data as JobContract };
}

export async function sendJobContract(
  locale: Locale,
  jobId: string,
  contractId: string
): Promise<JobContractActionResult> {
  const { supabase, companyId } = await requireOwnerCompany();
  if (!companyId) return { success: false, error: "forbidden" };

  const { data, error } = await supabase
    .from("job_contracts")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", contractId)
    .eq("company_id", companyId)
    .select(JOB_CONTRACT_SELECT_COLUMNS)
    .single();

  if (error || !data) return { success: false, error: "save_failed" };

  revalidatePath(`/${locale}/owner/jobs/${jobId}`);

  return { success: true, contract: data as JobContract };
}
