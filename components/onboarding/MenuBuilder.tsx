"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { addCategoryInline, addProductFromPos } from "@/app/actions/kitchenops";
import { advanceFromMenu } from "@/app/actions/onboarding-steps";

type Category = { id: string; name: string };
type Product = { id: string; name: string; sale_price: number; category_id: string | null };
type DraftRow = { id: number; name: string; price: string };

const STRINGS = {
  ro: {
    addCategory: "+ Adaugă categorie",
    newCategoryPlaceholder: "Numele categoriei (ex: Cafea)",
    create: "Adaugă",
    cancel: "Anulează",
    productHeader: "Produs",
    priceHeader: "Preț",
    addRow: "+ Adaugă rând",
    saveProducts: "Salvează produsele",
    saving: "Se salvează…",
    importMenu: "Importă meniul",
    continueBtn: "Continuă",
    continuing: "Se continuă…",
    noCategoriesYet: "Nicio categorie încă. Creează prima categorie pentru a începe meniul.",
    currencySuffix: "lei",
  },
  en: {
    addCategory: "+ Add category",
    newCategoryPlaceholder: "Category name (e.g. Coffee)",
    create: "Add",
    cancel: "Cancel",
    productHeader: "Product",
    priceHeader: "Price",
    addRow: "+ Add row",
    saveProducts: "Save products",
    saving: "Saving…",
    importMenu: "Import menu",
    continueBtn: "Continue",
    continuing: "Continuing…",
    noCategoriesYet: "No categories yet. Create your first category to start the menu.",
    currencySuffix: "",
  },
};

let rowIdCounter = 0;
function blankRows(count: number): DraftRow[] {
  return Array.from({ length: count }, () => ({ id: rowIdCounter++, name: "", price: "" }));
}

