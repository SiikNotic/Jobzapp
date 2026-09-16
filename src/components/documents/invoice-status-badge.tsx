import { useTranslations } from "next-intl";

import { Badge, type badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import type { InvoiceStatus } from "@/lib/invoices/types";

const STATUS_VARIANT: Record<InvoiceStatus, VariantProps<typeof badgeVariants>["variant"]> = {
  draft: "outline",
  sent: "secondary",
  paid: "success",
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const t = useTranslations("documents.invoiceStatus");

  return <Badge variant={STATUS_VARIANT[status]}>{t(status)}</Badge>;
}
