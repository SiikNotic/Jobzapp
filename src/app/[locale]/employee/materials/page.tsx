import { getTranslations } from "next-intl/server";

import { ComingSoon } from "@/components/coming-soon";

export default async function MaterialsPage() {
  const t = await getTranslations("employee.nav");
  return <ComingSoon title={t("materials")} />;
}
