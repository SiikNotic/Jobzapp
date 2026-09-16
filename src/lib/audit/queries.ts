import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import type { AuditEvent } from "./types";

const AUDIT_SELECT_COLUMNS =
  "id, entity_type, entity_id, action, label, detail, amount, actor_id, actor_label, created_at, actor:profiles!audit_log_actor_id_fkey(full_name)";

function mapRow(row: Record<string, unknown>): AuditEvent {
  const actor = row.actor as { full_name: string | null } | null;
  return { ...(row as object), actor_name: actor?.full_name ?? null } as AuditEvent;
}

export async function listRecentAuditEvents(companyId: string, limit = 8): Promise<AuditEvent[]> {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("audit_log")
    .select(AUDIT_SELECT_COLUMNS)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return ((data as unknown as Record<string, unknown>[]) ?? []).map(mapRow);
}

export async function listAuditEvents(
  companyId: string,
  options: { limit?: number; entityType?: AuditEvent["entity_type"] } = {}
): Promise<AuditEvent[]> {
  const supabase = await createSupabaseClient();
  let query = supabase
    .from("audit_log")
    .select(AUDIT_SELECT_COLUMNS)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(options.limit ?? 200);

  if (options.entityType) query = query.eq("entity_type", options.entityType);

  const { data } = await query;
  return ((data as unknown as Record<string, unknown>[]) ?? []).map(mapRow);
}
