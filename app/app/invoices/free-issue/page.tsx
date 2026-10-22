import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { mapUnitOfMeasureToAnafCode } from "@/lib/anaf/unit-codes";
import { FreeIssueForm } from "@/components/app/FreeIssueForm";

export const metadata: Metadata = {
  title: "Transfer gratuit | franchisetech",
};

type FreeIssueRow = {
  id: string;
  document_number: string;
  issue_date: string;
  recipient_name: string | null;
  reason: string;
  total_cost: number | null;
  line_items: Array<{ name: string; quantity: number; unitCode: string }> | null;
};

export default async function FreeIssuePage() {
  const { supabase, orgId } = await getKitchenOpsContext();
  const [{ data: products }, { data: issues }] = await Promise.all([
    supabase
      .from("products")
      .select("id,name,unit_of_measure")
      .eq("organisation_id", orgId)
      .eq("active", true)
      .order("name")
      .limit(500),
    supabase
      .from("stock_free_issues")
      .select("id,document_number,issue_date,recipient_name,reason,total_cost,line_items")
      .eq("organisation_id", orgId)
      .order("issue_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const options = (products ?? []).map((p) => ({
    id: String(p.id),
    name: String(p.name ?? ""),
    unitCode: mapUnitOfMeasureToAnafCode(p.unit_of_measure as string | null),
    stockUnit: (p.unit_of_measure as string | null) ?? "each",
  }));
  const rows = (issues ?? []) as FreeIssueRow[];

  return (
    <div className="max-w-4xl space-y-6 p-4 sm:p-6">
      <Link href="/app/invoices">
        <Button variant="ghost" size="sm" className="gap-1"><ChevronLeft className="h-4 w-4" />Facturi</Button>
      </Link>
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Transfer gratuit</h1>
        <p className="text-sm text-muted-foreground">Ieșiri de marfă fără vânzare (degustări, sponsorizări, donații). Se scad din stoc la cost, fără factură.</p>
      </div>

      <FreeIssueForm products={options} />

      <Card>
        <CardHeader><CardTitle className="text-base">Transferuri înregistrate</CardTitle></CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Niciun transfer gratuit încă.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-secondary">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Nr.</th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Data</th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Produse</th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Motiv</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 py-2 font-mono text-xs">{r.document_number}</td>
                      <td className="px-4 py-2">{new Date(r.issue_date).toLocaleDateString("ro-RO")}</td>
                      <td className="px-4 py-2">{(r.line_items ?? []).map((l) => `${l.name} × ${l.quantity}`).join(", ")}</td>
                      <td className="px-4 py-2 text-muted-foreground">{r.reason}{r.recipient_name ? ` · ${r.recipient_name}` : ""}</td>
                      <td className="px-4 py-2 text-right">{Number(r.total_cost ?? 0).toFixed(2)} RON</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
