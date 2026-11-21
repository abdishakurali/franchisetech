import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppLocale } from "@/lib/app-i18n";

export type DashboardAttentionItem = {
  severity: "critical" | "warning";
  message: string;
  href: string;
};

type Params = {
  orgId: string;
  locale: AppLocale;
  currency: string;
  inventoryVisible: boolean;
  recipeVisible: boolean;
  fiscalnetEnabled: boolean;
};

/** A receipt still "api_pending" this long after the sale never got an answer. */
export const FISCAL_STUCK_PENDING_MS = 5 * 60_000;

/** How far back the dashboard looks for unconfirmed receipts (same as the till panel). */
export const FISCAL_ATTENTION_DAYS = 14;

/**
 * PostgREST `or` filter for sales whose fiscal receipt is not confirmed:
 * failed/timeout/ambiguous/unconfirmed (the scheduled sweep's state for a
 * receipt that never got an answer), plus "api_pending" older than a few minutes. The
 * browser sends the receipt after the sale is saved; if the page closes or
 * reloads first, nothing ever moves the status off api_pending (production,
 * 2026-11-12: two Dolce Nera sales stuck there and the owner saw nothing).
 */
export function fiscalNotConfirmedFilter(now: Date = new Date()): string {
  const stuckBefore = new Date(now.getTime() - FISCAL_STUCK_PENDING_MS).toISOString();
  return `fiscal_receipt_status.in.(failed,timeout,ambiguous,unconfirmed),and(fiscal_receipt_status.eq.api_pending,sold_at.lt.${stuckBefore})`;
}

function money(v: number, currency: string): string {
  return currency === "RON" ? `${Math.abs(v).toFixed(2)} lei` : `${Math.abs(v).toFixed(2)} ${currency}`;
}

/**
 * Current-state signals for the owner dashboard's Attention section —
 * deliberately separate from lib/owner-digest/fetch.ts, which aggregates
 * over a reporting period for the email digest. This is "what's wrong right
 * now", not "what happened in the last day/week".
 */
