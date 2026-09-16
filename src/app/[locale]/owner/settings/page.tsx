"use client";

import * as React from "react";
import { FileSignature } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth/auth-provider";
import { getCompanyById } from "@/lib/company/get-company";
import type { Company } from "@/lib/company/types";
import { listContractTemplatesFull } from "@/lib/contract-templates/queries";
import type { ContractTemplate } from "@/lib/contract-templates/types";
import { CompanySettingsForm } from "@/components/owner/company-settings-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageLoadingSkeleton } from "@/components/page-loading-skeleton";

export default function SettingsPage() {
  const t = useTranslations("contractTemplates.teaser");
  const { profile } = useAuth();

  const [company, setCompany] = React.useState<Company | null | undefined>(undefined);
  const [templates, setTemplates] = React.useState<ContractTemplate[]>([]);

  React.useEffect(() => {
    if (!profile?.company_id) return;
    const companyId = profile.company_id;
    Promise.all([getCompanyById(companyId), listContractTemplatesFull(companyId)]).then(
      ([companyData, templateData]) => {
        setCompany(companyData);
        setTemplates(templateData);
      }
    );
  }, [profile?.company_id]);

  if (company === undefined) {
    return <PageLoadingSkeleton />;
  }

  if (!company) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <CompanySettingsForm company={company} />

      <Link href="/owner/settings/contract-templates">
        <Card className="transition-colors hover:bg-accent">
          <CardContent className="flex items-center gap-3 py-4">
            <FileSignature className="size-5 text-primary" />
            <div>
              <p className="font-medium">{t("title")}</p>
              <p className="text-sm text-muted-foreground">{t("count", { count: templates.length })}</p>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
