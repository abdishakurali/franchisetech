"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { captureClientEvent } from "@/lib/analytics/client-events";

type Locale = "en" | "ro";

const copy = {
  en: {
    contact: "Work email or phone",
    contactHelp: "We reply within 5 working hours, by email or by phone if you leave a number.",
    name: "Name (optional)",
    company: "Company and country (optional)",
    message: "What should Odoo connect to? (optional)",
    placeholder: "Odoo 18 Enterprise, Shopify store in Germany, orders and stock in both directions.",
    consent: "I agree that SALUT TECH SRL may use these details to answer my request, as described in the",
    privacy: "privacy notice",
    send: "Send enquiry",
    sending: "Sending",
    sent: "Enquiry sent.",
    sentHelp: "We reply within 5 working hours, by email or by phone if you left a number.",
    errors: { 400: "Enter a valid email address or phone number and tick the box.", 429: "Please wait a minute before sending again.", other: "The enquiry could not be sent. Write to info@franchisetech.ro." },
  },
  ro: {
    contact: "Email de serviciu sau telefon",
    contactHelp: "Răspundem în cel mult 5 ore lucrătoare, prin email sau, dacă lăsați un număr, telefonic.",
    name: "Nume (opțional)",
    company: "Firma și țara (opțional)",
    message: "Cu ce trebuie conectat Odoo? (opțional)",
    placeholder: "Odoo 18 Enterprise, magazin Shopify, comenzi și stoc în ambele sensuri.",
    consent: "Sunt de acord ca SALUT TECH SRL să folosească aceste date pentru a răspunde cererii mele, conform",
    privacy: "notei de informare",
    send: "Trimiteți cererea",
    sending: "Se trimite",
    sent: "Cererea a fost trimisă.",
    sentHelp: "Vă răspundem în cel mult 5 ore lucrătoare, prin email sau, dacă ați lăsat un număr, telefonic.",
    errors: { 400: "Introduceți un email sau un telefon valid și bifați acordul.", 429: "Așteptați un minut înainte de a trimite din nou.", other: "Cererea nu a putut fi trimisă. Scrieți la info@franchisetech.ro." },
  },
} as const;

/** Odoo services enquiry. Posts to the same /api/contact endpoint as the
 * site's contact form; the company goes into the message so the email
 * notification shows it. */
export function OdooEnquiryForm({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const source = locale === "ro" ? "odoo_page_ro" : "odoo_page";
  const started = useRef(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  function markStarted() {
    if (started.current) return;
    started.current = true;
    captureClientEvent("contact_form_started", { source });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const company = String(data.get("company") ?? "").trim();
    const need = String(data.get("need") ?? "").trim();
    const payload = {
      contact: data.get("contact"),
      name: data.get("name"),
      businessType: "Odoo integration",
      message: [company && `Company: ${company}`, need].filter(Boolean).join("\n"),
      consent: data.get("consent"),
      website: data.get("website"),
      source,
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(response.status === 400 ? t.errors[400] : response.status === 429 ? t.errors[429] : t.errors.other);
      captureClientEvent("contact_form_submitted", { source });
      setStatus("success");
      form.reset();
    } catch (cause) {
      const message = cause instanceof Error && cause.message ? cause.message : t.errors.other;
      captureClientEvent("contact_form_failed", { source, error: message });
      setError(message);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6" role="status">
        <h3 className="font-semibold text-emerald-950">{t.sent}</h3>
        <p className="mt-2 text-sm text-emerald-900">{t.sentHelp}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} onFocus={markStarted} className="space-y-4 rounded-lg border border-border bg-card p-5 sm:p-6">
      <div>
        <Label htmlFor={`${source}-contact`} className="text-base font-semibold text-foreground">{t.contact}</Label>
        <Input id={`${source}-contact`} name="contact" autoComplete="email" required maxLength={160} className="mt-1.5 h-12 text-base" />
        <p className="mt-1.5 text-xs text-muted-foreground">{t.contactHelp}</p>
      </div>
      <div>
        <Label htmlFor={`${source}-name`}>{t.name}</Label>
        <Input id={`${source}-name`} name="name" autoComplete="name" maxLength={100} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor={`${source}-company`}>{t.company}</Label>
        <Input id={`${source}-company`} name="company" autoComplete="organization" maxLength={160} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor={`${source}-need`}>{t.message}</Label>
        <Textarea id={`${source}-need`} name="need" rows={4} maxLength={1300} placeholder={t.placeholder} className="mt-1.5" />
      </div>
      <label className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
        <input type="checkbox" name="consent" required className="mt-1" />
        <span>{t.consent} <Link href="/privacy#odoo" className="underline">{t.privacy}</Link>.</span>
      </label>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {error ? <p className="text-sm text-red-700" role="alert">{error}</p> : null}
      <Button type="submit" disabled={status === "loading"} className="min-h-12 w-full rounded-md text-base">
        {status === "loading" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t.sending}</> : t.send}
      </Button>
    </form>
  );
}
