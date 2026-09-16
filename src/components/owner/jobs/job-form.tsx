"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Building2, Loader2, User, X } from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { ClientSummary } from "@/lib/clients/types";
import type { Employee, Job, JobMaterial, JobPriority } from "@/lib/jobs/types";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientPicker } from "@/components/owner/client-picker";
import { MaterialsEditor } from "@/components/owner/jobs/materials-editor";
import { EmployeeChecklist } from "@/components/owner/jobs/employee-checklist";
import { createJob, updateJob } from "@/app/[locale]/owner/jobs/actions";

type FormState = {
  address_line1: string;
  address_line2: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  scheduled_date: string;
  scheduled_time: string;
  priority: JobPriority;
  description: string;
  additional_info: string;
  contract_template_id: string;
};

function toFormState(job?: Job): FormState {
  return {
    address_line1: job?.address_line1 ?? "",
    address_line2: job?.address_line2 ?? "",
    city: job?.city ?? "",
    state_province: job?.state_province ?? "",
    postal_code: job?.postal_code ?? "",
    country: job?.country ?? "",
    scheduled_date: job?.scheduled_date ?? "",
    scheduled_time: job?.scheduled_time?.slice(0, 5) ?? "",
    priority: job?.priority ?? "medium",
    description: job?.description ?? "",
    additional_info: job?.additional_info ?? "",
    contract_template_id: job?.contract_template_id ?? "",
  };
}

export function JobForm({
  job,
  initialClient,
  employees,
  contractTemplates,
  locale,
}: {
  job?: Job;
  initialClient?: ClientSummary;
  employees: Employee[];
  contractTemplates: { id: string; name: string }[];
  locale: Locale;
}) {
  const t = useTranslations("jobs.form");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const isEditing = Boolean(job);

  const [form, setForm] = React.useState<FormState>(() => toFormState(job));
  const [selectedClient, setSelectedClient] = React.useState<ClientSummary | null>(
    initialClient ?? null
  );
  const [materials, setMaterials] = React.useState<JobMaterial[]>(job?.materials ?? []);
  const [employeeIds, setEmployeeIds] = React.useState<string[]>([]);
  const [pending, setPending] = React.useState(false);
  const [feedback, setFeedback] = React.useState<
    { type: "success" | "error"; message: string } | null
  >(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleClientSelect(client: ClientSummary) {
    setSelectedClient(client);
    setForm((prev) => ({
      ...prev,
      address_line1: client.address_line1 ?? prev.address_line1,
      address_line2: client.address_line2 ?? prev.address_line2,
      city: client.city ?? prev.city,
      state_province: client.state_province ?? prev.state_province,
      postal_code: client.postal_code ?? prev.postal_code,
      country: client.country ?? prev.country,
    }));
  }

  async function handleSubmit(formData: FormData) {
    if (!isEditing && !selectedClient) {
      setFeedback({ type: "error", message: t("clientRequired") });
      return;
    }

    setPending(true);
    setFeedback(null);

    if (selectedClient) formData.set("client_id", selectedClient.id);

    const result = isEditing
      ? await updateJob(locale, job!.id, formData)
      : await createJob(locale, formData);

    if (result.success) {
      if (isEditing) {
        setFeedback({ type: "success", message: t("saved") });
      } else {
        router.push(`/owner/jobs/${result.job.id}`);
        return;
      }
    } else {
      setFeedback({ type: "error", message: t("error") });
    }
    setPending(false);
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-6 pb-8">
      <Card>
        <CardHeader>
          <CardTitle>{t("clientTitle")}</CardTitle>
          {!isEditing ? <CardDescription>{t("clientDescription")}</CardDescription> : null}
        </CardHeader>
        <CardContent>
          {isEditing ? (
            selectedClient ? (
              <div className="flex items-center gap-2 text-sm">
                {selectedClient.type === "company" ? (
                  <Building2 className="size-4 text-muted-foreground" />
                ) : (
                  <User className="size-4 text-muted-foreground" />
                )}
                <span className="font-medium">{selectedClient.display_name}</span>
              </div>
            ) : null
          ) : selectedClient ? (
            <div className="flex items-center justify-between gap-2 rounded-md border p-3 text-sm">
              <div className="flex min-w-0 items-center gap-2">
                {selectedClient.type === "company" ? (
                  <Building2 className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <User className="size-4 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium">{selectedClient.display_name}</p>
                  {selectedClient.phone ? (
                    <p className="truncate text-xs text-muted-foreground">{selectedClient.phone}</p>
                  ) : null}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setSelectedClient(null)}
                aria-label={t("changeClient")}
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <ClientPicker onSelect={handleClientSelect} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("scheduleTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="scheduled_date">{t("date")}</Label>
            <Input
              id="scheduled_date"
              name="scheduled_date"
              type="date"
              required
              value={form.scheduled_date}
              onChange={(e) => set("scheduled_date", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="scheduled_time">{t("time")}</Label>
            <Input
              id="scheduled_time"
              name="scheduled_time"
              type="time"
              value={form.scheduled_time}
              onChange={(e) => set("scheduled_time", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="priority">{t("priority")}</Label>
            <Select
              name="priority"
              value={form.priority}
              onValueChange={(value) => set("priority", value as JobPriority)}
            >
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">{t("priorityLow")}</SelectItem>
                <SelectItem value="medium">{t("priorityMedium")}</SelectItem>
                <SelectItem value="high">{t("priorityHigh")}</SelectItem>
                <SelectItem value="urgent">{t("priorityUrgent")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("addressTitle")}</CardTitle>
          <CardDescription>{t("addressDescription")}</CardDescription>
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
          <CardTitle>{t("detailsTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">{t("description")}</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t("materials")}</Label>
            <MaterialsEditor materials={materials} onChange={setMaterials} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="additional_info">{t("additionalInfo")}</Label>
            <Textarea
              id="additional_info"
              name="additional_info"
              rows={3}
              value={form.additional_info}
              onChange={(e) => set("additional_info", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {!isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("employeesTitle")}</CardTitle>
            <CardDescription>{t("employeesDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <EmployeeChecklist
              employees={employees}
              selectedIds={employeeIds}
              onChange={setEmployeeIds}
            />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t("contractTitle")}</CardTitle>
          <CardDescription>{t("contractDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            name="contract_template_id"
            value={form.contract_template_id}
            onValueChange={(value) => set("contract_template_id", value)}
            disabled={contractTemplates.length === 0}
          >
            <SelectTrigger className="sm:max-w-sm">
              <SelectValue
                placeholder={
                  contractTemplates.length === 0 ? t("noTemplates") : t("selectTemplate")
                }
              />
            </SelectTrigger>
            <SelectContent>
              {contractTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
