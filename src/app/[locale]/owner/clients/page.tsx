"use client";

import * as React from "react";
import { Building2, Plus, User, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import { Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth/auth-provider";
import { listClients } from "@/lib/clients/queries";
import type { ClientSummary, ClientType } from "@/lib/clients/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClientsSearchBar } from "@/components/owner/clients-search-bar";
import { PageLoadingSkeleton } from "@/components/page-loading-skeleton";

function ClientsPageInner() {
  const t = useTranslations("owner.clients.list");
  const { profile } = useAuth();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const type = searchParams.get("type") ?? "all";
  const validType: ClientType | "all" = type === "individual" || type === "company" ? type : "all";

  const [clients, setClients] = React.useState<ClientSummary[] | null>(null);

  React.useEffect(() => {
    if (!profile?.company_id) return;
    listClients(profile.company_id, { q, type: validType }).then(setClients);
  }, [profile?.company_id, q, validType]);

  if (!clients) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button asChild>
          <Link href="/owner/clients/new">
            <Plus /> {t("newClient")}
          </Link>
        </Button>
      </div>

      <ClientsSearchBar initialQuery={q} initialType={validType} />

      {clients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Users className="size-8 text-muted-foreground" />
            <p className="font-medium">{t("emptyTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("emptyDescription")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/owner/clients/view?id=${client.id}`}
              className="flex flex-col gap-2 rounded-lg border bg-card p-4 transition-colors hover:bg-accent sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                {client.type === "company" ? (
                  <Building2 className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <User className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span className="font-medium">{client.display_name}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground sm:justify-end">
                {client.phone ? <span>{client.phone}</span> : null}
                {client.email ? <span>{client.email}</span> : null}
                {client.city ? <span>{client.city}</span> : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ClientsPage() {
  return (
    <React.Suspense fallback={<PageLoadingSkeleton />}>
      <ClientsPageInner />
    </React.Suspense>
  );
}
