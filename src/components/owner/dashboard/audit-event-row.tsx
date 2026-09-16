import { useFormatter, useTranslations } from "next-intl";
import {
  Briefcase,
  FileCheck2,
  FileText,
  Receipt,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";

import type { AuditEvent } from "@/lib/audit/types";

const ENTITY_ICONS: Record<AuditEvent["entity_type"], React.ReactNode> = {
  job: <Briefcase className="size-4" />,
  quote: <FileText className="size-4" />,
  invoice: <Receipt className="size-4" />,
  expense_request: <Receipt className="size-4" />,
  pay_receipt: <Wallet className="size-4" />,
  employee_pay_rate: <Wallet className="size-4" />,
  job_contract: <FileCheck2 className="size-4" />,
  job_assignment: <UserPlus className="size-4" />,
};

export function AuditEventRow({ event }: { event: AuditEvent }) {
  const t = useTranslations("audit.events");
  const format = useFormatter();

  const amount = event.amount != null ? `$${event.amount.toFixed(2)}` : "";
  const sentence = t(`${event.entity_type}.${event.action}`, {
    label: event.label,
    detail: event.detail ?? "",
    amount,
  });

  const actor = event.actor_name ?? event.actor_label;

  return (
    <div className="flex items-start gap-3 border-b py-3 text-sm last:border-0">
      <div className="mt-0.5 text-muted-foreground">{ENTITY_ICONS[event.entity_type] ?? <Users className="size-4" />}</div>
      <div className="flex-1">
        <p>{sentence}</p>
        <p className="text-xs text-muted-foreground">
          {actor ? `${actor} · ` : ""}
          {format.dateTime(new Date(event.created_at), { dateStyle: "medium", timeStyle: "short" })}
        </p>
      </div>
    </div>
  );
}
