import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import {
  JOB_SELECT_COLUMNS,
  type Employee,
  type JobDetail,
  type JobListItem,
  type JobMaterial,
  type JobStatus,
} from "./types";

const JOB_LIST_COLUMNS =
  "id, job_code, scheduled_date, scheduled_time, priority, status, client:clients(id, type, display_name, phone, email)";

export type JobListFilters = {
  status?: JobStatus | "all";
  q?: string;
};

export async function listJobsForOwner(
  companyId: string,
  filters: JobListFilters = {}
): Promise<JobListItem[]> {
  const supabase = await createSupabaseClient();

  let query = supabase
    .from("jobs")
    .select(JOB_LIST_COLUMNS)
    .eq("company_id", companyId)
    .order("scheduled_date", { ascending: true });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.q) {
    const term = filters.q.trim().replace(/[,()]/g, "");
    if (term) {
      const { data: matchingClients } = await supabase
        .from("clients")
        .select("id")
        .eq("company_id", companyId)
        .ilike("display_name", `%${term}%`);

      const clientIds = (matchingClients ?? []).map((c) => c.id);
      const orParts = [`job_code.ilike.%${term}%`];
      if (clientIds.length > 0) {
        orParts.push(`client_id.in.(${clientIds.join(",")})`);
      }
      query = query.or(orParts.join(","));
    }
  }

  const { data } = await query;
  return (data as unknown as JobListItem[]) ?? [];
}

export async function listJobsForEmployee(
  filters: JobListFilters = {}
): Promise<JobListItem[]> {
  const supabase = await createSupabaseClient();

  // RLS already restricts rows to jobs this employee is assigned to.
  let query = supabase
    .from("jobs")
    .select(JOB_LIST_COLUMNS)
    .order("scheduled_date", { ascending: true });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data } = await query;
  return (data as unknown as JobListItem[]) ?? [];
}

export async function getJobDetail(id: string): Promise<JobDetail | null> {
  const supabase = await createSupabaseClient();

  const { data: job } = await supabase
    .from("jobs")
    .select(
      `${JOB_SELECT_COLUMNS}, client:clients(id, type, display_name, phone, email), contract_template:contract_templates(name)`
    )
    .eq("id", id)
    .single();

  if (!job) return null;

  const [{ data: assignments }, { data: events }] = await Promise.all([
    supabase
      .from("job_assignments")
      .select("employee_id, profiles(id, full_name)")
      .eq("job_id", id),
    supabase
      .from("job_status_events")
      .select("id, status, changed_at, profiles(full_name)")
      .eq("job_id", id)
      .order("changed_at", { ascending: true }),
  ]);

  const raw = job as unknown as Record<string, unknown>;

  return {
    ...(raw as object),
    materials: (raw.materials ?? []) as JobMaterial[],
    client: (raw.client ?? null) as JobDetail["client"],
    contract_template_name:
      (raw.contract_template as { name: string } | null)?.name ?? null,
    assignees: (assignments ?? []).map((a) => {
      const profile = a.profiles as unknown as { id: string; full_name: string | null } | null;
      return {
        id: profile?.id ?? a.employee_id,
        full_name: profile?.full_name ?? null,
      };
    }),
    status_events: (events ?? []).map((e) => {
      const profile = e.profiles as unknown as { full_name: string | null } | null;
      return {
        id: e.id,
        status: e.status,
        changed_at: e.changed_at,
        changed_by_name: profile?.full_name ?? null,
      };
    }),
  } as JobDetail;
}

export async function listEmployees(companyId: string): Promise<Employee[]> {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("company_id", companyId)
    .eq("role", "employee")
    .order("full_name", { ascending: true });

  return (data as Employee[]) ?? [];
}

export async function listContractTemplates(
  companyId: string
): Promise<{ id: string; name: string }[]> {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("contract_templates")
    .select("id, name")
    .eq("company_id", companyId)
    .order("name", { ascending: true });

  return data ?? [];
}
