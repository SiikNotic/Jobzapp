"use server";

import { revalidatePath } from "next/cache";

import { requireOwnerCompany } from "@/lib/auth/require-owner";
import { companySettingsSchema } from "@/lib/company/schema";
import { COMPANY_SELECT_COLUMNS, type Company } from "@/lib/company/types";
import type { Locale } from "@/i18n/routing";

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

export type UpdateCompanySettingsResult =
  | { success: true; company: Company }
  | { success: false; error: string };

export async function updateCompanySettings(
  locale: Locale,
  formData: FormData
): Promise<UpdateCompanySettingsResult> {
  const { supabase, companyId } = await requireOwnerCompany();
  if (!companyId) {
    return { success: false, error: "forbidden" };
  }

  const raw = {
    name: String(formData.get("name") ?? ""),
    trade_name: String(formData.get("trade_name") ?? ""),
    contact_email: String(formData.get("contact_email") ?? ""),
    contact_phone: String(formData.get("contact_phone") ?? ""),
    address_line1: String(formData.get("address_line1") ?? ""),
    address_line2: String(formData.get("address_line2") ?? ""),
    city: String(formData.get("city") ?? ""),
    state_province: String(formData.get("state_province") ?? ""),
    postal_code: String(formData.get("postal_code") ?? ""),
    country: String(formData.get("country") ?? "US"),
    tax_id: String(formData.get("tax_id") ?? ""),
    default_locale: String(formData.get("default_locale") ?? "es"),
    theme_preference: String(formData.get("theme_preference") ?? "system"),
    document_notes: String(formData.get("document_notes") ?? ""),
    job_code_pattern: String(formData.get("job_code_pattern") ?? ""),
  };

  const parsed = companySettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: "validation" };
  }

  const update: Record<string, unknown> = { ...parsed.data };

  const removeLogo = formData.get("remove_logo") === "true";
  const logoFile = formData.get("logo");

  if (removeLogo) {
    update.logo_url = null;
  } else if (logoFile instanceof File && logoFile.size > 0) {
    if (logoFile.size > MAX_LOGO_BYTES) {
      return { success: false, error: "logo_too_large" };
    }
    if (!ALLOWED_LOGO_TYPES.includes(logoFile.type)) {
      return { success: false, error: "logo_invalid_type" };
    }

    const extension = logoFile.type === "image/svg+xml" ? "svg" : logoFile.type.split("/")[1];
    const path = `${companyId}/logo.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("company-logos")
      .upload(path, logoFile, { upsert: true, contentType: logoFile.type });

    if (uploadError) {
      return { success: false, error: "logo_upload_failed" };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("company-logos").getPublicUrl(path);

    update.logo_url = `${publicUrl}?v=${Date.now()}`;
  }

  const { data: updated, error } = await supabase
    .from("companies")
    .update(update)
    .eq("id", companyId)
    .select(COMPANY_SELECT_COLUMNS)
    .single();

  if (error || !updated) {
    return { success: false, error: "save_failed" };
  }

  revalidatePath(`/${locale}/owner/settings`);

  return { success: true, company: updated as Company };
}
