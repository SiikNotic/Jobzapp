"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Building2, Hash, ImageOff, Loader2, Upload, X } from "lucide-react";

import type { Locale } from "@/i18n/routing";
import type { Company, CompanyCountry, CompanyThemePreference } from "@/lib/company/types";
import { formatJobCode, isValidJobCodePattern } from "@/lib/company/job-code";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateCompanySettings } from "@/app/[locale]/owner/settings/actions";

type FormState = {
  name: string;
  trade_name: string;
  contact_email: string;
  contact_phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: CompanyCountry;
  tax_id: string;
  default_locale: "es" | "en";
  theme_preference: CompanyThemePreference;
  document_notes: string;
  job_code_pattern: string;
};

function toFormState(company: Company): FormState {
  return {
    name: company.name,
    trade_name: company.trade_name ?? "",
    contact_email: company.contact_email ?? "",
    contact_phone: company.contact_phone ?? "",
    address_line1: company.address_line1 ?? "",
    address_line2: company.address_line2 ?? "",
    city: company.city ?? "",
    state_province: company.state_province ?? "",
    postal_code: company.postal_code ?? "",
    country: company.country,
    tax_id: company.tax_id ?? "",
    default_locale: company.default_locale,
    theme_preference: company.theme_preference,
    document_notes: company.document_notes ?? "",
    job_code_pattern: company.job_code_pattern,
  };
}

