import type { LineItem } from "@/lib/documents/types";

export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected";

export type Quote = {
  id: string;
  company_id: string;
  job_id: string;
  client_id: string;
  quote_number: string;
  client_name: string;
  client_address: string | null;
  description: string | null;
  line_items: LineItem[];
  terms: string | null;
  total: number;
  status: QuoteStatus;
  sent_at: string | null;
  decided_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export const QUOTE_SELECT_COLUMNS =
  "id, company_id, job_id, client_id, quote_number, client_name, client_address, description, line_items, terms, total, status, sent_at, decided_at, created_by, created_at, updated_at";
