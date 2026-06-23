"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getMarketingMessages } from "@/lib/marketing/i18n";
import { useMarketingLocale } from "@/lib/marketing/use-marketing-locale";
import type { MarketingLocale } from "@/lib/marketing/locale";
import { readAcquisitionClient } from "@/lib/marketing/acquisition";

const PARTNER_TYPES_EN = [
  "Accountant or fiscal consultant",
  "POS / software reseller",
  "Hospitality consultant",
  "FiscalNet integrator",
  "Multi-site operator",
  "Other",
] as const;

const PARTNER_TYPES_RO = [
  "Contabil sau consultant fiscal",
  "Reseller POS / software",
  "Consultant ospitalitate",
  "Integrator FiscalNet",
  "Operator multi-locație",
  "Altul",
] as const;

const PARTNER_TYPES_IT = [
  "Commercialista o consulente fiscale",
  "Rivenditore POS / software",
  "Consulente hospitality",
  "Integratore FiscalNet",
  "Operatore multi-sede",
  "Altro",
] as const;

const PARTNER_TYPES: Record<MarketingLocale, readonly string[]> = {
  en: PARTNER_TYPES_EN,
  ro: PARTNER_TYPES_RO,
  it: PARTNER_TYPES_IT,
};

const DEFAULT_PARTNER_TYPE: Record<MarketingLocale, string> = {
  en: PARTNER_TYPES_EN[0],
  ro: PARTNER_TYPES_RO[0],
  it: PARTNER_TYPES_IT[0],
};

export function PartnerContactForm({ programOpen = false }: { programOpen?: boolean }) {
  const locale = useMarketingLocale();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const t = getMarketingMessages(locale);
  const partnerTypes = PARTNER_TYPES[locale];
  const defaultType = DEFAULT_PARTNER_TYPE[locale];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const form = e.currentTarget;
    const data = new FormData(form);
    const acquisition = readAcquisitionClient();
    const payload = {
      ...Object.fromEntries(data.entries()),
      utm_source: acquisition?.utm_source,
      utm_campaign: acquisition?.utm_campaign,
      utm_content: acquisition?.utm_content,
      waitlist: !programOpen,
    };

    try {
      const res = await fetch("/api/partners/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { error?: string };
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
        <p className="text-lg font-semibold text-green-900">
          {programOpen ? t.partners.form.successApply : t.partners.form.successWaitlist}
        </p>
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
          <Label htmlFor="phone">{t.partners.form.phone}</Label>
          <Input id="phone" name="phone" type="tel" className="mt-1" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="country">{t.partners.form.country} *</Label>
          <Input id="country" name="country" required placeholder={t.partners.form.countryPlaceholder} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="partnerType">{t.partners.form.partnerType} *</Label>
          <select
            id="partnerType"
            name="partnerType"
            required
            defaultValue={defaultType}
            className="mt-1 flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="">{t.partners.form.partnerTypePlaceholder}</option>
            {partnerTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <Label htmlFor="horecaClientCount">{t.partners.form.horecaClientCount}</Label>
        <Input
          id="horecaClientCount"
          name="horecaClientCount"
          placeholder={t.partners.form.horecaClientCountPlaceholder}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="message">{t.partners.form.message} *</Label>
        <Textarea id="message" name="message" required rows={5} className="mt-1" />
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={status === "loading"} className="w-full sm:w-auto">
        {status === "loading"
          ? t.partners.form.sending
          : programOpen
            ? t.partners.form.submitApply
            : t.partners.form.submitWaitlist}
      </Button>
    </form>
  );
}
