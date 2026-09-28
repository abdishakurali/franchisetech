"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { signUpAccountantPartner } from "@/app/actions/accountant-partners";

export default function AccountantPartnersPage() {
  const [form, setForm] = useState({ name: "", firm_name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.email.trim()) {
      setError("Numele și emailul sunt obligatorii.");
      return;
    }
    setSubmitting(true);
    const fd = new FormData();
    fd.set("name", form.name);
    fd.set("firm_name", form.firm_name);
    fd.set("email", form.email);
    const result = await signUpAccountantPartner(fd);
    setSubmitting(false);
    if (!result.ok) { setError(result.error); return; }
    setDone(true);
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass">Pentru contabili</p>
      <h1 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">Programul de parteneri franchisetech</h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        Recomandă clienții tăi HoReCa și primește acces gratuit la portalul contabil pentru toți, plus un comision recurent pentru fiecare client care devine abonat plătitor.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-5">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brass" />
          <div>
            <h3 className="font-semibold">Ce primești</h3>
            <p className="mt-1 text-sm text-muted-foreground">Acces gratuit, doar pentru citire, la portalul contabil pentru toate cafenelele și restaurantele tale — un singur login, date live, fără raportări trimise pe WhatsApp.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-5">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brass" />
          <div>
            <h3 className="font-semibold">Ce câștigi</h3>
            <p className="mt-1 text-sm text-muted-foreground">15€/lună pentru fiecare client pe care îl recomanzi și care devine abonat plătitor — cât timp rămâne activ.</p>
          </div>
        </div>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Înscrie-te ca partener</CardTitle>
          <CardDescription>Durează un minut. Îți trimitem imediat linkul de recomandare pe email.</CardDescription>
        </CardHeader>
        <CardContent>
          {done ? (
            <div className="flex items-center gap-2 rounded-lg border border-reconciled/30 bg-reconciled/10 p-4 text-sm text-reconciled">
              <CheckCircle2 className="size-5 shrink-0" />
              Cont creat. Verifică-ți emailul pentru linkul de activare și linkul tău de recomandare.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nume *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Numele tău" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="firm_name">Firma de contabilitate</Label>
                <Input id="firm_name" value={form.firm_name} onChange={(e) => setForm((f) => ({ ...f, firm_name: e.target.value }))} placeholder="Opțional" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="tu@firma.ro" required />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {submitting ? "Se creează contul…" : "Înscrie-te gratuit"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Ai deja un cont de partener? <Link href="/partner-dashboard" className="text-brass hover:underline">Intră în panoul de partener</Link>
      </p>
    </main>
  );
}
