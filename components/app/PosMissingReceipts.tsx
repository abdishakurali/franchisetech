"use client";

/**
 * Owner/manager banner: sales saved without a fiscal receipt (incident
 * 2026-11-12). Re-issuing goes through the same browser path as a live sale:
 * claimFiscalPrint → fiscalBrowserReceiptAndLog (sends to FiscalNet on this PC
 * and records the attempt, which updates the sale's fiscal status).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { getFiscalRetryPayload, listSalesMissingFiscalReceipt, type SaleMissingFiscalReceipt } from "@/app/actions/fiscal-recovery";
import { fiscalBrowserReceiptAndLog, type RecordFiscalAttempt } from "@/lib/fiscalnet/log-attempt";
import type { BrowserFiscalConfig } from "@/lib/fiscalnet/browser";
import { claimFiscalPrint, fiscalPrintClaimAgeMs, releaseFiscalPrint } from "@/lib/fiscalnet/print-guard";
import { RO_TIME_ZONE } from "@/lib/format/ro-datetime";

type RowResult = { ok: boolean; msg: string; sale: SaleMissingFiscalReceipt };

function lei(v: number) {
  return `${v.toFixed(2)} lei`;
}

function roTime(ts: string) {
  return new Intl.DateTimeFormat("ro-RO", { dateStyle: "short", timeStyle: "short", timeZone: RO_TIME_ZONE }).format(new Date(ts));
}

export function PosMissingReceipts({
  fiscalNet,
  recordAttempt,
}: {
  fiscalNet: BrowserFiscalConfig;
  recordAttempt: RecordFiscalAttempt;
}) {
  const [sales, setSales] = useState<SaleMissingFiscalReceipt[]>([]);
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, RowResult>>({});
  // Synchronous lock: two quick taps both see busyId === null before re-render.
  const busyRef = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const res = await listSalesMissingFiscalReceipt();
      setSales(res.ok ? res.sales : []);
    } catch {
      // Leave the current list; the banner is a recovery aid, never a blocker.
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    listSalesMissingFiscalReceipt().then(
      (res) => { if (!cancelled) setSales(res.ok ? res.sales : []); },
      () => {},
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const setResult = (sale: SaleMissingFiscalReceipt, r: { ok: boolean; msg: string }) =>
    setResults((cur) => ({ ...cur, [sale.id]: { ...r, sale } }));

  const STALE_FAILED_CLAIM_MS = 2 * 60 * 1000;

  async function issue(sale: SaleMissingFiscalReceipt) {
    if (busyRef.current) return;
    const label = sale.transaction_number || sale.id.slice(0, 8);
    const ok = window.confirm(
      `Verificați întâi rola casei de marcat: dacă bonul pentru această vânzare a fost deja tipărit, NU îl emiteți din nou. Emiteți acum bonul pentru vânzarea ${label} (${lei(sale.total)})?`,
    );
    if (!ok) return;
    busyRef.current = true;
    setBusyId(sale.id);
    try {
      // A sale the server reports as "failed" was refused by the cash register
      // (nothing printed). The live path keeps its claim forever, so on the
      // same browser take over a claim older than 2 minutes; the owner has
      // just confirmed the paper roll. Never for pending sales (may be in flight).
      const claimAge = fiscalPrintClaimAgeMs(sale.id);
      if (sale.status === "failed" && claimAge !== null && claimAge > STALE_FAILED_CLAIM_MS) {
        releaseFiscalPrint(sale.id);
      }
      if (!claimFiscalPrint(sale.id)) {
        setResult(sale, { ok: false, msg: "Bonul pentru această vânzare se trimite deja din acest browser." });
        return;
      }
      let payload: Awaited<ReturnType<typeof getFiscalRetryPayload>>;
      try {
        payload = await getFiscalRetryPayload(sale.id);
      } catch (e) {
        releaseFiscalPrint(sale.id);
        setResult(sale, { ok: false, msg: e instanceof Error ? e.message : "Eroare la pregătirea bonului." });
        return;
      }
      if (!payload.ok) {
        // Nothing was sent to the cash register.
        releaseFiscalPrint(sale.id);
        setResult(sale, { ok: false, msg: payload.error });
        return;
      }
      let fnRes: Awaited<ReturnType<typeof fiscalBrowserReceiptAndLog>>;
      try {
        fnRes = await fiscalBrowserReceiptAndLog(fiscalNet, payload.items, payload.total, payload.paymentType, {
          transactionId: payload.transactionId,
          attemptNumber: payload.attemptNumber,
          recordAttempt,
          paymentCode: payload.paymentCode,
        });
      } catch (e) {
        // Unknown whether it reached the device: keep the claim, ask for a roll check.
        setResult(sale, {
          ok: false,
          msg: `Rezultat necunoscut (${e instanceof Error ? e.message : "eroare"}). Verificați rola casei de marcat.`,
        });
        return;
      }
      if (fiscalNet.mockMode && fnRes.ok) {
        setResult(sale, { ok: true, msg: "TEST: bon simulat, nu s-a trimis la casa de marcat." });
      } else if (fnRes.ok && fnRes.confirmation === "unconfirmed") {
        // May have printed: keep the claim so this browser does not send it again.
        setResult(sale, {
          ok: false,
          msg: "FiscalNet a primit bonul, dar nu a confirmat că a fost emis. Verificați rola casei de marcat.",
        });
      } else if (fnRes.ok) {
        setResult(sale, {
          ok: true,
          msg: fnRes.receiptNumber ? `Bon fiscal emis. Nr: ${fnRes.receiptNumber}` : fnRes.message,
        });
      } else {
        releaseFiscalPrint(sale.id);
        setResult(sale, { ok: false, msg: `Bonul NU a fost emis: ${fnRes.message}` });
      }
    } finally {
      busyRef.current = false;
      setBusyId(null);
      void refresh();
    }
  }

  // Keep showing rows that just got a result, so the cashier can read it.
  const doneRows = Object.values(results).filter((r) => !sales.some((s) => s.id === r.sale.id));
  const visible: Array<{ sale: SaleMissingFiscalReceipt; done: boolean }> = [
    ...sales.map((sale) => ({ sale, done: false })),
    ...doneRows.map((r) => ({ sale: r.sale, done: true })),
  ];
  if (sales.length === 0 && Object.keys(results).length === 0) return null;

  return (
    <div role="region" aria-label="Vânzări fără bon fiscal" className="shrink-0 border-b border-attention/30 bg-attention/10 px-3 py-2 text-sm text-attention sm:px-4">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="font-semibold underline underline-offset-2">
        Vânzări fără bon fiscal ({sales.length})
      </button>
      {fiscalNet.mockMode && (
        <span className="ml-2 rounded bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-800">Mod test: bonurile sunt simulate</span>
      )}
      {open && (
        <ul className="mt-2 space-y-2">
          {visible.map(({ sale: s, done }) => {
            const r = results[s.id];
            return (
              <li key={s.id} className="rounded border border-attention/20 bg-card px-2 py-1.5 text-foreground">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{s.transaction_number}</span>
                  <span className="text-muted-foreground">{roTime(s.sold_at)}</span>
                  <span className="tabular-nums">{lei(s.total)}</span>
                  {!done && (
                    <button
                      type="button"
                      disabled={busyId !== null}
                      onClick={() => void issue(s)}
                      className="ml-auto rounded bg-attention px-2 py-1 text-xs font-semibold text-paper disabled:opacity-50"
                    >
                      {busyId === s.id ? "Se trimite..." : "Emite bonul fiscal"}
                    </button>
                  )}
                </div>
                {r && (
                  <p role="status" className={r.ok ? "mt-1 text-reconciled" : "mt-1 text-attention"}>
                    {r.msg}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
