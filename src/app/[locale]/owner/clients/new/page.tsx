import { getTranslations } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { getCompanyById } from "@/lib/company/get-company";
import { ClientForm } from "@/components/owner/client-form";
import { NewClientDuplicateCheck } from "@/components/owner/new-client-duplicate-check";

export default async function NewClientPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "owner.clients.new" });

  const { profile } = await getCurrentProfile();
  if (!profile?.company_id) {
    redirect({ href: "/login", locale });
    return null;
  }

  const company = await getCompanyById(profile.company_id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <NewClientDuplicateCheck />

      <ClientForm locale={locale} defaultCountry={company?.country} />
    </div>
  );
}
