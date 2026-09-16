export type AuditEntityType =
  | "job"
  | "quote"
  | "invoice"
  | "expense_request"
  | "pay_receipt"
  | "employee_pay_rate"
  | "job_contract"
  | "job_assignment";

export type AuditEvent = {
  id: string;
  entity_type: AuditEntityType;
  entity_id: string;
  action: string;
  label: string;
  detail: string | null;
  amount: number | null;
  actor_id: string | null;
  actor_label: string | null;
  actor_name: string | null;
  created_at: string;
};
