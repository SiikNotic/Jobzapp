export type SearchCategory = "jobs" | "clients" | "employees" | "quotes" | "invoices";

export type SearchResultItem = {
  id: string;
  primary: string;
  secondary: string | null;
  href: string;
};

export type GlobalSearchResults = Record<SearchCategory, SearchResultItem[]>;
