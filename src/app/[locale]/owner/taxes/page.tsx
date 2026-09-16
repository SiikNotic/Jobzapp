import { getTranslations } from "next-intl/server";

import { ComingSoon } from "@/components/coming-soon";

export default async function TaxesPage() {
  const t = await getTranslations("owner.nav");
  return <ComingSoon title={t("taxes")} />;
}
