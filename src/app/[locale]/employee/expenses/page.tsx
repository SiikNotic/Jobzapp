import { getTranslations } from "next-intl/server";

import { ComingSoon } from "@/components/coming-soon";

export default async function ExpensesPage() {
  const t = await getTranslations("employee.nav");
  return <ComingSoon title={t("expenses")} />;
}
