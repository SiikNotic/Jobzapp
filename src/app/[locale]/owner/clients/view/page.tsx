"use client";

import * as React from "react";
import { Briefcase, FileSignature, FileText, Pencil, Receipt } from "lucide-react";
import { useTranslations } from "next-intl";
import { notFound, useSearchParams } from "next/navigation";

import { Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth/auth-provider";
import { getClientById } from "@/lib/clients/queries";
import type { Client } from "@/lib/clients/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClientTypeBadge } from "@/components/owner/client-type-badge";
import { ClientHistorySection } from "@/components/owner/client-history-section";
import { PageLoadingSkeleton } from "@/components/page-loading-skeleton";

function ClientDetailPageInner() {
  const id = useSearchParams().get("id");
  const t = useTranslations("owner.clients.detail");
  const { profile } = useAuth();

  const [client, setClient] = React.useState<Client | null | undefined>(undefined);

  React.useEffect(() => {
    if (!profile?.company_id || !id) return;
    getClientById(id).then((data) => {
      if (!data || data.company_id !== profile.company_id) {
        setClient(null);
        return;
      }
      setClient(data);
    });
  }, [profile?.company_id, id]);

  if (client === null) {
    notFound();
  }

  if (client === undefined) {
    return <PageLoadingSkeleton />;
  }

  const contactLines = [client.phone, client.email].filter(Boolean);
  const addressLines = [
    client.address_line1,
    client.address_line2,
    [client.city, client.state_province, client.postal_code].filter(Boolean).join(", "),
    client.country,
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{client.display_name}</h1>
            <ClientTypeBadge type={client.type} />
          </div>
          {client.type === "company" && client.full_name ? (
            <p className="text-sm text-muted-foreground">
              {t("contactPerson")}: {client.full_name}
            </p>
          ) : null}
        </div>
        <Button asChild variant="outline">
          <Link href={`/owner/clients/edit?id=${client.id}`}>
            <Pencil /> {t("edit")}
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col gap-1 py-4">
            <p className="text-sm font-medium text-muted-foreground">{t("contact")}</p>
            {contactLines.length > 0 ? (
              contactLines.map((line) => (
                <p key={line} className="break-words">
                  {line}
                </p>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">{t("noData")}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 py-4">
            <p className="text-sm font-medium text-muted-foreground">{t("address")}</p>
            {addressLines.length > 0 ? (
              addressLines.map((line) => (
                <p key={line} className="break-words">
                  {line}
                </p>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">{t("noData")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {client.notes ? (
        <Card>
          <CardContent className="flex flex-col gap-1 py-4">
            <p className="text-sm font-medium text-muted-foreground">{t("notes")}</p>
            <p className="whitespace-pre-wrap break-words text-sm">{client.notes}</p>
          </CardContent>
        </Card>
      ) : null}

      <div>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">{t("historyTitle")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ClientHistorySection icon={Briefcase} title={t("jobsTitle")} message={t("jobsEmpty")} />
          <ClientHistorySection icon={FileText} title={t("quotesTitle")} message={t("quotesEmpty")} />
          <ClientHistorySection icon={Receipt} title={t("invoicesTitle")} message={t("invoicesEmpty")} />
          <ClientHistorySection
            icon={FileSignature}
            title={t("contractsTitle")}
            message={t("contractsEmpty")}
          />
        </div>
      </div>
    </div>
  );
}

export default function ClientDetailPage() {
  return (
    <React.Suspense fallback={<PageLoadingSkeleton />}>
      <ClientDetailPageInner />
    </React.Suspense>
  );
}
