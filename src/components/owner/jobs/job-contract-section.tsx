"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Copy, ExternalLink, FileSignature, Loader2, Send } from "lucide-react";

import type { Locale } from "@/i18n/routing";
import { BASE_PATH } from "@/lib/base-path";
import type { JobContract } from "@/lib/job-contracts/types";
import { Button } from "@/components/ui/button";
import { JobContractStatusBadge } from "@/components/contracts/job-contract-status-badge";
import { generateJobContract, sendJobContract } from "@/app/[locale]/owner/jobs/contract-actions";

export function JobContractSection({
  jobId,
  templateId,
  templateName,
  contract,
  locale,
}: {
  jobId: string;
  templateId: string | null;
  templateName: string | null;
  contract: JobContract | null;
  locale: Locale;
}) {
  const t = useTranslations("contracts.section");
  const [pending, setPending] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  if (!templateId) {
    return <p className="text-sm text-muted-foreground">{t("noTemplate")}</p>;
  }

  const publicUrl =
    contract && typeof window !== "undefined"
      ? `${window.location.origin}${BASE_PATH}/${locale}/contracts?token=${contract.access_token}`
      : "";

  async function handleGenerate() {
    setPending(true);
    await generateJobContract(locale, jobId, templateId!);
    setPending(false);
    window.location.reload();
  }

  async function handleSend() {
    if (!contract) return;
    setPending(true);
    await sendJobContract(contract.id);
    setPending(false);
    window.location.reload();
  }

  function handleCopy() {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (!contract) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          {t("templateSelected", { name: templateName ?? "" })}
        </p>
        <Button type="button" onClick={handleGenerate} disabled={pending} className="self-start">
          {pending ? <Loader2 className="animate-spin" /> : <FileSignature />}
          {t("generate")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <JobContractStatusBadge status={contract.status} />
        {contract.signed_at ? (
          <span className="text-sm text-muted-foreground">
            {t("signedBy", { name: contract.signer_name ?? "" })} ·{" "}
            {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(
              new Date(contract.signed_at)
            )}
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {contract.status === "draft" ? (
          <Button type="button" size="sm" onClick={handleSend} disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <Send />}
            {t("send")}
          </Button>
        ) : null}
        <Button type="button" size="sm" variant="outline" asChild>
          <a href={`${BASE_PATH}/${locale}/contracts?token=${contract.access_token}`} target="_blank" rel="noreferrer">
            <ExternalLink /> {t("view")}
          </a>
        </Button>
        {contract.status !== "draft" ? (
          <Button type="button" size="sm" variant="ghost" onClick={handleCopy}>
            <Copy /> {copied ? t("copied") : t("copyLink")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
