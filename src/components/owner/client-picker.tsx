"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Building2, Loader2, Search, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { ClientSummary } from "@/lib/clients/types";
import { searchClients } from "@/app/[locale]/owner/clients/actions";

/**
 * Search-as-you-type client/contact picker. Selecting a result calls
 * `onSelect` with the matching client's summary fields so the caller can
 * autofill a form (e.g. the future Jobs "new job" form) or navigate to the
 * client's page. Query logic lives server-side in `searchClients`, which
 * already scopes results to the caller's own company via RLS.
 */
export function ClientPicker({
  onSelect,
  placeholder,
  className,
}: {
  onSelect: (client: ClientSummary) => void;
  placeholder?: string;
  className?: string;
}) {
  const t = useTranslations("owner.clients.picker");
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<ClientSummary[]>([]);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  function handleChange(value: string) {
    setQuery(value);
    setOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const term = value.trim();
    if (!term) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const data = await searchClients(term);
      setResults(data);
      setLoading(false);
    }, 300);
  }

  function handleSelect(client: ClientSummary) {
    onSelect(client);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      onBlur={(event) => {
        if (!containerRef.current?.contains(event.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => query.trim() && setOpen(true)}
          placeholder={placeholder ?? t("placeholder")}
          className="pl-9"
        />
        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      {open && query.trim() ? (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
          {results.length === 0 && !loading ? (
            <p className="p-3 text-sm text-muted-foreground">{t("noResults")}</p>
          ) : (
            <ul className="max-h-64 overflow-y-auto py-1">
              {results.map((client) => (
                <li key={client.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(client)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    {client.type === "company" ? (
                      <Building2 className="size-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <User className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="flex-1 truncate">{client.display_name}</span>
                    {client.phone ? (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {client.phone}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
