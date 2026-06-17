import { getActiveOrg } from "@/lib/kitchenops/data";

function esc(v: unknown) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

export async function GET() {
  const { supabase, orgId } = await getActiveOrg();
  const { data } = await supabase.from("suppliers").select("name,contact_name,phone,email,address,notes").eq("organisation_id", orgId).eq("active", true).order("name");
  const headers = ["name","contact_name","phone","email","address","notes"];
  const body = [headers.join(","), ...(data ?? []).map((r) => headers.map((h) => esc(r[h as keyof typeof r])).join(","))].join("\n");
  return new Response(body, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": "attachment; filename=franchisetech-suppliers.csv" } });
}
