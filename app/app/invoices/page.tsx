import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { FileText, Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Facturi e-Factura | franchisetech",
};

type EfacturaRow = {
  id: string;
  invoice_number: string;
  issue_date: string;
  buyer_name: string;
  buyer_cif: string;
  total_incl_vat: number | null;
  currency: string | null;
  upload_status: string;
  processing_status: string | null;
  created_at: string;
};

function StatusBadge({ uploadStatus, processingStatus }: { uploadStatus: string; processingStatus: string | null }) {
  if (uploadStatus === "accepted") {
    return <span className="inline-flex items-center rounded-full bg-reconciled/10 px-2.5 py-0.5 text-xs font-medium text-reconciled">Acceptată</span>;
  }
  if (uploadStatus === "rejected") {
    return <span className="inline-flex items-center rounded-full bg-attention/10 px-2.5 py-0.5 text-xs font-medium text-attention">Respinsă</span>;
  }
  if (uploadStatus === "uploaded" || processingStatus === "in prelucrare") {
    return <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-brass">Trimisă</span>;
  }
  if (uploadStatus === "failed") {
    return <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700">Eroare</span>;
  }
  return <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-mid">Draft</span>;
}

export default async function InvoicesPage() {
  const { supabase, orgId, countryCode } = await getKitchenOpsContext();

  if (countryCode !== "RO") {
    return (
      <div className="p-6">
        <p className="text-muted-foreground text-sm">e-Factura este disponibilă doar pentru organizațiile din România.</p>
      </div>
    );
  }

  const { data: org } = await supabase
    .from("organisations")
    .select("efactura_enabled")
    .eq("id", orgId)
    .maybeSingle();

  if (!org?.efactura_enabled) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-xl rounded-xl border border-border bg-card p-6">
          <FileText className="h-9 w-9 text-muted-foreground" />
          <h1 className="mt-4 text-xl font-semibold text-foreground">e-Factura nu este instalată</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Instalează integrarea ANAF e-Factura din Marketplace doar dacă emiți facturi B2B prin SPV.
          </p>
          <Link href="/app/settings?tab=integrations" className="mt-5 inline-flex">
            <Button>Deschide Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { data: invoices } = await supabase
    .from("efactura_invoices")
    .select("id,invoice_number,issue_date,buyer_name,buyer_cif,total_incl_vat,currency,upload_status,processing_status,created_at")
    .eq("organisation_id", orgId)
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = (invoices ?? []) as EfacturaRow[];

  const totalValue = rows
    .filter((r) => r.upload_status === "accepted")
    .reduce((sum, r) => sum + (Number(r.total_incl_vat ?? 0)), 0);

  const sentCount = rows.filter((r) => ["uploaded", "accepted"].includes(r.upload_status)).length;
  const rejectedCount = rows.filter((r) => r.upload_status === "rejected").length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">e-Factura</h1>
          <p className="text-sm text-muted-foreground">Facturi electronice transmise la ANAF / SPV</p>
        </div>
        <Link href="/app/invoices/new">
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            Factură nouă
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total acceptate</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalValue.toLocaleString("ro-RO", { minimumFractionDigits: 2 })} RON</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Facturi trimise</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{sentCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Respinse ANAF</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-attention">{rejectedCount}</p></CardContent>
        </Card>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-border py-20 text-center">
          <FileText className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground">Nicio factură emisă încă</p>
            <p className="mt-1 text-sm text-muted-foreground">Emite prima ta e-Factură și trimite-o automat la ANAF/SPV.</p>
          </div>
          <Link href="/app/invoices/new">
            <Button>Factură nouă</Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nr. factură</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Client</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">CIF client</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Dată</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total incl. TVA</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status SPV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-card">
              {rows.map((inv) => (
                <tr key={inv.id} className="hover:bg-secondary">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/app/invoices/${inv.id}`} className="text-brass hover:underline">
                      {inv.invoice_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-foreground">{inv.buyer_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.buyer_cif}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(inv.issue_date).toLocaleDateString("ro-RO")}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {Number(inv.total_incl_vat ?? 0).toLocaleString("ro-RO", { minimumFractionDigits: 2 })} {inv.currency ?? "RON"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge uploadStatus={inv.upload_status} processingStatus={inv.processing_status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
