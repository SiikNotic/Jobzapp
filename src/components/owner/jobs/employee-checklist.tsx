"use client";

import { useTranslations } from "next-intl";

import type { Employee } from "@/lib/jobs/types";

export function EmployeeChecklist({
  employees,
  selectedIds,
  onChange,
}: {
  employees: Employee[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const t = useTranslations("jobs.form");

  function toggle(id: string) {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((existing) => existing !== id)
        : [...selectedIds, id]
    );
  }

  if (employees.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("noEmployees")}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="employee_ids" value={JSON.stringify(selectedIds)} />
      {employees.map((employee) => (
        <label
          key={employee.id}
          className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent"
        >
          <input
            type="checkbox"
            checked={selectedIds.includes(employee.id)}
            onChange={() => toggle(employee.id)}
            className="size-4 accent-primary"
          />
          {employee.full_name ?? t("unnamedEmployee")}
        </label>
      ))}
    </div>
  );
}
