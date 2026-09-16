"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Loader2, UserPlus, UserMinus } from "lucide-react";

import type { Locale } from "@/i18n/routing";
import type { Employee } from "@/lib/jobs/types";
import { assignEmployee, unassignEmployee } from "@/app/[locale]/owner/jobs/actions";

export function EmployeeAssignmentManager({
  jobId,
  employees,
  assignedIds,
  locale,
}: {
  jobId: string;
  employees: Employee[];
  assignedIds: string[];
  locale: Locale;
}) {
  const t = useTranslations("jobs.detail");
  const [assigned, setAssigned] = React.useState<Set<string>>(new Set(assignedIds));
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function toggle(employeeId: string) {
    setPendingId(employeeId);
    const isAssigned = assigned.has(employeeId);

    const result = isAssigned
      ? await unassignEmployee(locale, jobId, employeeId)
      : await assignEmployee(locale, jobId, employeeId);

    if (result.success) {
      setAssigned((prev) => {
        const next = new Set(prev);
        if (isAssigned) next.delete(employeeId);
        else next.add(employeeId);
        return next;
      });
    }
    setPendingId(null);
  }

  if (employees.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("noEmployeesAvailable")}</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {employees.map((employee) => {
        const isAssigned = assigned.has(employee.id);
        const isPending = pendingId === employee.id;

        return (
          <li
            key={employee.id}
            className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
          >
            <span>{employee.full_name ?? t("unnamedEmployee")}</span>
            <button
              type="button"
              disabled={isPending}
              onClick={() => toggle(employee.id)}
              className={
                isAssigned
                  ? "flex items-center gap-1 text-xs font-medium text-destructive hover:underline disabled:opacity-50"
                  : "flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:opacity-50"
              }
            >
              {isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : isAssigned ? (
                <UserMinus className="size-3.5" />
              ) : (
                <UserPlus className="size-3.5" />
              )}
              {isAssigned ? t("unassign") : t("assign")}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
