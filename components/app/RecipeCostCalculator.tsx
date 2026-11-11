"use client";
import Link from "next/link";
import { useState, useMemo, useRef, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Search, X } from "lucide-react";
import { addRecipeFromProducts, createIngredientInline, type RecipeActionResult } from "@/app/actions/kitchenops";
import { formatQty, formatRecipeMoney, formatRecipeUnitCost, recipeCurrencyLabel } from "@/lib/recipe-costing";
import { appText } from "@/lib/app-i18n";
import { recipeLineUnitWarning } from "@/lib/recipe-unit-warning";

type IngredientProduct = {
  id: string;
  name: string;
  unit_of_measure: string | null;
  cost_price: number | null;
  current_stock_qty: number | null;
  /** Archived product still linked by this recipe: shown, marked, not offered as a new choice. */
  archived?: boolean;
};

type SellableProduct = {
  id: string;
  name: string;
  sale_price: number | null;
  archived?: boolean;
};

const ARCHIVED_SUFFIX = " (arhivat)";

const RECIPE_SAVE_ERRORS: Record<RecipeActionResult["error"], string> = {
  empty: "Adăugați cel puțin un ingredient cu o cantitate mai mare decât zero.",
  failed: "Rețeta nu s-a salvat. Încercați din nou; dacă se repetă, scrieți-ne pe WhatsApp.",
};

/** saved_unit: the unit stored on an existing recipe line (edit mode), used only
 * to warn when it disagrees with the ingredient's stock unit. */
type IngredientRow = { id: number; product_id: string; quantity: string; saved_unit?: string | null };

type InlineCreateState = {
  rowId: number;
  initialName: string;
} | null;