export async function getDashboardAttention(
  supabase: SupabaseClient,
  { orgId, locale, currency, inventoryVisible, recipeVisible, fiscalnetEnabled }: Params
): Promise<DashboardAttentionItem[]> {
  const ro = locale === "ro";
  const items: DashboardAttentionItem[] = [];
  const fiscalSince = new Date(Date.now() - FISCAL_ATTENTION_DAYS * 86_400_000);

  const [vatReviewResult, complianceResult, lastClosedResult, lowStockResult, recipeCostedProductsResult, existingRecipesResult, fiscalErrorResult] =
    await Promise.all([
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("organisation_id", orgId)
        .eq("active", true)
        .eq("is_sellable", true)
        .in("vat_status", ["pending", "ambiguous"]),
      supabase.from("organisations").select("compliance_enforcement_at").eq("id", orgId).maybeSingle(),
      supabase
        .from("pos_sessions")
        .select("cash_difference")
        .eq("organisation_id", orgId)
        .eq("status", "closed")
        .order("closed_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      inventoryVisible
        ? supabase
            .from("products")
            .select("id,name,current_stock_qty,reorder_level")
            .eq("organisation_id", orgId)
            .eq("active", true)
            .or("is_stock_tracked.eq.true,is_ingredient.eq.true")
        : Promise.resolve({ data: [] as { id: string; name: string; current_stock_qty: number | null; reorder_level: number | null }[] }),
      recipeVisible
        ? supabase
            .from("products")
            .select("id")
            .eq("organisation_id", orgId)
            .eq("active", true)
            .eq("is_sellable", true)
            .eq("is_ingredient", false)
        : Promise.resolve({ data: [] as { id: string }[] }),
      recipeVisible
        ? supabase.from("recipes").select("product_id").eq("organisation_id", orgId).not("product_id", "is", null)
        : Promise.resolve({ data: [] as { product_id: string | null }[] }),
      fiscalnetEnabled
        ? supabase
            .from("pos_transactions")
            .select("id", { count: "exact", head: true })
            .eq("organisation_id", orgId)
            .eq("status", "completed")
            .or(fiscalNotConfirmedFilter())
            .gte("sold_at", fiscalSince.toISOString())
        : Promise.resolve({ count: 0 }),
    ]);

  // 1. VAT / fiscal setup problems
  const vatReviewCount = vatReviewResult.count ?? 0;
  if (vatReviewCount > 0) {
    const enforcementAt = complianceResult.data?.compliance_enforcement_at ?? null;
    const days = enforcementAt ? Math.ceil((new Date(enforcementAt).getTime() - Date.now()) / 86_400_000) : null;
    const soon = days !== null && days <= 3;
    items.push({
      severity: soon ? "critical" : "warning",
      href: "/app/settings?tab=data-repair",
      message: ro
        ? days !== null && days > 0
          ? `${vatReviewCount} produs(e) au nevoie de validare TVA — devin nevandabile în ${days} ${days === 1 ? "zi" : "zile"}.`
          : `${vatReviewCount} produs(e) au nevoie de validare TVA.`
        : days !== null && days > 0
          ? `${vatReviewCount} product(s) need VAT approval — sellable for ${days} more day${days === 1 ? "" : "s"}.`
          : `${vatReviewCount} product(s) need VAT approval.`,
    });
  }

  // 2. Low stock
  if (inventoryVisible) {
    const lowStock = (lowStockResult.data ?? []).filter(
      (p) => Number(p.reorder_level ?? 0) > 0 && Number(p.current_stock_qty ?? 0) <= Number(p.reorder_level ?? 0)
    );
    if (lowStock.length > 0) {
      items.push({
        severity: "warning",
        href: "/app/stock",
        message: ro ? `${lowStock.length} articol(e) sub pragul de reaprovizionare.` : `${lowStock.length} item(s) at or below reorder level.`,
      });
    }
  }

  // 3. Cash discrepancy at last till close
  const lastDiff = Number(lastClosedResult.data?.cash_difference ?? 0);
  if (lastClosedResult.data && Math.abs(lastDiff) >= 0.01) {
    items.push({
      severity: Math.abs(lastDiff) > 5 ? "critical" : "warning",
      href: "/app/reports/registru-de-casa",
      message: ro
        ? `Diferență de numerar la ultima închidere: ${lastDiff >= 0 ? "+" : "−"}${money(lastDiff, currency)}.`
        : `Cash difference at the last till close: ${lastDiff >= 0 ? "+" : "−"}${money(lastDiff, currency)}.`,
    });
  }

  // 4. Products missing a recipe
  if (recipeVisible) {
    const recipedProductIds = new Set((existingRecipesResult.data ?? []).map((r) => r.product_id));
    const missing = (recipeCostedProductsResult.data ?? []).filter((p) => !recipedProductIds.has(p.id));
    if (missing.length > 0) {
      items.push({
        severity: "warning",
        href: "/app/recipes",
        message: ro ? `${missing.length} produs(e) fără rețetă.` : `${missing.length} product(s) missing a recipe.`,
      });
    }
  }

  // 5. Sales without a confirmed fiscal receipt (last FISCAL_ATTENTION_DAYS days).
  // The till lists them with "Trimite bonul din nou"; the resend has to run on
  // the till PC, where the FiscalNet agent is.
  const fiscalErrorCount = fiscalErrorResult.count ?? 0;
  if (fiscalnetEnabled && fiscalErrorCount > 0) {
    items.push({
      severity: "critical",
      href: "/app/pos",
      message: ro
        ? `${fiscalErrorCount} vânzare(i) fără bon fiscal confirmat — verifică casa de marcat și retrimite din Casă.`
        : `${fiscalErrorCount} sale(s) without a confirmed fiscal receipt — check the printer and resend from the till.`,
    });
  }

  return items;
}
