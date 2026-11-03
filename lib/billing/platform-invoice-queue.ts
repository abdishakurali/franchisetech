// Queues SALUT TECH's e-Factura for a paid (or refunded) Stripe invoice.
// Exactly-once comes from the store: a unique Stripe invoice id per draft and
// one storno per invoice, both enforced by the database. Nothing here uploads
// to ANAF — upload is a separate, later step on rows marked "ready".

import { buildInvoiceXml, type UblAddress, type UblLineItem, type UblParty } from "@/lib/anaf/ubl-builder";
import { bucharestDate, mapStripeInvoice, type PlatformInvoiceConfig, type StripeInvoiceLike } from "@/lib/billing/platform-invoice";

export type StoredInvoice = {
  id: string;
  invoiceNumber: string;
  issued: boolean;
  uploadStatus: string;
  stripeInvoiceId: string | null;
  stornoOf: string | null;
  issueDate: string;
  currency: string;
  buyerName: string;
  buyerCif: string;
  buyerTaxId: string | null;
  buyerAddress: UblAddress | null;
  lines: UblLineItem[];
  note: string | null;
};

export type NewInvoiceRow = Omit<StoredInvoice, "id" | "invoiceNumber" | "issued"> & {
  draftNumber: string;
  errorMessage: string | null;
  totalInclVat: number;
};

export interface PlatformInvoiceStore {
  /** Insert; returns "conflict" if the unique Stripe id / one-storno rule already holds a row. */
  insert(row: NewInvoiceRow): Promise<{ id: string } | "conflict">;
  findByStripeInvoiceId(stripeInvoiceId: string): Promise<StoredInvoice | null>;
  findStornoOf(invoiceId: string): Promise<StoredInvoice | null>;
  /** Assigns the next number under a lock (issue_sales_invoice). Idempotent. */
  issue(invoiceId: string): Promise<{ invoiceNumber: string }>;
  saveXml(invoiceId: string, xml: string): Promise<void>;
}

export type QueueDeps = {
  store: PlatformInvoiceStore;
  seller: UblParty;
  config: PlatformInvoiceConfig;
  alert: (subject: string, body: string) => Promise<void>;
};

export type QueueResult =
  | { status: "skipped"; reason: string }
  | { status: "needs_data"; reason: string; invoiceId?: string }
  | { status: "ready"; invoiceId: string; invoiceNumber: string; resumed: boolean };

const PAYMENT_TERMS = "Plătit cu cardul la data emiterii.";

async function finish(deps: QueueDeps, row: StoredInvoice, resumed: boolean): Promise<QueueResult> {
  const { invoiceNumber } = await deps.store.issue(row.id);
  if (!row.buyerAddress) throw new Error("ready invoice without buyer address");
  const xml = buildInvoiceXml({
    invoiceNumber,
    issueDate: row.issueDate,
    currency: row.currency,
    seller: deps.seller,
    buyer: { name: row.buyerName, taxId: row.buyerTaxId ?? row.buyerCif, legalId: row.buyerCif, address: row.buyerAddress },
    lines: row.lines,
    note: row.note ?? undefined,
    paymentTerms: PAYMENT_TERMS,
    exemptionReason: deps.config.exemptionReason,
  });
  await deps.store.saveXml(row.id, xml);
  return { status: "ready", invoiceId: row.id, invoiceNumber, resumed };
}

export async function queuePlatformInvoice(inv: StripeInvoiceLike, deps: QueueDeps): Promise<QueueResult> {
  const mapping = mapStripeInvoice(inv, deps.config);
  if (mapping.kind === "skip") return { status: "skipped", reason: mapping.reason };

  const existing = await deps.store.findByStripeInvoiceId(inv.id);
  if (existing) {
    if (existing.uploadStatus === "needs_data") return { status: "needs_data", reason: "already held", invoiceId: existing.id };
    return finish(deps, existing, true);
  }

  const ready = mapping.kind === "ready" ? mapping.draft : null;
  const inserted = await deps.store.insert({
    stripeInvoiceId: inv.id,
    stornoOf: null,
    draftNumber: `CIORNA-${inv.id}`,
    uploadStatus: ready ? "draft" : "needs_data",
    errorMessage: ready ? null : mapping.kind === "needs_data" ? mapping.reason : null,
    issueDate: ready?.issueDate ?? new Date().toISOString().slice(0, 10),
    currency: ready?.currency ?? inv.currency.toUpperCase(),
    buyerName: ready?.buyerName ?? (inv.customer_name ?? "").trim(),
    buyerCif: ready?.buyerCif ?? "",
    buyerTaxId: ready?.buyerTaxId ?? null,
    buyerAddress: ready?.buyerAddress ?? null,
    lines: ready?.lines ?? [],
    totalInclVat: inv.amount_paid / 100,
    note: null,
  });

  if (inserted === "conflict") {
    // A concurrent delivery of the same event won the insert; finish its row.
    const winner = await deps.store.findByStripeInvoiceId(inv.id);
    if (!winner) throw new Error(`conflict without a row for ${inv.id}`);
    if (winner.uploadStatus === "needs_data") return { status: "needs_data", reason: "already held", invoiceId: winner.id };
    return finish(deps, winner, true);
  }

  if (!ready) {
    const reason = mapping.kind === "needs_data" ? mapping.reason : "unknown";
    await deps.alert(
      `Factură oprită: ${inv.customer_name ?? inv.id}`,
      `Plata Stripe ${inv.id} (${inv.amount_paid / 100} ${inv.currency.toUpperCase()}) nu a primit e-Factura: ${reason} Completați datele clientului în Stripe; factura se reia la următoarea încercare.`,
    );
    return { status: "needs_data", reason, invoiceId: inserted.id };
  }

  const row = await deps.store.findByStripeInvoiceId(inv.id);
  if (!row) throw new Error(`inserted row missing for ${inv.id}`);
  return finish(deps, row, false);
}

/** Full refund → one storno (negative) invoice of the original, once. */
export async function queuePlatformStorno(stripeInvoiceId: string, deps: QueueDeps): Promise<QueueResult> {
  const original = await deps.store.findByStripeInvoiceId(stripeInvoiceId);
  if (!original) return { status: "skipped", reason: "no invoice was issued for this payment" };
  if (!original.issued) {
    await deps.alert(`Rambursare fără factură emisă: ${stripeInvoiceId}`, `Plata ${stripeInvoiceId} a fost rambursată, dar factura nu fusese emisă. Verificați manual.`);
    return { status: "needs_data", reason: "original not issued", invoiceId: original.id };
  }
  const existing = await deps.store.findStornoOf(original.id);
  if (existing) return finish(deps, existing, true);

  const inserted = await deps.store.insert({
    stripeInvoiceId: null,
    stornoOf: original.id,
    draftNumber: `CIORNA-STORNO-${original.id}`,
    uploadStatus: "draft",
    errorMessage: null,
    issueDate: bucharestDate(Date.now() / 1000),
    currency: original.currency,
    buyerName: original.buyerName,
    buyerCif: original.buyerCif,
    buyerTaxId: original.buyerTaxId,
    buyerAddress: original.buyerAddress,
    lines: original.lines.map((l) => ({ ...l, quantity: -l.quantity })),
    totalInclVat: -original.lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0),
    note: `Stornare factura ${original.invoiceNumber}`,
  });
  // Whether we inserted it or a concurrent refund event did, finish that one row.
  const storno = await deps.store.findStornoOf(original.id);
  if (!storno) throw new Error(`storno row missing for ${original.id}`);
  return finish(deps, storno, inserted === "conflict");
}
