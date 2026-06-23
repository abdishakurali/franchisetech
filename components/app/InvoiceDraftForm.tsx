"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createInvoiceDraft, lookupBuyerByCif } from "@/app/actions/efactura";
import { Loader2, Plus, Trash2, Search } from "lucide-react";
import type { OrgVatRate } from "@/lib/vat-rates";
import { getDefaultVatRateValue } from "@/lib/vat-rates";
import { VatRateSelect } from "@/components/app/VatRateSelect";
import { SearchableSelect } from "@/components/app/SearchableSelect";
import { ANAF_UNIT_OPTIONS } from "@/lib/anaf/unit-codes";

type LineItem = {
  name: string;
  unitCode: string;
  quantity: string;
  unitPrice: string;
  vatRate: string;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function computeTotals(lines: LineItem[]) {
  let exclVat = 0;
  let vat = 0;
  for (const line of lines) {
    const qty = parseFloat(line.quantity) || 0;
    const price = parseFloat(line.unitPrice) || 0;
    const rate = parseFloat(line.vatRate) || 0;
    const ext = round2(qty * price);
    const lineVat = round2(ext * rate / 100);
    exclVat = round2(exclVat + ext);
    vat = round2(vat + lineVat);
  }
  return { exclVat, vat, inclVat: round2(exclVat + vat) };
}

export function InvoiceDraftForm({ vatRates }: { vatRates: OrgVatRate[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLooking, setIsLooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const defaultVatRate = String(getDefaultVatRateValue(vatRates));

  const today = new Date().toISOString().slice(0, 10);
  const [invoiceNumber, setInvoiceNumber] = useState(`FACTURA-${new Date().getFullYear()}-001`);
  const [issueDate, setIssueDate] = useState(today);
  const [dueDate, setDueDate] = useState("");
  const [buyerCif, setBuyerCif] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [lines, setLines] = useState<LineItem[]>([
    { name: "", unitCode: "C62", quantity: "1", unitPrice: "", vatRate: defaultVatRate },
  ]);

  const totals = computeTotals(lines);

  async function handleCifLookup() {
    const cif = buyerCif.trim();
    if (!cif) return;
    setIsLooking(true);
    try {
      const result = await lookupBuyerByCif(cif);
      if (result) {
        setBuyerName(result.name);
        setBuyerAddress(result.address);
      } else {
        setError("CIF-ul nu a fost găsit în registrul ANAF.");
      }
    } catch {
      setError("Eroare la interogarea ANAF. Completează manual.");
    } finally {
      setIsLooking(false);
    }
  }

  function addLine() {
    setLines((prev) => [...prev, { name: "", unitCode: "C62", quantity: "1", unitPrice: "", vatRate: defaultVatRate }]);
  }

  function removeLine(i: number) {
    setLines((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateLine(i: number, field: keyof LineItem, value: string) {
    setLines((prev) => prev.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedLines = lines.map((l) => ({
      name: l.name.trim(),
      unitCode: l.unitCode,
      quantity: parseFloat(l.quantity) || 0,
      unitPrice: parseFloat(l.unitPrice) || 0,
      vatRate: parseFloat(l.vatRate) || 0,
    }));

    if (!buyerCif.trim() || !buyerName.trim()) {
      setError("CIF-ul și numele cumpărătorului sunt obligatorii.");
      return;
    }
    if (parsedLines.some((l) => !l.name || l.quantity <= 0 || l.unitPrice <= 0)) {
      setError("Completează toate câmpurile liniilor de factură.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createInvoiceDraft({
          invoiceNumber: invoiceNumber.trim(),
          issueDate,
          dueDate: dueDate || undefined,
          buyerCif: buyerCif.trim(),
          buyerName: buyerName.trim(),
          buyerAddress: buyerAddress
            ? { street: buyerAddress, city: "România", countrySubentity: "RO-B", countryCode: "RO" }
            : undefined,
          lines: parsedLines,
        });
        router.push(`/app/invoices/${result.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Eroare la salvare");
      }
    });
  }

  return (
    <div className="space-y-6 p-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Factură nouă</h1>
        <p className="text-sm text-slate-500">Emite o e-Factură conformă ANAF/UBL 2.1</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Date factură</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="invoice_number">Nr. factură</Label>
              <Input id="invoice_number" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="issue_date">Data emiterii</Label>
              <Input id="issue_date" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="due_date">Scadență (opțional)</Label>
              <Input id="due_date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Cumpărător</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="buyer_cif">CIF cumpărător</Label>
                <Input id="buyer_cif" placeholder="ex: RO12345678" value={buyerCif} onChange={(e) => setBuyerCif(e.target.value)} required />
              </div>
              <div className="flex items-end">
                <Button type="button" variant="outline" onClick={handleCifLookup} disabled={isLooking}>
                  {isLooking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  <span className="ml-1.5 hidden sm:inline">Caută ANAF</span>
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="buyer_name">Denumire cumpărător</Label>
              <Input id="buyer_name" placeholder="Companie SRL" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="buyer_address">Adresă (opțional)</Label>
              <Input id="buyer_address" placeholder="Str. Exemplu 1, București" value={buyerAddress} onChange={(e) => setBuyerAddress(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Produse / servicii</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="hidden sm:grid sm:grid-cols-[1fr_90px_80px_100px_minmax(120px,160px)_32px] gap-2 text-xs font-medium text-slate-500 px-1">
              <span>Denumire</span><span>UM</span><span>Cantitate</span><span>Preț fără TVA</span><span>Cotă TVA</span><span></span>
            </div>
            {lines.map((line, i) => (
              <div key={i} className="grid sm:grid-cols-[1fr_90px_80px_100px_minmax(120px,160px)_32px] gap-2 items-center">
                <Input placeholder="Denumire produs/serviciu" value={line.name} onChange={(e) => updateLine(i, "name", e.target.value)} required />
                <SearchableSelect
                  name={`unit_code_${i}`}
                          options={ANAF_UNIT_OPTIONS}
                  defaultValue={line.unitCode}
                  required
                  searchPlaceholder="UM"
                  onValueChange={(value) => updateLine(i, "unitCode", value)}
                />
                <Input type="number" min="0.0001" step="any" placeholder="1" value={line.quantity} onChange={(e) => updateLine(i, "quantity", e.target.value)} required />
                <Input type="number" min="0" step="any" placeholder="0.00" value={line.unitPrice} onChange={(e) => updateLine(i, "unitPrice", e.target.value)} required />
                <VatRateSelect rates={vatRates} value={line.vatRate} onChange={(rate) => updateLine(i, "vatRate", rate)} name={`vat_rate_${i}`} compact settingsHint={false} />
                <Button type="button" variant="ghost" size="sm" onClick={() => removeLine(i)} disabled={lines.length === 1}>
                  <Trash2 className="h-4 w-4 text-slate-400" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addLine}>
              <Plus className="mr-1.5 h-4 w-4" /> Adaugă linie
            </Button>
          </CardContent>
        </Card>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Total fără TVA</span><span className="font-medium">{totals.exclVat.toFixed(2)} RON</span></div>
          <div className="flex justify-between mt-1"><span className="text-slate-500">TVA</span><span className="font-medium">{totals.vat.toFixed(2)} RON</span></div>
          <div className="flex justify-between mt-2 border-t border-slate-200 pt-2 text-base font-bold"><span>Total de plată</span><span>{totals.inclVat.toFixed(2)} RON</span></div>
        </div>

        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Salvează draft
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Anulează</Button>
        </div>
      </form>
    </div>
  );
}
