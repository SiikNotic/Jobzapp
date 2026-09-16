"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Check, Loader2, Pencil, Printer, Send, X, ArrowRightCircle } from "lucide-react";

import { Link, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Quote } from "@/lib/quotes/types";
import { Button } from "@/components/ui/button";
import {
  convertQuoteToInvoice,
  decideQuote,
  sendQuote,
} from "@/app/[locale]/owner/jobs/[id]/quotes/actions";

export function QuoteActions({
  jobId,
  quote,
  invoiceId,
  locale,
}: {
  jobId: string;
  quote: Quote;
  invoiceId: string | null;
  locale: Locale;
}) {
  const t = useTranslations("documents.actions");
  const router = useRouter();
  const [pending, setPending] = React.useState<string | null>(null);

  async function run(key: string, action: () => Promise<{ success: boolean }>) {
    setPending(key);
    const result = await action();
    setPending(null);
    if (result.success) router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      {quote.status === "draft" ? (
        <>
          <Button asChild variant="outline" size="sm">
            <Link href={`/owner/jobs/${jobId}/quotes/${quote.id}/edit`}>
              <Pencil /> {t("edit")}
            </Link>
          </Button>
          <Button
            size="sm"
            onClick={() => run("send", () => sendQuote(locale, jobId, quote.id))}
            disabled={pending !== null}
          >
            {pending === "send" ? <Loader2 className="animate-spin" /> : <Send />}
            {t("sendQuote")}
          </Button>
        </>
      ) : null}

      {quote.status === "sent" ? (
        <>
          <Button
            size="sm"
            onClick={() => run("accept", () => decideQuote(locale, jobId, quote.id, "accepted"))}
            disabled={pending !== null}
          >
            {pending === "accept" ? <Loader2 className="animate-spin" /> : <Check />}
            {t("markAccepted")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => run("reject", () => decideQuote(locale, jobId, quote.id, "rejected"))}
            disabled={pending !== null}
          >
            {pending === "reject" ? <Loader2 className="animate-spin" /> : <X />}
            {t("markRejected")}
          </Button>
        </>
      ) : null}

      {quote.status === "accepted" && !invoiceId ? (
        <Button
          size="sm"
          onClick={() => run("convert", () => convertQuoteToInvoice(locale, jobId, quote.id))}
          disabled={pending !== null}
        >
          {pending === "convert" ? <Loader2 className="animate-spin" /> : <ArrowRightCircle />}
          {t("convertToInvoice")}
        </Button>
      ) : null}

      {invoiceId ? (
        <Button asChild variant="outline" size="sm">
          <Link href={`/owner/jobs/${jobId}/invoices/${invoiceId}`}>{t("viewInvoice")}</Link>
        </Button>
      ) : null}

      <Button type="button" variant="ghost" size="sm" onClick={() => window.print()}>
        <Printer /> {t("print")}
      </Button>
    </div>
  );
}
