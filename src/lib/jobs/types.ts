export type JobStatus = "scheduled" | "in_progress" | "completed" | "cancelled";
export type JobPriority = "low" | "medium" | "high" | "urgent";

export type JobMaterial = {
  name: string;
  quantity: string;
};

export type Job = {
  id: string;
  company_id: string;
  job_code: string;
  client_id: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state_province: string | null;
  postal_code: string | null;
  country: string | null;
  scheduled_date: string;
  scheduled_time: string | null;
  priority: JobPriority;
  description: string | null;
  materials: JobMaterial[];
  additional_info: string | null;
  status: JobStatus;
  status_changed_at: string;
  contract_template_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type JobClientInfo = {
  id: string;
  type: "individual" | "company";
  display_name: string;
  phone: string | null;
  email: string | null;
};

export type JobAssignee = {
  id: string;
  full_name: string | null;
};

export type JobStatusEvent = {
  id: string;
  status: JobStatus;
  changed_at: string;
  changed_by_name: string | null;
};

export type JobListItem = {
  id: string;
  job_code: string;
  scheduled_date: string;
  scheduled_time: string | null;
  priority: JobPriority;
  status: JobStatus;
  client: JobClientInfo | null;
};

export type JobDetail = Job & {
  client: JobClientInfo | null;
  assignees: JobAssignee[];
  status_events: JobStatusEvent[];
  contract_template_name: string | null;
};

export type Employee = {
  id: string;
  full_name: string | null;
};

export const JOB_SELECT_COLUMNS =
  "id, company_id, job_code, client_id, address_line1, address_line2, city, state_province, postal_code, country, scheduled_date, scheduled_time, priority, description, materials, additional_info, status, status_changed_at, contract_template_id, created_by, created_at, updated_at";
