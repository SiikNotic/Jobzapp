export type PayRate = {
  employee_id: string;
  hourly_rate: number;
  updated_at: string;
};

export type TimeEntry = {
  id: string;
  company_id: string;
  employee_id: string;
  job_id: string | null;
  work_date: string;
  hours: number;
  notes: string | null;
  created_at: string;
};

export type TimeEntryWithJob = TimeEntry & {
  job_code: string | null;
};

export type PayReceipt = {
  id: string;
  company_id: string;
  employee_id: string;
  receipt_number: string;
  week_start_date: string;
  week_end_date: string;
  hours_worked: number;
  hourly_rate: number;
  gross_pay: number;
  notes: string | null;
  issued_at: string;
};

export type WeekSummary = {
  weekStart: string;
  weekEnd: string;
  hours: number;
  entries: TimeEntryWithJob[];
  receipt: PayReceipt | null;
};
