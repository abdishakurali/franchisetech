"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  APP_LOCALE_CHANGE_EVENT,
  POS_LOCALE_STORAGE_KEY,
  type PosLocale,
} from "@/lib/pos-i18n";
import { getMarketingMessages } from "@/lib/marketing/i18n";

const PARTNER_TYPES_EN = [
  "POS / software reseller",
  "Accountant or fiscal consultant",
  "Hospitality consultant",
  "Multi-site operator",
  "Other",
] as const;

const PARTNER_TYPES_RO = [
  "Reseller POS / software",
  "Contabil sau consultant fiscal",
  "Consultant ospitalitate",
  "Operator multi-locație",
  "Altul",
] as const;

function readLocale(): PosLocale {
  if (typeof window === "undefined") return "en";
  try {
    const raw = localStorage.getItem(POS_LOCALE_STORAGE_KEY);
    if (raw === "en" || raw === "ro") return raw;
  } catch {
    /* ignore */
  }
  return "en";
}

export function PartnerContactForm() {
  const [locale, setLocale] = useState<PosLocale>(readLocale);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const t = getMarketingMessages(locale);
  const partnerTypes = locale === "ro" ? PARTNER_TYPES_RO : PARTNER_TYPES_EN;

  useEffect(() => {
    const sync = () => setLocale(readLocale());
    window.addEventListener(APP_LOCALE_CHANGE_EVENT, sync);
    return () => window.removeEventListener(APP_LOCALE_CHANGE_EVENT, sync);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    try {
      const res = await fetch("/api/partners/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatus("error");
        setError(json.error ?? t.partners.form.error);
        return;
      }
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setError(t.partners.form.error);
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-lg font-semibold text-green-900">{t.partners.form.success}</p>
        <Button type="button" variant="outline" className="mt-4" onClick={() => setStatus("idle")}>
          OK
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">{t.partners.form.name} *</Label>
          <Input id="name" name="name" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="company">{t.partners.form.company} *</Label>
          <Input id="company" name="company" required className="mt-1" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="email">{t.partners.form.email} *</Label>
          <Input id="email" name="email" type="email" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" className="mt-1" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="country">{t.partners.form.country} *</Label>
          <Input id="country" name="country" required placeholder={t.partners.form.countryPlaceholder} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="partnerType">Partner type *</Label>
          <select
            id="partnerType"
            name="partnerType"
            required
            className="mt-1 flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="">—</option>
            {partnerTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <Label htmlFor="message">{t.partners.form.message} *</Label>
        <Textarea id="message" name="message" required rows={5} className="mt-1" />
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={status === "loading"} className="w-full sm:w-auto">
        {status === "loading" ? t.partners.form.sending : t.partners.form.submit}
      </Button>
    </form>
  );
}
