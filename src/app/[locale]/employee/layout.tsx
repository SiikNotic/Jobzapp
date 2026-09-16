import {
  Briefcase,
  Package,
  Receipt,
  Clock,
  UserCircle,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { AppShell, type NavItem } from "@/components/app-shell";
import { signOut } from "../(auth)/actions";

export default async function EmployeeLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const { user, profile } = await getCurrentProfile();

  if (!user || !profile) {
    redirect({ href: "/login", locale });
  }

  if (profile!.role !== "employee") {
    redirect({ href: "/owner/dashboard", locale });
  }

  const t = await getTranslations({ locale, namespace: "employee.nav" });

  const navItems: NavItem[] = [
    { href: "/employee/jobs", label: t("jobs"), icon: <Briefcase className="size-4" /> },
    { href: "/employee/materials", label: t("materials"), icon: <Package className="size-4" /> },
    { href: "/employee/expenses", label: t("expenses"), icon: <Receipt className="size-4" /> },
    { href: "/employee/hours", label: t("hours"), icon: <Clock className="size-4" /> },
    { href: "/employee/profile", label: t("profile"), icon: <UserCircle className="size-4" /> },
  ];

  return (
    <AppShell
      navItems={navItems}
      fullName={profile!.full_name}
      email={user!.email}
      locale={locale}
      onSignOut={signOut}
    >
      {children}
    </AppShell>
  );
}
