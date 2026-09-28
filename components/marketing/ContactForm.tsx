"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { captureClientEvent } from "@/lib/analytics/client-events";
import { readAcquisitionClient } from "@/lib/marketing/acquisition";
import { useMarketingLocale } from "@/lib/marketing/use-marketing-locale";

const BUSINESS_TYPES = ["Cafenea", "Takeaway / fast-food", "Brutărie / patiserie", "Magazin", "Servicii", "Alt tip de afacere"];

export function ContactForm({ source = "contact_page" }: { source?: string }) {
  const isRo = useMarketingLocale() === "ro";
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
    const acquisition = readAcquisitionClient();
    const payload = {
      ...Object.fromEntries(new FormData(form).entries()),
      source,
      utm_source: acquisition?.utm_source,
      utm_campaign: acquisition?.utm_campaign,
      utm_content: acquisition?.utm_content,
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error || "Cererea nu a putut fi trimisă.");
      captureClientEvent("contact_form_submitted", { source });
      setStatus("success");
      form.reset();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Cererea nu a putut fi trimisă.";
      captureClientEvent("contact_form_failed", { source, error: message });
      setError(message);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="border border-reconciled/25 bg-reconciled/10 p-6" role="status">
        <h3 className="font-semibold text-emerald-950">{isRo ? "Cererea a fost trimisă." : "Request sent."}</h3>
        <p className="mt-2 text-sm text-reconciled">{isRo ? "Revenim în maximum o zi lucrătoare." : "We will reply within one business day."}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} onFocus={markStarted} className="space-y-4 rounded-lg border border-border bg-card p-5 sm:p-6">
      {/* Phone number is the ONE required field. Everything else is optional:
          an owner at the counter should be able to leave a number in seconds
          and get a call back, not fill in a five-field qualification form. */}
      <div>
        <Label htmlFor={`${source}-contact`} className="text-base font-semibold text-foreground">
          {isRo ? "Numărul dumneavoastră de telefon" : "Your phone number"}
        </Label>
        <Input
          id={`${source}-contact`}
          name="contact"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder={isRo ? "07xx xxx xxx" : "07xx xxx xxx"}
          required
          maxLength={160}
          className="mt-1.5 h-12 font-mono text-base"
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          {isRo
            ? "Vă sunăm în următoarea zi lucrătoare. Puteți lăsa și un email, dacă preferați."
            : "We call you back the next working day. You can leave an email instead if you prefer."}
        </p>
      </div>

      <details className="group">
        <summary className="cursor-pointer list-none text-sm font-medium text-brass hover:text-brass">
          {isRo ? "Adaugă detalii (opțional)" : "Add details (optional)"}
        </summary>
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor={`${source}-name`}>{isRo ? "Nume" : "Name"}</Label>
            <Input id={`${source}-name`} name="name" autoComplete="name" maxLength={100} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor={`${source}-business-type`}>{isRo ? "Tipul afacerii" : "Business type"}</Label>
            <select id={`${source}-business-type`} name="businessType" defaultValue="" className="mt-1.5 h-10 w-full rounded-md border border-border bg-card px-3 text-sm">
              <option value="">{isRo ? "Alegeți" : "Select"}</option>
              {BUSINESS_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor={`${source}-message`}>{isRo ? "Întrebarea dumneavoastră" : "Your question"}</Label>
            <Textarea
              id={`${source}-message`}
              name="message"
              rows={3}
              maxLength={1500}
              placeholder={isRo ? "Am o casă de marcat Datecs DP-150. Merge cu ea?" : "I have a Datecs DP-150 register. Does it work?"}
              className="mt-1.5"
            />
          </div>
        </div>
      </details>

      <label className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
        <input type="checkbox" name="consent" required className="mt-1" />
        <span>{isRo ? "Sunt de acord ca franchisetech să folosească aceste date pentru a răspunde cererii mele, conform" : "I agree that franchisetech may use these details to answer my request under the"} <Link href="/privacy" className="underline">{isRo ? "politicii de confidențialitate" : "privacy policy"}</Link>.</span>
      </label>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {error ? <p className="text-sm text-attention" role="alert">{error}</p> : null}
      <Button type="submit" disabled={status === "loading"} className="min-h-12 w-full rounded-md bg-brass text-base hover:bg-brass">
        {status === "loading" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isRo ? "Se trimite" : "Sending"}</> : isRo ? "Sunați-mă" : "Call me back"}
      </Button>
    </form>
  );
}
