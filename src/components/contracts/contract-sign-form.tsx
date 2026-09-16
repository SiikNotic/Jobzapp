"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Loader2, PenLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignaturePad } from "@/components/contracts/signature-pad";
import { signContractAction } from "@/lib/job-contracts/public-actions";

export function ContractSignForm({ token }: { token: string }) {
  const t = useTranslations("contracts.sign");
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [signature, setSignature] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || !signature) {
      setError(t("missingFields"));
      return;
    }
    setPending(true);
    setError(null);

    const result = await signContractAction(token, name, signature);

    if (result.success) {
      router.refresh();
    } else {
      setError(t("error"));
      setPending(false);
    }
  }

  return (
    <Card className="print:hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <PenLine className="size-4 text-muted-foreground" /> {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="signer_name">{t("fullName")}</Label>
            <Input id="signer_name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t("drawSignature")}</Label>
            <SignaturePad onChange={setSignature} />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" disabled={pending} className="self-start">
            {pending ? <Loader2 className="animate-spin" /> : null}
            {t("accept")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
