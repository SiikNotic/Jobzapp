import {
  LayoutDashboard,
  Wallet,
  Briefcase,
  Users,
  UserSquare2,
  FileText,
  Settings,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { AppShell, type NavItem } from "@/components/app-shell";
import { signOut } from "../(auth)/actions";

export default async function OwnerLayout({
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

  if (profile!.role !== "owner") {
    redirect({ href: "/employee/jobs", locale });
  }

  const t = await getTranslations({ locale, namespace: "owner.nav" });

  const navItems: NavItem[] = [
    { href: "/owner/dashboard", label: t("dashboard"), icon: <LayoutDashboard className="size-4" /> },
    { href: "/owner/finances", label: t("finances"), icon: <Wallet className="size-4" /> },
    { href: "/owner/jobs", label: t("jobs"), icon: <Briefcase className="size-4" /> },
    { href: "/owner/clients", label: t("clients"), icon: <Users className="size-4" /> },
    { href: "/owner/employees", label: t("employees"), icon: <UserSquare2 className="size-4" /> },
    { href: "/owner/taxes", label: t("taxes"), icon: <FileText className="size-4" /> },
    { href: "/owner/settings", label: t("settings"), icon: <Settings className="size-4" /> },
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
