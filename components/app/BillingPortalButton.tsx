"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2 } from "lucide-react";
import { useAppI18n } from "@/lib/app-i18n-context";
import { captureClientEvent } from "@/lib/analytics/client-events";

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { locale } = useAppI18n();

  async function openPortal() {
    setLoading(true);
    setError(null);
    captureClientEvent("billing_portal_opened");
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (json.url) window.location.href = json.url;
      else {
        setError(
          locale === "ro"
            ? (json.error ?? "Nu am putut deschide portalul de facturare.")
            : (json.error ?? "Could not open the billing portal."),
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={openPortal} disabled={loading} variant="outline">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ExternalLink className="h-4 w-4 mr-2" />}
        {locale === "ro" ? "Gestionează facturarea" : "Manage billing"}
      </Button>
      {error && <p className="max-w-xs text-xs leading-5 text-red-700">{error}</p>}
    </div>
  );
}
