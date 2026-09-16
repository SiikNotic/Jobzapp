import { Building2, FileText, Pencil, Plus, Receipt, User } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { Link, redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { getJobDetail, listEmployees } from "@/lib/jobs/queries";
import { listExpenseRequestsForJob } from "@/lib/expense-requests/queries";
import { listQuotesForJob } from "@/lib/quotes/queries";
import { listInvoicesForJob } from "@/lib/invoices/queries";
import { getJobContract } from "@/lib/job-contracts/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobPriorityBadge } from "@/components/jobs/job-priority-badge";
import { MaterialsList } from "@/components/jobs/materials-list";
import { JobStatusHistory } from "@/components/jobs/job-status-history";
import { JobStatusControl } from "@/components/owner/jobs/job-status-control";
import { EmployeeAssignmentManager } from "@/components/owner/jobs/employee-assignment-manager";
import { ExpenseRequestCard } from "@/components/expense-requests/expense-request-card";
import { QuoteStatusBadge } from "@/components/documents/quote-status-badge";
import { InvoiceStatusBadge } from "@/components/documents/invoice-status-badge";
import { JobContractSection } from "@/components/owner/jobs/job-contract-section";

export default async function OwnerJobDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = (await params) as { locale: Locale; id: string };
  const t = await getTranslations({ locale, namespace: "jobs.detail" });
  const tExpenses = await getTranslations({ locale, namespace: "expenseRequests" });

  const { profile } = await getCurrentProfile();
  if (!profile?.company_id) {
    redirect({ href: "/login", locale });
    return null;
  }

  const job = await getJobDetail(id);
  if (!job || job.company_id !== profile.company_id) {
    notFound();
  }

  const [employees, expenseRequests, quotes, invoices, jobContract] = await Promise.all([
    listEmployees(profile.company_id),
    listExpenseRequestsForJob(job.id),
    listQuotesForJob(job.id),
    listInvoicesForJob(job.id),
    getJobContract(job.id),
  ]);

  const addressLines = [
    job.address_line1,
    job.address_line2,
    [job.city, job.state_province, job.postal_code].filter(Boolean).join(", "),
    job.country,
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-mono text-2xl font-semibold tracking-tight">{job.job_code}</h1>
            <JobPriorityBadge priority={job.priority} />
          </div>
          {job.client ? (
            <Link
              href={`/owner/clients/${job.client.id}`}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              {job.client.type === "company" ? (
                <Building2 className="size-3.5" />
              ) : (
                <User className="size-3.5" />
              )}
              {job.client.display_name}
            </Link>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <JobStatusControl jobId={job.id} status={job.status} locale={locale} />
          <Button asChild variant="outline">
            <Link href={`/owner/jobs/${job.id}/edit`}>
              <Pencil /> {t("edit")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("schedule")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>
              {new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
                new Date(`${job.scheduled_date}T00:00:00`)
              )}
            </p>
            {job.scheduled_time ? <p>{job.scheduled_time.slice(0, 5)}</p> : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("address")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {addressLines.length > 0 ? (
              addressLines.map((line) => <p key={line}>{line}</p>)
            ) : (
              <p className="text-muted-foreground">{t("noData")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {job.description ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("description")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm whitespace-pre-wrap">{job.description}</CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("materials")}</CardTitle>
        </CardHeader>
        <CardContent>
          <MaterialsList materials={job.materials} />
        </CardContent>
      </Card>

      {job.additional_info ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("additionalInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm whitespace-pre-wrap">{job.additional_info}</CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="size-4 text-muted-foreground" /> {t("quotes")}
          </CardTitle>
          <Button asChild size="sm" variant="outline">
            <Link href={`/owner/jobs/${job.id}/quotes/new`}>
              <Plus /> {t("newQuote")}
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {quotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noQuotes")}</p>
          ) : (
            quotes.map((quote) => (
              <Link
                key={quote.id}
                href={`/owner/jobs/${job.id}/quotes/${quote.id}`}
                className="flex items-center justify-between gap-2 rounded-md border p-3 text-sm transition-colors hover:bg-accent"
              >
                <span className="font-mono">{quote.quote_number}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">${quote.total.toFixed(2)}</span>
                  <QuoteStatusBadge status={quote.status} />
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      {invoices.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="size-4 text-muted-foreground" /> {t("invoices")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {invoices.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/owner/jobs/${job.id}/invoices/${invoice.id}`}
                className="flex items-center justify-between gap-2 rounded-md border p-3 text-sm transition-colors hover:bg-accent"
              >
                <span className="font-mono">{invoice.invoice_number}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">${invoice.total.toFixed(2)}</span>
                  <InvoiceStatusBadge status={invoice.status} />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("contract")}</CardTitle>
        </CardHeader>
        <CardContent>
          <JobContractSection
            jobId={job.id}
            templateId={job.contract_template_id}
            templateName={job.contract_template_name}
            contract={jobContract}
            locale={locale}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="size-4 text-muted-foreground" /> {tExpenses("list.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {expenseRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">{tExpenses("list.empty")}</p>
          ) : (
            expenseRequests.map((request) => (
              <ExpenseRequestCard
                key={request.id}
                request={request}
                canReview={request.requested_by !== profile.id}
                jobId={job.id}
                locale={locale}
              />
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("assignedEmployees")}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeeAssignmentManager
            jobId={job.id}
            employees={employees}
            assignedIds={job.assignees.map((a) => a.id)}
            locale={locale}
          />
        </CardContent>
      </Card>

      <JobStatusHistory events={job.status_events} />
    </div>
  );
}
