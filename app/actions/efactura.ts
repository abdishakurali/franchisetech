"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { buildInvoiceXml, computeInvoiceTotals } from "@/lib/anaf/ubl-builder";
import { validateXml, uploadDocument } from "@/lib/anaf/client";
import { lookupRomanianCompanyByCui } from "@/lib/anaf/company-lookup";
import { getOrgAccessToken, hasAnafCredentials, storeOrgTokens, revokeOrgTokens, exchangeCode } from "@/lib/anaf/auth";
import type { UblLineItem, UblAddress } from "@/lib/anaf/ubl-builder";
import { listActiveVatRates } from "@/lib/vat-rates-server";
import { ratesMatch } from "@/lib/vat-rates";
import { assertEntitlement } from "@/lib/billing/entitlement-resolver";
import { createServiceClient } from "@/lib/supabase/server";
import { toStockQuantity } from "@/lib/invoice-stock-units";
import { DRAFT_NUMBER_PREFIX } from "@/lib/invoice-numbering";
import { buildStornoLines } from "@/lib/invoice-storno";

export type EfacturaLineInput = {
  name: string;
  unitCode: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  /** Catalog product sold on this line — its stock is deducted once when the invoice is issued. */
  productId?: string;
};

export type CreateInvoiceDraftInput = {
  /** Optional: empty = the final number is assigned from the locked counter when the invoice is issued. */
  invoiceNumber?: string;
  issueDate: string;
  dueDate?: string;
  buyerCif: string;
  buyerName: string;
  buyerAddress?: {
    street: string;
    city: string;
    postalCode?: string;
    countrySubentity: string;
    countryCode: string;
  };
  lines: EfacturaLineInput[];
  note?: string;
  customerId?: string;
  buyerRegCom?: string;
  issuerName?: string;
  issuerIdDoc?: string;
  delegateName?: string;
  delegateIdDoc?: string;
};

type StockLineFields = { productId?: string; stockQty?: number; stockUnit?: string };

