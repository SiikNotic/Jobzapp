import { useTranslations } from "next-intl";

import { Badge, type badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import type { JobPriority } from "@/lib/jobs/types";

const PRIORITY_VARIANT: Record<JobPriority, VariantProps<typeof badgeVariants>["variant"]> = {
  low: "outline",
  medium: "secondary",
  high: "default",
  urgent: "destructive",
};

export function JobPriorityBadge({ priority }: { priority: JobPriority }) {
  const t = useTranslations("jobs.priority");

  return <Badge variant={PRIORITY_VARIANT[priority]}>{t(priority)}</Badge>;
}
