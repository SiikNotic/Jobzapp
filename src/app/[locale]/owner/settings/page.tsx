import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { getCompanyById } from "@/lib/company/get-company";
import { CompanySettingsForm } from "@/components/owner/company-settings-form";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
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

  return <CompanySettingsForm company={company} locale={locale} />;
}
