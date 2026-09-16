export type LineItemKind = "material" | "labor" | "other";

export type LineItem = {
  kind: LineItemKind;
  description: string;
  quantity: number;
  unit_cost: number;
};

export function lineItemsTotal(items: LineItem[]): number {
  return Math.round(items.reduce((sum, item) => sum + item.quantity * item.unit_cost, 0) * 100) / 100;
}

export type DocumentCompanyInfo = {
  name: string;
  logoUrl: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
};
