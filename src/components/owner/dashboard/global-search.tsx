"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Briefcase, FileText, Loader2, Receipt, Search, Users, UserSquare2 } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { globalSearch } from "@/lib/search/actions";
import type { GlobalSearchResults, SearchCategory } from "@/lib/search/types";
import { Input } from "@/components/ui/input";

const CATEGORY_ICONS: Record<SearchCategory, React.ReactNode> = {
  jobs: <Briefcase className="size-3.5" />,
  clients: <Users className="size-3.5" />,
  employees: <UserSquare2 className="size-3.5" />,
  quotes: <FileText className="size-3.5" />,
  invoices: <Receipt className="size-3.5" />,
};

const CATEGORY_ORDER: SearchCategory[] = ["jobs", "clients", "invoices", "quotes", "employees"];

const EMPTY_RESULTS: GlobalSearchResults = {
  jobs: [],
  clients: [],
  employees: [],
  quotes: [],
  invoices: [],
};

export function GlobalSearch() {
  const t = useTranslations("owner.dashboard.search");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<GlobalSearchResults>(EMPTY_RESULTS);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setResults(EMPTY_RESULTS);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const data = await globalSearch(value);
      setResults(data);
      setLoading(false);
    }, 300);
  }

  const totalResults = CATEGORY_ORDER.reduce((sum, cat) => sum + results[cat].length, 0);
  const showDropdown = open && query.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={t("placeholder")}
          className="pl-9"
        />
        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      {showDropdown ? (
        <div className="absolute z-20 mt-1 max-h-[70vh] w-full overflow-y-auto rounded-md border bg-popover p-2 shadow-md">
          {totalResults === 0 && !loading ? (
            <p className="p-3 text-sm text-muted-foreground">{t("noResults")}</p>
          ) : (
            CATEGORY_ORDER.map((category) =>
              results[category].length > 0 ? (
                <div key={category} className="mb-2 last:mb-0">
                  <p className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-muted-foreground">
                    {CATEGORY_ICONS[category]} {t(`categories.${category}`)}
                  </p>
                  {results[category].map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
                    >
                      <span className="font-medium">{item.primary}</span>
                      {item.secondary ? (
                        <span className="truncate text-xs text-muted-foreground">{item.secondary}</span>
                      ) : null}
                    </Link>
                  ))}
                </div>
              ) : null
            )
          )}
        </div>
      ) : null}
    </div>
  );
}
