export type ContractMergeData = {
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  client_name: string;
  client_address: string;
  job_code: string;
  job_description: string;
  job_date: string;
  total: string;
  today: string;
};

export const CONTRACT_PLACEHOLDERS: (keyof ContractMergeData)[] = [
  "company_name",
  "company_address",
  "company_phone",
  "company_email",
  "client_name",
  "client_address",
  "job_code",
  "job_description",
  "job_date",
  "total",
  "today",
];

export function renderContractTemplate(body: string, data: ContractMergeData): string {
  return CONTRACT_PLACEHOLDERS.reduce(
    (text, key) => text.replaceAll(`{{${key}}}`, data[key] || "—"),
    body
  );
}
