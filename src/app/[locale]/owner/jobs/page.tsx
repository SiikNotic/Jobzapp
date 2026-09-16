import { getTranslations } from "next-intl/server";

import { ComingSoon } from "@/components/coming-soon";

export default async function JobsPage() {
  const t = await getTranslations("owner.nav");
  return <ComingSoon title={t("jobs")} />;
}
