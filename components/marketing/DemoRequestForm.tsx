"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { captureClientEvent, getClientDistinctId } from "@/lib/analytics/client-events";
import { readAcquisitionClient } from "@/lib/marketing/acquisition";
import { BUSINESS_TYPES, LOCATION_OPTIONS, type DemoLeadField } from "@/lib/leads/demo-lead";

type Status = "idle" | "loading" | "success" | "error";
const FALLBACK_EMAIL = "info@franchisetech.ro";

const selectClass =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-base text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-[invalid=true]:border-destructive sm:text-sm";

export function DemoRequestForm() {
  const params = useSearchParams();
  const sourceArticle = params.get("from");
  const ctaId = params.get("cta");
  const startedAt = useRef<number | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState<Partial<Record<DemoLeadField, string>>>({});
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "error") errorSummaryRef.current?.focus();
  }, [status]);

  function markStarted() {
    if (startedAt.current !== null) return;
    startedAt.current = Date.now();
    // Same event the contact form uses; source/attribution say which form and which article.
    captureClientEvent("contact_form_started", { source: "demo_page", source_article: sourceArticle, cta_id: ctaId });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setFormError("");
    setErrors({});
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const acquisition = readAcquisitionClient();
    const payload = {
      ...data,
      consent: data.consent === "on",
      started_at: startedAt.current ?? 0,
      source_page: "/demo",
      source_article: sourceArticle,
      cta_id: ctaId,
      utm_source: acquisition?.utm_source,
      utm_medium: acquisition?.utm_medium,
      utm_campaign: acquisition?.utm_campaign,
      ph_distinct_id: getClientDistinctId(),
    };
    try {
      const response = await fetch("/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string; errors?: Partial<Record<DemoLeadField, string>> };
      if (!response.ok || !result.ok) {
        setErrors(result.errors ?? {});
        setFormError(result.errors?.form ?? result.error ?? `Cererea nu a putut fi trimisă. Scrie-ne la ${FALLBACK_EMAIL}.`);
        setStatus("error");
        return;
      }
      form.reset();
      setStatus("success");
    } catch {
      setFormError(`Conexiunea a eșuat. Verifică internetul și încearcă din nou, sau scrie-ne la ${FALLBACK_EMAIL}.`);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
        <CheckCircle2 className="h-6 w-6" aria-hidden />
        <h3 className="mt-3 text-lg font-semibold">Am primit cererea ta.</h3>
        <p className="mt-2 text-sm leading-6">
          Te contactăm în maximum o zi lucrătoare ca să stabilim demonstrația. Între timp poți începe singur perioada de probă Pro de 15 zile, fără card.
        </p>
        <Link
          href="/signup?plan=growth"
          className="mt-4 inline-flex text-sm font-semibold text-emerald-900 underline"
          onClick={() => captureClientEvent("marketing_cta_clicked", { cta_type: "secondary", cta_location: "demo_success", cta_text: "Începe perioada de probă", href: "/signup?plan=growth" })}
        >
          Începe perioada de probă
        </Link>
      </div>
    );
  }

  const fieldProps = (name: DemoLeadField) => ({
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `demo-${name}-error` : undefined,
  });
  const fieldError = (name: DemoLeadField) =>
    errors[name] ? (
      <p id={`demo-${name}-error`} className="mt-1 text-sm text-destructive">
        {errors[name]}
      </p>
    ) : null;

  return (
    <form onSubmit={submit} onFocus={markStarted} noValidate className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
      {status === "error" && (
        <div ref={errorSummaryRef} tabIndex={-1} role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 outline-none">
          {formError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="demo-business">Numele afacerii *</Label>
          <Input id="demo-business" name="business_name" required maxLength={120} autoComplete="organization" className="mt-1.5 h-11" {...fieldProps("businessName")} />
          {fieldError("businessName")}
        </div>
        <div>
          <Label htmlFor="demo-name">Numele tău *</Label>
          <Input id="demo-name" name="contact_name" required maxLength={100} autoComplete="name" className="mt-1.5 h-11" {...fieldProps("contactName")} />
          {fieldError("contactName")}
        </div>
        <div>
          <Label htmlFor="demo-email">Email *</Label>
          <Input id="demo-email" name="email" type="email" inputMode="email" required maxLength={160} autoComplete="email" className="mt-1.5 h-11" {...fieldProps("email")} />
          {fieldError("email")}
        </div>
        <div>
          <Label htmlFor="demo-phone">
            Telefon <span className="font-normal text-muted-foreground">(opțional)</span>
          </Label>
          <Input id="demo-phone" name="phone" type="tel" inputMode="tel" maxLength={40} autoComplete="tel" className="mt-1.5 h-11" {...fieldProps("phone")} />
          {fieldError("phone")}
        </div>
        <div>
          <Label htmlFor="demo-type">Tipul afacerii *</Label>
          <select id="demo-type" name="business_type" required defaultValue="" className={`mt-1.5 ${selectClass}`} {...fieldProps("businessType")}>
            <option value="" disabled>
              Alege
            </option>
            {BUSINESS_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {fieldError("businessType")}
        </div>
        <div>
          <Label htmlFor="demo-locations">Număr de locații *</Label>
          <select id="demo-locations" name="locations" required defaultValue="" className={`mt-1.5 ${selectClass}`} {...fieldProps("locations")}>
            <option value="" disabled>
              Alege
            </option>
            {LOCATION_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "1" ? "1 locație" : `${option} locații`}
              </option>
            ))}
          </select>
          {fieldError("locations")}
        </div>
      </div>

      <div>
        <Label htmlFor="demo-message">
          Ce vrei să vezi în demonstrație? <span className="font-normal text-muted-foreground">(opțional)</span>
        </Label>
        <Textarea id="demo-message" name="message" maxLength={1500} rows={3} placeholder="De exemplu: stocul la cafea, rețetele sau casa de marcat pe care o ai." className="mt-1.5" {...fieldProps("message")} />
        {fieldError("message")}
      </div>

      {/* Honeypot: hidden from people and screen readers, bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor="demo-website">Website</label>
        <input id="demo-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
          <input type="checkbox" name="consent" required className="mt-1 h-5 w-5 shrink-0 rounded border-input" {...fieldProps("consent")} />
          <span>
            Sunt de acord ca franchisetech să folosească aceste date doar ca să mă contacteze despre demonstrație. Detalii în{" "}
            <Link href="/privacy" className="underline">
              politica de confidențialitate
            </Link>
            . *
          </span>
        </label>
        {fieldError("consent")}
      </div>

      <Button type="submit" disabled={status === "loading"} className="h-12 w-full text-base">
        {status === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Se trimite…
          </>
        ) : (
          "Solicită o demonstrație gratuită"
        )}
      </Button>
      <p className="text-center text-xs text-muted-foreground">Răspundem în maximum o zi lucrătoare. Fără obligații.</p>
    </form>
  );
}
