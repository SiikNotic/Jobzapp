"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { createExpenseRequest } from "@/lib/expense-requests/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export function ExpenseRequestForm({ jobId }: { jobId: string }) {
  const t = useTranslations("expenseRequests.form");
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const result = await createExpenseRequest(jobId, formData);

    if (result.success) {
      router.push(`/employee/jobs/view?id=${jobId}`);
    } else {
      setError(t("error"));
      setPending(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="material_name">{t("material")}</Label>
            <Input id="material_name" name="material_name" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="reason">{t("reason")}</Label>
            <Textarea id="reason" name="reason" required rows={3} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="quantity">{t("quantity")}</Label>
              <Input id="quantity" name="quantity" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="estimated_cost">{t("estimatedCost")}</Label>
              <Input
                id="estimated_cost"
                name="estimated_cost"
                type="number"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="additional_info">{t("additionalInfo")}</Label>
            <Textarea id="additional_info" name="additional_info" rows={3} />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" disabled={pending} className="self-start">
            {pending ? <Loader2 className="animate-spin" /> : null}
            {t("submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
