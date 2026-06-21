import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatMoney, getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { getAppLocaleAndText } from "@/lib/app-locale-server";

function firstJoined<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

export default async function TransactionsPage() {
  const { countryCode, supabase, orgId, currency } = await getKitchenOpsContext();
  const { t } = await getAppLocaleAndText(countryCode);
  const { data: transactions } = await supabase
    .from("pos_transactions")
    .select("id,transaction_number,sold_at,total,discount_total,status,payment_methods(name),profiles(full_name,email),pos_transaction_items(id,discount_pct)")
    .eq("organisation_id", orgId)
    .order("sold_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6 p-6">
      <div><h1 className="text-2xl font-semibold text-slate-950">{t.transactions.title}</h1><p className="text-sm text-slate-500">{t.transactions.subtitle}</p></div>
      <Card><CardHeader><CardTitle>{t.transactions.historyTitle}</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>{t.transactions.number}</TableHead><TableHead>{t.transactions.soldAt}</TableHead><TableHead>{t.transactions.soldBy}</TableHead><TableHead>{t.tables.payment}</TableHead><TableHead>{t.transactions.items}</TableHead><TableHead>{t.tables.total}</TableHead><TableHead>{t.tables.status}</TableHead><TableHead></TableHead></TableRow></TableHeader><TableBody>{(transactions ?? []).map((tx) => {
        const method = firstJoined(tx.payment_methods as { name?: string | null } | { name?: string | null }[]);
        const profile = firstJoined(tx.profiles as { full_name?: string | null; email?: string | null } | { full_name?: string | null; email?: string | null }[]);
        const discountTotal = Number(tx.discount_total ?? 0);
        const itemDiscounts = (tx.pos_transaction_items ?? []).some((i: { discount_pct?: number | null }) => Number(i.discount_pct ?? 0) > 0);
        return <TableRow key={tx.id}><TableCell>{tx.transaction_number}</TableCell><TableCell>{formatDate(tx.sold_at)}</TableCell><TableCell>{profile?.full_name || profile?.email || "-"}</TableCell><TableCell>{method?.name ?? "-"}</TableCell><TableCell>{tx.pos_transaction_items?.length ?? 0}</TableCell><TableCell><div>{formatMoney(tx.total, currency)}</div>{(discountTotal > 0 || itemDiscounts) && <div className="text-xs text-blue-600 font-medium">−{formatMoney(discountTotal > 0 ? discountTotal : 0, currency)} {t.transactions.disc}</div>}</TableCell><TableCell><Badge variant="secondary">{tx.status}</Badge></TableCell><TableCell><Link className="font-medium text-blue-600 hover:underline" href={`/app/transactions/${tx.id}`}>{t.transactions.view}</Link></TableCell></TableRow>;
      })}</TableBody></Table></CardContent></Card>
    </div>
  );
}