export function CompanySettingsForm({
  company: initialCompany,
  locale,
}: {
  company: Company;
  locale: Locale;
}) {
  const t = useTranslations("owner.settings");
  const tCommon = useTranslations("common");
  const tTheme = useTranslations("theme");
  const tLang = useTranslations("language");

  const [company, setCompany] = React.useState(initialCompany);
  const [form, setForm] = React.useState<FormState>(() => toFormState(initialCompany));
  const [logoPreview, setLogoPreview] = React.useState<string | null>(initialCompany.logo_url);
  const [removeLogo, setRemoveLogo] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [feedback, setFeedback] = React.useState<
    { type: "success" | "error"; message: string } | null
  >(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setRemoveLogo(false);
    setLogoPreview(URL.createObjectURL(file));
  }

  function handleRemoveLogo() {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setLogoPreview(null);
    setRemoveLogo(true);
  }

  const patternValid = isValidJobCodePattern(form.job_code_pattern);
  const nextCodePreview = patternValid
    ? formatJobCode(form.job_code_pattern, company.job_code_next_seq + 1)
    : null;

  const isPR = form.country === "PR";
  const taxIdLabel = isPR
    ? t("sections.documents.taxIdPR")
    : t("sections.documents.taxIdUS");
  const stateLabel = isPR
    ? t("sections.address.statePR")
    : t("sections.address.stateUS");

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setFeedback(null);

    const result = await updateCompanySettings(locale, formData);

    if (result.success) {
      setCompany(result.company);
      setForm(toFormState(result.company));
      setRemoveLogo(false);
      setLogoPreview(result.company.logo_url);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFeedback({ type: "success", message: t("saved") });
    } else {
      setFeedback({ type: "error", message: t("error") });
    }
    setPending(false);
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-6 pb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Identity */}
      <Card>
        <CardHeader>
          <CardTitle>{t("sections.identity.title")}</CardTitle>
          <CardDescription>{t("sections.identity.description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element -- remote/user-uploaded logo, not build-optimized
                <img src={logoPreview} alt="" className="size-full object-contain" />
              ) : (
                <ImageOff className="size-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload /> {t("sections.identity.logo")}
                </Button>
                {logoPreview ? (
                  <Button type="button" variant="ghost" size="sm" onClick={handleRemoveLogo}>
                    <X /> {t("sections.identity.removeLogo")}
                  </Button>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">{t("sections.identity.logoHint")}</p>
              <input
                ref={fileInputRef}
                type="file"
                name="logo"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={handleLogoChange}
              />
              <input type="hidden" name="remove_logo" value={removeLogo ? "true" : "false"} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">{t("sections.identity.legalName")}</Label>
              <Input
                id="name"
                name="name"
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="trade_name">{t("sections.identity.tradeName")}</Label>
              <Input
                id="trade_name"
                name="trade_name"
                value={form.trade_name}
                onChange={(e) => set("trade_name", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle>{t("sections.contact.title")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="contact_email">{t("sections.contact.email")}</Label>
            <Input
              id="contact_email"
              name="contact_email"
              type="email"
              value={form.contact_email}
              onChange={(e) => set("contact_email", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="contact_phone">{t("sections.contact.phone")}</Label>
            <Input
              id="contact_phone"
              name="contact_phone"
              type="tel"
              value={form.contact_phone}
              onChange={(e) => set("contact_phone", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Address / jurisdiction */}
      <Card>
        <CardHeader>
          <CardTitle>{t("sections.address.title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="country">{t("sections.address.country")}</Label>
            <Select
              name="country"
              value={form.country}
              onValueChange={(value) => set("country", value as CompanyCountry)}
            >
              <SelectTrigger id="country" className="sm:max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">{t("sections.address.countryUS")}</SelectItem>
                <SelectItem value="PR">{t("sections.address.countryPR")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="address_line1">{t("sections.address.line1")}</Label>
              <Input
                id="address_line1"
                name="address_line1"
                value={form.address_line1}
                onChange={(e) => set("address_line1", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="address_line2">{t("sections.address.line2")}</Label>
              <Input
                id="address_line2"
                name="address_line2"
                value={form.address_line2}
                onChange={(e) => set("address_line2", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="city">{t("sections.address.city")}</Label>
              <Input
                id="city"
                name="city"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="state_province">{stateLabel}</Label>
              <Input
                id="state_province"
                name="state_province"
                value={form.state_province}
                onChange={(e) => set("state_province", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="postal_code">{t("sections.address.postalCode")}</Label>
              <Input
                id="postal_code"
                name="postal_code"
                value={form.postal_code}
                onChange={(e) => set("postal_code", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax / document info */}
      <Card>
        <CardHeader>
          <CardTitle>{t("sections.documents.title")}</CardTitle>
          <CardDescription>{t("sections.documents.description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="tax_id">{taxIdLabel}</Label>
              <Input
                id="tax_id"
                name="tax_id"
                value={form.tax_id}
                onChange={(e) => set("tax_id", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="currency">{t("sections.documents.currency")}</Label>
              <Input id="currency" value={company.currency} disabled readOnly />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="document_notes">{t("sections.documents.notes")}</Label>
            <Textarea
              id="document_notes"
              name="document_notes"
              rows={4}
              value={form.document_notes}
              onChange={(e) => set("document_notes", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{t("sections.documents.notesHint")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>{t("sections.preferences.title")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="default_locale">{t("sections.preferences.defaultLanguage")}</Label>
            <Select
              name="default_locale"
              value={form.default_locale}
              onValueChange={(value) => set("default_locale", value as "es" | "en")}
            >
              <SelectTrigger id="default_locale">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">{tLang("es")}</SelectItem>
                <SelectItem value="en">{tLang("en")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="theme_preference">{t("sections.preferences.themePreference")}</Label>
            <Select
              name="theme_preference"
              value={form.theme_preference}
              onValueChange={(value) =>
                set("theme_preference", value as CompanyThemePreference)
              }
            >
              <SelectTrigger id="theme_preference">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{tTheme("light")}</SelectItem>
                <SelectItem value="dark">{tTheme("dark")}</SelectItem>
                <SelectItem value="system">{tTheme("system")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Job codes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="size-4 text-primary" /> {t("sections.jobCodes.title")}
          </CardTitle>
          <CardDescription>{t("sections.jobCodes.description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:max-w-xs">
            <Label htmlFor="job_code_pattern">{t("sections.jobCodes.pattern")}</Label>
            <Input
              id="job_code_pattern"
              name="job_code_pattern"
              value={form.job_code_pattern}
              onChange={(e) => set("job_code_pattern", e.target.value.toUpperCase())}
              aria-invalid={!patternValid}
              className={cn(!patternValid && "border-destructive focus-visible:ring-destructive")}
            />
            {!patternValid ? (
              <p className="text-xs text-destructive">{t("sections.jobCodes.patternError")}</p>
            ) : null}
            <p className="text-xs text-muted-foreground">{t("sections.jobCodes.examples")}</p>
          </div>

          <Separator />

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Building2 className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">{t("sections.jobCodes.nextCode")}:</span>
            <Badge variant="secondary" className="font-mono">
              {nextCodePreview ?? "—"}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {t("sections.jobCodes.issued", { count: company.job_code_next_seq })}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-0 -mx-4 flex flex-col gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between md:-mx-6 md:px-6">
        <div aria-live="polite" className="text-sm">
          {feedback ? (
            <span
              className={
                feedback.type === "success" ? "text-success" : "text-destructive"
              }
            >
              {feedback.message}
            </span>
          ) : null}
        </div>
        <Button type="submit" disabled={pending || !patternValid} className="sm:w-auto">
          {pending ? <Loader2 className="animate-spin" /> : null}
          {tCommon("save")}
        </Button>
      </div>
    </form>
  );
}
