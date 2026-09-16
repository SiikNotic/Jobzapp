"use client";

import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";

type Requirement = {
  key: string;
  met: boolean;
};

function getRequirements(password: string): Requirement[] {
  return [
    { key: "requirementLength", met: password.length >= 6 },
    { key: "requirementLonger", met: password.length >= 8 },
    { key: "requirementUppercase", met: /[A-Z]/.test(password) },
    { key: "requirementNumber", met: /[0-9]/.test(password) },
  ];
}

const BAR_COLORS = ["bg-destructive", "bg-destructive", "bg-amber-500", "bg-amber-500", "bg-success"];

export function PasswordStrength({ password }: { password: string }) {
  const t = useTranslations("auth.password");

  if (!password) return null;

  const requirements = getRequirements(password);
  const score = requirements.filter((r) => r.met).length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${i < score ? BAR_COLORS[score] : "bg-muted"}`}
          />
        ))}
      </div>
      <ul className="flex flex-col gap-1">
        {requirements.map((req) => (
          <li
            key={req.key}
            className={`flex items-center gap-1.5 text-xs ${req.met ? "text-success" : "text-muted-foreground"}`}
          >
            {req.met ? <Check className="size-3.5" /> : <X className="size-3.5" />}
            {t(req.key)}
          </li>
        ))}
      </ul>
    </div>
  );
}
