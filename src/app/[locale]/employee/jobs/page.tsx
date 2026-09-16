import { getTranslations } from "next-intl/server";

import { ComingSoon } from "@/components/coming-soon";

export default async function EmployeeJobsPage() {
  const t = await getTranslations("employee.nav");
  return <ComingSoon title={t("jobs")} />;
}
