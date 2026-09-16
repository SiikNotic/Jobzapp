import { useTranslations } from "next-intl";

import { Badge, type badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import type { QuoteStatus } from "@/lib/quotes/types";

const STATUS_VARIANT: Record<QuoteStatus, VariantProps<typeof badgeVariants>["variant"]> = {
  draft: "outline",
  sent: "secondary",
  accepted: "success",
  rejected: "destructive",
};

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  const t = useTranslations("documents.quoteStatus");

  return <Badge variant={STATUS_VARIANT[status]}>{t(status)}</Badge>;
}
