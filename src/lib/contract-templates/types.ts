export type ContractTemplate = {
  id: string;
  company_id: string;
  name: string;
  body: string;
  created_at: string;
  updated_at: string;
};

export const CONTRACT_TEMPLATE_SELECT_COLUMNS =
  "id, company_id, name, body, created_at, updated_at";
