"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { FileSpreadsheet, FileText, Loader2, Table } from "lucide-react";

import type { TaxReportData } from "@/lib/taxes/types";
import { downloadTextFile, rowsToCsv } from "@/lib/taxes/csv";
import { Button } from "@/components/ui/button";

type ExportKind = "csv" | "pdf" | "excel";

export function TaxReportExport({ report }: { report: TaxReportData }) {
  const t = useTranslations("owner.taxes");
  const [pending, setPending] = React.useState<ExportKind | null>(null);

  const fileBase = `taxes-${report.company.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "company"}-${report.period.from}_${report.period.to}`;

  async function handleCsv() {
    setPending("csv");
    try {
      const blocks = [
        [`${t("title")} — ${report.period.from} to ${report.period.to}`],
        [],
        [t("income.title")],
        ["Invoice #", "Job", "Client", "Paid at", "Total"],
        ...report.income.map((i) => [i.invoice_number, i.job_code, i.client_name, i.paid_at, i.total.toFixed(2)]),
        [t("income.total"), "", "", "", report.totalIncome.toFixed(2)],
        [],
        [t("expenses.title")],
        ["Description", "Job", "Date", "Amount"],
        ...report.expenses.map((e) => [e.description, e.job_code, e.created_at, e.amount.toFixed(2)]),
        [t("expenses.total"), "", "", report.totalExpenses.toFixed(2)],
        [],
        [t("payroll.title")],
        ["Receipt #", "Employee", "Week start", "Week end", "Hours", "Rate", "Gross pay"],
        ...report.payroll.map((p) => [
          p.receipt_number,
          p.employee_name,
          p.week_start_date,
          p.week_end_date,
          p.hours_worked.toFixed(2),
          p.hourly_rate.toFixed(2),
          p.gross_pay.toFixed(2),
        ]),
        [t("payroll.total"), "", "", "", "", "", report.totalPayroll.toFixed(2)],
        [],
        [t("employees.title")],
        [t("employees.name"), t("employees.hourlyRate"), t("employees.totalPaid")],
        ...report.employees.map((e) => [
          e.full_name ?? "",
          e.hourly_rate != null ? e.hourly_rate.toFixed(2) : t("employees.hourlyRateNotSet"),
          e.total_paid.toFixed(2),
        ]),
      ] as (string | number)[][];

      const csv = blocks.map((row) => (row.length ? rowsToCsv([row]) : "")).join("\n");
      downloadTextFile(`${fileBase}.csv`, `﻿${csv}`, "text/csv;charset=utf-8;");
    } finally {
      setPending(null);
    }
  }

  async function handlePdf() {
    setPending("pdf");
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "letter" });
      const money = (v: number) => `$${v.toFixed(2)}`;
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginLeft = 48;
      let y = 56;

      function ensureSpace(extra: number) {
        if (y + extra > pageHeight - 48) {
          doc.addPage();
          y = 56;
        }
      }

      function heading(text: string) {
        ensureSpace(30);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(20);
        doc.text(text, marginLeft, y);
        y += 10;
        doc.setDrawColor(200);
        doc.line(marginLeft, y, 564, y);
        y += 20;
      }

      function line(text: string, opts?: { bold?: boolean }) {
        ensureSpace(16);
        doc.setFontSize(10);
        doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
        doc.setTextColor(opts?.bold ? 20 : 60);
        doc.text(text, marginLeft, y);
        y += 16;
      }

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20);
      doc.text(report.company.name || "—", marginLeft, y);
      y += 22;
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(90);
      doc.text(`${t("title")} — ${report.period.from} to ${report.period.to}`, marginLeft, y);
      y += 30;

      heading(t("income.title"));
      if (report.income.length === 0) line(t("income.empty"));
      report.income.forEach((i) => line(`${i.invoice_number}  ${i.job_code}  ${i.client_name}  ${i.paid_at.slice(0, 10)}  ${money(i.total)}`));
      line(`${t("income.total")}: ${money(report.totalIncome)}`, { bold: true });
      y += 10;

      heading(t("expenses.title"));
      if (report.expenses.length === 0) line(t("expenses.empty"));
      report.expenses.forEach((e) => line(`${e.description}  ${e.job_code}  ${e.created_at.slice(0, 10)}  ${money(e.amount)}`));
      line(`${t("expenses.total")}: ${money(report.totalExpenses)}`, { bold: true });
      y += 10;

      heading(t("payroll.title"));
      if (report.payroll.length === 0) line(t("payroll.empty"));
      report.payroll.forEach((p) =>
        line(`${p.receipt_number}  ${p.employee_name}  ${p.week_start_date} – ${p.week_end_date}  ${money(p.gross_pay)}`)
      );
      line(`${t("payroll.total")}: ${money(report.totalPayroll)}`, { bold: true });
      y += 10;

      heading(t("employees.title"));
      if (report.employees.length === 0) line(t("employees.empty"));
      report.employees.forEach((e) =>
        line(
          `${e.full_name ?? "—"}  ${t("employees.hourlyRate")}: ${
            e.hourly_rate != null ? money(e.hourly_rate) : t("employees.hourlyRateNotSet")
          }  ${t("employees.totalPaid")}: ${money(e.total_paid)}`
        )
      );

      heading(t("withholding.title"));
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(120);
      const withholdingLines = doc.splitTextToSize(t("withholding.note"), 516);
      withholdingLines.forEach((textLine: string) => {
        ensureSpace(14);
        doc.text(textLine, marginLeft, y);
        y += 14;
      });

      y += 20;
      ensureSpace(40);
      doc.setDrawColor(200);
      doc.line(marginLeft, y, 564, y);
      y += 16;
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(140);
      const disclaimerLines = doc.splitTextToSize(t("disclaimerBody"), 516);
      disclaimerLines.forEach((textLine: string) => {
        ensureSpace(12);
        doc.text(textLine, marginLeft, y);
        y += 12;
      });

      doc.save(`${fileBase}.pdf`);
    } finally {
      setPending(null);
    }
  }

  async function handleExcel() {
    setPending("excel");
    try {
      const ExcelJS = await import("exceljs");
      const workbook = new ExcelJS.Workbook();

      const incomeSheet = workbook.addWorksheet(t("income.title").slice(0, 31));
      incomeSheet.columns = [
        { header: "Invoice #", key: "invoice_number", width: 16 },
        { header: "Job", key: "job_code", width: 14 },
        { header: "Client", key: "client_name", width: 24 },
        { header: "Paid at", key: "paid_at", width: 14 },
        { header: "Total", key: "total", width: 12 },
      ];
      report.income.forEach((i) =>
        incomeSheet.addRow({
          invoice_number: i.invoice_number,
          job_code: i.job_code,
          client_name: i.client_name,
          paid_at: i.paid_at.slice(0, 10),
          total: i.total,
        })
      );

      const expensesSheet = workbook.addWorksheet(t("expenses.title").slice(0, 31));
      expensesSheet.columns = [
        { header: "Description", key: "description", width: 32 },
        { header: "Job", key: "job_code", width: 14 },
        { header: "Date", key: "created_at", width: 14 },
        { header: "Amount", key: "amount", width: 12 },
      ];
      report.expenses.forEach((e) =>
        expensesSheet.addRow({
          description: e.description,
          job_code: e.job_code,
          created_at: e.created_at.slice(0, 10),
          amount: e.amount,
        })
      );

      const payrollSheet = workbook.addWorksheet(t("payroll.title").slice(0, 31));
      payrollSheet.columns = [
        { header: "Receipt #", key: "receipt_number", width: 16 },
        { header: "Employee", key: "employee_name", width: 24 },
        { header: "Week start", key: "week_start_date", width: 14 },
        { header: "Week end", key: "week_end_date", width: 14 },
        { header: "Hours", key: "hours_worked", width: 10 },
        { header: "Rate", key: "hourly_rate", width: 10 },
        { header: "Gross pay", key: "gross_pay", width: 12 },
      ];
      report.payroll.forEach((p) =>
        payrollSheet.addRow({
          receipt_number: p.receipt_number,
          employee_name: p.employee_name,
          week_start_date: p.week_start_date,
          week_end_date: p.week_end_date,
          hours_worked: p.hours_worked,
          hourly_rate: p.hourly_rate,
          gross_pay: p.gross_pay,
        })
      );

      const employeesSheet = workbook.addWorksheet(t("employees.title").slice(0, 31));
      employeesSheet.columns = [
        { header: t("employees.name"), key: "name", width: 24 },
        { header: t("employees.hourlyRate"), key: "rate", width: 14 },
        { header: t("employees.totalPaid"), key: "total_paid", width: 16 },
      ];
      report.employees.forEach((e) =>
        employeesSheet.addRow({
          name: e.full_name ?? "",
          rate: e.hourly_rate ?? "",
          total_paid: e.total_paid,
        })
      );

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileBase}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" onClick={handlePdf} disabled={pending !== null}>
        {pending === "pdf" ? <Loader2 className="animate-spin" /> : <FileText />}
        {t("export.pdf")}
      </Button>
      <Button type="button" variant="outline" onClick={handleCsv} disabled={pending !== null}>
        {pending === "csv" ? <Loader2 className="animate-spin" /> : <Table />}
        {t("export.csv")}
      </Button>
      <Button type="button" variant="outline" onClick={handleExcel} disabled={pending !== null}>
        {pending === "excel" ? <Loader2 className="animate-spin" /> : <FileSpreadsheet />}
        {t("export.excel")}
      </Button>
    </div>
  );
}
