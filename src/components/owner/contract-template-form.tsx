"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Loader2, Trash2 } from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import type { ContractTemplate } from "@/lib/contract-templates/types";
import { CONTRACT_PLACEHOLDERS } from "@/lib/contract-templates/render";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createContractTemplate,
  deleteContractTemplate,
  updateContractTemplate,
} from "@/app/[locale]/owner/settings/contract-templates/actions";

export function ContractTemplateForm({
  template,
}: {
  template?: ContractTemplate;
}) {
  const t = useTranslations("contractTemplates.form");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const isEditing = Boolean(template);

  const [pending, setPending] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<
    { type: "success" | "error"; message: string } | null
  >(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setFeedback(null);

    const result = isEditing
      ? await updateContractTemplate(template!.id, formData)
      : await createContractTemplate(formData);

    if (result.success) {
      if (isEditing) {
        setFeedback({ type: "success", message: t("saved") });
      } else {
        router.push("/owner/settings/contract-templates");
        return;
      }
    } else {
      setFeedback({ type: "error", message: t("error") });
    }
    setPending(false);
  }

  async function handleDelete() {
    if (!template) return;
    setDeleting(true);
    const result = await deleteContractTemplate(template.id);
    if (result.success) {
      router.push("/owner/settings/contract-templates");
    } else {
      setFeedback({ type: "error", message: t("deleteError") });
      setDeleting(false);
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-6 pb-8">
      <Card>
        <CardHeader>
          <CardTitle>{t("identityTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 sm:max-w-md">
            <Label htmlFor="name">{t("name")}</Label>
            <Input id="name" name="name" required defaultValue={template?.name} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("bodyTitle")}</CardTitle>
          <CardDescription>{t("bodyDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-1.5">
            {CONTRACT_PLACEHOLDERS.map((placeholder) => (
              <Badge key={placeholder} variant="outline" className="font-mono text-xs">
                {`{{${placeholder}}}`}
              </Badge>
            ))}
          </div>
          <Textarea
            id="body"
            name="body"
            required
            rows={16}
            className="font-mono text-sm"
            defaultValue={template?.body}
          />
        </CardContent>
      </Card>

      <div className="sticky bottom-0 -mx-4 flex flex-col gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between md:-mx-6 md:px-6">
        <div className="flex items-center gap-3">
          <div aria-live="polite" className="text-sm">
            {feedback ? (
              <span className={feedback.type === "success" ? "text-success" : "text-destructive"}>
                {feedback.message}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <Button
              type="button"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
              {tCommon("delete")}
            </Button>
          ) : null}
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : null}
            {tCommon("save")}
          </Button>
        </div>
      </div>
    </form>
  );
}
