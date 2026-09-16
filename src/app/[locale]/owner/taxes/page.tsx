import { getTranslations } from "next-intl/server";

import { ComingSoon } from "@/components/coming-soon";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { getCompanyById } from "@/lib/company/get-company";
import { TAX_FORMS_BY_COUNTRY } from "@/lib/company/tax-jurisdiction";
import { Badge } from "@/components/ui/badge";

export default async function TaxesPage() {
  const t = await getTranslations("owner.nav");
  const tTaxes = await getTranslations("owner.taxes");
  const { profile } = await getCurrentProfile();
  const company = profile?.company_id ? await getCompanyById(profile.company_id) : null;

  const country = company?.country ?? "US";
  const forms = TAX_FORMS_BY_COUNTRY[country];
  const jurisdictionLabel =
    country === "PR" ? tTaxes("jurisdictionPR") : tTaxes("jurisdictionUS");

  return (
    <ComingSoon title={t("taxes")}>
      <div className="rounded-lg border bg-card p-4 text-sm">
        <p className="mb-3 text-muted-foreground">
          {tTaxes("preview", { jurisdiction: jurisdictionLabel })}
        </p>
        <div className="flex flex-wrap gap-2">
          {forms.map((form) => (
            <Badge key={form} variant="outline">
              {form}
            </Badge>
          ))}
        </div>
      </div>
    </ComingSoon>
  );
}
