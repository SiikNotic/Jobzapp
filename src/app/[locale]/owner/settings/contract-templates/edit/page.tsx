"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { notFound, useSearchParams } from "next/navigation";

import { useAuth } from "@/lib/auth/auth-provider";
import { getContractTemplateById } from "@/lib/contract-templates/queries";
import type { ContractTemplate } from "@/lib/contract-templates/types";
import { ContractTemplateForm } from "@/components/owner/contract-template-form";
import { PageLoadingSkeleton } from "@/components/page-loading-skeleton";

function EditContractTemplatePageInner() {
  const id = useSearchParams().get("id");
  const t = useTranslations("contractTemplates.edit");
  const { profile } = useAuth();

  const [template, setTemplate] = React.useState<ContractTemplate | null | undefined>(undefined);

  React.useEffect(() => {
    if (!profile?.company_id || !id) return;
    getContractTemplateById(id).then((data) => {
      if (!data || data.company_id !== profile.company_id) {
        setTemplate(null);
        return;
      }
      setTemplate(data);
    });
  }, [profile?.company_id, id]);

  if (template === null) {
    notFound();
  }

  if (template === undefined) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{template.name}</p>
      </div>

      <ContractTemplateForm template={template} />
    </div>
  );
}

export default function EditContractTemplatePage() {
  return (
    <React.Suspense fallback={<PageLoadingSkeleton />}>
      <EditContractTemplatePageInner />
    </React.Suspense>
  );
}
