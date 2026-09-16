"use client";

import * as React from "react";
import { Building2, FileText, Pencil, Plus, Receipt, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";
import { notFound } from "next/navigation";

import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { useAuth } from "@/lib/auth/auth-provider";
import { getJobDetail, listEmployees } from "@/lib/jobs/queries";
import type { JobDetail, Employee } from "@/lib/jobs/types";
import { listExpenseRequestsForJob } from "@/lib/expense-requests/queries";
import type { ExpenseRequestWithNames } from "@/lib/expense-requests/types";
import { listQuotesForJob } from "@/lib/quotes/queries";
import type { Quote } from "@/lib/quotes/types";
import { listInvoicesForJob } from "@/lib/invoices/queries";
import type { Invoice } from "@/lib/invoices/types";
import { getJobContract } from "@/lib/job-contracts/queries";
import type { JobContract } from "@/lib/job-contracts/types";
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
import { PageLoadingSkeleton } from "@/components/page-loading-skeleton";

function OwnerJobDetailPageInner() {
  const { locale } = useParams<{ locale: Locale }>();
  const id = useSearchParams().get("id");
  const t = useTranslations("jobs.detail");
  const tExpenses = useTranslations("expenseRequests");
  const { profile } = useAuth();

  const [job, setJob] = React.useState<JobDetail | null | undefined>(undefined);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [expenseRequests, setExpenseRequests] = React.useState<ExpenseRequestWithNames[]>([]);
  const [quotes, setQuotes] = React.useState<Quote[]>([]);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [jobContract, setJobContract] = React.useState<JobContract | null>(null);

  React.useEffect(() => {
    if (!profile?.company_id || !id) return;
    const companyId = profile.company_id;

    getJobDetail(id).then(async (detail) => {
      if (!detail || detail.company_id !== companyId) {
        setJob(null);
        return;
      }
      setJob(detail);

      const [emps, requests, jobQuotes, jobInvoices, contract] = await Promise.all([
        listEmployees(companyId),
        listExpenseRequestsForJob(detail.id),
        listQuotesForJob(detail.id),
        listInvoicesForJob(detail.id),
        getJobContract(detail.id),
      ]);
      setEmployees(emps);
      setExpenseRequests(requests);
      setQuotes(jobQuotes);
      setInvoices(jobInvoices);
      setJobContract(contract);
    });
  }, [profile?.company_id, id]);

  if (job === null) {
    notFound();
  }

  if (job === undefined || !profile) {
    return <PageLoadingSkeleton />;
  }

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
              href={`/owner/clients/view?id=${job.client.id}`}
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
          <JobStatusControl jobId={job.id} status={job.status} />
          <Button asChild variant="outline">
            <Link href={`/owner/jobs/edit?id=${job.id}`}>
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
              addressLines.map((line) => (
                <p key={line} className="break-words">
                  {line}
                </p>
              ))
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
          <CardContent className="whitespace-pre-wrap break-words text-sm">{job.description}</CardContent>
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
          <CardContent className="whitespace-pre-wrap break-words text-sm">{job.additional_info}</CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="size-4 text-muted-foreground" /> {t("quotes")}
          </CardTitle>
          <Button asChild size="sm" variant="outline">
            <Link href={`/owner/jobs/quotes/new?jobId=${job.id}`}>
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
                href={`/owner/jobs/quotes/view?jobId=${job.id}&quoteId=${quote.id}`}
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
                href={`/owner/jobs/invoices/view?jobId=${job.id}&invoiceId=${invoice.id}`}
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
          />
        </CardContent>
      </Card>

      <JobStatusHistory events={job.status_events} />
    </div>
  );
}

export default function OwnerJobDetailPage() {
  return (
    <React.Suspense fallback={<PageLoadingSkeleton />}>
      <OwnerJobDetailPageInner />
    </React.Suspense>
  );
}
