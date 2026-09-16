"use client";

import * as React from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Check, Loader2, X } from "lucide-react";

import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { ExpenseRequestWithNames } from "@/lib/expense-requests/types";
import { reviewExpenseRequest } from "@/lib/expense-requests/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ExpenseRequestStatusBadge } from "@/components/expense-requests/expense-request-status-badge";

export function ExpenseRequestCard({
  request,
  canReview,
  jobId,
  locale,
  jobCode,
}: {
  request: ExpenseRequestWithNames;
  canReview: boolean;
  jobId: string;
  locale: Locale;
  /** Shown as a link back to the job when this card appears outside the
   * job's own detail page (e.g. the employee's cross-job request list). */
  jobCode?: string;
}) {
  const t = useTranslations("expenseRequests");
  const format = useFormatter();
  const [notes, setNotes] = React.useState("");
  const [pending, setPending] = React.useState<"approved" | "rejected" | null>(null);
  const [error, setError] = React.useState(false);

  async function handleDecision(decision: "approved" | "rejected") {
    setPending(decision);
    setError(false);
    const result = await reviewExpenseRequest(locale, jobId, request.id, decision, notes);
    setPending(null);
    if (!result.success) setError(true);
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium">{request.material_name}</p>
          <p className="text-sm text-muted-foreground">{request.reason}</p>
          {jobCode ? (
            <Link
              href={`/employee/jobs/${jobId}`}
              className="mt-1 inline-block font-mono text-xs text-primary hover:underline"
            >
              {jobCode}
            </Link>
          ) : null}
        </div>
        <ExpenseRequestStatusBadge status={request.status} />
      </div>

      <div className="grid gap-2 text-sm sm:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">{t("detail.quantity")}</p>
          <p>{request.quantity}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("detail.estimatedCost")}</p>
          <p className="font-medium">${request.estimated_cost.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("detail.requestedBy")}</p>
          <p>{request.requested_by_name ?? "—"}</p>
        </div>
      </div>

      {request.additional_info ? (
        <div>
          <p className="text-xs text-muted-foreground">{t("detail.additionalInfo")}</p>
          <p className="whitespace-pre-wrap break-words text-sm">{request.additional_info}</p>
        </div>
      ) : null}

      {request.status !== "pending" ? (
        <div className="rounded-md bg-muted/50 p-3 text-sm">
          <p className="text-xs text-muted-foreground">
            {t("detail.reviewedBy")}: {request.reviewed_by_name ?? "—"}
            {request.reviewed_at
              ? ` · ${format.dateTime(new Date(request.reviewed_at), {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}`
              : ""}
          </p>
          {request.review_notes ? <p className="mt-1">{request.review_notes}</p> : null}
        </div>
      ) : canReview ? (
        <div className="flex flex-col gap-2 border-t pt-3">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("review.notesPlaceholder")}
            rows={2}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => handleDecision("approved")}
              disabled={pending !== null}
            >
              {pending === "approved" ? <Loader2 className="animate-spin" /> : <Check />}
              {t("review.approve")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleDecision("rejected")}
              disabled={pending !== null}
            >
              {pending === "rejected" ? <Loader2 className="animate-spin" /> : <X />}
              {t("review.reject")}
            </Button>
          </div>
          {error ? <p className="text-sm text-destructive">{t("review.error")}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
