import { Clock, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link, redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { listEmployees } from "@/lib/jobs/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function EmployeesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "owner.employees.list" });

  const { profile } = await getCurrentProfile();
  if (!profile?.company_id) {
    redirect({ href: "/login", locale });
    return null;
  }

  const employees = await listEmployees(profile.company_id);

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
                  <Link href={`/owner/employees/${employee.id}`}>
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