export function MenuBuilder({
  locale,
  defaultVatRate,
  initialCategories,
  initialProducts,
}: {
  locale: "ro" | "en";
  defaultVatRate: number;
  initialCategories: Category[];
  initialProducts: Product[];
}) {
  const t = STRINGS[locale];
  const [categories, setCategories] = useState(initialCategories);
  const [productsByCategory, setProductsByCategory] = useState<Record<string, Product[]>>(() => {
    const map: Record<string, Product[]> = {};
    for (const cat of initialCategories) map[cat.id] = [];
    for (const product of initialProducts) {
      if (!product.category_id) continue;
      (map[product.category_id] ??= []).push(product);
    }
    return map;
  });
  const [draftRows, setDraftRows] = useState<Record<string, DraftRow[]>>(() => {
    const map: Record<string, DraftRow[]> = {};
    for (const cat of initialCategories) map[cat.id] = blankRows(3);
    return map;
  });
  const [showNewCategory, setShowNewCategory] = useState(categories.length === 0);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, startCreatingCategory] = useTransition();
  const [savingCategoryId, setSavingCategoryId] = useState<string | null>(null);
  const [continuing, startContinuing] = useTransition();

  function createCategory() {
    if (!newCategoryName.trim()) return;
    startCreatingCategory(async () => {
      const fd = new FormData();
      fd.set("name", newCategoryName.trim());
      const result = await addCategoryInline(fd);
      if (!result.ok || !result.category) {
        toast.error(result.error ?? "Nu s-a putut crea categoria.");
        return;
      }
      const category = { id: result.category.id, name: result.category.name };
      setCategories((current) => [...current, category]);
      setProductsByCategory((current) => ({ ...current, [category.id]: [] }));
      setDraftRows((current) => ({ ...current, [category.id]: blankRows(3) }));
      setNewCategoryName("");
      setShowNewCategory(false);
    });
  }

  function updateRow(categoryId: string, rowId: number, field: "name" | "price", value: string) {
    setDraftRows((current) => ({
      ...current,
      [categoryId]: current[categoryId].map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    }));
  }

  function addRow(categoryId: string) {
    setDraftRows((current) => ({ ...current, [categoryId]: [...current[categoryId], ...blankRows(1)] }));
  }

  function removeRow(categoryId: string, rowId: number) {
    setDraftRows((current) => ({
      ...current,
      [categoryId]: current[categoryId].filter((row) => row.id !== rowId),
    }));
  }

  async function saveRows(categoryId: string) {
    const rows = draftRows[categoryId].filter((row) => row.name.trim() && row.price.trim());
    if (rows.length === 0) return;
    setSavingCategoryId(categoryId);
    try {
      const created: Product[] = [];
      for (const row of rows) {
        const fd = new FormData();
        fd.set("name", row.name.trim());
        fd.set("sale_price", row.price.trim());
        fd.set("pos_category_id", categoryId);
        fd.set("vat_rate", String(defaultVatRate));
        const result = await addProductFromPos(fd);
        if (!result.ok) {
          toast.error(result.error ?? "Nu s-a putut adăuga produsul.");
          continue;
        }
        created.push({ id: crypto.randomUUID(), name: row.name.trim(), sale_price: Number(row.price), category_id: categoryId });
      }
      if (created.length) {
        setProductsByCategory((current) => ({
          ...current,
          [categoryId]: [...(current[categoryId] ?? []), ...created],
        }));
        setDraftRows((current) => ({ ...current, [categoryId]: blankRows(3) }));
        toast.success(locale === "ro" ? `${created.length} produse adăugate.` : `${created.length} products added.`);
      }
    } finally {
      setSavingCategoryId(null);
    }
  }

  function continueToNext() {
    startContinuing(async () => {
      const result = await advanceFromMenu();
      if (result && "error" in result && result.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      {categories.length === 0 && !showNewCategory && (
        <p className="text-sm text-mid">{t.noCategoriesYet}</p>
      )}

      {categories.map((category) => (
        <div key={category.id} className="rounded-md border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
              {category.name}
            </h3>
          </div>

          {(productsByCategory[category.id]?.length ?? 0) > 0 && (
            <ul className="divide-y divide-border border-b border-border">
              {productsByCategory[category.id].map((product) => (
                <li key={product.id} className="flex items-center justify-between px-4 py-2 text-sm">
                  <span className="text-foreground">{product.name}</span>
                  <span className="font-[family-name:var(--font-space-mono)] text-mid">
                    {product.sale_price} {t.currencySuffix}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-2 p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-mid">
              <span className="flex-1">{t.productHeader}</span>
              <span className="w-24">{t.priceHeader}</span>
              <span className="w-8" />
            </div>
            {draftRows[category.id]?.map((row) => (
              <div key={row.id} className="flex items-center gap-2">
                <Input
                  value={row.name}
                  onChange={(e) => updateRow(category.id, row.id, "name", e.target.value)}
                  placeholder={locale === "ro" ? "ex: Cappuccino" : "e.g. Cappuccino"}
                  className="flex-1"
                />
                <Input
                  value={row.price}
                  onChange={(e) => updateRow(category.id, row.id, "price", e.target.value)}
                  placeholder="14"
                  inputMode="decimal"
                  className="w-24 font-[family-name:var(--font-space-mono)]"
                />
                <button
                  type="button"
                  onClick={() => removeRow(category.id, row.id)}
                  className="flex h-9 w-8 shrink-0 items-center justify-center text-mid hover:text-attention"
                  aria-label={locale === "ro" ? "Șterge rândul" : "Remove row"}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => addRow(category.id)}
                className="inline-flex items-center gap-1 text-sm font-medium text-brass hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> {t.addRow}
              </button>
              <Button
                type="button"
                variant="outline"
                disabled={savingCategoryId === category.id}
                onClick={() => void saveRows(category.id)}
              >
                {savingCategoryId === category.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.saving}
                  </>
                ) : (
                  t.saveProducts
                )}
              </Button>
            </div>
          </div>
        </div>
      ))}

      {showNewCategory ? (
        <div className="flex items-center gap-2 rounded-md border border-dashed border-brass/40 bg-accent p-3">
          <Input
            autoFocus
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") createCategory();
            }}
            placeholder={t.newCategoryPlaceholder}
            className="flex-1 bg-card"
          />
          <Button type="button" size="sm" disabled={creatingCategory} onClick={createCategory}>
            {t.create}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setShowNewCategory(false)}>
            {t.cancel}
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowNewCategory(true)}
          className="text-sm font-medium text-brass hover:underline"
        >
          {t.addCategory}
        </button>
      )}

      <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/app/products/import" className="text-sm font-medium text-brass hover:underline">
          {t.importMenu}
        </Link>
        <Button
          className="h-11 bg-primary px-8 text-base text-primary-foreground hover:bg-primary/90"
          disabled={continuing}
          onClick={continueToNext}
        >
          {continuing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.continuing}
            </>
          ) : (
            <>
              {t.continueBtn} <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
