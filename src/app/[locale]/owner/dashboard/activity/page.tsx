import { History } from "lucide-react";
import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { redirect } from "@/i18n/navigation";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { listAuditEvents } from "@/lib/audit/queries";
import type { AuditEntityType } from "@/lib/audit/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuditEventRow } from "@/components/owner/dashboard/audit-event-row";
import { ActivityFilter } from "@/components/owner/dashboard/activity-filter";

const VALID_TYPES: AuditEntityType[] = [
  "job",
  "quote",
  "invoice",
  "expense_request",
  "pay_receipt",
  "employee_pay_rate",
  "job_contract",
  "job_assignment",
];

export default async function DashboardActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const { type } = await searchParams;
  const t = await getTranslations({ locale, namespace: "owner.dashboard.activity" });

  const { profile } = await getCurrentProfile();
  if (!profile?.company_id) {
    redirect({ href: "/login", locale });
    return null;
  }

  const entityType = VALID_TYPES.includes(type as AuditEntityType) ? (type as AuditEntityType) : undefined;
  const events = await listAuditEvents(profile.company_id, { entityType, limit: 200 });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <ActivityFilter initialType={entityType ?? "all"} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="size-4 text-muted-foreground" /> {t("title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
          ) : (
            <div className="flex flex-col">
              {events.map((event) => (
                <AuditEventRow key={event.id} event={event} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
