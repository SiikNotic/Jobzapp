import { createClient } from "@/lib/supabase/client";

export async function login(formData: FormData) {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });

  if (error) {
    return { error: error.code ?? "generic" };
  }

  return { error: null };
}

export async function signup(formData: FormData) {
  const supabase = createClient();

  const fullName = String(formData.get("fullName"));
  const companyName = String(formData.get("companyName"));

  const { error } = await supabase.auth.signUp({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
    options: {
      data: {
        full_name: fullName,
        company_name: companyName,
      },
    },
  });

  if (error) {
    return { error: error.code ?? "generic" };
  }

  return { error: null };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}
