"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const PARTNER_TYPES = [
  "POS / software reseller",
  "Accountant or fiscal consultant",
  "Hospitality consultant",
  "Multi-site operator",
  "Other",
];

export function PartnerContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

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
        setError(json.error ?? "Something went wrong.");
        return;
      }
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setError("Could not send your application. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-lg font-semibold text-green-900">Application received</p>
        <p className="mt-2 text-sm text-green-800">We will respond within 2 business days.</p>
        <Button type="button" variant="outline" className="mt-4" onClick={() => setStatus("idle")}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Your name *</Label>
          <Input id="name" name="name" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="company">Company *</Label>
          <Input id="company" name="company" required className="mt-1" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="email">Work email *</Label>
          <Input id="email" name="email" type="email" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" className="mt-1" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="country">Country *</Label>
          <Input id="country" name="country" required placeholder="e.g. your country or region" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="partnerType">Partner type *</Label>
          <select
            id="partnerType"
            name="partnerType"
            required
            className="mt-1 flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="">Select…</option>
            {PARTNER_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <Label htmlFor="message">Tell us about your network *</Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Who do you serve, how many locations, and what you are looking for from a platform partner?"
          className="mt-1"
        />
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={status === "loading"} className="w-full sm:w-auto">
        {status === "loading" ? "Sending…" : "Apply to partner"}
      </Button>
    </form>
  );
}
