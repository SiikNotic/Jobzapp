"use client";

import {
  Briefcase,
  Package,
  Receipt,
  Clock,
  UserCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { AppShell, type NavItem } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { signOut } from "../(auth)/actions";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("employee.nav");
  const router = useRouter();

  const navItems: NavItem[] = [
    { href: "/employee/jobs", label: t("jobs"), icon: <Briefcase className="size-4" /> },
    { href: "/employee/materials", label: t("materials"), icon: <Package className="size-4" /> },
    { href: "/employee/expenses", label: t("expenses"), icon: <Receipt className="size-4" /> },
    { href: "/employee/hours", label: t("hours"), icon: <Clock className="size-4" /> },
    { href: "/employee/profile", label: t("profile"), icon: <UserCircle className="size-4" /> },
  ];

  return (
    <ProtectedRoute role="employee">
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
