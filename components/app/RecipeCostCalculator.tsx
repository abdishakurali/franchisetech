"use client";
import Link from "next/link";
import { useState, useMemo, useRef, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Search, X } from "lucide-react";
import { addRecipeFromProducts, createIngredientInline } from "@/app/actions/kitchenops";

type IngredientProduct = {
  id: string;
  name: string;
  unit_of_measure: string | null;
  cost_price: number | null;
  current_stock_qty: number | null;
};

type SellableProduct = {
  id: string;
  name: string;
  sale_price: number | null;
};

type IngredientRow = { id: number; product_id: string; quantity: string };

type InlineCreateState = {
  rowId: number;
  initialName: string;
} | null;

function money(v: number) {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(v);
}

// Searchable ingredient picker with inline create
function IngredientPicker({
  rowId,
  value,
  products,
  onChange,
  onInlineCreate,
}: {
  rowId: number;
  value: string;
  products: IngredientProduct[];
  onChange: (id: string) => void;
  onInlineCreate: (rowId: number, name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = products.find((p) => p.id === value);

  const filtered = query.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : products;

  const hasExactMatch = products.some(
    (p) => p.name.toLowerCase() === query.trim().toLowerCase()
  );

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  function selectProduct(id: string) {
    onChange(id);
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative w-full">
      {/* Hidden input for form submission */}
      <input type="hidden" name="ingredient_product_id" value={value} />

      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-left flex items-center justify-between gap-2 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
      >
        <span className={selected ? "text-slate-900" : "text-slate-400"}>
          {selected ? `${selected.name} (${selected.unit_of_measure ?? "each"})` : "— choose stock item —"}
        </span>
        {selected && (
          <span className="text-slate-400 text-xs shrink-0">
            €{Number(selected.cost_price ?? 0).toFixed(4)}/unit
          </span>
        )}
      </button>

      {open && (
        <div className="absolute z-50 top-11 left-0 right-0 rounded-md border border-slate-200 bg-white shadow-lg">
          <div className="p-2 border-b border-slate-100 flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stock items…"
              className="flex-1 text-sm outline-none bg-transparent"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
            {/* Clear option */}
            {value && (
              <li>
                <button
                  type="button"
                  onClick={() => selectProduct("")}
                  className="w-full px-3 py-2 text-sm text-left text-slate-400 hover:bg-slate-50"
                >
                  — none —
                </button>
              </li>
            )}
            {filtered.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => selectProduct(p.id)}
                  className={`w-full px-3 py-2 text-sm text-left hover:bg-blue-50 flex justify-between gap-2 ${p.id === value ? "bg-blue-50 font-medium text-blue-700" : "text-slate-700"}`}
                >
                  <span>{p.name} <span className="text-slate-400 font-normal">({p.unit_of_measure ?? "each"})</span></span>
                  <span className="text-slate-400 shrink-0">€{Number(p.cost_price ?? 0).toFixed(4)}/unit</span>
                </button>
              </li>
            ))}
            {!filtered.length && !query.trim() && (
              <li className="px-3 py-3 text-sm text-slate-400 text-center">No stock items yet.</li>
            )}
            {/* Inline create option */}
            {query.trim() && !hasExactMatch && (
              <li className="border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                    onInlineCreate(rowId, query.trim());
                  }}
                  className="w-full px-3 py-2.5 text-sm text-left text-blue-600 hover:bg-blue-50 font-medium"
                >
                  + Create &ldquo;{query.trim()}&rdquo; as new stock item
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// Inline creation modal
function InlineCreateModal({
  initialName,
  onSave,
  onCancel,
}: {
  initialName: string;
  onSave: (product: IngredientProduct) => void;
  onCancel: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createIngredientInline(fd);
      if ("error" in result) {
        setError(result.error);
      } else {
        onSave(result);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Create stock item</h3>
          <p className="text-sm text-slate-500 mt-0.5">This item will be available as an ingredient in all products.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Name *</Label>
            <Input name="name" defaultValue={initialName} required autoFocus className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Unit</Label>
              <select
                name="unit_of_measure"
                defaultValue="each"
                className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="each">each</option>
                <option value="g">grams (g)</option>
                <option value="kg">kilograms (kg)</option>
                <option value="ml">millilitres (ml)</option>
                <option value="l">litres (l)</option>
                <option value="portion">portion</option>
              </select>
            </div>
            <div>
              <Label>Cost per unit (€)</Label>
              <Input name="cost_price" type="number" step="0.0001" min="0" defaultValue="0" className="mt-1" />
            </div>
          </div>
          <div>
            <Label>Opening stock <span className="text-slate-400 font-normal">(optional)</span></Label>
            <Input name="opening_stock" type="number" step="0.01" min="0" defaultValue="0" className="mt-1" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={isPending} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              {isPending ? "Creating…" : "Create & select"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function RecipeCostCalculator({
  sellableProducts,
  ingredientProducts,
}: {
  sellableProducts: SellableProduct[];
  ingredientProducts: IngredientProduct[];
}) {
  const nextId = { current: 1 };
  const [selectedProductId, setSelectedProductId] = useState(sellableProducts[0]?.id ?? "");
  const [yieldQty, setYieldQty] = useState("1");
  const [rows, setRows] = useState<IngredientRow[]>([{ id: 0, product_id: "", quantity: "" }]);
  const [allIngredients, setAllIngredients] = useState<IngredientProduct[]>(ingredientProducts);
  const [inlineCreate, setInlineCreate] = useState<InlineCreateState>(null);

  const selectedProduct = sellableProducts.find((p) => p.id === selectedProductId);
  // Recipe name auto-fills from selected product name
  const recipeName = selectedProduct?.name ?? "";
  const salePrice = Number(selectedProduct?.sale_price ?? 0);
  const yield_ = Math.max(Number(yieldQty) || 1, 0.001);

  const productMap = useMemo(
    () => new Map(allIngredients.map((p) => [p.id, p])),
    [allIngredients]
  );

  const filledRows = rows.filter((r) => r.product_id && Number(r.quantity) > 0);

  const totalCost = filledRows.reduce((sum, row) => {
    const p = productMap.get(row.product_id);
    return sum + Number(p?.cost_price ?? 0) * Number(row.quantity);
  }, 0);
  const costPerUnit = totalCost / yield_;
  const margin = salePrice - costPerUnit;
  const marginPct = salePrice > 0 ? (margin / salePrice) * 100 : 0;

  let canMakeData: { canMake: number; limitingProduct: IngredientProduct | null } | null = null;
  if (filledRows.length > 0) {
    let minPortions = Infinity;
    let limitingProduct: IngredientProduct | null = null;
    for (const row of filledRows) {
      const p = productMap.get(row.product_id);
      if (!p) continue;
      const stock = Number(p.current_stock_qty ?? 0);
      const qtyPerPortion = Number(row.quantity) / yield_;
      if (qtyPerPortion <= 0) continue;
      const portionsFromThis = Math.floor(stock / qtyPerPortion);
      if (portionsFromThis < minPortions) {
        minPortions = portionsFromThis;
        limitingProduct = p;
      }
    }
    canMakeData = {
      canMake: minPortions === Infinity ? 0 : Math.max(0, minPortions),
      limitingProduct,
    };
  }

  const addRow = () => {
    setRows((rs) => [...rs, { id: nextId.current++, product_id: "", quantity: "" }]);
  };
  const removeRow = (id: number) => setRows((rs) => rs.filter((r) => r.id !== id));
  const updateRow = (id: number, field: keyof Omit<IngredientRow, "id">, value: string) => {
    setRows((rs) => rs.map((r) => r.id === id ? { ...r, [field]: value } : r));
  };

  function handleInlineCreateSave(newProduct: IngredientProduct, rowId: number) {
    // Add to local list and auto-select in the triggering row
    setAllIngredients((prev) => [...prev, newProduct]);
    updateRow(rowId, "product_id", newProduct.id);
    setInlineCreate(null);
  }

  return (
    <>
      {inlineCreate && (
        <InlineCreateModal
          initialName={inlineCreate.initialName}
          onSave={(p) => handleInlineCreateSave(p, inlineCreate.rowId)}
          onCancel={() => setInlineCreate(null)}
        />
      )}

      <form action={addRecipeFromProducts as unknown as (fd: FormData) => Promise<void>} className="space-y-5">
        {/* Hidden recipe name — auto-set to selected product name */}
        <input type="hidden" name="name" value={recipeName || "Ingredients"} />

        {/* Finished product + batch size */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Product *</Label>
            <p className="text-xs text-slate-500 mb-1 mt-0.5">Choose the product you sell.</p>
            <select
              name="product_id"
              required
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="">— select product —</option>
              {sellableProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — €{Number(p.sale_price ?? 0).toFixed(2)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Portions per batch</Label>
            <Input
              name="yield_qty"
              type="number"
              step="0.01"
              min="0.01"
              value={yieldQty}
              onChange={(e) => setYieldQty(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-slate-500 mt-0.5">How many portions this batch makes.</p>
          </div>
        </div>

        {/* Ingredient rows */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label>Stock items used</Label>
              <p className="text-xs text-slate-500 mt-0.5">How much of each ingredient goes into one batch.</p>
            </div>
          </div>

          {allIngredients.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <p className="text-sm text-slate-500 mb-3">No stock items yet.</p>
              <p className="text-xs text-slate-400 mb-4">
                Add stock items with unit and cost price to track ingredient costs.
              </p>
              <Link href="/app/recipes/new">
                <Button type="button" variant="outline" size="sm">Add first stock item</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[1fr_100px_80px_32px] gap-2 px-1 text-xs text-slate-400 font-medium">
                <span>Stock item</span>
                <span className="text-right">Qty per batch</span>
                <span className="text-right">Line cost</span>
                <span />
              </div>

              {rows.map((row) => {
                const p = productMap.get(row.product_id);
                const qty = Number(row.quantity) || 0;
                const rowCost = qty * Number(p?.cost_price ?? 0);
                const stock = Number(p?.current_stock_qty ?? 0);

                return (
                  <div key={row.id} className="grid grid-cols-[1fr_100px_80px_32px] gap-2 items-start">
                    <div>
                      <IngredientPicker
                        rowId={row.id}
                        value={row.product_id}
                        products={allIngredients}
                        onChange={(id) => updateRow(row.id, "product_id", id)}
                        onInlineCreate={(rowId, name) => setInlineCreate({ rowId, initialName: name })}
                      />
                      {p && (
                        <p className="text-[10px] text-slate-400 mt-0.5 pl-1">
                          Stock on hand: <span className={stock < qty * 5 ? "text-amber-600 font-medium" : ""}>{stock} {p.unit_of_measure ?? "each"}</span>
                        </p>
                      )}
                    </div>
                    <Input
                      name="quantity"
                      type="number"
                      step="0.001"
                      min="0"
                      value={row.quantity}
                      onChange={(e) => updateRow(row.id, "quantity", e.target.value)}
                      placeholder="0"
                      className="text-right"
                    />
                    <div className="h-10 flex items-center justify-end">
                      <span className="text-sm font-medium text-slate-700">
                        {rowCost > 0 ? money(rowCost) : "—"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      disabled={rows.length === 1}
                      className="h-10 w-8 flex items-center justify-center rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 disabled:opacity-20 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={addRow}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-2 text-sm text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                <Plus className="h-4 w-4" />Add stock item
              </button>
            </>
          )}
        </div>

        {/* Live cost + can-make summary */}
        {filledRows.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <p className="text-sm font-semibold text-slate-700">Cost and margin</p>

            <div className="space-y-1">
              {filledRows.map((row, i) => {
                const p = productMap.get(row.product_id);
                if (!p) return null;
                const qty = Number(row.quantity);
                const cost = qty * Number(p.cost_price ?? 0);
                return (
                  <div key={i} className="flex justify-between text-sm text-slate-600">
                    <span>{p.name} × {qty} {p.unit_of_measure ?? "each"}</span>
                    <span className="tabular-nums">{money(cost)}</span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-200 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Total ingredient cost ({yieldQty} portions)</span>
                <strong className="tabular-nums">{money(totalCost)}</strong>
              </div>
              {Number(yieldQty) > 1 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Cost per portion</span>
                  <strong className="tabular-nums">{money(costPerUnit)}</strong>
                </div>
              )}
              {salePrice > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Sale price</span>
                    <strong className="tabular-nums">{money(salePrice)}</strong>
                  </div>
                  <div className={`flex justify-between text-base font-bold pt-1 border-t border-slate-200 ${
                    marginPct >= 60 ? "text-green-700" : marginPct >= 30 ? "text-amber-600" : "text-red-600"
                  }`}>
                    <span>Gross margin</span>
                    <span className="tabular-nums">{money(margin)} ({marginPct.toFixed(1)}%)</span>
                  </div>
                </>
              )}

              {canMakeData !== null && (
                <div className="mt-3 pt-3 border-t border-slate-200 rounded-lg bg-white border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Can make now</p>
                      <p className="text-xs text-slate-400">Based on current stock levels</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-bold leading-none ${
                        canMakeData.canMake === 0 ? "text-red-600" : canMakeData.canMake < 5 ? "text-amber-600" : "text-green-700"
                      }`}>
                        {canMakeData.canMake}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">portions</p>
                    </div>
                  </div>
                  {canMakeData.limitingProduct && canMakeData.canMake < 20 && (
                    <p className="text-xs text-amber-700 mt-2">
                      ⚠ Limiting item: <strong>{canMakeData.limitingProduct.name}</strong> — only {Number(canMakeData.limitingProduct.current_stock_qty ?? 0)} {canMakeData.limitingProduct.unit_of_measure ?? "units"} left
                    </p>
                  )}
                  {canMakeData.canMake === 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      Not enough stock. Purchase more or reduce batch size.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2 border-t border-slate-100">
          <Link href="/app/recipes"><Button variant="outline" type="button">Cancel</Button></Link>
          <Button
            type="submit"
            disabled={allIngredients.length === 0 || !selectedProductId || filledRows.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save ingredients
          </Button>
        </div>
      </form>
    </>
  );
}