function draftInvoiceNumber(manual: string | undefined): string {
  const trimmed = (manual ?? "").trim();
  return trimmed || `${DRAFT_NUMBER_PREFIX}${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

/**
 * Resolves each product line's quantity into the product's stock unit
 * (e.g. 50 GRM → 0.05 kg). Throws a line-numbered Romanian error for an
 * unknown product or an incompatible unit, before anything is saved.
 */
async function resolveStockLines(
  supabase: Awaited<ReturnType<typeof getKitchenOpsContext>>["supabase"],
  orgId: string,
  lines: Array<{ productId?: string; quantity: number; unitCode: string }>,
): Promise<StockLineFields[]> {
  const ids = [...new Set(lines.map((l) => l.productId).filter((id): id is string => Boolean(id)))];
  const productUnits = new Map<string, string | null>();
  if (ids.length) {
    const { data, error } = await supabase
      .from("products")
      .select("id,unit_of_measure")
      .eq("organisation_id", orgId)
      .in("id", ids);
    if (error) throw new Error("Produsele nu au putut fi verificate. Încercați din nou.");
    for (const p of data ?? []) productUnits.set(String(p.id), (p.unit_of_measure as string | null) ?? null);
  }
  return lines.map((line, i) => {
    if (!line.productId) return {};
    if (!productUnits.has(line.productId)) throw new Error(`Linia ${i + 1}: produsul nu mai există în catalog.`);
    const productUnit = productUnits.get(line.productId) ?? "each";
    const converted = toStockQuantity(line.quantity, line.unitCode, productUnit);
    if (!converted.ok) throw new Error(`Linia ${i + 1}: ${converted.error}`);
    return { productId: line.productId, stockQty: converted.stockQty, stockUnit: productUnit ?? "each" };
  });
}

function canManage(role: string | null | undefined) {
  return ["owner", "manager"].includes(role ?? "");
}

function roTaxId(cui: string | null | undefined, vatRegistered: boolean): string {
  const clean = (cui ?? "").replace(/^RO/i, "").replace(/[^0-9]/g, "");
  if (!clean) return "—";
  return vatRegistered ? `RO${clean}` : clean;
}

async function assertEfacturaInstalled(
  supabase: Awaited<ReturnType<typeof getKitchenOpsContext>>["supabase"],
  orgId: string,
): Promise<void> {
  const { data: org } = await supabase
    .from("organisations")
    .select("efactura_enabled")
    .eq("id", orgId)
    .maybeSingle();
  if (!org?.efactura_enabled) throw new Error("Instalează e-Factura din Marketplace înainte de a emite facturi.");
}

export async function createInvoiceDraft(input: CreateInvoiceDraftInput): Promise<{ id: string }> {
  const { supabase, orgId, membership, user } = await getKitchenOpsContext();
  if (!canManage(membership.role)) redirect("/app/invoices");
  await assertEfacturaInstalled(supabase, orgId);
  await assertEntitlement(orgId, "fiscal.efactura");
  const activeVatRates = await listActiveVatRates(supabase, orgId);
  if (activeVatRates.length > 0) {
    const invalid = input.lines.find((line) => !activeVatRates.some((rate) => ratesMatch(rate.rate, line.vatRate)));
    if (invalid) throw new Error(`Cota TVA ${invalid.vatRate}% nu este activă în Setări.`);
  }

  const stockFields = await resolveStockLines(supabase, orgId, input.lines);
  const lines = input.lines.map((l, i) => ({
    id: i + 1,
    name: l.name,
    unitCode: l.unitCode,
    quantity: l.quantity,
    unitPrice: l.unitPrice,
    vatRate: l.vatRate,
    ...stockFields[i],
  })) satisfies Array<UblLineItem & StockLineFields>;

  const totals = computeInvoiceTotals(lines);

  const { data, error } = await supabase
    .from("efactura_invoices")
    .insert({
      organisation_id: orgId,
      invoice_number: draftInvoiceNumber(input.invoiceNumber),
      invoice_type: "380",
      issue_date: input.issueDate,
      due_date: input.dueDate ?? null,
      buyer_cif: input.buyerCif,
      buyer_name: input.buyerName,
      buyer_address: input.buyerAddress ?? null,
      line_items: lines,
      total_excl_vat: totals.totalExclVat,
      total_vat: totals.totalVat,
      total_incl_vat: totals.totalInclVat,
      upload_status: "draft",
      created_by: user.id,
      customer_id: input.customerId || null,
      buyer_reg_com: input.buyerRegCom?.trim() || null,
      issuer_name: input.issuerName?.trim() || null,
      issuer_id_doc: input.issuerIdDoc?.trim() || null,
      delegate_name: input.delegateName?.trim() || null,
      delegate_id_doc: input.delegateIdDoc?.trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    // Unique (organisation_id, invoice_number): also what stops a double-clicked
    // "Salvează" from creating two drafts.
    if (error.code === "23505") throw new Error(`Numărul de factură ${input.invoiceNumber ?? ""} există deja. Alegeți alt număr sau lăsați câmpul gol (număr automat).`);
    throw new Error(`Factura nu a putut fi salvată: ${error.message}`);
  }

  revalidatePath("/app/invoices");
  return { id: data.id };
}

export async function generateInvoiceXml(invoiceId: string): Promise<{
  valid: boolean;
  xml: string;
  errors: string[];
}> {
  const { supabase, orgId } = await getKitchenOpsContext();
  await assertEfacturaInstalled(supabase, orgId);
  await assertEntitlement(orgId, "fiscal.efactura");

  const { data: inv, error } = await supabase
    .from("efactura_invoices")
    .select("*")
    .eq("id", invoiceId)
    .eq("organisation_id", orgId)
    .single();
  if (error || !inv) throw new Error("Invoice not found");

  const { data: org } = await supabase
    .from("organisations")
    .select("name,company_legal_name,company_address,company_reg_com,company_share_capital,anaf_cif,fiscalnet_cif,anaf_vat_registered,country_code")
    .eq("id", orgId)
    .single();

  const sellerAddress: UblAddress = {
    street: org?.company_address ?? "—",
    city: "România",
    countrySubentity: "RO-B",
    countryCode: "RO",
  };
  const sellerCui = org?.anaf_cif ?? org?.fiscalnet_cif ?? null;

  const buyerAddr = inv.buyer_address as UblAddress | null;
  const buyerAddress: UblAddress = buyerAddr ?? {
    street: "—",
    city: "România",
    countrySubentity: "RO-B",
    countryCode: "RO",
  };

  const xml = buildInvoiceXml({
    invoiceNumber: inv.invoice_number,
    issueDate: inv.issue_date,
    dueDate: inv.due_date ?? undefined,
    seller: {
      name: org?.company_legal_name ?? org?.name ?? "—",
      taxId: roTaxId(sellerCui, Boolean(org?.anaf_vat_registered)),
      legalId: sellerCui ? roTaxId(sellerCui, false) : undefined,
      legalForm: [org?.company_reg_com, org?.company_share_capital ? `Capital social ${org.company_share_capital}` : null]
        .filter(Boolean).join(", ") || undefined,
      address: sellerAddress,
    },
    buyer: {
      name: inv.buyer_name,
      // As entered / returned by the ANAF lookup: "RO…" only for VAT payers.
      // A bare CUI is sent as the legal identifier, not as a VAT number.
      taxId: inv.buyer_cif.trim().toUpperCase(),
      legalId: inv.buyer_cif.trim().replace(/^RO/i, ""),
      address: buyerAddress,
    },
    lines: (inv.line_items as UblLineItem[]),
    note: (inv.note as string | null) ?? undefined,
  });

  const validation = await validateXml(xml);

  await supabase
    .from("efactura_invoices")
    .update({ xml_content: xml, updated_at: new Date().toISOString() })
    .eq("id", invoiceId)
    .eq("organisation_id", orgId);

  return { valid: validation.valid, xml, errors: validation.errors };
}

export async function submitInvoiceToAnaf(invoiceId: string): Promise<{ indexIncarcare: number }> {
  const { supabase, orgId } = await getKitchenOpsContext();
  await assertEfacturaInstalled(supabase, orgId);
  await assertEntitlement(orgId, "fiscal.efactura");

  const { data: inv } = await supabase
    .from("efactura_invoices")
    .select("*")
    .eq("id", invoiceId)
    .eq("organisation_id", orgId)
    .single();
  if (!inv) throw new Error("Invoice not found");
  if (inv.upload_status !== "draft" && inv.upload_status !== "failed") {
    throw new Error(`Cannot submit invoice in status: ${inv.upload_status}`);
  }

  const { data: org } = await supabase
    .from("organisations")
    .select("anaf_cif,fiscalnet_cif")
    .eq("id", orgId)
    .single();
  const orgCui = org?.anaf_cif ?? org?.fiscalnet_cif ?? null;
  if (!orgCui) throw new Error("ANAF CIF not configured in settings");

  const accessToken = await getOrgAccessToken(orgId);

  // An invoice sent to ANAF is issued: make sure its stock was deducted
  // (no-op if it already was).
  await issueInvoiceStock(orgId, invoiceId);

  let xml = inv.xml_content as string | null;
  if (!xml) {
    const result = await generateInvoiceXml(invoiceId);
    if (!result.valid) throw new Error(`XML validation failed: ${result.errors.join("; ")}`);
    xml = result.xml;
  }

  await supabase
    .from("efactura_invoices")
    .update({ upload_status: "pending", updated_at: new Date().toISOString() })
    .eq("id", invoiceId);

  const uploadResult = await uploadDocument(xml, orgCui, accessToken);

  await supabase
    .from("efactura_invoices")
    .update({
      upload_status: "uploaded",
      index_incarcare: uploadResult.indexIncarcare,
      updated_at: new Date().toISOString(),
    })
    .eq("id", invoiceId);

  revalidatePath("/app/invoices");
  return { indexIncarcare: uploadResult.indexIncarcare };
}

function issueErrorMessage(message: string): string {
  if (message.includes("INVOICE_NOT_FOUND")) return "Factura nu a fost găsită.";
  if (message.includes("INVOICE_PRODUCT_NOT_FOUND")) return "Un produs de pe factură nu mai există în catalog. Corectați factura.";
  if (message.includes("INVOICE_NUMBER_TAKEN")) return "Numărul următor din Setări este deja folosit. Actualizați „Următorul număr de factură” în Setări → e-Factura.";
  if (message.includes("STORNO_SOURCE_NOT_ISSUED")) return "Factura stornată trebuie să fie emisă.";
  return "Factura nu a putut fi emisă. Încercați din nou — stocul nu va fi scăzut de două ori.";
}

async function issueInvoiceStock(orgId: string, invoiceId: string) {
  const { user } = await getKitchenOpsContext();
  const service = await createServiceClient();
  const { data, error } = await service.rpc("issue_sales_invoice", {
    p_org_id: orgId,
    p_actor_id: user.id,
    p_invoice_id: invoiceId,
  });
  if (error) {
    console.error("[invoice] issue_sales_invoice failed", { orgId, invoiceId, message: error.message });
    throw new Error(issueErrorMessage(error.message ?? ""));
  }
  return data as { invoice_number: string; idempotent: boolean; movements: number };
}

/**
 * Storno: creates the reversing invoice of an issued invoice (same lines,
 * negative quantities). Issuing it returns the stock. At most one storno per
 * invoice — enforced by a unique index, so a double click cannot create two.
 */
export async function createStornoInvoice(invoiceId: string): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const { supabase, orgId, membership, user } = await getKitchenOpsContext();
  if (!canManage(membership.role)) return { ok: false, error: "Doar managerul sau proprietarul poate storna facturi." };
  await assertEfacturaInstalled(supabase, orgId);
  await assertEntitlement(orgId, "fiscal.efactura");

  const { data: src } = await supabase
    .from("efactura_invoices")
    .select("*")
    .eq("id", invoiceId)
    .eq("organisation_id", orgId)
    .maybeSingle();
  if (!src) return { ok: false, error: "Factura nu a fost găsită." };
  if (!src.issued_at) return { ok: false, error: "Doar o factură emisă poate fi stornată." };
  if (src.storno_of) return { ok: false, error: "Aceasta este deja o factură de stornare." };

  const { data: existing } = await supabase
    .from("efactura_invoices")
    .select("id")
    .eq("organisation_id", orgId)
    .eq("storno_of", invoiceId)
    .maybeSingle();
  if (existing) return { ok: true, id: String(existing.id) };

  const lines = buildStornoLines((src.line_items ?? []) as Array<UblLineItem & StockLineFields>);
  const totals = computeInvoiceTotals(lines);
  const issueDate = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("efactura_invoices")
    .insert({
      organisation_id: orgId,
      invoice_number: draftInvoiceNumber(undefined),
      invoice_type: "380",
      issue_date: issueDate,
      buyer_cif: src.buyer_cif,
      buyer_name: src.buyer_name,
      buyer_address: src.buyer_address,
      buyer_reg_com: src.buyer_reg_com,
      customer_id: src.customer_id,
      line_items: lines,
      total_excl_vat: totals.totalExclVat,
      total_vat: totals.totalVat,
      total_incl_vat: totals.totalInclVat,
      currency: src.currency,
      upload_status: "draft",
      created_by: user.id,
      issuer_name: src.issuer_name,
      issuer_id_doc: src.issuer_id_doc,
      storno_of: invoiceId,
      note: `Stornare factura nr. ${src.invoice_number} din ${String(src.issue_date).split("-").reverse().join(".")}`,
    })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") {
      const { data: again } = await supabase
        .from("efactura_invoices").select("id").eq("organisation_id", orgId).eq("storno_of", invoiceId).maybeSingle();
      if (again) return { ok: true, id: String(again.id) };
    }
    return { ok: false, error: `Stornarea nu a putut fi creată: ${error.message}` };
  }
  revalidatePath("/app/invoices");
  revalidatePath(`/app/invoices/${invoiceId}`);
  return { ok: true, id: String(data.id) };
}

/**
 * Issue the invoice: it becomes final and the sold quantities leave stock.
 * Safe to retry or double-click — the RPC locks the invoice and deducts stock
 * only the first time (issued_at).
 */
export async function issueSalesInvoice(invoiceId: string): Promise<
  { ok: true; alreadyIssued: boolean; movements: number; invoiceNumber: string } | { ok: false; error: string }
> {
  const { supabase, orgId, membership } = await getKitchenOpsContext();
  if (!canManage(membership.role)) return { ok: false, error: "Doar managerul sau proprietarul poate emite facturi." };
  await assertEfacturaInstalled(supabase, orgId);
  await assertEntitlement(orgId, "fiscal.efactura");
  try {
    const result = await issueInvoiceStock(orgId, invoiceId);
    revalidatePath(`/app/invoices/${invoiceId}`);
    revalidatePath("/app/invoices");
    return { ok: true, alreadyIssued: result.idempotent, movements: result.movements, invoiceNumber: result.invoice_number };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Factura nu a putut fi emisă." };
  }
}

/** The number the next issued invoice will get (shown as a hint on drafts). */
export async function suggestNextInvoiceNumber(): Promise<string> {
  const { supabase, orgId } = await getKitchenOpsContext();
  const [{ data: org }, { data: rows }] = await Promise.all([
    supabase.from("organisations").select("invoice_series,invoice_next_number").eq("id", orgId).maybeSingle(),
    supabase
      .from("efactura_invoices")
      .select("invoice_number")
      .eq("organisation_id", orgId)
      .not("issued_at", "is", null)
      .order("issued_at", { ascending: false })
      .limit(500),
  ]);
  const series = (org?.invoice_series as string | null) ?? "";
  if (org?.invoice_next_number) return `${series}${org.invoice_next_number}`;
  let max = 0;
  for (const row of rows ?? []) {
    const m = String(row.invoice_number ?? "").match(/(\d+)$/);
    const n = m ? Number(m[1]) : 0;
    if (!String(row.invoice_number).startsWith(DRAFT_NUMBER_PREFIX) && n > max) max = n;
  }
  return `${series}${max + 1}`;
}

/** Called from the ANAF OAuth callback route to persist tokens. */
export async function connectAnafAccount(
  orgId: string,
  code: string,
  redirectUri: string,
): Promise<void> {
  const clientId = process.env.ANAF_CLIENT_ID;
  const clientSecret = process.env.ANAF_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("ANAF credentials not configured on server");

  const tokens = await exchangeCode(code, clientId, clientSecret, redirectUri);

  // Fetch the CIF from the org settings (must have been saved first)
  const supabase = (await import("@/lib/supabase/server")).createClient;
  const sb = await supabase();
  const { data: org } = await sb.from("organisations").select("anaf_cif,fiscalnet_cif").eq("id", orgId).single();
  const orgCui = org?.anaf_cif ?? org?.fiscalnet_cif ?? null;
  if (!orgCui) throw new Error("Set your CIF in settings before connecting ANAF");

  await storeOrgTokens(orgId, orgCui, tokens);
}

export async function disconnectAnaf(): Promise<void> {
  const { orgId, membership } = await getKitchenOpsContext();
  if (!canManage(membership.role)) return;
  const { supabase } = await getKitchenOpsContext();
  await assertEfacturaInstalled(supabase, orgId);
  await assertEntitlement(orgId, "fiscal.efactura");
  await revokeOrgTokens(orgId);
  revalidatePath("/app/settings");
}

export async function checkAnafConnected(): Promise<boolean> {
  const { orgId } = await getKitchenOpsContext();
  return hasAnafCredentials(orgId);
}

export async function lookupBuyerByCif(cif: string): Promise<{
  name: string;
  address: string;
  vatRegistered: boolean;
} | null> {
  const result = await lookupRomanianCompanyByCui(cif);
  if (!result) return null;
  return { name: result.name, address: result.address, vatRegistered: result.vatRegistered };
}

export async function saveAnafSettings(formData: FormData): Promise<void> {
  const { supabase, orgId, membership } = await getKitchenOpsContext();
  if (!canManage(membership.role)) return;
  await assertEfacturaInstalled(supabase, orgId);
  await assertEntitlement(orgId, "fiscal.efactura");

  const anaf_cif = (formData.get("anaf_cif") as string ?? "").trim();
  const anaf_vat_registered = formData.get("anaf_vat_registered") === "on";
  const text = (key: string) => ((formData.get(key) as string | null) ?? "").trim() || null;

  const update: Record<string, unknown> = {
    anaf_cif: anaf_cif || null,
    fiscalnet_cif: anaf_cif || null,
    anaf_vat_registered,
  };
  // Seller details printed on invoices — only written when the form includes them.
  if (formData.has("company_legal_name")) {
    update.company_legal_name = text("company_legal_name");
    update.company_address = text("company_address");
    update.company_county = text("company_county");
    update.company_reg_com = text("company_reg_com");
    update.company_share_capital = text("company_share_capital");
    const accounts = [0, 1, 2]
      .map((i) => ({ bank: text(`bank_name_${i}`), iban: text(`bank_iban_${i}`)?.replace(/\s+/g, "").toUpperCase() ?? null, currency: text(`bank_currency_${i}`) ?? "RON" }))
      .filter((a) => a.iban);
    update.invoice_bank_accounts = accounts;
    update.invoice_series = text("invoice_series");
    const nextNumber = Number(text("invoice_next_number") ?? "");
    update.invoice_next_number = Number.isInteger(nextNumber) && nextNumber > 0 ? nextNumber : null;
  }

  await supabase
    .from("organisations")
    .update(update)
    .eq("id", orgId);

  revalidatePath("/app/settings");
}
