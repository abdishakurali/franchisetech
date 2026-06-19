"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { savePurchaseDraft, postNirPurchase } from "@/app/actions/kitchenops";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

type Supplier = { id: string; name: string };
type Site = { id: string; name: string };
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

export type PurchaseDraftInitial = {
  id: string;
  supplier_id: string | null;
  purchase_date: string | null;
  nir_date: string | null;
  invoice_number: string | null;
  supplier_invoice_date: string | null;
  site_id: string | null;
  notes: string | null;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_cost: number;
    tax_rate: number;
    unit_of_measure: string | null;
  }>;
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

function SupplierCombobox({
  suppliers,
  isRO,
  initialId,
  initialName,
}: {
  suppliers: Supplier[];
  isRO: boolean;
  initialId?: string;
  initialName?: string;
}) {
  const [query, setQuery] = useState(initialName ?? "");
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(initialId ?? "");

  const filtered = suppliers
    .filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 10);

  function handleSelect(s: Supplier) {
    setSelectedId(s.id);
    setQuery(s.name);
    setOpen(false);
  }
  function handleClear() {
    setSelectedId("");
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="relative mt-1">
      <input type="hidden" name="supplier_id" value={selectedId} />
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (selectedId) setSelectedId("");
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={isRO ? "Caută furnizor…" : "Search supplier…"}
          autoComplete="off"
          className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 pr-8 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            aria-label={isRO ? "Șterge furnizor" : "Clear supplier"}
          >✕</button>
        )}
      </div>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          <button
            type="button"
            onMouseDown={handleClear}
            className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 border-b border-slate-100 italic text-slate-400"
          >
            {isRO ? "— fără furnizor —" : "— no supplier —"}
          </button>
          {filtered.length > 0 ? (
            filtered.map((s) => (
              <button
                key={s.id}
                type="button"
                onMouseDown={() => handleSelect(s)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 border-b border-slate-50 last:border-0 ${s.id === selectedId ? "text-blue-700 font-medium bg-blue-50" : "text-slate-800"}`}
              >
                {s.name}
              </button>
            ))
          ) : (
            <div className="px-3 py-3 text-xs text-slate-500">
              {query && <span>{isRO ? "Niciun furnizor găsit. " : "No supplier found. "}</span>}
              <Link href="/app/suppliers/new" className="text-blue-600 hover:underline">
                {isRO ? "Adaugă furnizorul din pagina Furnizori →" : "Add suppliers from the Suppliers page →"}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PurchaseItemCombobox({
  products,
  productId,
  isRO,
  itemTypeLabels,
  onSelect,
}: {
  products: Product[];
  productId: string;
  isRO: boolean;
  itemTypeLabels: Record<string, string>;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState(() => products.find((p) => p.id === productId)?.name ?? "");
  const [open, setOpen] = useState(false);

  const filtered = products
    .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 12);

  function getTypeLabel(p: Product) {
    if (p.item_type && itemTypeLabels[p.item_type]) return itemTypeLabels[p.item_type];
    if (p.is_ingredient) return itemTypeLabels["ingredient"];
    return "";
  }

  function handleSelect(p: Product) {
    onSelect(p.id);
    setQuery(p.name);
    setOpen(false);
  }
  function handleClear() {
    onSelect("");
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="relative">
      <input type="hidden" name="product_id" value={productId} />
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (productId) onSelect("");
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() =>
            setTimeout(() => {
              setOpen(false);
              if (!productId) setQuery("");
            }, 150)
          }
          placeholder={isRO ? "Caută articol…" : "Search item…"}
          autoComplete="off"
          className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 pr-7 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            aria-label={isRO ? "Șterge articol" : "Clear item"}
          >✕</button>
        )}
      </div>
      {open && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {filtered.length > 0 ? (
            filtered.map((p) => {
              const typeLabel = getTypeLabel(p);
              const isSelected = p.id === productId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onMouseDown={() => handleSelect(p)}
                  className={`w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-slate-50 last:border-0 ${isSelected ? "bg-blue-50" : ""}`}
                >
                  <p className={`text-sm font-medium ${isSelected ? "text-blue-700" : "text-slate-900"}`}>{p.name}</p>
                  {(typeLabel || p.unit_of_measure) && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      {[typeLabel, p.unit_of_measure].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </button>
              );
            })
          ) : (
            <div className="px-3 py-3 text-xs text-slate-500">
              {isRO ? "Niciun articol găsit. " : "No item found. "}
              <Link href="/app/products/new" className="text-blue-600 hover:underline">
                {isRO
                  ? "Adaugă ingredient, marfă sau consumabil din Produse →"
                  : "Add an ingredient, goods item, or supply from Products →"}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function PurchaseForm({
  suppliers,
  products,
  sites = [],
  currency = "EUR",
  currentUserId,
  initialDraft,
}: {
  suppliers: Supplier[];
  products: Product[];
  sites?: Site[];
  currency?: string;
  currentUserId?: string;
  initialDraft?: PurchaseDraftInitial;
}) {
  const isRO = currency === "RON";
  const taxLabel = isRO ? "TVA" : "VAT";
  const taxRates = isRO ? RO_TAX_RATES : EN_TAX_RATES;
  const umOptions = isRO ? RO_UM_OPTIONS : EN_UM_OPTIONS;
  const itemTypeLabels = isRO ? ITEM_TYPE_LABELS : ITEM_TYPE_LABELS_EN;
  const defaultUm = isRO ? "Buc" : "each";
  const today = new Date().toISOString().slice(0, 10);
  const emptyMsg = isRO
    ? "Nu există articole de cumpărat. Adăugați ingrediente, mărfuri sau consumabile în catalogul de produse, marcând «Poate fi cumpărat»."
    : "No purchase items yet. Add ingredients, goods, or supplies to your product catalogue and mark them as purchaseable.";

  const initialSupplier = initialDraft?.supplier_id
    ? suppliers.find((s) => s.id === initialDraft.supplier_id)
    : null;

  const nextId = useRef(initialDraft?.items.length ?? 1);
  const [lines, setLines] = useState<LineItem[]>(() => {
    if (initialDraft?.items.length) {
      return initialDraft.items.map((item, i) => ({
        id: i,
        product_id: item.product_id,
        quantity: String(item.quantity),
        unit_cost: String(item.unit_cost),
        tax_rate: String(item.tax_rate),
        unit_of_measure: item.unit_of_measure || defaultUm,
      }));
    }
    return [{ id: 0, product_id: "", quantity: "", unit_cost: "", tax_rate: "0", unit_of_measure: defaultUm }];
  });

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

  const title = initialDraft
    ? (isRO ? "Editează ciorna NIR" : "Edit NIR draft")
    : (isRO ? "Înregistrează NIR / cumpărare" : "Record NIR / purchase");

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Link href="/app/purchases" className="text-sm text-slate-500 hover:text-slate-700">← {isRO ? "Cumpărături" : "Purchases"}</Link>
        <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
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
          <CardTitle>{isRO ? "Detalii NIR" : "NIR details"}</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            {isRO
              ? "Salvați ciorna fără a modifica stocul. Generarea NIR actualizează stocul o singură dată."
              : "Save a draft without changing stock. Posting the NIR increases stock once."}
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-5">
            <input type="hidden" name="currency" value={currency} />
            {initialDraft?.id && <input type="hidden" name="purchase_id" value={initialDraft.id} />}
            {currentUserId && <input type="hidden" name="received_by_user_id" value={currentUserId} />}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label>{isRO ? "Furnizor" : "Supplier"}</Label>
                <SupplierCombobox
                  suppliers={suppliers}
                  isRO={isRO}
                  initialId={initialDraft?.supplier_id ?? undefined}
                  initialName={initialSupplier?.name}
                />
              </div>
              <div>
                <Label>{isRO ? "Nr. factură furnizor" : "Supplier invoice no."}</Label>
                <Input
                  name="invoice_number"
                  defaultValue={initialDraft?.invoice_number ?? ""}
                  placeholder={isRO ? "FAC-2026-001" : "INV-2026-001"}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{isRO ? "Data factură furnizor" : "Supplier invoice date"}</Label>
                <Input
                  name="supplier_invoice_date"
                  type="date"
                  defaultValue={initialDraft?.supplier_invoice_date ?? today}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{isRO ? "Data NIR" : "NIR date"}</Label>
                <Input
                  name="nir_date"
                  type="date"
                  defaultValue={initialDraft?.nir_date ?? today}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{isRO ? "Data cumpărăturii" : "Purchase date"}</Label>
                <Input
                  name="purchase_date"
                  type="date"
                  defaultValue={initialDraft?.purchase_date ?? today}
                  className="mt-1"
                />
              </div>
              {sites.length > 0 && (
                <div>
                  <Label>{isRO ? "Gestiune / Locație" : "Location / warehouse"}</Label>
                  <select
                    name="site_id"
                    defaultValue={initialDraft?.site_id ?? ""}
                    className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                  >
                    <option value="">{isRO ? "— fără locație —" : "— no location —"}</option>
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{isRO ? "Articole primite" : "Received items"}</Label>
                <span className="text-xs text-slate-400">{lines.length} {isRO ? "linie/linii" : `line${lines.length !== 1 ? "s" : ""}`}</span>
              </div>

              <div className="grid grid-cols-[1fr_80px_90px_90px_80px_80px_36px] gap-2 px-0.5 text-xs text-slate-400 font-medium">
                <span>{isRO ? "Articol" : "Item"}</span>
                <span>{isRO ? "UM" : "Unit"}</span>
                <span>{isRO ? "Cantitate" : "Quantity"}</span>
                <span>{isRO ? "Cost net" : "Net cost"}</span>
                <span>{taxLabel} %</span>
                <span>{isRO ? "Total brut" : "Gross"}</span>
                <span />
              </div>

              {lines.map((line, idx) => {
                const calc = lineCalc[idx];
                const selectedProduct = products.find((p) => p.id === line.product_id);
                return (
                  <div key={line.id} className="grid grid-cols-[1fr_80px_90px_90px_80px_80px_36px] gap-2 items-center">
                    <PurchaseItemCombobox
                      products={products}
                      productId={line.product_id}
                      isRO={isRO}
                      itemTypeLabels={itemTypeLabels}
                      onSelect={(id) => onProductChange(line.id, id)}
                    />
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
                      placeholder={isRO ? "Cost net" : "Net cost"}
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

              {grandTotal > 0 && (
                <div className="space-y-1 rounded-lg bg-slate-50 px-4 py-3 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>{isRO ? "Total net" : "Net total"}</span>
                    <span className="tabular-nums">{fmt(subtotalSum)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>{isRO ? `Total ${taxLabel}` : `Total ${taxLabel}`}</span>
                    <span className="tabular-nums">{fmt(taxSum)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-slate-900 border-t pt-2 mt-1">
                    <span>{isRO ? "Total brut" : "Gross total"}</span>
                    <span className="tabular-nums">{fmt(grandTotal)}</span>
                  </div>
                </div>
              )}

              <input type="hidden" name="subtotal_amount" value={subtotalSum.toFixed(4)} />
              <input type="hidden" name="tax_total" value={taxSum.toFixed(4)} />

              <p className="text-xs text-slate-500">
                {isRO
                  ? "Cantitate = câte unități ai primit. Cost net = prețul pe unitate, fără TVA."
                  : "Quantity is how much you received. Net cost is the unit price excluding VAT."}
              </p>
            </div>

            <div>
              <Label>{isRO ? "Observații / diferențe" : "Observations / differences"}</Label>
              <Input
                name="notes"
                defaultValue={initialDraft?.notes ?? ""}
                placeholder={isRO ? "Diferențe față de factură, cantități lipsă, observații recepție…" : "Quantity differences, missing items, receiving notes…"}
                className="mt-1"
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/app/purchases"><Button variant="outline" type="button">{isRO ? "Anulează" : "Cancel"}</Button></Link>
              <Button
                type="submit"
                variant="outline"
                disabled={products.length === 0}
                formAction={savePurchaseDraft as unknown as (fd: FormData) => Promise<void>}
              >
                {isRO ? "Salvează ciornă" : "Save draft"}
              </Button>
              <Button
                type="submit"
                disabled={products.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                formAction={postNirPurchase as unknown as (fd: FormData) => Promise<void>}
              >
                {isRO ? "Generează NIR" : "Post NIR"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
