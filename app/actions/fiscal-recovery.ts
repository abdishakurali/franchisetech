"use server";

/**
 * Re-issue the fiscal receipt for a sale that was saved but never got one
 * (incident 2026-11-12). The server only lists and prepares; the browser sends
 * to the FiscalNet agent on the cashier PC (localhost:65400) and records the
 * outcome with recordFiscalReceiptAttempt → record_fiscal_receipt_attempt,
 * exactly like a live sale. Nothing here calls FiscalNet.
 */

import { getActiveOrg } from "@/lib/kitchenops/data";
import { isFiscalNetActive } from "@/lib/fiscalnet/eligibility";
import { requireActiveSite } from "@/lib/site-context";
import { listActiveVatRates } from "@/lib/vat-rates-server";
import {
  fiscalItemsFromSaleLines,
  missingReceiptVerdict,
  MISSING_RECEIPT_MIN_AGE_MS,
  MISSING_RECEIPT_WINDOW_MS,
  RECOVERABLE_FISCAL_STATUSES,
  saleLineFromStoredItem,
  vatRateGroupMapFrom,
  type MissingReceiptAttempt,
} from "@/lib/fiscalnet/missing-receipt";

export type SaleMissingFiscalReceipt = {
  id: string;
  transaction_number: string;
  sold_at: string;
  total: number;
  status: string;
};

export type FiscalRetryPayload = {
  ok: true;
  transactionId: string;
  transactionNumber: string;
  items: ReturnType<typeof fiscalItemsFromSaleLines>;
  total: number;
  paymentType: string;
  paymentCode: number | null;
  attemptNumber: number;
  mockMode: boolean;
};

function canManage(role: string | null | undefined): boolean {
  return role === "owner" || role === "manager";
}

const TX_COLUMNS = "id,transaction_number,sold_at,total,status,site_id,fiscal_receipt_required,fiscal_receipt_status,payment_method_id";

async function loadContext() {
  const ctx = await getActiveOrg();
  if (!canManage(ctx.membership.role as string)) return null;
  const { data: org } = await ctx.supabase
    .from("organisations")
    .select("country_code,fiscalnet_enabled,fiscalnet_mock_mode")
    .eq("id", ctx.orgId)
    .single();
  const row = org as { country_code?: string | null; fiscalnet_enabled?: boolean | null; fiscalnet_mock_mode?: boolean | null } | null;
  if (!row || !isFiscalNetActive(row.country_code, row.fiscalnet_enabled)) return null;
  const { siteId } = await requireActiveSite(ctx.supabase, ctx.orgId, ctx.membership.id, ctx.membership.role);
  // Same default as completeSaleReturn and the POS page: anything but an explicit false is mock.
  return { ...ctx, siteId, orgMockMode: row.fiscalnet_mock_mode !== false };
}

/** Completed sales of the last 7 days at the active site that still have no fiscal receipt. */
export async function listSalesMissingFiscalReceipt(): Promise<{ ok: boolean; sales: SaleMissingFiscalReceipt[] }> {
  const ctx = await loadContext();
  if (!ctx) return { ok: false, sales: [] };
  const now = Date.now();

  const { data: txs, error } = await ctx.supabase
    .from("pos_transactions")
    .select(TX_COLUMNS)
    .eq("organisation_id", ctx.orgId)
    .eq("site_id", ctx.siteId)
    .eq("status", "completed")
    .eq("fiscal_receipt_required", true)
    .in("fiscal_receipt_status", [...RECOVERABLE_FISCAL_STATUSES])
    .gte("sold_at", new Date(now - MISSING_RECEIPT_WINDOW_MS).toISOString())
    .lte("sold_at", new Date(now - MISSING_RECEIPT_MIN_AGE_MS).toISOString())
    .order("sold_at", { ascending: false })
    .limit(50);
  if (error || !txs?.length) return { ok: !error, sales: [] };

  const rows = txs as unknown as Array<Record<string, unknown>>;
  const ids = rows.map((t) => t.id as string);
  const { data: attempts, error: attemptsError } = await ctx.supabase
    .from("fiscal_receipt_attempts")
    .select("transaction_id,status,mock_mode")
    .eq("organisation_id", ctx.orgId)
    .in("transaction_id", ids);
  // Without the attempts we cannot tell whether a receipt exists: show nothing.
  if (attemptsError) return { ok: false, sales: [] };

  const byTx = new Map<string, MissingReceiptAttempt[]>();
  for (const a of (attempts ?? []) as Array<{ transaction_id: string } & MissingReceiptAttempt>) {
    const list = byTx.get(a.transaction_id) ?? [];
    list.push(a);
    byTx.set(a.transaction_id, list);
  }

  const sales = rows
    .filter((t) =>
      missingReceiptVerdict(
        {
          status: t.status as string | null,
          sold_at: t.sold_at as string | null,
          fiscal_receipt_required: t.fiscal_receipt_required as boolean | null,
          fiscal_receipt_status: t.fiscal_receipt_status as string | null,
        },
        byTx.get(t.id as string) ?? [],
        { orgMockMode: ctx.orgMockMode, now },
      ).eligible,
    )
    .map((t) => ({
      id: t.id as string,
      transaction_number: (t.transaction_number as string) ?? "",
      sold_at: t.sold_at as string,
      total: Number(t.total),
      status: t.fiscal_receipt_status as string,
    }));
  return { ok: true, sales };
}

