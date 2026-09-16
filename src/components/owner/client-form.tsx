"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Building2, Loader2, User } from "lucide-react";

import { Link } from "@/i18n/navigation";
import type { Client, ClientType } from "@/lib/clients/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  createClientRecord,
  findPotentialDuplicates,
  updateClientRecord,
  type PotentialDuplicate,
} from "@/app/[locale]/owner/clients/actions";

type FormState = {
  type: ClientType;
  full_name: string;
  company_name: string;
  phone: string;
  email: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  notes: string;
};

function toFormState(client?: Client, defaultCountry?: string): FormState {
  return {
    type: client?.type ?? "individual",
    full_name: client?.full_name ?? "",
    company_name: client?.company_name ?? "",
    phone: client?.phone ?? "",
    email: client?.email ?? "",
    address_line1: client?.address_line1 ?? "",
    address_line2: client?.address_line2 ?? "",
    city: client?.city ?? "",
    state_province: client?.state_province ?? "",
    postal_code: client?.postal_code ?? "",
    country: client?.country ?? defaultCountry ?? "",
    notes: client?.notes ?? "",
  };
}

export function ClientForm({
  client,
  defaultCountry,
}: {
  client?: Client;
  defaultCountry?: string;
}) {
  const t = useTranslations("owner.clients.form");
  const tCommon = useTranslations("common");
  const isEditing = Boolean(client);

  const [form, setForm] = React.useState<FormState>(() =>
    toFormState(client, defaultCountry)
  );
  const [pending, setPending] = React.useState(false);
  const [feedback, setFeedback] = React.useState<
    { type: "success" | "error"; message: string } | null
  >(null);
  const [duplicates, setDuplicates] = React.useState<PotentialDuplicate[]>([]);
  const duplicateCheckRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function checkDuplicates(next: FormState) {
    if (duplicateCheckRef.current) clearTimeout(duplicateCheckRef.current);
    if (isEditing) return;
    if (!next.email.trim() && !next.phone.trim()) {
      setDuplicates([]);
      return;
    }
    duplicateCheckRef.current = setTimeout(async () => {
      const matches = await findPotentialDuplicates(next.email, next.phone, client?.id);
      setDuplicates(matches);
    }, 400);
  }

  const isCompany = form.type === "company";
  const nameLabel = isCompany ? t("contactPerson") : t("fullName");

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setFeedback(null);

    const result = isEditing
      ? await updateClientRecord(client!.id, formData)
      : await createClientRecord(formData);

    if (result.success) {
      setFeedback({ type: "success", message: t("saved") });
      if (!isEditing) {
        setForm(toFormState(undefined, defaultCountry));
        setDuplicates([]);
      } else {
        setForm(toFormState(result.client, defaultCountry));
      }
    } else {
      setFeedback({ type: "error", message: t("error") });
    }
    setPending(false);
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-6 pb-8">
      <input type="hidden" name="type" value={form.type} />

      <Card>
        <CardHeader>
          <CardTitle>{t("typeTitle")}</CardTitle>
          <CardDescription>{t("typeDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:max-w-sm" role="radiogroup">
            <button
              type="button"
              role="radio"
              aria-checked={form.type === "individual"}
              disabled={isEditing}
              onClick={() => set("type", "individual")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                form.type === "individual"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <User className="size-4" /> {t("individual")}
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={form.type === "company"}
              disabled={isEditing}
              onClick={() => set("type", "company")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                form.type === "company"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Building2 className="size-4" /> {t("company")}
            </button>
          </div>
          {isEditing ? (
            <p className="mt-2 text-xs text-muted-foreground">{t("typeLockedHint")}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("identityTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {isCompany ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="company_name">{t("companyName")}</Label>
              <Input
                id="company_name"
                name="company_name"
                required
                value={form.company_name}
                onChange={(e) => {
                  set("company_name", e.target.value);
                  checkDuplicates({ ...form, company_name: e.target.value });
                }}
              />
            </div>
          ) : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor="full_name">{nameLabel}</Label>
            <Input
              id="full_name"
              name="full_name"
              required={!isCompany}
              value={form.full_name}
              onChange={(e) => set("full_name", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">{t("phone")}</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => {
                set("phone", e.target.value);
                checkDuplicates({ ...form, phone: e.target.value });
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => {
                set("email", e.target.value);
                checkDuplicates({ ...form, email: e.target.value });
              }}
            />
          </div>
        </CardContent>
      </Card>

      {duplicates.length > 0 ? (
        <div className="flex flex-col gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          <div className="flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400">
            <AlertTriangle className="size-4" /> {t("duplicateWarningTitle")}
          </div>
          <ul className="flex flex-col gap-1">
            {duplicates.map((dup) => (
              <li key={dup.id}>
                <Link
                  href={`/owner/clients/view?id=${dup.id}`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {dup.display_name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t("addressTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="address_line1">{t("line1")}</Label>
              <Input
                id="address_line1"
                name="address_line1"
                value={form.address_line1}
                onChange={(e) => set("address_line1", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="address_line2">{t("line2")}</Label>
              <Input
                id="address_line2"
                name="address_line2"
                value={form.address_line2}
                onChange={(e) => set("address_line2", e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="city">{t("city")}</Label>
              <Input
                id="city"
                name="city"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="state_province">{t("state")}</Label>
              <Input
                id="state_province"
                name="state_province"
                value={form.state_province}
                onChange={(e) => set("state_province", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="postal_code">{t("postalCode")}</Label>
              <Input
                id="postal_code"
                name="postal_code"
                value={form.postal_code}
                onChange={(e) => set("postal_code", e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:max-w-xs">
            <Label htmlFor="country">{t("country")}</Label>
            <Input
              id="country"
              name="country"
              value={form.country}
              onChange={(e) => set("country", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("notesTitle")}</CardTitle>
          <CardDescription>{t("notesDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            name="notes"
            rows={4}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="sticky bottom-0 -mx-4 flex flex-col gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between md:-mx-6 md:px-6">
        <div aria-live="polite" className="text-sm">
          {feedback ? (
            <span className={feedback.type === "success" ? "text-success" : "text-destructive"}>
              {feedback.message}
            </span>
          ) : null}
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : null}
          {tCommon("save")}
        </Button>
      </div>
    </form>
  );
}
