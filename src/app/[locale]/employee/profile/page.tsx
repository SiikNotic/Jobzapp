import { getTranslations } from "next-intl/server";

import { ComingSoon } from "@/components/coming-soon";

export default async function EmployeeProfilePage() {
  const t = await getTranslations("employee.nav");
  return <ComingSoon title={t("profile")} />;
}
