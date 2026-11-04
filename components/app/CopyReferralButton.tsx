"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyReferralButton({ link, locale }: { link: string; locale?: string | null }) {
  const ro = locale === "ro";
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      onClick={async () => {
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
    >
      {copied ? (ro ? "Copiat" : "Copied") : ro ? "Copiați linkul de recomandare" : "Copy referral link"}
    </Button>
  );
}
