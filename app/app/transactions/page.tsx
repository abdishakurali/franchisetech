import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatMoney, getKitchenOpsContext } from "@/lib/kitchenops/metrics";

function firstJoined<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

export default async function TransactionsPage() {
  const { supabase, orgId, currency } = await getKitchenOpsContext();
  const { data: transactions } = await supabase
    .from("pos_transactions")
    .select("id,transaction_number,sold_at,total,status,payment_methods(name),profiles(full_name,email),pos_transaction_items(id)")
    .eq("organisation_id", orgId)
    .order("sold_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6 p-6">
      <div><h1 className="text-2xl font-semibold text-slate-950">Transactions</h1><p className="text-sm text-slate-500">Sales history from the POS register.</p></div>
      <Card><CardHeader><CardTitle>Transaction history</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Number</TableHead><TableHead>Sold at</TableHead><TableHead>Sold by</TableHead><TableHead>Payment</TableHead><TableHead>Items</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader><TableBody>{(transactions ?? []).map((tx) => {
        const method = firstJoined(tx.payment_methods as { name?: string | null } | { name?: string | null }[]);
        const profile = firstJoined(tx.profiles as { full_name?: string | null; email?: string | null } | { full_name?: string | null; email?: string | null }[]);
        return <TableRow key={tx.id}><TableCell>{tx.transaction_number}</TableCell><TableCell>{formatDate(tx.sold_at)}</TableCell><TableCell>{profile?.full_name || profile?.email || "-"}</TableCell><TableCell>{method?.name ?? "-"}</TableCell><TableCell>{tx.pos_transaction_items?.length ?? 0}</TableCell><TableCell>{formatMoney(tx.total, currency)}</TableCell><TableCell><Badge variant="secondary">{tx.status}</Badge></TableCell><TableCell><Link className="font-medium text-blue-600 hover:underline" href={`/app/transactions/${tx.id}`}>View</Link></TableCell></TableRow>;
      })}</TableBody></Table></CardContent></Card>
    </div>
  );
}
