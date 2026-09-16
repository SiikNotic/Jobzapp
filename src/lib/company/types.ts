export type CompanyCountry = "US" | "PR";
export type CompanyThemePreference = "light" | "dark" | "system";

export type Company = {
  id: string;
  name: string;
  trade_name: string | null;
  logo_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state_province: string | null;
  postal_code: string | null;
  country: CompanyCountry;
  tax_id: string | null;
  currency: string;
  default_locale: "es" | "en";
  theme_preference: CompanyThemePreference;
  document_notes: string | null;
  job_code_pattern: string;
  job_code_next_seq: number;
  created_at: string;
  updated_at: string;
};

export const COMPANY_SELECT_COLUMNS =
  "id, name, trade_name, logo_url, contact_email, contact_phone, address_line1, address_line2, city, state_province, postal_code, country, tax_id, currency, default_locale, theme_preference, document_notes, job_code_pattern, job_code_next_seq, created_at, updated_at";
