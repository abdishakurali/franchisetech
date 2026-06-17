import { getActiveOrg } from "@/lib/kitchenops/data";

const HEADERS = ["name","category","sku","barcode","unit","sale_price_gross","cost_price","vat_rate","available_in_pos","is_ingredient","is_stock_tracked","current_stock_qty","reorder_level","image_url"];

function esc(v: unknown) {
  const s = Array.isArray(v) ? v.join(";") : String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

export async function GET() {
  const { supabase, orgId } = await getActiveOrg();
  const { data } = await supabase.from("products").select("*,product_categories(name)").eq("organisation_id", orgId).order("name");
  const body = [HEADERS.join(","), ...(data ?? []).map((p) => [
    p.name, p.product_categories?.name ?? "", p.sku ?? "", "", p.unit_of_measure ?? "each",
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
