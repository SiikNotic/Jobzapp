"use client";

import * as React from "react";
import { Clock, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth/auth-provider";
import { listEmployees } from "@/lib/jobs/queries";
import type { Employee } from "@/lib/jobs/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageLoadingSkeleton } from "@/components/page-loading-skeleton";

export default function EmployeesPage() {
  const t = useTranslations("owner.employees.list");
  const { profile } = useAuth();
  const [employees, setEmployees] = React.useState<Employee[] | null>(null);

  React.useEffect(() => {
    if (!profile?.company_id) return;
    listEmployees(profile.company_id).then(setEmployees);
  }, [profile?.company_id]);

  if (!employees) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {employees.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Users className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {employees.map((employee) => (
            <Card key={employee.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-2 py-4">
                <span className="font-medium">{employee.full_name ?? "—"}</span>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/owner/employees/view?id=${employee.id}`}>
                    <Clock /> {t("manageHours")}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
