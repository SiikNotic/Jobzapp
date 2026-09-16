import { useTranslations } from "next-intl";

import type { DocumentCompanyInfo, LineItem } from "@/lib/documents/types";

export function DocumentPreview({
  kind,
  number,
  jobCode,
  clientName,
  clientAddress,
  description,
  lineItems,
  terms,
  total,
  company,
}: {
  kind: "quote" | "invoice";
  number: string;
  jobCode: string;
  clientName: string;
  clientAddress: string | null;
  description: string | null;
  lineItems: LineItem[];
  terms: string | null;
  total: number;
  company: DocumentCompanyInfo;
}) {
  const t = useTranslations("documents");
  const tKind = useTranslations(`documents.kind.${kind}`);

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm print:border-none print:p-0 print:shadow-none">
      <div className="mb-6 flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3">
          {company.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- company logo, not build-optimized
            <img src={company.logoUrl} alt="" className="size-12 rounded object-contain" />
          ) : null}
          <div>
            <p className="font-semibold">{company.name}</p>
            {company.address ? (
              <p className="whitespace-pre-line text-sm text-muted-foreground">{company.address}</p>
            ) : null}
            {company.phone ? <p className="text-sm text-muted-foreground">{company.phone}</p> : null}
            {company.email ? <p className="text-sm text-muted-foreground">{company.email}</p> : null}
          </div>
        </div>
        <div className="sm:text-right">
          <p className="text-lg font-semibold">{tKind("title")}</p>
          <p className="font-mono text-sm text-muted-foreground">{number}</p>
          <p className="font-mono text-sm text-muted-foreground">{jobCode}</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-xs font-medium text-muted-foreground">{t("client")}</p>
        <p className="font-medium">{clientName}</p>
        {clientAddress ? (
          <p className="whitespace-pre-line text-sm text-muted-foreground">{clientAddress}</p>
        ) : null}
      </div>

      {description ? (
        <div className="mb-6">
          <p className="text-xs font-medium text-muted-foreground">{t("description")}</p>
          <p className="whitespace-pre-wrap break-words text-sm">{description}</p>
        </div>
      ) : null}

      <div className="mb-6 -mx-6 overflow-x-auto px-6 print:mx-0 print:overflow-visible print:px-0">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="py-2 font-medium">{t("itemDescription")}</th>
              <th className="py-2 text-right font-medium">{t("quantity")}</th>
              <th className="py-2 text-right font-medium">{t("unitCost")}</th>
              <th className="py-2 text-right font-medium">{t("amount")}</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr key={index} className="border-b last:border-0">
                <td className="py-2">{item.description}</td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">${item.unit_cost.toFixed(2)}</td>
                <td className="py-2 text-right">${(item.quantity * item.unit_cost).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-6 flex justify-end">
        <div className="flex items-center gap-4 text-lg font-semibold">
          <span>{t("total")}</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {terms ? (
        <div className="border-t pt-4">
          <p className="text-xs font-medium text-muted-foreground">{t("terms")}</p>
          <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{terms}</p>
        </div>
      ) : null}
    </div>
  );
}