// Searchable ingredient picker with inline create
function IngredientPicker({
  rowId,
  value,
  products,
  onChange,
  onInlineCreate,
  currency,
}: {
  rowId: number;
  value: string;
  products: IngredientProduct[];
  onChange: (id: string) => void;
  onInlineCreate: (rowId: number, name: string) => void;
  currency: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = products.find((p) => p.id === value);

  // An archived ingredient is only listed when it is the one already selected.
  const choosable = products.filter((p) => !p.archived || p.id === value);
  const filtered = query.trim()
    ? choosable.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : choosable;

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
        className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-left flex items-center justify-between gap-2 hover:border-border focus:outline-none focus:ring-2 focus:ring-brass/30"
      >
        <span className={selected ? "text-foreground" : "text-muted-foreground"}>
          {selected ? `${selected.name} (${selected.unit_of_measure ?? "buc"})${selected.archived ? ARCHIVED_SUFFIX : ""}` : "— alege articol din stoc —"}
        </span>
        {selected && (
          <span className="text-muted-foreground text-xs shrink-0">
            {formatRecipeUnitCost(Number(selected.cost_price ?? 0), currency)}/unit
          </span>
        )}
      </button>

      {open && (
        <div className="absolute z-50 top-11 left-0 right-0 rounded-md border border-border bg-card shadow-lg">
          <div className="p-2 border-b border-border flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Caută articole din stoc…"
              className="flex-1 text-sm outline-none bg-transparent"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="text-muted-foreground hover:text-mid">
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
                  className="w-full px-3 py-2 text-sm text-left text-muted-foreground hover:bg-secondary"
                >
                  — niciunul —
                </button>
              </li>
            )}
            {filtered.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => selectProduct(p.id)}
                  className={`w-full px-3 py-2 text-sm text-left hover:bg-accent flex justify-between gap-2 ${p.id === value ? "bg-accent font-medium text-brass" : "text-foreground"}`}
                >
                  <span>{p.name} <span className="text-muted-foreground font-normal">({p.unit_of_measure ?? "buc"}){p.archived ? ARCHIVED_SUFFIX : ""}</span></span>
                  <span className="text-muted-foreground shrink-0">{formatRecipeUnitCost(Number(p.cost_price ?? 0), currency)}/unitate</span>
                </button>
              </li>
            ))}
            {!filtered.length && !query.trim() && (
              <li className="px-3 py-3 text-sm text-muted-foreground text-center">Niciun articol de stoc încă.</li>
            )}
            {/* Inline create option */}
            {query.trim() && !hasExactMatch && (
              <li className="border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                    onInlineCreate(rowId, query.trim());
                  }}
                  className="w-full px-3 py-2.5 text-sm text-left text-brass hover:bg-accent font-medium"
                >
                  + Creează &ldquo;{query.trim()}&rdquo; ca articol nou de stoc
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
  currency,
}: {
  currency: string;
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
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Creează articol de stoc</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Acest articol va fi disponibil ca ingredient în toate produsele.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Nume *</Label>
            <Input name="name" defaultValue={initialName} required autoFocus className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Unitate</Label>
              <select
                name="unit_of_measure"
                defaultValue="each"
                className="mt-1 h-10 w-full rounded-md border border-border bg-card px-3 text-sm"
              >
                <option value="each">bucată</option>
                <option value="g">grame (g)</option>
                <option value="kg">kilograme (kg)</option>
                <option value="ml">mililitri (ml)</option>
                <option value="l">litri (l)</option>
                <option value="portion">porție</option>
              </select>
            </div>
            <div>
              <Label>Cost per unitate ({recipeCurrencyLabel(currency)})</Label>
              <Input name="cost_price" type="number" step="0.0001" min="0" defaultValue="0" className="mt-1" />
            </div>
          </div>
          <div>
            <Label>Stoc inițial <span className="text-muted-foreground font-normal">(opțional)</span></Label>
            <Input name="opening_stock" type="number" step="0.01" min="0" defaultValue="0" className="mt-1" />
          </div>
          {error && <p className="text-sm text-attention">{error}</p>}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Anulează</Button>
            <Button type="submit" disabled={isPending} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
              {isPending ? "Se creează…" : "Creează și selectează"}
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
  // Edit mode: when a recipeId is supplied the same calculator is reused to
  // update an existing recipe instead of creating a new one, so both flows stay
  // visually identical and there is only one costing UI to maintain.
  recipeId,
  initialProductId,
  initialYieldQty,
  initialRows,
  submitAction,
  submitLabel,
  // Org currency (organisations.currency_code). Display only: amounts are
  // printed as stored, never converted.
  currency = "EUR",
}: {
  currency?: string;
  sellableProducts: SellableProduct[];
  ingredientProducts: IngredientProduct[];
  recipeId?: string;
  initialProductId?: string;
  initialYieldQty?: string;
  initialRows?: { product_id: string; quantity: string; unit_of_measure?: string | null }[];
  submitAction?: (fd: FormData) => Promise<RecipeActionResult | void>;
  submitLabel?: string;
}) {
  // Success redirects (server side). A returned result means nothing was
  // saved, so the form keeps what the owner typed and says why.
  const [saveError, setSaveError] = useState<string | null>(null);
  async function submitRecipe(fd: FormData) {
    setSaveError(null);
    const res = await (submitAction ?? addRecipeFromProducts)(fd);
    if (res && res.ok === false) setSaveError(RECIPE_SAVE_ERRORS[res.error] ?? RECIPE_SAVE_ERRORS.failed);
  }
  const seededRows: IngredientRow[] = (initialRows ?? []).map((r, i) => ({
    id: i,
    product_id: r.product_id,
    quantity: r.quantity,
    saved_unit: r.unit_of_measure ?? null,
  }));
  const nextId = { current: seededRows.length > 0 ? seededRows.length : 1 };
  const [selectedProductId, setSelectedProductId] = useState(
    initialProductId ?? sellableProducts[0]?.id ?? ""
  );
  const [yieldQty, setYieldQty] = useState(initialYieldQty ?? "1");
  const [rows, setRows] = useState<IngredientRow[]>(
    seededRows.length > 0 ? seededRows : [{ id: 0, product_id: "", quantity: "" }]
  );
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
  const updateRow = (id: number, field: "product_id" | "quantity", value: string) => {
    // A different ingredient makes the saved unit meaningless, so drop it.
    setRows((rs) => rs.map((r) => r.id === id
      ? { ...r, [field]: value, ...(field === "product_id" && value !== r.product_id ? { saved_unit: null } : {}) }
      : r));
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
          currency={currency}
        />
      )}

      <form action={submitRecipe} className="space-y-5">
        {/* Hidden recipe name — auto-set to selected product name */}
        <input type="hidden" name="name" value={recipeName || "Ingrediente"} />
        {recipeId ? <input type="hidden" name="recipe_id" value={recipeId} /> : null}

        {/* Finished product + batch size */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Produs *</Label>
            <p className="text-xs text-muted-foreground mb-1 mt-0.5">Alege produsul pe care îl vinzi.</p>
            <select
              name="product_id"
              required
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm"
            >
              <option value="">— alege produsul —</option>
              {sellableProducts.filter((p) => !p.archived || p.id === selectedProductId).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}{p.archived ? ARCHIVED_SUFFIX : ""} — {formatRecipeMoney(Number(p.sale_price ?? 0), currency)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Porții per rețetă</Label>
            <Input
              name="yield_qty"
              type="number"
              step="0.01"
              min="0.01"
              value={yieldQty}
              onChange={(e) => setYieldQty(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-0.5">Câte porții rezultă din această rețetă.</p>
          </div>
        </div>

        {/* Ingredient rows */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label>Articole de stoc folosite</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Câtă cantitate din fiecare ingredient intră într-o rețetă.</p>
            </div>
          </div>

          {allIngredients.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground mb-3">Niciun articol de stoc încă.</p>
              <p className="text-xs text-muted-foreground mb-4">
                Adaugă articole de stoc cu unitate și preț de cost pentru a urmări costul ingredientelor.
              </p>
              <Link href="/app/recipes/new">
                <Button type="button" variant="outline" size="sm">Adaugă primul articol de stoc</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[1fr_100px_80px_32px] gap-2 px-1 text-xs text-muted-foreground font-medium">
                <span>Articol de stoc</span>
                <span className="text-right">Cantitate per rețetă</span>
                <span className="text-right">Cost linie</span>
                <span />
              </div>

              {rows.map((row) => {
                const p = productMap.get(row.product_id);
                const qty = Number(row.quantity) || 0;
                const rowCost = qty * Number(p?.cost_price ?? 0);
                const stock = Number(p?.current_stock_qty ?? 0);
                // This screen is Romanian-only (hard-coded copy), so use the ro text.
                const unitWarning = p ? recipeLineUnitWarning(row.saved_unit, p.unit_of_measure, row.quantity, appText.ro, "ro") : null;

                return (
                  <div key={row.id} className="grid grid-cols-[1fr_100px_80px_32px] gap-2 items-start">
                    <div>
                      <IngredientPicker
                        rowId={row.id}
                        value={row.product_id}
                        products={allIngredients}
                        onChange={(id) => updateRow(row.id, "product_id", id)}
                        onInlineCreate={(rowId, name) => setInlineCreate({ rowId, initialName: name })}
                        currency={currency}
                      />
                      {p && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 pl-1">
                          Stoc disponibil: <span className={stock < qty * 5 ? "text-amber-600 font-medium" : ""}>{formatQty(stock)} {p.unit_of_measure ?? "buc"}</span>
                        </p>
                      )}
                      {unitWarning && (
                        <p role="status" data-testid="recipe-unit-warning" className="mt-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] text-amber-900">
                          {unitWarning}
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
                      <span className="text-sm font-medium text-foreground">
                        {rowCost > 0 ? formatRecipeMoney(rowCost, currency) : "—"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      disabled={rows.length === 1}
                      className="h-10 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-attention hover:bg-attention/10 disabled:opacity-20 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={addRow}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-sm text-muted-foreground hover:border-brass/40 hover:text-brass transition-colors"
              >
                <Plus className="h-4 w-4" />Adaugă articol de stoc
              </button>
            </>
          )}
        </div>

        {/* Live cost + can-make summary */}
        {filledRows.length > 0 && (
          <div className="rounded-xl border border-border bg-secondary p-4 space-y-3">
            <p className="text-sm font-semibold text-foreground">Cost și marjă</p>

            <div className="space-y-1">
              {filledRows.map((row, i) => {
                const p = productMap.get(row.product_id);
                if (!p) return null;
                const qty = Number(row.quantity);
                const cost = qty * Number(p.cost_price ?? 0);
                return (
                  <div key={i} className="flex justify-between text-sm text-mid">
                    <span>{p.name} × {qty} {p.unit_of_measure ?? "buc"}</span>
                    <span className="tabular-nums">{formatRecipeMoney(cost, currency)}</span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-mid">Cost total ingrediente ({yieldQty} porții)</span>
                <strong className="tabular-nums">{formatRecipeMoney(totalCost, currency)}</strong>
              </div>
              {Number(yieldQty) > 1 && (
                <div className="flex justify-between text-sm">
                  <span className="text-mid">Cost per porție</span>
                  <strong className="tabular-nums">{formatRecipeMoney(costPerUnit, currency)}</strong>
                </div>
              )}
              {salePrice > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-mid">Preț vânzare</span>
                    <strong className="tabular-nums">{formatRecipeMoney(salePrice, currency)}</strong>
                  </div>
                  <div className={`flex justify-between text-base font-bold pt-1 border-t border-border ${
                    marginPct >= 60 ? "text-reconciled" : marginPct >= 30 ? "text-amber-600" : "text-attention"
                  }`}>
                    <span>Marjă brută</span>
                    <span className="tabular-nums">{formatRecipeMoney(margin, currency)} ({marginPct.toFixed(1)}%)</span>
                  </div>
                </>
              )}

              {canMakeData !== null && (
                <div className="mt-3 pt-3 border-t border-border rounded-lg bg-card border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Poți prepara acum</p>
                      <p className="text-xs text-muted-foreground">Pe baza stocului curent</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-bold leading-none ${
                        canMakeData.canMake === 0 ? "text-attention" : canMakeData.canMake < 5 ? "text-amber-600" : "text-reconciled"
                      }`}>
                        {canMakeData.canMake}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">porții</p>
                    </div>
                  </div>
                  {canMakeData.limitingProduct && canMakeData.canMake < 20 && (
                    <p className="text-xs text-amber-700 mt-2">
                      ⚠ Articol limitativ: <strong>{canMakeData.limitingProduct.name}</strong> — doar {Number(canMakeData.limitingProduct.current_stock_qty ?? 0)} {canMakeData.limitingProduct.unit_of_measure ?? "unități"} rămase
                    </p>
                  )}
                  {canMakeData.canMake === 0 && (
                    <p className="text-xs text-attention mt-1">
                      Stoc insuficient. Achiziționează mai mult sau redu dimensiunea rețetei.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {saveError && (
          <p role="alert" className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {saveError}
          </p>
        )}

        <div className="flex gap-3 pt-2 border-t border-border">
          <Link href={recipeId ? `/app/recipes/${recipeId}` : "/app/recipes"}>
            <Button variant="outline" type="button">Anulează</Button>
          </Link>
          <Button
            type="submit"
            disabled={allIngredients.length === 0 || !selectedProductId || filledRows.length === 0}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {submitLabel ?? "Salvează ingredientele"}
          </Button>
        </div>
      </form>
    </>
  );
}
