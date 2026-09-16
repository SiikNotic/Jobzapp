"use client";

import * as React from "react";
import { useParams } from "next/navigation";

import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { useAuth, type Profile } from "@/lib/auth/auth-provider";
import { PageLoadingSkeleton } from "@/components/page-loading-skeleton";

/**
 * Client-side route guard, replacing the old proxy.ts redirect for
 * unauthenticated visits — static export has no server to do this on.
 */
export function ProtectedRoute({
  role,
  children,
}: {
  role?: "owner" | "employee";
  children: (args: { user: NonNullable<ReturnType<typeof useAuth>["user"]>; profile: Profile }) => React.ReactNode;
}) {
  const { user, profile, loading } = useAuth();
  const { locale } = useParams<{ locale: Locale }>();

  if (loading) {
    return <PageLoadingSkeleton />;
  }

  if (!user || !profile) {
    redirect({ href: "/login", locale });
    return null;
  }

  if (role && profile.role !== role) {
    redirect({ href: profile.role === "owner" ? "/owner/dashboard" : "/employee/jobs", locale });
    return null;
  }

  return <>{children({ user, profile })}</>;
}
