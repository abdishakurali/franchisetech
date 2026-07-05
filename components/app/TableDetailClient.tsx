"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  openTab,
  requestBill,
  closeTab,
  voidTab,
  unlockTabForOrdering,
  type TableWithStatus,
} from "@/app/actions/table-service";
import { PreBillPrintButton } from "@/components/app/PreBillPrintButton";
import { Clock, Users, ArrowLeft, CreditCard, FileText, LockOpen, XCircle } from "lucide-react";

type Props = {
  table: TableWithStatus;
  canManage: boolean;
  currency: string;
};

function formatDuration(openedAt: string): string {
  const ms = Date.now() - new Date(openedAt).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

function statusMeta(tab: TableWithStatus["active_tab"]) {
  if (!tab) return { label: "Liberă", color: "bg-emerald-500", badge: "default" as const, border: "border-emerald-200" };
  if (tab.status === "bill_requested") return { label: "Solicită nota", color: "bg-blue-500", badge: "secondary" as const, border: "border-blue-300 ring-2 ring-blue-200" };
  return { label: "Ocupată", color: "bg-red-500", badge: "destructive" as const, border: "border-red-200" };
}

export function TableDetailClient({ table, canManage, currency }: Props) {
  const router = useRouter();
  const [coverCount, setCoverCount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const tab = table.active_tab;
  const meta = statusMeta(tab);

  function run(action: () => Promise<{ ok: boolean; error?: string; tabId?: string }>, onSuccess?: () => void) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Eroare.");
        return;
      }
      onSuccess?.();
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 min-h-[calc(100vh-8rem)]">
      {/* Floor context — inspired by design left panel */}
      <div className="flex-1 min-w-0">
        <Link href="/app/tables" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          Înapoi la sală
        </Link>

        <div className={`border rounded-2xl p-6 sm:p-8 bg-card ${meta.border} transition-all`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${meta.color}`} />
                <h1 className="text-2xl font-bold">{table.name}</h1>
              </div>
              {table.section && (
                <p className="text-sm text-muted-foreground mt-1">{table.section}</p>
              )}
              {table.capacity && (
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {table.capacity} locuri
                </p>
              )}
            </div>
            <Badge variant={meta.badge}>{meta.label}</Badge>
          </div>

          {tab && (
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Durată</p>
                <p className="font-semibold flex items-center gap-1 mt-0.5">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDuration(tab.opened_at)}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Persoane</p>
                <p className="font-semibold mt-0.5">{tab.cover_count ?? "—"}</p>
              </div>
              {tab.opener_name && (
                <div className="rounded-lg bg-muted/50 p-3 col-span-2">
                  <p className="text-xs text-muted-foreground">Deschis de</p>
                  <p className="font-semibold mt-0.5">{tab.opener_name}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detail sidebar — inspired by design right panel */}
      <aside className="w-full lg:w-96 shrink-0 border rounded-2xl bg-card shadow-sm flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Detalii</h2>
          {tab && tab.status === "bill_requested" && (
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Notă solicitată</Badge>
          )}
          {!tab && <Badge variant="outline">Liberă</Badge>}
        </div>

        <div className="p-4 flex-1 space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          )}

          {!tab ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Deschide un bon pentru această masă.</p>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Număr persoane (opțional)</label>
                <Input
                  type="number"
                  min={1}
                  value={coverCount}
                  onChange={(e) => setCoverCount(e.target.value)}
                  placeholder="2"
                  className="h-9"
                />
              </div>
              <Button
                className="w-full"
                disabled={pending}
                onClick={() => run(() => openTab(table.id, {
                  coverCount: coverCount ? Number(coverCount) : undefined,
                  siteId: table.site_id,
                }))}
              >
                Deschide bon
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {tab.status === "open" && (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    disabled={pending}
                    onClick={() => run(() => requestBill(tab.id))}
                  >
                    <FileText className="h-4 w-4" />
                    Solicită nota de plată
                  </Button>
                  <PreBillPrintButton tabId={tab.id} currency={currency} disabled={pending} requestBillFirst />
                </>
              )}

              {tab.status === "bill_requested" && (
                <>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    Masa este blocată pentru comandă nouă. Poți încasa sau debloca (manager).
                  </div>
                  <PreBillPrintButton tabId={tab.id} currency={currency} disabled={pending} requestBillFirst={false} />
                  {canManage && (
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      disabled={pending}
                      onClick={() => run(() => unlockTabForOrdering(tab.id))}
                    >
                      <LockOpen className="h-4 w-4" />
                      Deblochează pentru comandă
                    </Button>
                  )}
                </>
              )}

              <Link href={`/app/pos?tabId=${tab.id}`} className="block">
                <Button className="w-full justify-start gap-2" disabled={pending}>
                  <CreditCard className="h-4 w-4" />
                  Comandă →
                </Button>
              </Link>

              {canManage && (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    disabled={pending}
                    onClick={() => run(() => closeTab(tab.id))}
                  >
                    Închide bon (fără încasare)
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-red-600 hover:text-red-700"
                    disabled={pending}
                    onClick={() => {
                      if (!confirm("Anulezi bonul deschis?")) return;
                      run(() => voidTab(tab.id));
                    }}
                  >
                    <XCircle className="h-4 w-4" />
                    Anulează bon
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
