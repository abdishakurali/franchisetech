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
    addCategory: "+ Categorie",
    newCategoryPlaceholder: "Numele categoriei (ex: Cafea)",
    create: "Adaugă",
    cancel: "Anulează",
    addRow: "+ Produs",
    importMenu: "Importă meniul",
    continueBtn: "Adaugă produsele și continuă",
    continuing: "Se salvează…",
    noCategoriesYet: "Nicio categorie încă. Creează prima categorie pentru a începe meniul.",
    currencySuffix: "lei",
    removeRow: "Șterge rândul",
  },
  en: {
    addCategory: "+ Category",
    newCategoryPlaceholder: "Category name (e.g. Coffee)",
    create: "Add",
    cancel: "Cancel",
    addRow: "+ Product",
    importMenu: "Import menu",
    continueBtn: "Add products and continue",
    continuing: "Saving…",
    noCategoriesYet: "No categories yet. Create your first category to start the menu.",
    currencySuffix: "",
    removeRow: "Remove row",
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
    for (const cat of initialCategories) map[cat.id] = blankRows(1);
    return map;
  });
  const [showNewCategory, setShowNewCategory] = useState(categories.length === 0);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, startCreatingCategory] = useTransition();
  const [continuing, startContinuing] = useTransition();

  function createCategory() {
    if (!newCategoryName.trim()) return;
    startCreatingCategory(async () => {
      const fd = new FormData();
      fd.set("name", newCategoryName.trim());
      const result = await addCategoryInline(fd);
      if (!result.ok || !result.category) {
        toast.error(
          result.error === "entitlement_denied"
            ? locale === "ro"
              ? "Acțiune indisponibilă pentru planul curent."
              : "This action isn't available on your current plan."
            : (result.error ?? (locale === "ro" ? "Nu s-a putut crea categoria." : "Couldn't create the category.")),
        );
        return;
      }
      const category = { id: result.category.id, name: result.category.name };
      setCategories((current) => [...current, category]);
      setProductsByCategory((current) => ({ ...current, [category.id]: [] }));
      setDraftRows((current) => ({ ...current, [category.id]: blankRows(1) }));
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

  // One page-level save: Continue always flushes every non-empty draft row
  // across every category first, then advances — there is no separate
  // per-category save action, so a typed-but-unsaved row can never be
  // silently dropped by clicking Continue.
  function continueToNext() {
    startContinuing(async () => {
      const createdByCategory: Record<string, Product[]> = {};
      let totalCreated = 0;
      let hadError = false;

      for (const categoryId of Object.keys(draftRows)) {
        const rows = draftRows[categoryId].filter((row) => row.name.trim() && row.price.trim());
        if (!rows.length) continue;
        const created: Product[] = [];
        for (const row of rows) {
          const fd = new FormData();
          fd.set("name", row.name.trim());
          fd.set("sale_price", row.price.trim());
          fd.set("pos_category_id", categoryId);
          fd.set("vat_rate", String(defaultVatRate));
          const result = await addProductFromPos(fd);
          if (!result.ok) {
            hadError = true;
            // addProductFromPos forwards the bare EntitlementDeniedError
            // code, not a message, if this ever fires mid-onboarding.
            toast.error(
              result.error === "entitlement_denied"
                ? locale === "ro"
                  ? "Acțiune indisponibilă pentru planul curent."
                  : "This action isn't available on your current plan."
                : (result.error ?? (locale === "ro" ? "Nu s-a putut adăuga produsul." : "Couldn't add the product.")),
            );
            continue;
          }
          created.push({ id: crypto.randomUUID(), name: row.name.trim(), sale_price: Number(row.price), category_id: categoryId });
          totalCreated += 1;
        }
        if (created.length) createdByCategory[categoryId] = created;
      }

      if (totalCreated > 0) {
        setProductsByCategory((current) => {
          const next = { ...current };
          for (const [categoryId, created] of Object.entries(createdByCategory)) {
            next[categoryId] = [...(next[categoryId] ?? []), ...created];
          }
          return next;
        });
        setDraftRows((current) => {
          const next = { ...current };
          for (const categoryId of Object.keys(createdByCategory)) next[categoryId] = blankRows(1);
          return next;
        });
      }

      if (hadError) return;

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
            <h3 className="text-sm font-semibold text-foreground">
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
            {draftRows[category.id]?.map((row) => {
              const hasContent = row.name.trim() || row.price.trim();
              return (
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
                    className={hasContent ? "flex h-9 w-8 shrink-0 items-center justify-center text-muted-foreground hover:text-attention" : "h-9 w-8 shrink-0"}
                    aria-label={t.removeRow}
                  >
                    {hasContent ? <Trash2 className="h-4 w-4" /> : null}
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              onClick={() => addRow(category.id)}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              <Plus className="h-3.5 w-3.5" /> {t.addRow}
            </button>
          </div>
        </div>
      ))}

      {showNewCategory ? (
        <div className="flex items-center gap-2 rounded-md border border-dashed border-border bg-accent p-3">
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
          className="text-sm font-medium text-primary hover:underline"
        >
          {t.addCategory}
        </button>
      )}

      <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/app/products/import" className="text-sm font-medium text-muted-foreground hover:underline">
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
