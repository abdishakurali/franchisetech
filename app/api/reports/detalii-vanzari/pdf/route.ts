import { formatMoney } from "@/lib/kitchenops/metrics";
import { getReportPdfContext } from "@/lib/pdf/pdf-route-context";
import { ReportPdfDocument, type PdfRow } from "@/lib/pdf/ReportPdfDocument";
import { renderReportPdfResponse } from "@/lib/pdf/renderReportPdf";

type LineItem = {
  product_id: string | null;
  product_name: string;
  quantity: number | null;
  vat_rate: number | null;
  net_amount: number | null;
  vat_amount: number | null;
  gross_amount: number | null;
  line_total: number | null;
  discount_amount: number | null;
};

type TransactionRow = {
  id: string;
  status: string;
  total_gross: number | null;
  total: number | null;
  pos_transaction_items: LineItem[];
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const from = searchParams.get("from") ?? monthStart;
  const to = searchParams.get("to") ?? today;

  const ctx = await getReportPdfContext();
  if ("error" in ctx) return ctx.error;
  const { supabase, orgId, org, currency, generatedBy } = ctx;

  const { data: transactions } = await supabase
    .from("pos_transactions")
    .select(`
      id, status, total_gross, total,
      pos_transaction_items(product_id,product_name,quantity,vat_rate,net_amount,vat_amount,gross_amount,line_total,discount_amount)
    `)
    .eq("organisation_id", orgId)
    .gte("sold_at", `${from}T00:00:00Z`)
    .lte("sold_at", `${to}T23:59:59Z`);

  const rows = (transactions ?? []) as TransactionRow[];
  const completed = rows.filter((r) => r.status !== "voided");

  const productIds = [
    ...new Set(completed.flatMap((tx) => (tx.pos_transaction_items ?? []).map((i) => i.product_id).filter(Boolean))),
  ] as string[];
  const productCategoryMap = new Map<string, string | null>();
  if (productIds.length > 0) {
    const { data: products } = await supabase.from("products").select("id,category_id").in("id", productIds);
    const categoryIds = [...new Set((products ?? []).map((p) => p.category_id).filter(Boolean))] as string[];
    const categoryNameById = new Map<string, string>();
    if (categoryIds.length > 0) {
      const { data: categories } = await supabase.from("product_categories").select("id,name").in("id", categoryIds);
      for (const c of categories ?? []) categoryNameById.set(c.id, c.name);
    }
    for (const p of products ?? []) {
      productCategoryMap.set(p.id, p.category_id ? categoryNameById.get(p.category_id) ?? null : null);
    }
  }

  const byProduct = new Map<
    string,
    { category: string; product: string; qty: number; net: number; vat: number; gross: number; discount: number }
  >();
  for (const tx of completed) {
    for (const item of tx.pos_transaction_items ?? []) {
      const category = (item.product_id ? productCategoryMap.get(item.product_id) : null) ?? "—";
      const key = `${category}::${item.product_name}`;
      const entry = byProduct.get(key) ?? { category, product: item.product_name, qty: 0, net: 0, vat: 0, gross: 0, discount: 0 };
      const gross = Number(item.gross_amount ?? item.line_total ?? 0);
      const vat = Number(item.vat_amount ?? 0);
      const net = Number(item.net_amount ?? gross - vat);
      entry.qty += Number(item.quantity ?? 0);
      entry.net += net;
      entry.vat += vat;
      entry.gross += gross;
      entry.discount += Number(item.discount_amount ?? 0);
      byProduct.set(key, entry);
    }
  }
  const itemizedRows = Array.from(byProduct.values()).sort(
    (a, b) => a.category.localeCompare(b.category) || b.gross - a.gross
  );

  const money = (v: number) => formatMoney(v, currency);
  const totNet = itemizedRows.reduce((s, r) => s + r.net, 0);
  const totVat = itemizedRows.reduce((s, r) => s + r.vat, 0);
  const totGross = itemizedRows.reduce((s, r) => s + r.gross, 0);
  const totDiscount = itemizedRows.reduce((s, r) => s + r.discount, 0);

  const pdfRows: PdfRow[] = itemizedRows.map((r, idx) => ({
    nr: idx + 1,
    category: r.category,
    product: r.product,
    qty: r.qty,
    net: money(r.net),
    vat: money(r.vat),
    gross: money(r.gross),
    discount: r.discount > 0 ? `-${money(r.discount)}` : "—",
  }));
  pdfRows.push({
    nr: "", category: "", product: "TOTAL", qty: "",
    net: money(totNet), vat: money(totVat), gross: money(totGross),
    discount: totDiscount > 0 ? `-${money(totDiscount)}` : "—",
    _rowStyle: "total",
  });

  const doc = ReportPdfDocument({
    companyName: org?.name ?? "franchisetech",
    companyCui: org?.fiscalnet_cif ?? undefined,
    title: "Detalii Vânzări",
    subtitle: "Vânzări itemizate pe categorie și produs",
    periodLabel: `Perioada: ${from} — ${to}`,
    generatedBy,
    generatedAt: new Date().toLocaleString("ro-RO"),
    orientation: "landscape",
    summary: [
      { label: "Vânzări nete", value: money(totNet) },
      { label: "TVA colectat", value: money(totVat) },
      { label: "Vânzări brute", value: money(totGross) },
      { label: "Discounturi", value: money(totDiscount) },
    ],
    columns: [
      { key: "nr", label: "Nr.", align: "right", width: "5%" },
      { key: "category", label: "Categorie", width: "13%" },
      { key: "product", label: "Produs", width: "24%" },
      { key: "qty", label: "Cant.", align: "right", width: "9%" },
      { key: "net", label: "Net", align: "right", width: "12%" },
      { key: "vat", label: "TVA", align: "right", width: "12%" },
      { key: "gross", label: "Brut", align: "right", width: "12%" },
      { key: "discount", label: "Discount", align: "right", width: "13%" },
    ],
    rows: pdfRows,
    signatureLabels: ["Întocmit de", "Semnătură contabil"],
  });

  return renderReportPdfResponse(doc, `detalii-vanzari-${from}-${to}.pdf`);
}
