"use client";

import * as React from "react";

import { useRouter } from "@/i18n/navigation";

export default function ReceiptsPage() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace("/employee/hours");
  }, [router]);

  return null;
}
