import { approveProductVat, updateSgrPolicy } from "@/app/actions/kitchenops";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { PRODUCT_INVENTORY_CATEGORY_EMBED } from "@/lib/supabase/product-selects";

export default async function DataRepairPage() {
  const { supabase, orgId, membership } = await getKitchenOpsContext();
  const canManage = ["owner", "manager"].includes(membership.role ?? "");
  const [{ data: products }, { data: rates }, { data: batches }, { data: org }] = await Promise.all([
    supabase.from("products")
      .select(`id,name,vat_rate,vat_status,category,${PRODUCT_INVENTORY_CATEGORY_EMBED}(name)`)
      .eq("organisation_id", orgId)
      .in("vat_status", ["pending", "ambiguous"])
      .eq("active", true)
      .order("name"),
    supabase.from("vat_rates").select("id,name,rate").eq("organisation_id", orgId).eq("active", true).order("sort_order"),
    supabase.from("repair_batches").select("id,repair_type,status,summary,created_at,completed_at").eq("organisation_id", orgId).order("created_at", { ascending: false }).limit(20),
    supabase.from("organisations").select("sgr_policy,sgr_deposit_amount,sgr_vat_rate,compliance_enforcement_at").eq("id", orgId).single(),
  ]);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Controlul datelor</h1>
        <p className="text-sm text-muted-foreground">Excepțiile sunt blocate din POS până la validare și fiecare corecție rămâne în audit.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="border-l-4 border-red-500 bg-card p-4">
          <p className="text-sm text-muted-foreground">TVA de validat</p>
          <p className="mt-1 text-2xl font-semibold">{products?.length ?? 0}</p>
        </div>
        <div className="border-l-4 border-amber-500 bg-card p-4">
          <p className="text-sm text-muted-foreground">Blocarea începe</p>
          <p className="mt-1 text-sm font-semibold">{org?.compliance_enforcement_at ? new Date(org.compliance_enforcement_at).toLocaleString("ro-RO") : "Imediat"}</p>
        </div>
        <div className="border-l-4 border-emerald-600 bg-card p-4">
          <p className="text-sm text-muted-foreground">Loturi finalizate</p>
          <p className="mt-1 text-2xl font-semibold">{(batches ?? []).filter((batch) => batch.status === "completed").length}</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Coada TVA</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Produs</TableHead><TableHead>Categorie</TableHead><TableHead>Stare</TableHead><TableHead>Cotă aprobată</TableHead></TableRow></TableHeader>
            <TableBody>
              {(products ?? []).map((product) => {
                const categoryRelation = product.inventory_category as unknown as { name?: string | null } | Array<{ name?: string | null }> | null;
                const category = Array.isArray(categoryRelation) ? categoryRelation[0]?.name : categoryRelation?.name;
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{category ?? product.category ?? "Fără categorie"}</TableCell>
                    <TableCell><Badge variant="secondary">{product.vat_status === "ambiguous" ? "Ambiguu" : "În așteptare"}</Badge></TableCell>
                    <TableCell>
                      {canManage ? (
                        <form action={approveProductVat} className="flex min-w-56 gap-2">
                          <input type="hidden" name="product_id" value={product.id} />
                          <select name="vat_rate" defaultValue={String(product.vat_rate)} className="h-9 flex-1 rounded-md border bg-card px-2 text-sm">
                            {(rates ?? []).map((rate) => <option key={rate.id} value={Number(rate.rate)}>{rate.name} ({Number(rate.rate)}%)</option>)}
                          </select>
                          <button className="h-9 rounded-md bg-ink px-3 text-sm font-medium text-white">Aprobă</button>
                        </form>
                      ) : "Doar proprietarul sau managerul poate aproba."}
                    </TableCell>
                  </TableRow>
                );
              })}
              {!products?.length && <TableRow><TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">Nu există produse blocate pentru TVA.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Politica SGR aprobată de contabil</CardTitle></CardHeader>
        <CardContent>
          <form action={updateSgrPolicy} className="grid gap-3 sm:grid-cols-[1fr_9rem_9rem_auto] sm:items-end">
            <label className="text-sm">Tratament
              <select name="sgr_policy" defaultValue={org?.sgr_policy ?? "accountant_approval_required"} className="mt-1 h-10 w-full rounded-md border bg-card px-2">
                <option value="accountant_approval_required">Necesită aprobarea contabilului</option>
                <option value="outside_vat_scope">În afara bazei TVA</option>
                <option value="included_in_taxable_base">Inclus în baza taxabilă</option>
              </select>
            </label>
            <label className="text-sm">Garanție
              <input name="sgr_deposit_amount" type="number" min="0" step="0.01" defaultValue={Number(org?.sgr_deposit_amount ?? 0.5)} className="mt-1 h-10 w-full rounded-md border px-2" />
            </label>
            <label className="text-sm">TVA
              <input name="sgr_vat_rate" type="number" min="0" step="0.01" defaultValue={Number(org?.sgr_vat_rate ?? 0)} className="mt-1 h-10 w-full rounded-md border px-2" />
            </label>
            <button className="h-10 rounded-md bg-ink px-4 text-sm font-medium text-white">Salvează</button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Jurnal loturi de reparație</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(batches ?? []).map((batch) => (
            <div key={batch.id} className="flex items-center justify-between border-b py-2 text-sm">
              <span>{batch.repair_type} · {new Date(batch.created_at).toLocaleString("ro-RO")}</span>
              <Badge variant="outline">{batch.status}</Badge>
            </div>
          ))}
          {!batches?.length && <p className="py-6 text-center text-sm text-muted-foreground">Nu există loturi de reparație.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
