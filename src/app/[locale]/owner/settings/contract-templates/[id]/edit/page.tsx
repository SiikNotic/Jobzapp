import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import type { Locale } from "@/i18n/routing";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { getContractTemplateById } from "@/lib/contract-templates/queries";
import { ContractTemplateForm } from "@/components/owner/contract-template-form";

export default async function EditContractTemplatePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = (await params) as { locale: Locale; id: string };
  const t = await getTranslations({ locale, namespace: "contractTemplates.edit" });

  const { profile } = await getCurrentProfile();
  const template = await getContractTemplateById(id);

  if (!template || template.company_id !== profile?.company_id) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{template.name}</p>
      </div>

      <ContractTemplateForm template={template} locale={locale} />
    </div>
  );
}
