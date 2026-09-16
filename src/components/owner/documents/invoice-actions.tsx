"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { CircleDollarSign, Loader2, Printer, Send } from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Invoice } from "@/lib/invoices/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { markInvoicePaid, sendInvoice } from "@/app/[locale]/owner/jobs/[id]/invoices/actions";

export function InvoiceActions({
  jobId,
  invoice,
  locale,
}: {
  jobId: string;
  invoice: Invoice;
  locale: Locale;
}) {
  const t = useTranslations("documents.actions");
  const router = useRouter();
  const [pending, setPending] = React.useState<string | null>(null);
  const [paymentNotes, setPaymentNotes] = React.useState("");

  async function run(key: string, action: () => Promise<{ success: boolean }>) {
    setPending(key);
    const result = await action();
    setPending(null);
    if (result.success) router.refresh();
  }

  return (
    <div className="flex flex-col gap-2 print:hidden">
      <div className="flex flex-wrap items-center gap-2">
        {invoice.status === "draft" ? (
          <Button
            size="sm"
            onClick={() => run("send", () => sendInvoice(locale, jobId, invoice.id))}
            disabled={pending !== null}
          >
            {pending === "send" ? <Loader2 className="animate-spin" /> : <Send />}
            {t("sendInvoice")}
          </Button>
        ) : null}

        {invoice.status === "sent" ? (
          <>
            <Input
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              placeholder={t("paymentNotesPlaceholder")}
              className="max-w-xs"
            />
            <Button
              size="sm"
              onClick={() =>
                run("paid", () => markInvoicePaid(locale, jobId, invoice.id, paymentNotes))
              }
              disabled={pending !== null}
            >
              {pending === "paid" ? <Loader2 className="animate-spin" /> : <CircleDollarSign />}
              {t("markPaid")}
            </Button>
          </>
        ) : null}

        <Button type="button" variant="ghost" size="sm" onClick={() => window.print()}>
          <Printer /> {t("print")}
        </Button>
      </div>
      {invoice.status === "paid" && invoice.payment_notes ? (
        <p className="text-sm text-muted-foreground">
          {t("paymentNotesLabel")}: {invoice.payment_notes}
        </p>
      ) : null}
    </div>
  );
}
