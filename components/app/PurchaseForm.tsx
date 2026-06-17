"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { addPurchase } from "@/app/actions/kitchenops";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

type Supplier = { id: string; name: string };
type Product = {
  id: string;
  name: string;
  unit_of_measure: string | null;
  item_type: string | null;
  is_ingredient: boolean | null;
};
type LineItem = {
  id: number;
  product_id: string;
  quantity: string;
  unit_cost: string;
  tax_rate: string;
  unit_of_measure: string;
};

const ITEM_TYPE_LABELS: Record<string, string> = {
  finished_product: "Produs finit",
  ingredient: "Ingredient",
  merchandise: "Marfă",
  supply: "Consumabil",
  packaging: "Ambalaj",
  raw_material: "Materie primă",
};

const ITEM_TYPE_LABELS_EN: Record<string, string> = {
  finished_product: "Finished product",
  ingredient: "Ingredient",
  merchandise: "Goods",
  supply: "Supply",
  packaging: "Packaging",
  raw_material: "Raw material",
};

const RO_UM_OPTIONS = ["Buc", "kg", "g", "L", "ml", "pachet", "cutie", "bax", "doză", "pungă"];
const EN_UM_OPTIONS = ["each", "kg", "g", "L", "ml", "pack", "box", "case", "bag"];

const RO_TAX_RATES = [
  { label: "0% TVA", value: "0" },
  { label: "11% TVA", value: "11" },
  { label: "21% TVA", value: "21" },
];
const EN_TAX_RATES = [
  { label: "0% VAT", value: "0" },
  { label: "9% VAT", value: "9" },
  { label: "23% VAT", value: "23" },
];