/**
 * Re-checks eligibility for one sale and returns exactly what the live sale
 * path hands the browser (CompleteSaleResult.items / total / paymentType plus
 * the payment method's FiscalNet code), rebuilt from the saved sale lines with
 * the same mapping (fiscalItemsFromSaleLines).
 */
export async function getFiscalRetryPayload(
  transactionId: string,
): Promise<FiscalRetryPayload | { ok: false; error: string }> {
  if (!transactionId) return { ok: false, error: "Lipsește vânzarea." };
  const ctx = await loadContext();
  if (!ctx) return { ok: false, error: "Permisiune refuzată." };

  const { data: tx } = await ctx.supabase
    .from("pos_transactions")
    .select(`${TX_COLUMNS},payment_methods(type,fiscalnet_code)`)
    .eq("id", transactionId)
    .eq("organisation_id", ctx.orgId)
    .eq("site_id", ctx.siteId)
    .maybeSingle();
  if (!tx) return { ok: false, error: "Vânzarea nu a fost găsită." };
  const t = tx as unknown as Record<string, unknown>;

  const { data: attempts, error: attemptsError } = await ctx.supabase
    .from("fiscal_receipt_attempts")
    .select("status,mock_mode,attempt_number")
    .eq("organisation_id", ctx.orgId)
    .eq("transaction_id", transactionId);
  if (attemptsError) return { ok: false, error: "Nu am putut verifica încercările anterioare. Reîncercați." };
  const attemptRows = (attempts ?? []) as Array<MissingReceiptAttempt & { attempt_number: number | null }>;

  const verdict = missingReceiptVerdict(
    {
      status: t.status as string | null,
      sold_at: t.sold_at as string | null,
      fiscal_receipt_required: t.fiscal_receipt_required as boolean | null,
      fiscal_receipt_status: t.fiscal_receipt_status as string | null,
    },
    attemptRows,
    { orgMockMode: ctx.orgMockMode, now: Date.now() },
  );
  if (!verdict.eligible) {
    const why: Record<typeof verdict.reason, string> = {
      voided: "Vânzarea a fost anulată.",
      not_required: "Vânzarea nu necesită bon fiscal.",
      status: "Starea bonului s-a schimbat; lista se actualizează.",
      too_recent: "Vânzarea este prea recentă; bonul poate fi încă în curs de trimitere.",
      too_old: "Vânzarea este mai veche de 7 zile.",
      has_receipt: "Există deja un bon fiscal emis pentru această vânzare.",
    };
    return { ok: false, error: why[verdict.reason] };
  }

  const { data: itemRows, error: itemsError } = await ctx.supabase
    .from("pos_transaction_items")
    .select("product_name,quantity,unit_price,vat_rate,discount_pct,created_at")
    .eq("organisation_id", ctx.orgId)
    .eq("transaction_id", transactionId)
    .order("created_at", { ascending: true });
  if (itemsError || !itemRows?.length) return { ok: false, error: "Liniile vânzării nu au putut fi citite." };

  const groupMap = vatRateGroupMapFrom(await listActiveVatRates(ctx.supabase, ctx.orgId));
  const items = fiscalItemsFromSaleLines(
    (itemRows as Array<Record<string, unknown>>).map((row) =>
      saleLineFromStoredItem(
        {
          product_name: row.product_name,
          quantity: row.quantity,
          unit_price: row.unit_price,
          vat_rate: row.vat_rate,
          discount_pct: row.discount_pct,
        },
        groupMap,
      ),
    ),
  );

  const method = (Array.isArray(t.payment_methods) ? t.payment_methods[0] : t.payment_methods) as
    | { type?: string | null; fiscalnet_code?: number | null }
    | null;
  const maxAttempt = attemptRows.reduce((m, a) => Math.max(m, Number(a.attempt_number ?? 0)), 0);

  return {
    ok: true,
    transactionId,
    transactionNumber: (t.transaction_number as string) ?? "",
    items,
    total: Number(t.total),
    // Live path: the selected payment method's type, "other" when none.
    paymentType: method?.type ?? "other",
    paymentCode: method?.fiscalnet_code ?? null,
    // Count + 1, and never below an existing number: (transaction_id, attempt_number) is unique.
    attemptNumber: Math.max(attemptRows.length, maxAttempt) + 1,
    mockMode: ctx.orgMockMode,
  };
}
