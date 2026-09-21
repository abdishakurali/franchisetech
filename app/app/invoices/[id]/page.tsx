import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { hasAnafCredentials } from "@/lib/anaf/auth";
import { ChevronLeft } from "lucide-react";
import InvoiceActions from "./InvoiceActions";

export const metadata: Metadata = {
  title: "Detalii factură | franchisetech",
};

type UblLine = {
  id: number;
  name: string;
  unitCode: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
};

type UblAddress = {
  street?: string;
  city?: string;
  countrySubentity?: string;
  countryCode?: string;
};

function StatusBadge({ status, processingStatus }: { status: string; processingStatus: string | null }) {
  if (status === "accepted") {
    return <span className="inline-flex items-center rounded-full bg-reconciled/10 px-3 py-1 text-sm font-medium text-reconciled">Acceptată ANAF</span>;
  }
  if (status === "rejected") {
    return <span className="inline-flex items-center rounded-full bg-attention/10 px-3 py-1 text-sm font-medium text-attention">Respinsă ANAF</span>;
  }
  if (status === "uploaded" || processingStatus === "in prelucrare") {
    return <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-sm font-medium text-brass">Trimisă la ANAF</span>;
  }
  if (status === "pending") {
    return <span className="inline-flex items-center rounded-full bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-700">Se trimite...</span>;
  }
  if (status === "failed") {
    return <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700">Eroare trimitere</span>;
  }
  return <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-sm font-medium text-mid">Draft</span>;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, orgId, countryCode } = await getKitchenOpsContext();

  if (countryCode !== "RO") redirect("/app/invoices");

  const { data: org } = await supabase
    .from("organisations")
    .select("efactura_enabled")
    .eq("id", orgId)
    .maybeSingle();
  if (!org?.efactura_enabled) redirect("/app/settings?tab=integrations");

  const { data: inv } = await supabase
    .from("efactura_invoices")
    .select("*")
    .eq("id", id)
    .eq("organisation_id", orgId)
    .single();

  if (!inv) redirect("/app/invoices");

  const anafConnected = await hasAnafCredentials(orgId);

  const lines = (inv.line_items as UblLine[]) ?? [];
  const buyerAddress = inv.buyer_address as UblAddress | null;

  let exclVat = 0;
  let totalVat = 0;
  const vatBreakdown: Record<number, number> = {};

  for (const line of lines) {
    const ext = round2(line.quantity * line.unitPrice);
    const lineVat = round2(ext * line.vatRate / 100);
    exclVat = round2(exclVat + ext);
    totalVat = round2(totalVat + lineVat);
    vatBreakdown[line.vatRate] = round2((vatBreakdown[line.vatRate] ?? 0) + lineVat);
  }
  const inclVat = round2(exclVat + totalVat);

  const canSubmit = ["draft", "failed"].includes(inv.upload_status);
  const isSubmitted = ["uploaded", "accepted", "rejected"].includes(inv.upload_status);

  return (
    <div className="space-y-6 p-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/app/invoices">
          <Button variant="ghost" size="sm" className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            Facturi
          </Button>
        </Link>
      </div>

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{inv.invoice_number}</h1>
          <p className="text-sm text-muted-foreground">
            Emisă la {new Date(inv.issue_date).toLocaleDateString("ro-RO")}
            {inv.due_date && ` · Scadentă la ${new Date(inv.due_date).toLocaleDateString("ro-RO")}`}
          </p>
        </div>
        <StatusBadge status={inv.upload_status} processingStatus={inv.processing_status} />
      </div>

      {inv.upload_status === "rejected" && inv.error_message && (
        <div className="rounded-lg bg-attention/10 border border-attention/25 p-4">
          <p className="text-sm font-medium text-attention">Factură respinsă de ANAF</p>
          <p className="mt-1 text-sm text-attention">{inv.error_message}</p>
        </div>
      )}

      {inv.index_incarcare && (
        <div className="rounded-lg bg-accent border border-brass/15 p-3 text-sm text-brass">
          Index încărcare ANAF: <span className="font-mono font-medium">{inv.index_incarcare}</span>
          {inv.id_descarcare && (
            <> · ID descărcare: <span className="font-mono font-medium">{inv.id_descarcare}</span></>
          )}
        </div>
      )}

      {/* Buyer */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Cumpărător</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p className="font-medium text-foreground">{inv.buyer_name}</p>
          <p className="text-muted-foreground">CIF: {inv.buyer_cif}</p>
          {buyerAddress?.street && (
            <p className="text-muted-foreground">{buyerAddress.street}{buyerAddress.city ? `, ${buyerAddress.city}` : ""}</p>
          )}
        </CardContent>
      </Card>

      {/* Line items */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Produse / servicii</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Denumire</th>
                  <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">UM</th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Cant.</th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Preț fără TVA</th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Cotă TVA</th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Total fără TVA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-card">
                {lines.map((line) => (
                  <tr key={line.id}>
                    <td className="px-4 py-2.5 text-foreground">{line.name}</td>
                    <td className="px-4 py-2.5 text-center text-muted-foreground">{line.unitCode}</td>
                    <td className="px-4 py-2.5 text-right text-foreground">{line.quantity}</td>
                    <td className="px-4 py-2.5 text-right text-foreground">{Number(line.unitPrice).toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">{line.vatRate}%</td>
                    <td className="px-4 py-2.5 text-right font-medium">
                      {round2(line.quantity * line.unitPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      <div className="rounded-xl border border-border bg-secondary p-4 space-y-1 text-sm ml-auto max-w-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total fără TVA</span>
          <span className="font-medium">{exclVat.toFixed(2)} RON</span>
        </div>
        {Object.entries(vatBreakdown).map(([rate, amount]) => (
          <div key={rate} className="flex justify-between text-muted-foreground">
            <span>TVA {rate}%</span>
            <span>{(amount as number).toFixed(2)} RON</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-border pt-1.5 text-base font-bold">
          <span>Total de plată</span>
          <span>{inclVat.toFixed(2)} RON</span>
        </div>
      </div>

      {/* Actions */}
      <InvoiceActions
        invoiceId={id}
        canSubmit={canSubmit}
        isSubmitted={isSubmitted}
        anafConnected={anafConnected}
        hasXml={!!inv.xml_content}
      />
    </div>
  );
}
