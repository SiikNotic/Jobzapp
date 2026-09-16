import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  company_id: string | null;
  role: "owner" | "employee";
  full_name: string | null;
  avatar_url: string | null;
};

export async function getCurrentProfile(): Promise<{
  user: { email: string | null } | null;
  profile: Profile | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, company_id, role, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  return { user: { email: user.email ?? null }, profile };
}
