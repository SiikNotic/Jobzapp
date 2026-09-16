import { getTranslations } from "next-intl/server";

import { getCurrentProfile } from "@/lib/auth/get-profile";

export default async function OwnerDashboardPage() {
  const { user, profile } = await getCurrentProfile();
  const t = await getTranslations("owner.dashboard");
  const name = profile?.full_name ?? user?.email ?? "";

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">
        {t("welcome", { name })}
      </h1>
      <p className="text-muted-foreground">{t("subtitle")}</p>
    </div>
  );
}
