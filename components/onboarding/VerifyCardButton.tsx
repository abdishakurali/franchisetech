"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { captureClientEvent } from "@/lib/analytics/client-events";

export function VerifyCardButton({
  label,
  loadingLabel,
}: {
  label: string;
  loadingLabel: string;
}) {
  const [pending, setPending] = useState(false);

  const startVerification = async () => {
    setPending(true);
    captureClientEvent("card_verification_started", {});
    try {
      const res = await fetch("/api/billing/verify-card", { method: "POST" });
      const json = (await res.json().catch(() => null)) as
        | { url?: string | null; alreadyVerified?: boolean; error?: string }
        | null;

      if (json?.alreadyVerified) {
        window.location.href = "/app/pos?welcome=1";
        return;
      }
      if (!res.ok || !json?.url) {
        toast.error(json?.error ?? "Could not start verification. Try again.");
        setPending(false);
        return;
      }
      window.location.href = json.url;
    } catch {
      toast.error("Could not start verification. Try again.");
      setPending(false);
    }
  };

  return (
    <Button
      onClick={startVerification}
      disabled={pending}
      size="lg"
      className="w-full bg-blue-600 text-white hover:bg-blue-500"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </Button>
  );
}
