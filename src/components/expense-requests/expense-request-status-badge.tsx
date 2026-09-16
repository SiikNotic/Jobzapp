import { useTranslations } from "next-intl";

import { Badge, type badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import type { ExpenseRequestStatus } from "@/lib/expense-requests/types";

const STATUS_VARIANT: Record<
  ExpenseRequestStatus,
  VariantProps<typeof badgeVariants>["variant"]
> = {
  pending: "secondary",
  approved: "success",
  rejected: "destructive",
};

export function ExpenseRequestStatusBadge({ status }: { status: ExpenseRequestStatus }) {
  const t = useTranslations("expenseRequests.status");

  return <Badge variant={STATUS_VARIANT[status]}>{t(status)}</Badge>;
}
