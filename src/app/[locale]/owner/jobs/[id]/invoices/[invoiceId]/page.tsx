import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import type { Locale } from "@/i18n/routing";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { getJobDetail } from "@/lib/jobs/queries";
import { getInvoiceById } from "@/lib/invoices/queries";
import { getCompanyById } from "@/lib/company/get-company";
import { formatAddress } from "@/lib/documents/format-address";
import { DocumentPreview } from "@/components/documents/document-preview";
import { InvoiceStatusBadge } from "@/components/documents/invoice-status-badge";
import { InvoiceActions } from "@/components/owner/documents/invoice-actions";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string; invoiceId: string }>;
}) {
  const { locale, id, invoiceId } = (await params) as {
    locale: Locale;
    id: string;
    invoiceId: string;
  };
  const t = await getTranslations({ locale, namespace: "documents.detail" });

  const { profile } = await getCurrentProfile();
  if (!profile?.company_id) notFound();

  const [job, invoice] = await Promise.all([getJobDetail(id), getInvoiceById(invoiceId)]);
  if (!job || job.company_id !== profile.company_id) notFound();
  if (!invoice || invoice.job_id !== id) notFound();

  const company = await getCompanyById(profile.company_id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{invoice.invoice_number}</h1>
          <p className="text-sm text-muted-foreground">{t("sentOrDecided")}</p>
        </div>
        <InvoiceStatusBadge status={invoice.status} />
      </div>

      <InvoiceActions jobId={id} invoice={invoice} locale={locale} />

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
