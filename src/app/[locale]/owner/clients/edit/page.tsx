"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { notFound, useSearchParams } from "next/navigation";

import { useAuth } from "@/lib/auth/auth-provider";
import { getClientById } from "@/lib/clients/queries";
import type { Client } from "@/lib/clients/types";
import { ClientForm } from "@/components/owner/client-form";
import { PageLoadingSkeleton } from "@/components/page-loading-skeleton";

function EditClientPageInner() {
  const id = useSearchParams().get("id");
  const t = useTranslations("owner.clients.edit");
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{client.display_name}</p>
      </div>

      <ClientForm client={client} />
    </div>
  );
}

export default function EditClientPage() {
  return (
    <React.Suspense fallback={<PageLoadingSkeleton />}>
      <EditClientPageInner />
    </React.Suspense>
  );
}
