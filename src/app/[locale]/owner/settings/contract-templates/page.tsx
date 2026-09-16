"use client";

import * as React from "react";
import { FileSignature, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth/auth-provider";
import { listContractTemplatesFull } from "@/lib/contract-templates/queries";
import type { ContractTemplate } from "@/lib/contract-templates/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageLoadingSkeleton } from "@/components/page-loading-skeleton";

export default function ContractTemplatesPage() {
  const t = useTranslations("contractTemplates.list");
  const { profile } = useAuth();
  const [templates, setTemplates] = React.useState<ContractTemplate[] | null>(null);

  React.useEffect(() => {
    if (!profile?.company_id) return;
    listContractTemplatesFull(profile.company_id).then(setTemplates);
  }, [profile?.company_id]);

  if (!templates) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button asChild>
          <Link href="/owner/settings/contract-templates/new">
            <Plus /> {t("newTemplate")}
          </Link>
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <FileSignature className="size-8 text-muted-foreground" />
            <p className="font-medium">{t("emptyTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("emptyDescription")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {templates.map((template) => (
            <Link
              key={template.id}
              href={`/owner/settings/contract-templates/edit?id=${template.id}`}
              className="flex items-center justify-between gap-2 rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
            >
              <div className="flex items-center gap-2">
                <FileSignature className="size-4 text-muted-foreground" />
                <span className="font-medium">{template.name}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
