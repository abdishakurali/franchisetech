import { getReportPdfContext } from "@/lib/pdf/pdf-route-context";
import { renderReportPdfResponse } from "@/lib/pdf/renderReportPdf";
import { InvoicePdfDocument, type InvoicePdfData, type InvoicePdfLine } from "@/lib/pdf/InvoicePdfDocument";
import { displayInvoiceNumber } from "@/lib/invoice-numbering";

type BuyerAddress = { street?: string | null; city?: string | null } | null;

function roCif(cui: string | null | undefined, vatRegistered: boolean): string {
  const clean = (cui ?? "").replace(/^RO/i, "").replace(/[^0-9]/g, "");
  if (!clean) return "—";
  return vatRegistered ? `RO${clean}` : clean;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getReportPdfContext();
  if ("error" in ctx) return ctx.error;
  const { supabase, orgId } = ctx;

  // RLS on efactura_invoices limits this to the caller's own organisation.
  const [{ data: inv }, { data: org }] = await Promise.all([
    supabase.from("efactura_invoices").select("*").eq("id", id).eq("organisation_id", orgId).maybeSingle(),
    supabase
      .from("organisations")
      .select("name,company_legal_name,company_address,company_county,company_reg_com,company_share_capital,invoice_bank_accounts,anaf_cif,fiscalnet_cif,anaf_vat_registered")
      .eq("id", orgId)
      .maybeSingle(),
  ]);
  if (!inv) return new Response("Factura nu a fost găsită", { status: 404 });

  const buyerAddress = inv.buyer_address as BuyerAddress;
  const data: InvoicePdfData = {
    number: displayInvoiceNumber(inv.invoice_number),
    note: (inv.note as string | null) ?? null,
    issueDate: String(inv.issue_date),
    dueDate: (inv.due_date as string | null) ?? null,
    currency: String(inv.currency ?? "RON"),
    draft: !inv.issued_at,
    seller: {
      name: org?.company_legal_name || org?.name || "—",
      cif: roCif(org?.anaf_cif ?? org?.fiscalnet_cif, Boolean(org?.anaf_vat_registered)),
      regCom: org?.company_reg_com ?? null,
      shareCapital: org?.company_share_capital ?? null,
      address: org?.company_address ?? null,
      county: org?.company_county ?? null,
      bankAccounts: Array.isArray(org?.invoice_bank_accounts) ? org.invoice_bank_accounts : [],
    },
    buyer: {
      name: String(inv.buyer_name),
      cif: String(inv.buyer_cif),
      regCom: (inv.buyer_reg_com as string | null) ?? null,
      address: [buyerAddress?.street, buyerAddress?.city && buyerAddress.city !== "România" ? buyerAddress.city : null]
        .filter(Boolean)
        .join(", ") || null,
    },
    lines: ((inv.line_items ?? []) as InvoicePdfLine[]).map((l) => ({
      name: l.name,
      unitCode: l.unitCode,
      quantity: Number(l.quantity),
      unitPrice: Number(l.unitPrice),
      vatRate: Number(l.vatRate),
    })),
    issuerName: (inv.issuer_name as string | null) ?? null,
    issuerIdDoc: (inv.issuer_id_doc as string | null) ?? null,
    delegateName: (inv.delegate_name as string | null) ?? null,
    delegateIdDoc: (inv.delegate_id_doc as string | null) ?? null,
  };

  const safeNumber = String(inv.invoice_number).replace(/[^A-Za-z0-9_-]/g, "_");
  return renderReportPdfResponse(InvoicePdfDocument({ data }), `Factura_${safeNumber}.pdf`);
}
