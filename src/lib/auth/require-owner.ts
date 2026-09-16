import { createClient } from "@/lib/supabase/server";

/**
 * Resolves the current session to its owner's company, if any. Shared by
 * every Owner-only server action (Company Settings, Clients, Jobs, ...) so
 * the "is this an authenticated owner, and which company" check and its
 * failure modes stay identical everywhere it's used.
 */
export async function requireOwnerCompany() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, companyId: null as string | null, userId: null as string | null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "owner" || !profile.company_id) {
    return { supabase, companyId: null as string | null, userId: user.id };
  }

  return { supabase, companyId: profile.company_id as string, userId: user.id };
}
