"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchableSelect } from "@/components/app/SearchableSelect";
import { ANAF_UNIT_OPTIONS } from "@/lib/anaf/unit-codes";
import { postFreeIssue } from "@/app/actions/free-issue";

export type FreeIssueProductOption = { id: string; name: string; unitCode: string; stockUnit: string };

type Line = { productId: string; quantity: string; unitCode: string };

export function FreeIssueForm({ products }: { products: FreeIssueProductOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [recipient, setRecipient] = useState("");
  const [reason, setReason] = useState("");
  const [lines, setLines] = useState<Line[]>([{ productId: "", quantity: "1", unitCode: "C62" }]);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  // Same key for retries of this exact transfer; a new one after success.
  const keyRef = useRef<string | null>(null);
  const submittingRef = useRef(false);
  const productById = new Map(products.map((p) => [p.id, p]));

  function update(i: number, patch: Partial<Line>) {
    keyRef.current = null; // the document changed — it is a different transfer
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submittingRef.current) return;
    setMessage(null);
    const parsed = lines.map((l) => ({
      productId: l.productId,
      name: productById.get(l.productId)?.name ?? "",
      quantity: parseFloat(l.quantity) || 0,
      unitCode: l.unitCode,
    }));
    if (!reason.trim()) return setMessage({ ok: false, text: "Completați motivul transferului." });
    if (parsed.some((l) => !l.productId || l.quantity <= 0)) {
      return setMessage({ ok: false, text: "Alegeți produsul și o cantitate mai mare decât zero pe fiecare linie." });
    }
    keyRef.current ??= crypto.randomUUID();
    submittingRef.current = true;
    startTransition(async () => {
      try {
        const result = await postFreeIssue({
          idempotencyKey: keyRef.current!,
          issueDate,
          recipientName: recipient.trim() || undefined,
          reason: reason.trim(),
          lines: parsed,
        });
        if (!result.ok) {
          setMessage({ ok: false, text: result.error });
          return;
        }
        keyRef.current = null;
        setMessage({
          ok: true,
          text: result.idempotent
            ? `Transferul ${result.documentNumber} era deja înregistrat. Stocul nu a fost scăzut din nou.`
            : `Transfer ${result.documentNumber} înregistrat. Stocul a fost actualizat.`,
        });
        setLines([{ productId: "", quantity: "1", unitCode: "C62" }]);
        setReason("");
        setRecipient("");
        router.refresh();
      } catch {
        setMessage({ ok: false, text: "Conexiunea a eșuat. Apăsați din nou — transferul nu se va dubla." });
      } finally {
        submittingRef.current = false;
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Transfer gratuit nou</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="fi_date">Data</Label>
              <Input id="fi_date" type="date" value={issueDate} onChange={(e) => { keyRef.current = null; setIssueDate(e.target.value); }} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fi_recipient">Destinatar (opțional)</Label>
              <Input id="fi_recipient" value={recipient} onChange={(e) => { keyRef.current = null; setRecipient(e.target.value); }} placeholder="ex: Eveniment caritabil" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fi_reason">Motiv</Label>
              <Input id="fi_reason" value={reason} onChange={(e) => { keyRef.current = null; setReason(e.target.value); }} placeholder="ex: Degustare, sponsorizare" required />
            </div>
          </div>

          {lines.map((line, i) => {
            const product = productById.get(line.productId);
            return (
              <div key={i} className="grid gap-2 sm:grid-cols-[minmax(220px,2fr)_minmax(90px,.7fr)_minmax(130px,.8fr)_40px] sm:items-center">
                <SearchableSelect
                  key={`p-${i}-${line.productId}`}
                  name={`fi_product_${i}`}
                  options={products.map((p) => ({ value: p.id, label: p.name }))}
                  defaultValue={line.productId}
                  placeholder="Alege produs"
                  searchPlaceholder="Caută produs..."
                  onValueChange={(value) => update(i, { productId: value, unitCode: productById.get(value)?.unitCode ?? line.unitCode })}
                />
                <Input type="number" min="0.001" step="any" value={line.quantity} onChange={(e) => update(i, { quantity: e.target.value })} aria-label="Cantitate" required />
                <SearchableSelect
                  key={`u-${i}-${line.unitCode}`}
                  name={`fi_unit_${i}`}
                  options={ANAF_UNIT_OPTIONS}
                  defaultValue={line.unitCode}
                  searchPlaceholder="UM"
                  onValueChange={(value) => update(i, { unitCode: value })}
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => { keyRef.current = null; setLines((prev) => prev.filter((_, idx) => idx !== i)); }} disabled={lines.length === 1} aria-label="Șterge linia">
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
                {product && <p className="text-xs text-muted-foreground sm:col-span-4">Se scade din stoc în UM-ul produsului ({product.stockUnit}), la costul mediu (CMP).</p>}
              </div>
            );
          })}
          <Button type="button" variant="outline" size="sm" onClick={() => { keyRef.current = null; setLines((prev) => [...prev, { productId: "", quantity: "1", unitCode: "C62" }]); }}>
            <Plus className="mr-1.5 h-4 w-4" /> Adaugă produs
          </Button>
        </CardContent>
      </Card>

      {message && (
        <p role="status" className={`rounded-lg p-3 text-sm ${message.ok ? "bg-reconciled/10 text-reconciled" : "bg-attention/10 text-attention"}`}>{message.text}</p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
        {isPending ? "Se înregistrează…" : "Înregistrează transferul"}
      </Button>
      <p className="text-xs text-muted-foreground">Transferul gratuit nu este o vânzare: nu generează factură, venit sau e-Factura. Stabiliți tratamentul contabil cu contabilul.</p>
    </form>
  );
}
