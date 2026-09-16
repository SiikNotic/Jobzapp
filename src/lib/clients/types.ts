export type ClientType = "individual" | "company";

export type Client = {
  id: string;
  company_id: string;
  type: ClientType;
  full_name: string | null;
  company_name: string | null;
  display_name: string;
  phone: string | null;
  email: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state_province: string | null;
  postal_code: string | null;
  country: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ClientSummary = Pick<
  Client,
  | "id"
  | "type"
  | "display_name"
  | "phone"
  | "email"
  | "address_line1"
  | "address_line2"
  | "city"
  | "state_province"
  | "postal_code"
  | "country"
>;

export const CLIENT_SELECT_COLUMNS =
  "id, company_id, type, full_name, company_name, display_name, phone, email, address_line1, address_line2, city, state_province, postal_code, country, notes, created_by, created_at, updated_at";

// Includes the address so callers like the Jobs form's client picker can
// autofill a job's site address the moment a client is selected, without a
// second round-trip.
export const CLIENT_SUMMARY_COLUMNS =
  "id, type, display_name, phone, email, address_line1, address_line2, city, state_province, postal_code, country";
