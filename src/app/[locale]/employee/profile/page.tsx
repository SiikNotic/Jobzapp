"use client";

import { useTranslations } from "next-intl";

import { ComingSoon } from "@/components/coming-soon";

export default function EmployeeProfilePage() {
  const t = useTranslations("employee.nav");
  return <ComingSoon title={t("profile")} />;
}