export function PurchaseForm({
  suppliers,
  products,
  currency = "EUR",
}: {
  suppliers: Supplier[];
  products: Product[];
  currency?: string;
}) {
  const isRO = currency === "RON";
  const taxLabel = isRO ? "TVA" : "VAT";
  const taxRates = isRO ? RO_TAX_RATES : EN_TAX_RATES;
  const umOptions = isRO ? RO_UM_OPTIONS : EN_UM_OPTIONS;
  const itemTypeLabels = isRO ? ITEM_TYPE_LABELS : ITEM_TYPE_LABELS_EN;
  const defaultUm = isRO ? "Buc" : "each";
  const emptyMsg = isRO
    ? "Nu există articole de cumpărat. Adăugați ingrediente, mărfuri sau consumabile în catalogul de produse, marcând «Poate fi cumpărat»."
    : "No purchase items yet. Add ingredients, goods, or supplies to your product catalogue and mark them as purchaseable.";

  const nextId = useRef(1);
  const [lines, setLines] = useState<LineItem[]>([
    { id: 0, product_id: "", quantity: "", unit_cost: "", tax_rate: "0", unit_of_measure: defaultUm },
  ]);

  function addLine() {
    setLines((prev) => [...prev, { id: nextId.current++, product_id: "", quantity: "", unit_cost: "", tax_rate: "0", unit_of_measure: defaultUm }]);
  }
  function removeLine(id: number) {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }
  function updateLine(id: number, field: keyof Omit<LineItem, "id">, value: string) {
    setLines((prev) => prev.map((l) => l.id === id ? { ...l, [field]: value } : l));
  }
  function onProductChange(lineId: number, productId: string) {
    const p = products.find((pr) => pr.id === productId);
    setLines((prev) => prev.map((l) => l.id === lineId
      ? { ...l, product_id: productId, unit_of_measure: p?.unit_of_measure || defaultUm }
      : l));
  }

  const lineCalc = lines.map((l) => {
    const qty = parseFloat(l.quantity) || 0;
    const cost = parseFloat(l.unit_cost) || 0;
    const rate = parseFloat(l.tax_rate) || 0;
    const subtotal = qty * cost;
    const taxAmount = subtotal * rate / 100;
    return { subtotal, taxAmount, lineTotal: subtotal + taxAmount };
  });
  const subtotalSum = lineCalc.reduce((s, l) => s + l.subtotal, 0);
  const taxSum = lineCalc.reduce((s, l) => s + l.taxAmount, 0);
  const grandTotal = subtotalSum + taxSum;

  const fmt = (v: number) => {
    if (isRO) return `${v.toFixed(2)} lei`;
    return new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(v);
  };

  const getItemTypeLabel = (p: Product) => {
    if (p.item_type && itemTypeLabels[p.item_type]) return itemTypeLabels[p.item_type];
    if (p.is_ingredient) return itemTypeLabels["ingredient"];
    return "";
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Link href="/app/purchases" className="text-sm text-slate-500 hover:text-slate-700">← {isRO ? "Cumpărături" : "Purchases"}</Link>
        <h1 className="text-2xl font-semibold text-slate-950">{isRO ? "Înregistrează cumpărătură" : "Record purchase"}</h1>
      </div>

      {products.length === 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          <p className="font-medium mb-1">{isRO ? "Articole cumpărate / stoc" : "Purchase / inventory items"}</p>
          <p>{emptyMsg}</p>
          <Link href="/app/products" className="mt-2 inline-block text-blue-600 hover:underline text-xs">
            {isRO ? "Mergi la produse →" : "Go to products →"}
          </Link>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{isRO ? "Detalii cumpărătură" : "Purchase details"}</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            {isRO ? "Înregistrează ce ai cumpărat. Stocul va fi actualizat." : "Record what you bought. This increases your stock and updates cost prices."}
          </p>
        </CardHeader>
        <CardContent>
          <form action={addPurchase as unknown as (fd: FormData) => Promise<void>} className="space-y-5">
            <input type="hidden" name="currency" value={currency} />

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label>{isRO ? "Furnizor" : "Supplier"}</Label>
                <select name="supplier_id" className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                  <option value="">{isRO ? "— fără furnizor —" : "— no supplier —"}</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {suppliers.length === 0 && (
                  <Link href="/app/suppliers/new" className="mt-1 block text-xs text-blue-600 hover:underline">
                    {isRO ? "Adaugă furnizor →" : "Add a supplier first →"}
                  </Link>
                )}
              </div>
              <div>
                <Label>{isRO ? "Data cumpărăturii" : "Purchase date"}</Label>
                <Input name="purchase_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="mt-1" />
              </div>
              <div>
                <Label>{isRO ? "Referință / Nr. factură" : "Reference / Invoice #"}</Label>
                <Input name="reference" placeholder={isRO ? "FAC-2024-001" : "INV-2024-001"} className="mt-1" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{isRO ? "Articole primite" : "Items received"}</Label>
                <span className="text-xs text-slate-400">{lines.length} {isRO ? "linie/linii" : `line${lines.length !== 1 ? "s" : ""}`}</span>
              </div>

              {/* Column headers */}
              <div className="grid grid-cols-[1fr_80px_90px_90px_80px_80px_36px] gap-2 px-0.5 text-xs text-slate-400 font-medium">
                <span>{isRO ? "Articol" : "Item"}</span>
                <span>UM</span>
                <span>{isRO ? "Cantitate" : "Quantity"}</span>
                <span>{isRO ? "Cost/UM" : "Cost/unit"}</span>
                <span>{taxLabel} %</span>
                <span>{isRO ? "Total" : "Line total"}</span>
                <span />
              </div>

              {lines.map((line, idx) => {
                const calc = lineCalc[idx];
                const selectedProduct = products.find((p) => p.id === line.product_id);
                return (
                  <div key={line.id} className="grid grid-cols-[1fr_80px_90px_90px_80px_80px_36px] gap-2 items-center">
                    <select
                      name="product_id"
                      value={line.product_id}
                      onChange={(e) => onProductChange(line.id, e.target.value)}
                      className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                    >
                      <option value="">{isRO ? "— selectează —" : "— select item —"}</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}{getItemTypeLabel(p) ? ` [${getItemTypeLabel(p)}]` : ""}
                        </option>
                      ))}
                    </select>
                    <select
                      name="unit_of_measure"
                      value={line.unit_of_measure}
                      onChange={(e) => updateLine(line.id, "unit_of_measure", e.target.value)}
                      className="h-10 rounded-md border border-slate-200 bg-white px-2 text-sm"
                    >
                      {selectedProduct?.unit_of_measure && !umOptions.includes(selectedProduct.unit_of_measure) && (
                        <option value={selectedProduct.unit_of_measure}>{selectedProduct.unit_of_measure}</option>
                      )}
                      {umOptions.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <Input
                      name="quantity"
                      type="number" step="0.001" min="0"
                      placeholder={isRO ? "Cantitate" : "Qty"}
                      value={line.quantity}
                      onChange={(e) => updateLine(line.id, "quantity", e.target.value)}
                    />
                    <Input
                      name="unit_cost"
                      type="number" step="0.0001" min="0"
                      placeholder={isRO ? "Cost" : "Cost"}
                      value={line.unit_cost}
                      onChange={(e) => updateLine(line.id, "unit_cost", e.target.value)}
                    />
                    <select
                      name="tax_rate"
                      value={line.tax_rate}
                      onChange={(e) => updateLine(line.id, "tax_rate", e.target.value)}
                      className="h-10 rounded-md border border-slate-200 bg-white px-2 text-sm"
                    >
                      {taxRates.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                    <div className="text-right text-sm font-medium text-slate-700 tabular-nums">
                      {calc.lineTotal > 0 ? fmt(calc.lineTotal) : "—"}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLine(line.id)}
                      disabled={lines.length === 1}
                      className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label={`${isRO ? "Șterge linia" : "Remove line"} ${idx + 1}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={addLine}
                className="flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-colors w-full justify-center"
              >
                <Plus className="h-4 w-4" />{isRO ? "Adaugă linie" : "Add line"}
              </button>

              {/* Tax breakdown and totals */}
              {grandTotal > 0 && (
                <div className="space-y-1 rounded-lg bg-slate-50 px-4 py-3 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>{isRO ? "Subtotal (fără TVA)" : "Subtotal (excl. VAT)"}</span>
                    <span className="tabular-nums">{fmt(subtotalSum)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>{taxLabel}</span>
                    <span className="tabular-nums">{fmt(taxSum)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-slate-900 border-t pt-2 mt-1">
                    <span>{isRO ? "Total" : "Grand total"}</span>
                    <span className="tabular-nums">{fmt(grandTotal)}</span>
                  </div>
                </div>
              )}

              {/* Hidden computed totals for server */}
              <input type="hidden" name="subtotal_amount" value={subtotalSum.toFixed(4)} />
              <input type="hidden" name="tax_total" value={taxSum.toFixed(4)} />

              <p className="text-xs text-slate-500">
                {isRO
                  ? "Cantitate = câte unități ai primit. Cost/UM = prețul pe unitate, fără TVA."
                  : "Quantity is how much you received. Cost/unit is the net cost per unit, excluding VAT."}
              </p>
            </div>

            <div>
              <Label>{isRO ? "Notițe" : "Notes"}</Label>
              <Input name="notes" placeholder={isRO ? "Observații despre această livrare" : "Any notes about this delivery"} className="mt-1" />
            </div>

            <div className="flex gap-3 pt-1">
              <Link href="/app/purchases"><Button variant="outline" type="button">{isRO ? "Anulează" : "Cancel"}</Button></Link>
              <Button type="submit" disabled={products.length === 0} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isRO ? "Înregistrează cumpărătura" : "Record purchase"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
