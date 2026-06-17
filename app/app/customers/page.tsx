import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { addCustomer, importCustomersCsv } from "@/app/actions/kitchenops";

export default async function CustomersPage() {
  const { supabase, orgId } = await getKitchenOpsContext();

  const [{ data: customers }, { data: txCounts }] = await Promise.all([
    supabase
      .from("customers")
      .select("id,name,email,phone,notes,created_at")
      .eq("organisation_id", orgId)
      .order("name"),
    supabase
      .from("pos_transactions")
      .select("customer_id")
      .eq("organisation_id", orgId)
      .not("customer_id", "is", null),
  ]);

  const txByCustomer = new Map<string, number>();
  for (const t of txCounts ?? []) {
    if (t.customer_id) txByCustomer.set(t.customer_id, (txByCustomer.get(t.customer_id) ?? 0) + 1);
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Customers</h1>
          <p className="text-sm text-slate-500">Add customers to link them to sales at the register.</p>
        </div>
        <div className="flex gap-2">
          <a href="/api/customers/export"><Button variant="outline">Export CSV</Button></a>
          <a href="/app/customers/import"><Button variant="outline">Import CSV</Button></a>
        </div>
      </div>
      <details className="rounded-xl border border-slate-200 bg-white">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-700">Import customers</summary>
        <form action={importCustomersCsv as unknown as (fd: FormData) => Promise<void>} className="space-y-3 border-t p-4">
          <a className="text-sm text-blue-600 hover:underline" href={`data:text/csv;charset=utf-8,${encodeURIComponent("name,phone,email,notes\nJane Murphy,+353 87 000 0000,jane@example.ie,Regular customer")}`} download="franchisetech-customers-template.csv">Download CSV template</a>
          <input name="csv_file" type="file" accept=".csv,text/csv" className="block text-sm" />
          <textarea name="csv_text" className="min-h-24 w-full rounded-md border border-slate-200 p-3 font-mono text-xs" placeholder="name,phone,email,notes" />
          <Button type="submit" size="sm">Import customers</Button>
        </form>
      </details>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Add customer form */}
        <Card>
          <CardHeader><CardTitle>Add customer</CardTitle></CardHeader>
          <CardContent>
            <form action={addCustomer as unknown as (fd: FormData) => Promise<void>} className="space-y-3">
              <div>
                <Label>Name *</Label>
                <Input name="name" required placeholder="Jane Murphy" autoFocus />
              </div>
              <div>
                <Label>Email</Label>
                <Input name="email" type="email" placeholder="jane@example.com" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input name="phone" placeholder="+353 87 000 0000" />
              </div>
              <div>
                <Label>Notes</Label>
                <Input name="notes" placeholder="Preferences or notes" />
              </div>
              <Button type="submit" className="w-full">Add customer</Button>
            </form>
          </CardContent>
        </Card>

        {/* Customer list */}
        <Card>
          <CardHeader><CardTitle>Customer list ({customers?.length ?? 0})</CardTitle></CardHeader>
          <CardContent>
            {!customers?.length ? (
              <div className="text-center py-12">
                <p className="text-slate-400">No customers yet.</p>
                <p className="text-sm text-slate-400 mt-1">Add customers here or at the register during a sale.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(customers ?? []).map((c) => (
                    <TableRow key={c.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium"><Link className="block hover:text-blue-600" href={`/app/customers?selected=${c.id}`}>{c.name}</Link></TableCell>
                      <TableCell className="text-slate-500"><Link className="block" href={`/app/customers?selected=${c.id}`}>{c.email ?? "—"}</Link></TableCell>
                      <TableCell className="text-slate-500"><Link className="block" href={`/app/customers?selected=${c.id}`}>{c.phone ?? "—"}</Link></TableCell>
                      <TableCell className="text-right">
                        {txByCustomer.get(c.id) ? (
                          <Badge variant="secondary">{txByCustomer.get(c.id)}</Badge>
                        ) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
