import { useFormatter, useTranslations } from "next-intl";
import { History } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobStatusBadge } from "@/components/jobs/job-status-badge";
import type { JobStatusEvent } from "@/lib/jobs/types";

export function JobStatusHistory({ events }: { events: JobStatusEvent[] }) {
  const t = useTranslations("jobs.history");
  const format = useFormatter();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="size-4 text-muted-foreground" /> {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3">
          {events.map((event) => (
            <li key={event.id} className="flex flex-wrap items-center gap-2 text-sm">
              <JobStatusBadge status={event.status} />
              <span className="text-muted-foreground">
                {format.dateTime(new Date(event.changed_at), {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
              {event.changed_by_name ? (
                <span className="text-muted-foreground">
                  · {t("by")} {event.changed_by_name}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
