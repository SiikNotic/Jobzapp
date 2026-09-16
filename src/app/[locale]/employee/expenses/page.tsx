"use client";

import * as React from "react";
import { Receipt } from "lucide-react";
import { useTranslations } from "next-intl";

import { useAuth } from "@/lib/auth/auth-provider";
import { listExpenseRequestsForEmployee } from "@/lib/expense-requests/queries";
import type { EmployeeExpenseRequestItem } from "@/lib/expense-requests/types";
import { Card, CardContent } from "@/components/ui/card";
import { ExpenseRequestCard } from "@/components/expense-requests/expense-request-card";
import { PageLoadingSkeleton } from "@/components/page-loading-skeleton";

export default function EmployeeExpensesPage() {
  const t = useTranslations("expenseRequests");
  const { user } = useAuth();
  const [requests, setRequests] = React.useState<EmployeeExpenseRequestItem[] | null>(null);

  React.useEffect(() => {
    if (!user) return;
    listExpenseRequestsForEmployee().then(setRequests);
  }, [user]);

  if (!requests) {
    return <PageLoadingSkeleton />;
  }

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
            />
          ))}
        </div>
      )}
    </div>
  );
}
