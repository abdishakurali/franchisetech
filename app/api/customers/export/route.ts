import { getActiveOrg } from "@/lib/kitchenops/data";

function esc(v: unknown) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

export async function GET() {
  const { supabase, orgId } = await getActiveOrg();
  const { data } = await supabase.from("customers").select("name,phone,email,notes").eq("organisation_id", orgId).order("name");
  const headers = ["name","phone","email","notes"];
  const body = [headers.join(","), ...(data ?? []).map((r) => headers.map((h) => esc(r[h as keyof typeof r])).join(","))].join("\n");
  return new Response(body, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": "attachment; filename=franchisetech-customers.csv" } });
}
