import { Briefcase, CheckCircle2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import type { Locale } from "@/i18n/routing";
import { getPublicContract } from "@/lib/job-contracts/queries";
import { JobContractStatusBadge } from "@/components/contracts/job-contract-status-badge";
import { ContractSignForm } from "@/components/contracts/contract-sign-form";
import { PrintButton } from "@/components/contracts/print-button";

export default async function PublicContractPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = (await params) as { locale: Locale; token: string };
  const t = await getTranslations({ locale, namespace: "contracts.public" });

  const contract = await getPublicContract(token);
  if (!contract) {
    notFound();
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
        <div className="whitespace-pre-wrap text-sm leading-relaxed">{content}</div>
      </div>

      {isSigned && contract.signature_data_url ? (
        <div className="rounded-lg border bg-card p-4">
          <p className="mb-2 text-sm font-medium">{t("signatureLabel")}</p>
          {/* eslint-disable-next-line @next/next/no-img-element -- signature is a locally-generated data URL */}
          <img src={contract.signature_data_url} alt="" className="h-24" />
        </div>
      ) : null}

      {!isSigned ? <ContractSignForm token={token} /> : null}
    </div>
  );
}
