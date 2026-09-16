import type { CompanyCountry } from "./types";

/**
 * Reference data for how jurisdiction drives the Taxes / Payroll module.
 * The module itself isn't built yet, but the company's country already
 * determines which forms will apply once it is.
 */
export const TAX_FORMS_BY_COUNTRY: Record<CompanyCountry, string[]> = {
  US: ["W-2", "W-4", "W-9", "1099-NEC", "941", "940"],
  PR: ["Modelo 499 R-2/W-2PR", "Modelo SC 2788", "Modelo 941-PR", "Modelo 480"],
};
