import { FileSignature } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link, redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { getCompanyById } from "@/lib/company/get-company";
import { listContractTemplatesFull } from "@/lib/contract-templates/queries";
import { CompanySettingsForm } from "@/components/owner/company-settings-form";
import { Card, CardContent } from "@/components/ui/card";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "contractTemplates.teaser" });
  const { profile } = await getCurrentProfile();

  if (!profile?.company_id) {
    redirect({ href: "/login", locale });
    return null;
  }

  const company = await getCompanyById(profile.company_id);

  if (!company) {
    redirect({ href: "/login", locale });
    return null;
  }

  const templates = await listContractTemplatesFull(profile.company_id);

  return (
    <div className="flex flex-col gap-6">
      <CompanySettingsForm company={company} locale={locale} />

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
