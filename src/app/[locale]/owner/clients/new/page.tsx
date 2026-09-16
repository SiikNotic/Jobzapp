"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { useAuth } from "@/lib/auth/auth-provider";
import { getCompanyById } from "@/lib/company/get-company";
import type { Company } from "@/lib/company/types";
import { ClientForm } from "@/components/owner/client-form";
import { NewClientDuplicateCheck } from "@/components/owner/new-client-duplicate-check";
import { PageLoadingSkeleton } from "@/components/page-loading-skeleton";

export default function NewClientPage() {
  const t = useTranslations("owner.clients.new");
  const { profile } = useAuth();
  const [company, setCompany] = React.useState<Company | null | undefined>(undefined);

  React.useEffect(() => {
    if (!profile?.company_id) return;
    getCompanyById(profile.company_id).then(setCompany);
  }, [profile?.company_id]);

  if (company === undefined) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <NewClientDuplicateCheck />

      <ClientForm defaultCountry={company?.country} />
    </div>
  );
}
