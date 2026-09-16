"use client";

import {
  LayoutDashboard,
  Wallet,
  Briefcase,
  Users,
  UserSquare2,
  FileText,
  Settings,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { AppShell, type NavItem } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { signOut } from "../(auth)/actions";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("owner.nav");
  const router = useRouter();

  const navItems: NavItem[] = [
    { href: "/owner/dashboard", label: t("dashboard"), icon: <LayoutDashboard className="size-4" /> },
    { href: "/owner/jobs", label: t("jobs"), icon: <Briefcase className="size-4" /> },
    { href: "/owner/clients", label: t("clients"), icon: <Users className="size-4" /> },
    { href: "/owner/employees", label: t("employees"), icon: <UserSquare2 className="size-4" /> },
    { href: "/owner/finances", label: t("finances"), icon: <Wallet className="size-4" /> },
    { href: "/owner/taxes", label: t("taxes"), icon: <FileText className="size-4" /> },
    { href: "/owner/settings", label: t("settings"), icon: <Settings className="size-4" /> },
  ];

  return (
    <ProtectedRoute role="owner">
      {({ user, profile }) => (
        <AppShell
          navItems={navItems}
          fullName={profile.full_name}
          email={user.email ?? null}
          onSignOut={async () => {
            await signOut();
            router.replace("/login");
          }}
        >
          {children}
        </AppShell>
      )}
    </ProtectedRoute>
  );
}
