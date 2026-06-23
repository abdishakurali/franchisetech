import { getActiveOrg } from "@/lib/kitchenops/data";
import { PRODUCT_EXPORT_SELECT } from "@/lib/supabase/product-selects";

const HEADERS = ["name","category","pos_category","sku","barcode","unit","sale_price_gross","cost_price","vat_rate","available_in_pos","is_ingredient","is_stock_tracked","current_stock_qty","reorder_level","image_url"];

type ExportProduct = {
  name: string;
  sku: string | null;
  unit_of_measure: string | null;
  sale_price: number | null;
  cost_price: number | null;
  vat_rate: number | null;
  available_in_pos: boolean | null;
  is_ingredient: boolean | null;
  is_stock_tracked: boolean | null;
  current_stock_qty: number | null;
  reorder_level: number | null;
  image_url: string | null;
  inventory_category: { name: string } | null;
  pos_category: { name: string } | null;
};

function esc(v: unknown) {
  const s = Array.isArray(v) ? v.join(";") : String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

export async function GET() {
  const { supabase, orgId } = await getActiveOrg();
  const { data } = await supabase.from("products").select(PRODUCT_EXPORT_SELECT).eq("organisation_id", orgId).order("name");
  const rows = (data ?? []) as unknown as ExportProduct[];
  const body = [HEADERS.join(","), ...rows.map((p) => [
    p.name, p.inventory_category?.name ?? "", p.pos_category?.name ?? "", p.sku ?? "", "", p.unit_of_measure ?? "each",
    p.sale_price ?? 0, p.cost_price ?? "", p.vat_rate ?? 0, p.available_in_pos !== false,
    p.is_ingredient === true, p.is_stock_tracked === true,
    p.current_stock_qty ?? "", p.reorder_level ?? "", p.image_url ?? "",
  ].map(esc).join(","))].join("\n");
  return new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=franchisetech-products.csv",
    },
  });
}
