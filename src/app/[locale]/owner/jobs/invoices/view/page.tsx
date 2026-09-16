"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { notFound, useSearchParams } from "next/navigation";

import { useAuth } from "@/lib/auth/auth-provider";
import { getJobDetail } from "@/lib/jobs/queries";
import type { JobDetail } from "@/lib/jobs/types";
import { getInvoiceById } from "@/lib/invoices/queries";
import type { Invoice } from "@/lib/invoices/types";
import { getCompanyById } from "@/lib/company/get-company";
import type { Company } from "@/lib/company/types";
import { formatAddress } from "@/lib/documents/format-address";
import { DocumentPreview } from "@/components/documents/document-preview";
import { InvoiceStatusBadge } from "@/components/documents/invoice-status-badge";
import { InvoiceActions } from "@/components/owner/documents/invoice-actions";
import { PageLoadingSkeleton } from "@/components/page-loading-skeleton";

function InvoiceDetailPageInner() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const invoiceId = searchParams.get("invoiceId");
  const t = useTranslations("documents.detail");
  const { profile } = useAuth();

  const [state, setState] = React.useState<
    { job: JobDetail; invoice: Invoice; company: Company | null } | null | undefined
  >(undefined);

  React.useEffect(() => {
    if (!profile?.company_id || !jobId || !invoiceId) return;
    const companyId = profile.company_id;

    Promise.all([getJobDetail(jobId), getInvoiceById(invoiceId)]).then(async ([job, invoice]) => {
      if (!job || job.company_id !== companyId || !invoice || invoice.job_id !== jobId) {
        setState(null);
        return;
      }
      const company = await getCompanyById(companyId);
      setState({ job, invoice, company });
    });
  }, [profile?.company_id, jobId, invoiceId]);

  if (state === null) {
    notFound();
  }

  if (state === undefined) {
    return <PageLoadingSkeleton />;
  }

  const { job, invoice, company } = state;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{invoice.invoice_number}</h1>
          <p className="text-sm text-muted-foreground">{t("sentOrDecided")}</p>
        </div>
        <InvoiceStatusBadge status={invoice.status} />
      </div>

      <InvoiceActions invoice={invoice} />

      <DocumentPreview
        kind="invoice"
        number={invoice.invoice_number}
        jobCode={job.job_code}
        clientName={invoice.client_name}
        clientAddress={invoice.client_address}
        description={invoice.description}
        lineItems={invoice.line_items}
        terms={invoice.terms}
        total={invoice.total}
        company={{
          name: company?.trade_name || company?.name || "",
          logoUrl: company?.logo_url ?? null,
          address: formatAddress(company ?? {}),
          email: company?.contact_email ?? null,
          phone: company?.contact_phone ?? null,
        }}
      />
    </div>
  );
}

export default function InvoiceDetailPage() {
  return (
    <React.Suspense fallback={<PageLoadingSkeleton />}>
      <InvoiceDetailPageInner />
    </React.Suspense>
  );
}
