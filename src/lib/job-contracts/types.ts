export type JobContractStatus = "draft" | "sent" | "signed";

export type JobContract = {
  id: string;
  company_id: string;
  job_id: string;
  contract_template_id: string;
  rendered_content: string;
  accepted_content: string | null;
  access_token: string;
  status: JobContractStatus;
  sent_at: string | null;
  signed_at: string | null;
  signer_name: string | null;
  signature_data_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export const JOB_CONTRACT_SELECT_COLUMNS =
  "id, company_id, job_id, contract_template_id, rendered_content, accepted_content, access_token, status, sent_at, signed_at, signer_name, signature_data_url, created_by, created_at, updated_at";

export type PublicContract = {
  id: string;
  status: JobContractStatus;
  rendered_content: string;
  accepted_content: string | null;
  sent_at: string | null;
  signed_at: string | null;
  signer_name: string | null;
  signature_data_url: string | null;
};
