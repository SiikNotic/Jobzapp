"use client";

import * as React from "react";
import { Briefcase, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { notFound, useParams, useSearchParams } from "next/navigation";

import type { Locale } from "@/i18n/routing";
import { getPublicContract } from "@/lib/job-contracts/queries";
import type { PublicContract } from "@/lib/job-contracts/types";
import { JobContractStatusBadge } from "@/components/contracts/job-contract-status-badge";
import { ContractSignForm } from "@/components/contracts/contract-sign-form";
import { PrintButton } from "@/components/contracts/print-button";
import { PageLoadingSkeleton } from "@/components/page-loading-skeleton";

function PublicContractPageInner() {
  const { locale } = useParams<{ locale: Locale }>();
  const token = useSearchParams().get("token");
  const t = useTranslations("contracts.public");

  const [contract, setContract] = React.useState<PublicContract | null | undefined>(undefined);

  React.useEffect(() => {
    if (!token) return;
    getPublicContract(token).then((data) => setContract(data ?? null));
  }, [token]);

  if (contract === null) {
    notFound();
  }

  if (contract === undefined) {
    return <PageLoadingSkeleton />;
  }

  const content = contract.accepted_content ?? contract.rendered_content;
  const isSigned = contract.status === "signed";

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-4 py-8 md:p-8">
      <div className="flex items-center justify-between gap-2 print:hidden">
        <div className="flex items-center gap-2 font-semibold">
          <Briefcase className="size-5 text-primary" />
          Jobzapp
        </div>
        <PrintButton />
      </div>

      {isSigned ? (
        <div className="flex items-center gap-2 rounded-lg border border-success/40 bg-success/10 p-4 text-sm print:hidden">
          <CheckCircle2 className="size-4 shrink-0 text-success" />
          <span>
            {t("signedBanner", {
              name: contract.signer_name ?? "",
              date: contract.signed_at
                ? new Intl.DateTimeFormat(locale, { dateStyle: "long", timeStyle: "short" }).format(
                    new Date(contract.signed_at)
                  )
                : "",
            })}
          </span>
        </div>
      ) : null}

      <div className="rounded-lg border bg-card p-6 shadow-sm print:border-none print:p-0 print:shadow-none">
        <div className="mb-4 flex items-center justify-between print:hidden">
          <h1 className="text-lg font-semibold">{t("title")}</h1>
          <JobContractStatusBadge status={contract.status} />
        </div>
        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">{content}</div>
      </div>

      {isSigned && contract.signature_data_url ? (
        <div className="rounded-lg border bg-card p-4">
          <p className="mb-2 text-sm font-medium">{t("signatureLabel")}</p>
          {/* eslint-disable-next-line @next/next/no-img-element -- signature is a locally-generated data URL */}
          <img src={contract.signature_data_url} alt="" className="h-24" />
        </div>
      ) : null}

      {!isSigned ? <ContractSignForm token={token!} /> : null}
    </div>
  );
}

export default function PublicContractPage() {
  return (
    <React.Suspense fallback={<PageLoadingSkeleton />}>
      <PublicContractPageInner />
    </React.Suspense>
  );
}
