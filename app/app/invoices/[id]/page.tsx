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
    return <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">Acceptată ANAF</span>;
  }
  if (status === "rejected") {
    return <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700">Respinsă ANAF</span>;
  }
  if (status === "uploaded" || processingStatus === "in prelucrare") {
    return <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">Trimisă la ANAF</span>;
  }
  if (status === "pending") {
    return <span className="inline-flex items-center rounded-full bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-700">Se trimite...</span>;
  }
  if (status === "failed") {
    return <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700">Eroare trimitere</span>;
  }
  return <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">Draft</span>;
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
          <h1 className="text-2xl font-semibold text-slate-950">{inv.invoice_number}</h1>
          <p className="text-sm text-slate-500">
            Emisă la {new Date(inv.issue_date).toLocaleDateString("ro-RO")}
            {inv.due_date && ` · Scadentă la ${new Date(inv.due_date).toLocaleDateString("ro-RO")}`}
          </p>
        </div>
        <StatusBadge status={inv.upload_status} processingStatus={inv.processing_status} />
      </div>

      {inv.upload_status === "rejected" && inv.error_message && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm font-medium text-red-800">Factură respinsă de ANAF</p>
          <p className="mt-1 text-sm text-red-700">{inv.error_message}</p>
        </div>
      )}

      {inv.index_incarcare && (
        <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-sm text-blue-700">
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
          <p className="font-medium text-slate-900">{inv.buyer_name}</p>
          <p className="text-slate-500">CIF: {inv.buyer_cif}</p>
          {buyerAddress?.street && (
            <p className="text-slate-500">{buyerAddress.street}{buyerAddress.city ? `, ${buyerAddress.city}` : ""}</p>
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
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium text-slate-500">Denumire</th>
                  <th className="px-4 py-2.5 text-center font-medium text-slate-500">UM</th>
                  <th className="px-4 py-2.5 text-right font-medium text-slate-500">Cant.</th>
                  <th className="px-4 py-2.5 text-right font-medium text-slate-500">Preț fără TVA</th>
                  <th className="px-4 py-2.5 text-right font-medium text-slate-500">Cotă TVA</th>
                  <th className="px-4 py-2.5 text-right font-medium text-slate-500">Total fără TVA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {lines.map((line) => (
                  <tr key={line.id}>
                    <td className="px-4 py-2.5 text-slate-800">{line.name}</td>
                    <td className="px-4 py-2.5 text-center text-slate-500">{line.unitCode}</td>
                    <td className="px-4 py-2.5 text-right text-slate-700">{line.quantity}</td>
                    <td className="px-4 py-2.5 text-right text-slate-700">{Number(line.unitPrice).toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right text-slate-500">{line.vatRate}%</td>
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
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1 text-sm ml-auto max-w-xs">
        <div className="flex justify-between">
          <span className="text-slate-500">Total fără TVA</span>
          <span className="font-medium">{exclVat.toFixed(2)} RON</span>
        </div>
        {Object.entries(vatBreakdown).map(([rate, amount]) => (
          <div key={rate} className="flex justify-between text-slate-500">
            <span>TVA {rate}%</span>
            <span>{(amount as number).toFixed(2)} RON</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-slate-200 pt-1.5 text-base font-bold">
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
