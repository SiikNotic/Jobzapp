import { useTranslations } from "next-intl";

import { Badge, type badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import type { JobStatus } from "@/lib/jobs/types";

const STATUS_VARIANT: Record<JobStatus, VariantProps<typeof badgeVariants>["variant"]> = {
  scheduled: "secondary",
  in_progress: "default",
  completed: "success",
  cancelled: "destructive",
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const t = useTranslations("jobs.status");

  return <Badge variant={STATUS_VARIANT[status]}>{t(status)}</Badge>;
}
