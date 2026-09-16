import { useTranslations } from "next-intl";

import { Badge, type badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import type { JobContractStatus } from "@/lib/job-contracts/types";

const STATUS_VARIANT: Record<
  JobContractStatus,
  VariantProps<typeof badgeVariants>["variant"]
> = {
  draft: "outline",
  sent: "secondary",
  signed: "success",
};

export function JobContractStatusBadge({ status }: { status: JobContractStatus }) {
  const t = useTranslations("contracts.status");

  return <Badge variant={STATUS_VARIANT[status]}>{t(status)}</Badge>;
}
