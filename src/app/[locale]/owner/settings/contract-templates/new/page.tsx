"use client";

import { useTranslations } from "next-intl";

import { ContractTemplateForm } from "@/components/owner/contract-template-form";

export default function NewContractTemplatePage() {
  const t = useTranslations("contractTemplates.new");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <ContractTemplateForm />
    </div>
  );
}
