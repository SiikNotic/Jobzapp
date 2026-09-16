import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { ContractTemplateForm } from "@/components/owner/contract-template-form";

export default async function NewContractTemplatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "contractTemplates.new" });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <ContractTemplateForm locale={locale} />
    </div>
  );
}
