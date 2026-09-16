import { Building2, User } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import type { ClientType } from "@/lib/clients/types";

export function ClientTypeBadge({ type }: { type: ClientType }) {
  const t = useTranslations("owner.clients.type");

  return (
    <Badge variant="secondary" className="gap-1">
      {type === "company" ? <Building2 className="size-3" /> : <User className="size-3" />}
      {type === "company" ? t("company") : t("individual")}
    </Badge>
  );
}
