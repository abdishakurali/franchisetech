"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2 } from "lucide-react";

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const json = await res.json();
      if (json.url) window.location.href = json.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={openPortal} disabled={loading} variant="outline">
      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ExternalLink className="h-4 w-4 mr-2" />}
      Manage billing
    </Button>
  );
}
