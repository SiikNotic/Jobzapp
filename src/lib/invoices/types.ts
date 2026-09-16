import type { LineItem } from "@/lib/documents/types";

export type InvoiceStatus = "draft" | "sent" | "paid";

export type Invoice = {
  id: string;
  company_id: string;
  job_id: string;
  client_id: string;
  quote_id: string | null;
  invoice_number: string;
  client_name: string;
  client_address: string | null;
  description: string | null;
  line_items: LineItem[];
  terms: string | null;
  total: number;
  status: InvoiceStatus;
  sent_at: string | null;
  paid_at: string | null;
  payment_notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export const INVOICE_SELECT_COLUMNS =
  "id, company_id, job_id, client_id, quote_id, invoice_number, client_name, client_address, description, line_items, terms, total, status, sent_at, paid_at, payment_notes, created_by, created_at, updated_at";
