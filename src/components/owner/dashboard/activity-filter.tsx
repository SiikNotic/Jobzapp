"use client";

import { useTranslations } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";
import type { AuditEntityType } from "@/lib/audit/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ENTITY_TYPES: AuditEntityType[] = [
  "job",
  "quote",
  "invoice",
  "expense_request",
  "pay_receipt",
  "employee_pay_rate",
  "job_contract",
  "job_assignment",
];

export function ActivityFilter({ initialType }: { initialType: string }) {
  const t = useTranslations("audit.entityTypes");
  const tPage = useTranslations("owner.dashboard.activity");
  const router = useRouter();
  const pathname = usePathname();

  function navigate(value: string) {
    const search = value === "all" ? "" : `?type=${value}`;
    router.replace(`${pathname}${search}`);
  }

  return (
    <Select value={initialType} onValueChange={navigate}>
      <SelectTrigger className="w-56">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{tPage("allTypes")}</SelectItem>
        {ENTITY_TYPES.map((type) => (
          <SelectItem key={type} value={type}>
            {t(type)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
