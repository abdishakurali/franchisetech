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

export type EfacturaLineInput = {
  name: string;
  unitCode: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
};

export type CreateInvoiceDraftInput = {
  invoiceNumber: string;
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
};

function canManage(role: string | null | undefined) {
  return ["owner", "manager"].includes(role ?? "");
}

export async function createInvoiceDraft(input: CreateInvoiceDraftInput): Promise<{ id: string }> {
  const { supabase, orgId, membership, user } = await getKitchenOpsContext();
  if (!canManage(membership.role)) redirect("/app/invoices");
  const activeVatRates = await listActiveVatRates(supabase, orgId);
  if (activeVatRates.length > 0) {
    const invalid = input.lines.find((line) => !activeVatRates.some((rate) => ratesMatch(rate.rate, line.vatRate)));
    if (invalid) throw new Error(`Cota TVA ${invalid.vatRate}% nu este activă în Setări.`);
  }

  const lines = input.lines.map((l, i) => ({
    id: i + 1,
    name: l.name,
    unitCode: l.unitCode,
    quantity: l.quantity,
    unitPrice: l.unitPrice,
    vatRate: l.vatRate,
  })) satisfies UblLineItem[];

  const totals = computeInvoiceTotals(lines);

  const { data, error } = await supabase
    .from("efactura_invoices")
    .insert({
      organisation_id: orgId,
      invoice_number: input.invoiceNumber,
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
    })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to create invoice: ${error.message}`);

  revalidatePath("/app/invoices");
  return { id: data.id };
}

export async function generateInvoiceXml(invoiceId: string): Promise<{
  valid: boolean;
  xml: string;
  errors: string[];
}> {
  const { supabase, orgId } = await getKitchenOpsContext();

  const { data: inv, error } = await supabase
    .from("efactura_invoices")
    .select("*")
    .eq("id", invoiceId)
    .eq("organisation_id", orgId)
    .single();
  if (error || !inv) throw new Error("Invoice not found");

  const { data: org } = await supabase
    .from("organisations")
    .select("name,anaf_cif,anaf_vat_registered,country_code")
    .eq("id", orgId)
    .single();

  const sellerAddress: UblAddress = {
    street: "—",
    city: "România",
    countrySubentity: "RO-B",
    countryCode: "RO",
  };

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
      name: org?.name ?? "—",
      taxId: org?.anaf_vat_registered ? `RO${org.anaf_cif}` : (org?.anaf_cif ?? "—"),
      address: sellerAddress,
    },
    buyer: {
      name: inv.buyer_name,
      taxId: inv.buyer_cif.startsWith("RO") ? inv.buyer_cif : `RO${inv.buyer_cif}`,
      address: buyerAddress,
    },
    lines: (inv.line_items as UblLineItem[]),
    note: undefined,
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
    .select("anaf_cif")
    .eq("id", orgId)
    .single();
  if (!org?.anaf_cif) throw new Error("ANAF CIF not configured in settings");

  const accessToken = await getOrgAccessToken(orgId);

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

  const uploadResult = await uploadDocument(xml, org.anaf_cif, accessToken);

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
  const { data: org } = await sb.from("organisations").select("anaf_cif").eq("id", orgId).single();
  if (!org?.anaf_cif) throw new Error("Set your CIF in settings before connecting ANAF");

  await storeOrgTokens(orgId, org.anaf_cif, tokens);
}

export async function disconnectAnaf(): Promise<void> {
  const { orgId, membership } = await getKitchenOpsContext();
  if (!canManage(membership.role)) return;
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

  const anaf_cif = (formData.get("anaf_cif") as string ?? "").trim();
  const anaf_vat_registered = formData.get("anaf_vat_registered") === "on";

  await supabase
    .from("organisations")
    .update({ anaf_cif: anaf_cif || null, anaf_vat_registered })
    .eq("id", orgId);

  revalidatePath("/app/settings");
}
