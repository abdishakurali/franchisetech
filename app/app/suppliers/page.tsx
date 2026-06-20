import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMoney, getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { requireBusinessModule } from "@/lib/module-guard";
import { importSuppliersCsv } from "@/app/actions/kitchenops";

type SupplierRow = { id: string; name: string; contact_name: string | null; email: string | null; phone: string | null; active: boolean };
type PurchaseRow = { supplier_id: string | null; total_amount: number | null };

export default async function SuppliersPage() {
  await requireBusinessModule("inventory");
  const { supabase, orgId, currency } = await getKitchenOpsContext();
  const [suppRes, purchRes] = await Promise.all([
    supabase.from("suppliers").select("*").eq("organisation_id", orgId).eq("active", true).order("name"),
    supabase.from("purchases").select("supplier_id,total_amount").eq("organisation_id", orgId),
  ]);
  const suppliers = (suppRes.data ?? []) as SupplierRow[];
  const purchases = (purchRes.data ?? []) as PurchaseRow[];

  const spendBySupplier = new Map<string, number>();
  for (const p of purchases) {
    if (p.supplier_id) spendBySupplier.set(p.supplier_id, (spendBySupplier.get(p.supplier_id) ?? 0) + Number(p.total_amount ?? 0));
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Suppliers</h1>
          <p className="text-sm text-slate-500">Manage suppliers and track purchase spend by vendor.</p>
        </div>
        <div className="flex gap-2">
          <a href="/api/suppliers/export"><Button variant="outline">Export CSV</Button></a>
          <Link href="/app/suppliers/import"><Button variant="outline">Import CSV</Button></Link>
          <Link href="/app/suppliers/new"><Button>Add supplier</Button></Link>
        </div>
      </div>
      <details className="rounded-xl border border-slate-200 bg-white">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-700">Import suppliers</summary>
        <form action={importSuppliersCsv as unknown as (fd: FormData) => Promise<void>} className="space-y-3 border-t p-4">
          <a className="text-sm text-blue-600 hover:underline" href={`data:text/csv;charset=utf-8,${encodeURIComponent("name,contact_name,phone,email,address,notes\nFresh Foods,Jane Murphy,+353 1 000 0000,orders@example.ie,Dublin,Weekly delivery")}`} download="franchisetech-suppliers-template.csv">Download CSV template</a>
          <input name="csv_file" type="file" accept=".csv,text/csv" className="block text-sm" />
          <textarea name="csv_text" className="min-h-24 w-full rounded-md border border-slate-200 p-3 font-mono text-xs" placeholder="name,contact_name,phone,email,address,notes" />
          <Button type="submit" size="sm">Import suppliers</Button>
        </form>
      </details>
      <Card>
        <CardHeader><CardTitle>Supplier list ({suppliers.length})</CardTitle></CardHeader>
        <CardContent>
          {!suppliers.length ? (
            <div className="text-center py-10">
              <p className="text-slate-400 mb-4">No suppliers yet.</p>
              <Link href="/app/suppliers/new"><Button variant="outline">Add first supplier</Button></Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Total spend</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((s) => (
                  <TableRow key={s.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium"><Link className="block hover:text-blue-600" href={`/app/suppliers/${s.id}/edit`}>{s.name}</Link></TableCell>
                    <TableCell><Link className="block" href={`/app/suppliers/${s.id}/edit`}>{s.contact_name ?? "—"}</Link></TableCell>
                    <TableCell><Link className="block" href={`/app/suppliers/${s.id}/edit`}>{s.email ?? "—"}</Link></TableCell>
                    <TableCell><Link className="block" href={`/app/suppliers/${s.id}/edit`}>{s.phone ?? "—"}</Link></TableCell>
                    <TableCell className="text-right"><Link className="block" href={`/app/suppliers/${s.id}/edit`}>{formatMoney(spendBySupplier.get(s.id) ?? 0, currency)}</Link></TableCell>
                    <TableCell>
                      <Link href={`/app/suppliers/${s.id}/edit`}>
                        <Badge variant="outline" className="cursor-pointer hover:bg-slate-50">Edit</Badge>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
