// Supabase-backed store and wiring for SALUT TECH's own e-Factura queue.
// Off unless PLATFORM_BILLING_ORG_ID is set: until SALUT TECH exists as an
// organisation and the accountant has confirmed the VAT category, nothing runs.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { UblAddress } from "@/lib/anaf/ubl-builder";
import { sendPlainAlert } from "@/lib/email/plain-alert";
import { PLATFORM_SELLER } from "@/lib/legal/controller";
import type { PlatformInvoiceConfig } from "@/lib/billing/platform-invoice";
import type { PlatformInvoiceStore, QueueDeps, StoredInvoice } from "@/lib/billing/platform-invoice-queue";

type Row = {
  id: string;
  invoice_number: string;
  issued_at: string | null;
  upload_status: string;
  stripe_invoice_id: string | null;
  storno_of: string | null;
  issue_date: string;
  currency: string | null;
  buyer_name: string;
  buyer_cif: string;
  buyer_address: (UblAddress & { buyerTaxId?: string | null }) | null;
  line_items: StoredInvoice["lines"];
  note: string | null;
};

const COLUMNS = "id,invoice_number,issued_at,upload_status,stripe_invoice_id,storno_of,issue_date,currency,buyer_name,buyer_cif,buyer_address,line_items,note";

function toStored(r: Row): StoredInvoice {
  const { buyerTaxId, ...address } = r.buyer_address ?? ({} as UblAddress & { buyerTaxId?: string | null });
  return {
    id: r.id, invoiceNumber: r.invoice_number, issued: Boolean(r.issued_at), uploadStatus: r.upload_status,
    stripeInvoiceId: r.stripe_invoice_id, stornoOf: r.storno_of, issueDate: r.issue_date, currency: r.currency ?? "RON",
    buyerName: r.buyer_name, buyerCif: r.buyer_cif, buyerTaxId: buyerTaxId ?? null,
    buyerAddress: r.buyer_address ? (address as UblAddress) : null, lines: r.line_items ?? [], note: r.note,
  };
}

export function supabasePlatformInvoiceStore(db: SupabaseClient, orgId: string): PlatformInvoiceStore {
  return {
    async insert(row) {
      const { data, error } = await db.from("efactura_invoices").insert({
        organisation_id: orgId,
        invoice_number: row.draftNumber,
        invoice_type: "380",
        issue_date: row.issueDate,
        buyer_cif: row.buyerCif,
        buyer_name: row.buyerName,
        buyer_address: row.buyerAddress ? { ...row.buyerAddress, buyerTaxId: row.buyerTaxId } : null,
        line_items: row.lines,
        total_excl_vat: row.totalInclVat,
        total_vat: 0,
        total_incl_vat: row.totalInclVat,
        currency: row.currency,
        upload_status: row.uploadStatus,
        error_message: row.errorMessage,
        stripe_invoice_id: row.stripeInvoiceId,
        storno_of: row.stornoOf,
        note: row.note,
      }).select("id").single();
      if (error?.code === "23505") return "conflict";
      if (error || !data) throw new Error(`platform invoice insert failed: ${error?.message}`);
      return { id: data.id as string };
    },
    async findByStripeInvoiceId(stripeInvoiceId) {
      const { data, error } = await db.from("efactura_invoices").select(COLUMNS)
        .eq("organisation_id", orgId).eq("stripe_invoice_id", stripeInvoiceId).maybeSingle();
      if (error) throw new Error(`platform invoice lookup failed: ${error.message}`);
      return data ? toStored(data as Row) : null;
    },
    async findStornoOf(invoiceId) {
      const { data, error } = await db.from("efactura_invoices").select(COLUMNS)
        .eq("organisation_id", orgId).eq("storno_of", invoiceId).maybeSingle();
      if (error) throw new Error(`platform storno lookup failed: ${error.message}`);
      return data ? toStored(data as Row) : null;
    },
    async issue(invoiceId) {
      const { data, error } = await db.rpc("issue_sales_invoice", { p_org_id: orgId, p_actor_id: null, p_invoice_id: invoiceId });
      if (error) throw new Error(`issue_sales_invoice failed: ${error.message}`);
      return { invoiceNumber: String((data as { invoice_number?: string } | null)?.invoice_number ?? "") };
    },
    async saveXml(invoiceId, xml) {
      // "ready" = numbered and built; uploading is a separate, explicit step.
      const { error } = await db.from("efactura_invoices")
        .update({ xml_content: xml, upload_status: "ready", updated_at: new Date().toISOString() })
        .eq("organisation_id", orgId).eq("id", invoiceId).in("upload_status", ["draft", "ready"]);
      if (error) throw new Error(`platform invoice save failed: ${error.message}`);
    },
  };
}

/** Null when platform invoicing is not switched on. */
export function platformInvoiceDeps(db: SupabaseClient): QueueDeps | null {
  const orgId = process.env.PLATFORM_BILLING_ORG_ID?.trim();
  if (!orgId) return null;
  const vatCategory = process.env.PLATFORM_VAT_CATEGORY === "E" ? "E" : "O";
  const config: PlatformInvoiceConfig = { vatCategory, exemptionReason: process.env.PLATFORM_VAT_EXEMPTION_REASON?.trim() || undefined };
  return {
    store: supabasePlatformInvoiceStore(db, orgId),
    config,
    seller: { name: PLATFORM_SELLER.name, taxId: PLATFORM_SELLER.cui, legalId: PLATFORM_SELLER.cui, legalForm: PLATFORM_SELLER.regCom, address: { ...PLATFORM_SELLER.address } },
    alert: async (subject, body) => {
      const sent = await sendPlainAlert(subject, body);
      if (!sent) console.error("platform_invoice_alert_failed", subject);
    },
  };
}
