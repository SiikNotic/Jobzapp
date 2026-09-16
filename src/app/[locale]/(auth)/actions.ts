"use server";

import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Locale } from "@/i18n/routing";

export async function login(locale: Locale, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });

  if (error) {
    return { error: error.code ?? "generic" };
  }

  redirect({ href: "/owner/dashboard", locale });
}

export async function signup(locale: Locale, formData: FormData) {
  const supabase = await createClient();

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

  redirect({ href: "/owner/dashboard", locale });
}

export async function signOut(locale: Locale) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect({ href: "/login", locale });
}
