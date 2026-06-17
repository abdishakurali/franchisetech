"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyReferralButton({ link }: { link: string }) {
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
      {copied ? "Copied" : "Copy referral link"}
    </Button>
  );
}
