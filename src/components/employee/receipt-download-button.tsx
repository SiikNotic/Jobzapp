"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Download, Loader2 } from "lucide-react";

import type { Locale } from "@/i18n/routing";
import type { PayReceipt } from "@/lib/hours-pay/types";
import { Button } from "@/components/ui/button";

export function ReceiptDownloadButton({
  receipt,
  companyName,
  employeeName,
  locale,
}: {
  receipt: PayReceipt;
  companyName: string;
  employeeName: string;
  locale: Locale;
}) {
  const t = useTranslations("hoursPay.receiptPdf");
  const [pending, setPending] = React.useState(false);

  async function handleDownload() {
    setPending(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "letter" });

      const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: "long" });
      const money = (value: number) => `$${value.toFixed(2)}`;

      let y = 56;
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(companyName || "—", 48, y);

      y += 28;
      doc.setFontSize(14);
      doc.text(t("title"), 48, y);

      y += 12;
      doc.setDrawColor(200);
      doc.line(48, y, 564, y);

      const row = (label: string, value: string) => {
        y += 26;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(110);
        doc.text(label, 48, y);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(20);
        doc.text(value, 48, y + 16);
      };

      y += 14;
      row(t("receiptNumber"), receipt.receipt_number);
      row(t("employee"), employeeName || "—");
      row(
        t("period"),
        `${dateFormat.format(new Date(`${receipt.week_start_date}T00:00:00`))} – ${dateFormat.format(
          new Date(`${receipt.week_end_date}T00:00:00`)
        )}`
      );
      row(t("hoursWorked"), receipt.hours_worked.toFixed(2));
      row(t("hourlyRate"), money(receipt.hourly_rate));

      y += 40;
      doc.setDrawColor(200);
      doc.line(48, y, 564, y);
      y += 30;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80);
      doc.text(t("grossPay"), 48, y);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20);
      doc.text(money(receipt.gross_pay), 48, y + 26);

      y += 60;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(140);
      doc.text(
        `${t("issuedOn")} ${dateFormat.format(new Date(receipt.issued_at))}`,
        48,
        y
      );

      doc.save(`${receipt.receipt_number}.pdf`);
    } finally {
      setPending(false);
    }
  }

  return (
    <Button type="button" size="sm" variant="outline" onClick={handleDownload} disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : <Download />}
      {t("download")}
    </Button>
  );
}
