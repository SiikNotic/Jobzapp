import { getTranslations } from "next-intl/server";
import { useFormatter } from "next-intl";

import { Link, redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { listExpensesForCompany } from "@/lib/expense-requests/queries";
import type { Expense } from "@/lib/expense-requests/types";
import { listPaidInvoicesForCompany } from "@/lib/invoices/queries";
import type { Invoice } from "@/lib/invoices/types";
import { ComingSoon } from "@/components/coming-soon";

export default async function FinancesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "owner.nav" });
  const tFinances = await getTranslations({ locale, namespace: "owner.finances" });

  const { profile } = await getCurrentProfile();
  if (!profile?.company_id) {
    redirect({ href: "/login", locale });
    return null;
  }

  const [expenses, invoices] = await Promise.all([
    listExpensesForCompany(profile.company_id),
    listPaidInvoicesForCompany(profile.company_id),
  ]);

  return (
    <ComingSoon title={t("finances")}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <p className="mb-3 text-sm text-muted-foreground">{tFinances("revenuePreview")}</p>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">{tFinances("noRevenue")}</p>
          ) : (
            <InvoicesTable invoices={invoices} />
          )}
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="mb-3 text-sm text-muted-foreground">{tFinances("expensesPreview")}</p>
          {expenses.length === 0 ? (
            <p className="text-sm text-muted-foreground">{tFinances("noExpenses")}</p>
          ) : (
            <ExpensesTable expenses={expenses} />
          )}
        </div>
      </div>
    </ComingSoon>
  );
}

function InvoicesTable({ invoices }: { invoices: Invoice[] }) {
  const format = useFormatter();

  return (
    <div className="flex flex-col gap-2">
      {invoices.map((invoice) => (
        <div
          key={invoice.id}
          className="flex flex-wrap items-center justify-between gap-2 border-b py-2 text-sm last:border-0"
        >
          <div>
            <Link href={`/owner/jobs/${invoice.job_id}`} className="font-medium hover:underline">
              {invoice.invoice_number} · {invoice.client_name}
            </Link>
            <p className="text-xs text-muted-foreground">
              {invoice.paid_at
                ? format.dateTime(new Date(invoice.paid_at), { dateStyle: "medium" })
                : ""}
            </p>
          </div>
          <span className="font-mono font-medium text-success">${invoice.total.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

function ExpensesTable({ expenses }: { expenses: Expense[] }) {
  const format = useFormatter();

  return (
    <div className="flex flex-col gap-2">
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="flex flex-wrap items-center justify-between gap-2 border-b py-2 text-sm last:border-0"
        >
          <div>
            <Link
              href={`/owner/jobs/${expense.job_id}`}
              className="font-medium hover:underline"
            >
              {expense.description}
            </Link>
            <p className="text-xs text-muted-foreground">
              {format.dateTime(new Date(expense.created_at), { dateStyle: "medium" })}
            </p>
          </div>
          <span className="font-mono font-medium">${expense.amount.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}
