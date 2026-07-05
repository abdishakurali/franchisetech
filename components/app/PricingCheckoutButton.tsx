"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BillingPlan } from "@/lib/billing/plans";
import { useAppI18n } from "@/lib/app-i18n-context";

export function PricingCheckoutButton({
  plan,
  loggedIn,
  configured,
  interval = "month",
}: {
  plan: BillingPlan;
  loggedIn: boolean;
  configured: boolean;
  interval?: "month" | "year";
}) {
  const router = useRouter();
  const { locale } = useAppI18n();
  const [loading, setLoading] = useState(false);
  const text = locale === "ro"
    ? {
        createAccount: "Creează cont",
        notConfigured: "Facturarea nu este configurată încă",
        opening: "Se deschide checkout-ul...",
        subscribe: "Abonează-te acum",
      }
    : {
        createAccount: "Create account",
        notConfigured: "Billing is not configured yet",
        opening: "Opening checkout...",
        subscribe: "Subscribe now",
      };

  if (!loggedIn) {
    return (
      <Link href={`/signup?plan=${plan}`}>
        <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
          {text.createAccount} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    );
  }

  if (!configured) {
    return (
      <Button disabled className="w-full">
        {text.notConfigured}
      </Button>
    );
  }

  const startCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, interval }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.url) throw new Error(payload.error || "Checkout failed");
      window.location.href = payload.url;
    } catch {
      router.push("/app/billing?checkout=error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={startCheckout} disabled={loading} className="w-full bg-blue-600 text-white hover:bg-blue-700">
      {loading ? text.opening : text.subscribe}
    </Button>
  );
}
