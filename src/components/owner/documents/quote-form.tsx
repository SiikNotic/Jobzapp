"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Quote } from "@/lib/quotes/types";
import type { LineItem } from "@/lib/documents/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineItemsEditor } from "@/components/owner/documents/line-items-editor";
import { createQuote, updateQuote } from "@/app/[locale]/owner/jobs/[id]/quotes/actions";

export function QuoteForm({
  jobId,
  quote,
  defaultClientAddress,
  defaultTerms,
  locale,
}: {
  jobId: string;
  quote?: Quote;
  defaultClientAddress?: string | null;
  defaultTerms?: string | null;
  locale: Locale;
}) {
  const t = useTranslations("documents.form");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const isEditing = Boolean(quote);

  const [clientAddress, setClientAddress] = React.useState(
    quote?.client_address ?? defaultClientAddress ?? ""
  );
  const [description, setDescription] = React.useState(quote?.description ?? "");
  const [terms, setTerms] = React.useState(quote?.terms ?? defaultTerms ?? "");
  const [lineItems, setLineItems] = React.useState<LineItem[]>(quote?.line_items ?? []);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const result = isEditing
      ? await updateQuote(locale, jobId, quote!.id, formData)
      : await createQuote(locale, jobId, formData);

    if (result.success) {
      router.push(`/owner/jobs/${jobId}/quotes/${result.quote.id}`);
    } else {
      setError(t("error"));
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-6 pb-8">
      <Card>
        <CardHeader>
          <CardTitle>{t("clientAddressTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            name="client_address"
            rows={3}
            value={clientAddress}
            onChange={(e) => setClientAddress(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("descriptionTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            name="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("lineItemsTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <LineItemsEditor items={lineItems} onChange={setLineItems} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("termsTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="terms" className="sr-only">
            {t("termsTitle")}
          </Label>
          <Textarea
            id="terms"
            name="terms"
            rows={4}
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="sticky bottom-0 -mx-4 flex flex-col gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between md:-mx-6 md:px-6">
        <div aria-live="polite" className="text-sm">
          {error ? <span className="text-destructive">{error}</span> : null}
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : null}
          {tCommon("save")}
        </Button>
      </div>
    </form>
  );
}
