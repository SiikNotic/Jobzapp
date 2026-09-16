"use client";

import * as React from "react";
import { History } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import { useAuth } from "@/lib/auth/auth-provider";
import { listAuditEvents } from "@/lib/audit/queries";
import type { AuditEntityType, AuditEvent } from "@/lib/audit/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuditEventRow } from "@/components/owner/dashboard/audit-event-row";
import { ActivityFilter } from "@/components/owner/dashboard/activity-filter";
import { PageLoadingSkeleton } from "@/components/page-loading-skeleton";

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

function DashboardActivityPageInner() {
  const t = useTranslations("owner.dashboard.activity");
  const { profile } = useAuth();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") ?? undefined;
  const entityType = VALID_TYPES.includes(type as AuditEntityType) ? (type as AuditEntityType) : undefined;

  const [events, setEvents] = React.useState<AuditEvent[] | null>(null);

  React.useEffect(() => {
    if (!profile?.company_id) return;
    listAuditEvents(profile.company_id, { entityType, limit: 200 }).then(setEvents);
  }, [profile?.company_id, entityType]);

  if (!events) {
    return <PageLoadingSkeleton />;
  }

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

export default function DashboardActivityPage() {
  return (
    <React.Suspense fallback={<PageLoadingSkeleton />}>
      <DashboardActivityPageInner />
    </React.Suspense>
  );
}
