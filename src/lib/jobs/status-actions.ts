import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import type { Job, JobStatus } from "./types";

export type ChangeJobStatusResult =
  | { success: true; job: Job }
  | { success: false; error: string };

/**
 * Shared by both the Owner and Employee areas. Authorization and which
 * transitions are allowed live entirely in the `update_job_status` RPC:
 * owners can set any status, assigned employees can only move a job to
 * in_progress/completed. Every change is logged to job_status_events by
 * a database trigger regardless of which caller made it.
 */
export async function changeJobStatus(jobId: string, status: JobStatus): Promise<ChangeJobStatusResult> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase.rpc("update_job_status", {
    p_job_id: jobId,
    p_new_status: status,
  });

  if (error || !data) {
    return { success: false, error: "not_allowed" };
  }

  return { success: true, job: data as Job };
}
