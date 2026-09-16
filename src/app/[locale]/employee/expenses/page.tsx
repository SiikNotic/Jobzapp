import { Receipt } from "lucide-react";
import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { listExpenseRequestsForEmployee } from "@/lib/expense-requests/queries";
import { Card, CardContent } from "@/components/ui/card";
import { ExpenseRequestCard } from "@/components/expense-requests/expense-request-card";

export default async function EmployeeExpensesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "expenseRequests" });

  const requests = await listExpenseRequestsForEmployee();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("employeeList.title")}</h1>
        <p className="text-muted-foreground">{t("employeeList.subtitle")}</p>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Receipt className="size-8 text-muted-foreground" />
            <p className="font-medium">{t("employeeList.emptyTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("employeeList.emptyDescription")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((request) => (
            <ExpenseRequestCard
              key={request.id}
              request={request}
              canReview={false}
              jobId={request.job_id}
              jobCode={request.job_code}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );
}
