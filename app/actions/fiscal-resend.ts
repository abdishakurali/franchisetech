"use server";

/**
 * Send a fiscal receipt again for a sale whose receipt was never confirmed.
 *
 * Two steps around the browser's call to the local FiscalNet agent (the server
 * never calls FiscalNet itself; CLAUDE.md):
 *   1. beginFiscalReceiptResend — permission + "printer checked" confirmation,
 *      then begin_fiscal_receipt_resend locks the sale, writes a `pending`
 *      attempt row and moves the sale to `printing`. Returns the receipt lines
 *      rebuilt from the saved sale.
 *   2. finishFiscalReceiptResend — records FiscalNet's answer on that attempt
 *      row and sets the sale's status.
 * Rules and texts: lib/fiscalnet/resend.ts.
 */

import { revalidatePath } from "next/cache";
import { getActiveOrg, stringValue } from "@/lib/kitchenops/data";
import { createServiceClient } from "@/lib/supabase/server";
import { isFiscalNetActive } from "@/lib/fiscalnet/eligibility";
import {
  PRINTER_CHECKED_VALUE,
  RESEND_STUCK_PENDING_MS,
  buildResendItems,
  resendErrorMessage,
  resendPermission,
  type ResendItemRow,
} from "@/lib/fiscalnet/resend";

export type BeginResendResult =
  | { ok: false; message: string }
  | {
      ok: true;
      attemptId: string;
      attemptNumber: number;
      transactionNumber: string;
      total: number;
      paymentType: string;
      paymentCode: number | null;
      items: ReturnType<typeof buildResendItems>;
    };

async function openSessionIdFor(
  supabase: Awaited<ReturnType<typeof getActiveOrg>>["supabase"],
  orgId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("pos_sessions")
    .select("id")
    .eq("organisation_id", orgId)
    .eq("status", "open")
    .order("opened_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.id as string | undefined) ?? null;
}

export async function beginFiscalReceiptResend(formData: FormData): Promise<BeginResendResult> {
  const transactionId = stringValue(formData, "transaction_id");
  if (!transactionId) return { ok: false, message: "Lipsește vânzarea." };
  if (stringValue(formData, "printer_checked") !== PRINTER_CHECKED_VALUE) {
    return { ok: false, message: "Confirmați întâi că ați verificat casa de marcat." };
  }

  const { supabase, orgId, membership, user } = await getActiveOrg();
  const orgRow = (Array.isArray(membership.organisations) ? membership.organisations[0] : membership.organisations) as
    | Record<string, unknown>
    | null;
  if (!isFiscalNetActive((orgRow?.country_code as string) ?? null, orgRow?.fiscalnet_enabled as boolean | null | undefined)) {
    return { ok: false, message: "FiscalNet nu este activ." };
  }

  const isManager = membership.role === "owner" || membership.role === "manager";
  const permission = resendPermission(membership.role, isManager ? null : await openSessionIdFor(supabase, orgId));
  if (!permission.allowed) return { ok: false, message: "Nu aveți drept să retrimiteți bonuri fiscale." };

  const service = await createServiceClient();
  const { data: begun, error } = await service.rpc("begin_fiscal_receipt_resend", {
    p_org_id: orgId,
    p_transaction_id: transactionId,
    p_performed_by: user.id,
    p_required_session_id: permission.requiredSessionId,
    p_stuck_minutes: Math.round(RESEND_STUCK_PENDING_MS / 60_000),
  });
  if (error || !begun) {
    console.warn("[FiscalNet] begin_fiscal_receipt_resend refused", { transactionId, error: error?.message });
    return { ok: false, message: resendErrorMessage(error?.message) };
  }
  const { attempt_id: attemptId, attempt_number: attemptNumber } = begun as { attempt_id: string; attempt_number: number };

  const [{ data: tx }, { data: vatRates }] = await Promise.all([
    service
      .from("pos_transactions")
      .select("transaction_number,total,payment_methods(type,fiscalnet_code),pos_transaction_items(product_name,quantity,unit_price,vat_rate,discount_pct,created_at)")
      .eq("id", transactionId)
      .eq("organisation_id", orgId)
      .single(),
    service.from("vat_rates").select("rate,fiscalnet_vat_group").eq("organisation_id", orgId).eq("active", true),
  ]);

  const items = ((tx?.pos_transaction_items ?? []) as Array<ResendItemRow & { created_at?: string | null }>)
    .slice()
    .sort((a, b) => String(a.created_at ?? "").localeCompare(String(b.created_at ?? "")));
  const vatRateGroupMap: Record<number, number> = Object.fromEntries(
    ((Array.isArray(vatRates) ? vatRates : []) as Array<{ rate: number | string; fiscalnet_vat_group: number | null }>)
      .filter((r) => r.fiscalnet_vat_group != null)
      .map((r) => [Number(r.rate), r.fiscalnet_vat_group as number]),
  );
  const method = (Array.isArray(tx?.payment_methods) ? tx?.payment_methods[0] : tx?.payment_methods) as
    | { type?: string | null; fiscalnet_code?: number | null }
    | null
    | undefined;

  if (!tx || items.length === 0) {
    // Nothing can be sent: close the attempt so the sale does not stay in `printing`.
    await service.rpc("finish_fiscal_receipt_resend", {
      p_org_id: orgId,
      p_attempt_id: attemptId,
      p_status: "failed",
      p_response_content: null,
      p_receipt_number: null,
      p_error_code: "RESEND_NO_LINES",
      p_error_info: "resend: sale lines could not be read; nothing sent",
    });
    return { ok: false, message: "Liniile vânzării nu au putut fi citite. Nu s-a trimis nimic." };
  }

  return {
    ok: true,
    attemptId,
    attemptNumber,
    transactionNumber: String(tx.transaction_number ?? ""),
    total: Number(tx.total ?? 0),
    paymentType: method?.type ?? "other",
    paymentCode: method?.fiscalnet_code ?? null,
    items: buildResendItems(items, vatRateGroupMap),
  };
}

const FINISH_STATUSES = ["success", "failed", "timeout", "ambiguous", "mock_success"] as const;

export async function finishFiscalReceiptResend(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const attemptId = stringValue(formData, "attempt_id");
  const status = stringValue(formData, "status");
  if (!attemptId) return { ok: false, error: "Missing attempt id." };
  if (!(FINISH_STATUSES as readonly string[]).includes(status)) return { ok: false, error: `Invalid status: ${status}` };

  const { orgId } = await getActiveOrg();
  const service = await createServiceClient();
  const { error } = await service.rpc("finish_fiscal_receipt_resend", {
    p_org_id: orgId,
    p_attempt_id: attemptId,
    p_status: status,
    p_response_content: stringValue(formData, "response_content") || null,
    p_receipt_number: stringValue(formData, "receipt_number") || null,
    p_error_code: stringValue(formData, "error_code") || null,
    p_error_info: stringValue(formData, "error_info") || null,
  });
  if (error) {
    console.error("[FiscalNet] finish_fiscal_receipt_resend failed", error.message);
    return { ok: false, error: error.message };
  }
  revalidatePath("/app", "page");
  revalidatePath("/app/transactions", "page");
  return { ok: true };
}
