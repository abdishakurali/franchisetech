"use server";

import { revalidatePath } from "next/cache";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { assertEntitlement, EntitlementDeniedError } from "@/lib/billing/entitlement-resolver";
import { createServiceClient } from "@/lib/supabase/server";
import { toStockQuantity } from "@/lib/invoice-stock-units";

export type FreeIssueLineInput = { productId: string; name: string; quantity: number; unitCode: string };

export type FreeIssueInput = {
  /** Generated once per form submission and reused on retry. */
  idempotencyKey: string;
  issueDate: string;
  recipientName?: string;
  reason: string;
  lines: FreeIssueLineInput[];
};

export type FreeIssueResult =
  | { ok: true; documentNumber: string; idempotent: boolean }
  | { ok: false; error: string };

function freeIssueErrorMessage(message: string): string {
  if (message.includes("FREE_ISSUE_REASON_REQUIRED")) return "Completați motivul transferului.";
  if (message.includes("FREE_ISSUE_LINES_REQUIRED")) return "Adăugați cel puțin un produs.";
  if (message.includes("FREE_ISSUE_PRODUCT_NOT_FOUND")) return "Un produs nu mai există în catalog.";
  if (message.includes("FREE_ISSUE_QUANTITY_INVALID")) return "Cantitățile trebuie să fie mai mari decât zero.";
  return "Transferul nu a fost înregistrat. Încercați din nou — stocul nu va fi scăzut de două ori.";
}

/**
 * "Transfer gratuit": goods leave stock at cost (CMP) with no revenue and no
 * invoice / e-Factura. One atomic, idempotent RPC writes the numbered
 * document and its stock movements together.
 */
export async function postFreeIssue(input: FreeIssueInput): Promise<FreeIssueResult> {
  const { supabase, orgId, membership, user } = await getKitchenOpsContext();
  if (!["owner", "manager"].includes(membership.role ?? "")) {
    return { ok: false, error: "Doar managerul sau proprietarul poate înregistra transferuri gratuite." };
  }
  try {
    await assertEntitlement(orgId, "inventory.enabled");
  } catch (error) {
    if (error instanceof EntitlementDeniedError) return { ok: false, error: error.body.error };
    throw error;
  }
  if (!input.idempotencyKey) return { ok: false, error: "Reîncărcați pagina și încercați din nou." };
  if (!input.reason.trim()) return { ok: false, error: "Completați motivul transferului." };
  if (!input.lines.length) return { ok: false, error: "Adăugați cel puțin un produs." };

  const ids = [...new Set(input.lines.map((l) => l.productId))];
  const { data: products, error: productError } = await supabase
    .from("products")
    .select("id,unit_of_measure")
    .eq("organisation_id", orgId)
    .in("id", ids);
  if (productError) return { ok: false, error: "Produsele nu au putut fi verificate. Încercați din nou." };
  const unitById = new Map((products ?? []).map((p) => [String(p.id), (p.unit_of_measure as string | null) ?? "each"]));

  const lines = [];
  for (const [i, line] of input.lines.entries()) {
    if (!unitById.has(line.productId)) return { ok: false, error: `Linia ${i + 1}: produsul nu mai există în catalog.` };
    const converted = toStockQuantity(line.quantity, line.unitCode, unitById.get(line.productId));
    if (!converted.ok) return { ok: false, error: `Linia ${i + 1}: ${converted.error}` };
    lines.push({ productId: line.productId, name: line.name, quantity: line.quantity, unitCode: line.unitCode, stockQty: converted.stockQty });
  }

  const service = await createServiceClient();
  const { data, error } = await service.rpc("post_stock_free_issue", {
    p_org_id: orgId,
    p_actor_id: user.id,
    p_document: {
      idempotency_key: input.idempotencyKey,
      issue_date: input.issueDate,
      recipient_name: input.recipientName ?? "",
      reason: input.reason,
      lines,
    },
  });
  if (error) {
    console.error("[stock] post_stock_free_issue failed", { orgId, message: error.message });
    return { ok: false, error: freeIssueErrorMessage(error.message ?? "") };
  }
  const result = data as { document_number: string; idempotent: boolean };
  revalidatePath("/app/invoices/free-issue");
  revalidatePath("/app/products");
  return { ok: true, documentNumber: result.document_number, idempotent: result.idempotent };
}
