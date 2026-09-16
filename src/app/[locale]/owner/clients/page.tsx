import { getTranslations } from "next-intl/server";

import { ComingSoon } from "@/components/coming-soon";

export default async function ClientsPage() {
  const t = await getTranslations("owner.nav");
  return <ComingSoon title={t("clients")} />;
}
