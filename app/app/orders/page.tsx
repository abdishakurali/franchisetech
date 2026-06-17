import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMoney, getKitchenOpsContext } from "@/lib/kitchenops/metrics";

function firstJoined<T>(v: T | T[] | null | undefined): T | null {
  return Array.isArray(v) ? v[0] ?? null : v ?? null;
}

export default async function OrdersPage() {
  const { supabase, orgId, currency } = await getKitchenOpsContext();

  const { data: transactions } = await supabase
    .from("pos_transactions")
    .select("id,transaction_number,sold_at,total,status,customer_name,payment_methods(name),pos_transaction_items(product_name,quantity)")
    .eq("organisation_id", orgId)
    .eq("status", "completed")
    .order("sold_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Orders</h1>
          <p className="text-sm text-slate-500">Recent completed sales from the register.</p>
        </div>
        <Link href="/app/pos" className="rounded-lg bg-green-600 text-white px-4 py-2 text-sm font-medium hover:bg-green-700">
          + New sale
        </Link>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent orders ({transactions?.length ?? 0})</CardTitle></CardHeader>
        <CardContent>
          {!transactions?.length ? (
            <div className="text-center py-12">
              <p className="text-slate-400 mb-3">No orders yet today.</p>
              <Link href="/app/pos" className="text-blue-600 hover:underline text-sm">Go to register →</Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(transactions ?? []).map((tx) => {
                  const method = firstJoined(tx.payment_methods as {name?:string}|{name?:string}[]|null);
                  const items = tx.pos_transaction_items ?? [];
                  const time = tx.sold_at ? new Intl.DateTimeFormat("en-IE", { timeStyle: "short", dateStyle: "short" }).format(new Date(tx.sold_at)) : "—";
                  return (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-sm">{tx.transaction_number}</TableCell>
                      <TableCell className="text-sm text-slate-500">{time}</TableCell>
                      <TableCell>{tx.customer_name ?? "—"}</TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600">
                          {items.slice(0, 2).map((i: {product_name:string;quantity:number}) => `${i.product_name} ×${i.quantity}`).join(", ")}
                          {items.length > 2 && ` +${items.length - 2} more`}
                        </span>
                      </TableCell>
                      <TableCell><Badge variant="secondary">{method?.name ?? "—"}</Badge></TableCell>
                      <TableCell className="text-right font-semibold">{formatMoney(tx.total, currency)}</TableCell>
                      <TableCell>
                        <Link href={`/app/transactions/${tx.id}`} className="text-sm text-blue-600 hover:underline">Receipt</Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
