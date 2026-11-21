"use client";

/**
 * Till banner: sales whose fiscal receipt was never confirmed, each with
 * "Trimite bonul din nou". Sending needs a ticked "I checked the printer, the
 * receipt did NOT print" box; the server refuses without it (see
 * lib/fiscalnet/resend.ts for why: FiscalNet cannot de-duplicate).
 */

import { useRef, useState } from "react";
import { beginFiscalReceiptResend, finishFiscalReceiptResend } from "@/app/actions/fiscal-resend";
import type { BrowserFiscalConfig } from "@/lib/fiscalnet/browser";
import { RESEND_TEXT } from "@/lib/fiscalnet/resend";
import { resendFiscalReceipt, type ResendDeps, type ResendOutcome } from "@/lib/fiscalnet/resend-client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type UnconfirmedReceipt = {
  id: string;
  transactionNumber: string;
  total: number;
  soldAt: string | null;
  status: string;
};

const STATUS_LABEL: Record<string, string> = {
  failed: "netrimis",
  timeout: "fără răspuns",
  api_pending: "fără răspuns",
  unconfirmed: "neconfirmat",
};

function timeLabel(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("ro-RO", {
      timeZone: "Europe/Bucharest",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function FiscalResendPanel({
  receipts,
  fiscalNet,
  money,
  trackPrint = (p) => p,
  deps,
}: {
  receipts: UnconfirmedReceipt[];
  fiscalNet: BrowserFiscalConfig;
  money: (v: number) => string;
  /** PosRegister passes trackFiscalPrint so a till refresh waits for the answer. */
  trackPrint?: (p: Promise<ResendOutcome>) => Promise<ResendOutcome>;
  /** Tests only. */
  deps?: ResendDeps;
}) {
  const [resolved, setResolved] = useState<Record<string, string>>({});
  const [target, setTarget] = useState<UnconfirmedReceipt | null>(null);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const inFlight = useRef(false);

  const open = receipts.filter((r) => !resolved[r.id]);
  if (open.length === 0 && !message) return null;

  function close() {
    if (busy) return;
    setTarget(null);
    setChecked(false);
  }

  async function send() {
    if (!target || !checked || inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setMessage(null);
    try {
      const outcome = await trackPrint(
        resendFiscalReceipt(fiscalNet, target.id, deps ?? { begin: beginFiscalReceiptResend, finish: finishFiscalReceiptResend }),
      );
      if (outcome.kind === "refused") {
        setMessage({ ok: false, text: outcome.message });
      } else if (outcome.confirmed) {
        setResolved((m) => ({ ...m, [target.id]: "success" }));
        setMessage({ ok: true, text: `${target.transactionNumber}: ${RESEND_TEXT.done(outcome.result.receiptNumber ?? null)}` });
      } else {
        // The attempt is logged; the sale stays listed (failed) or is flagged (ambiguous).
        if (outcome.result.ok) setResolved((m) => ({ ...m, [target.id]: "ambiguous" }));
        setMessage({ ok: false, text: `${target.transactionNumber}: ${outcome.result.message}` });
      }
    } finally {
      inFlight.current = false;
      setBusy(false);
      setTarget(null);
      setChecked(false);
    }
  }

  return (
    <div role="alert" data-testid="fiscal-resend-panel" className="shrink-0 border-b border-attention/30 bg-attention/10 px-3 py-2.5 text-sm text-attention sm:px-4">
      {open.length > 0 && (
        <>
          <p className="font-semibold">{RESEND_TEXT.panelTitle(open.length)}</p>
          <p className="mt-0.5">{RESEND_TEXT.panelHint}</p>
          <ul className="mt-1.5 space-y-1">
            {open.slice(0, 5).map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="tabular-nums">
                  {timeLabel(r.soldAt)} · {r.transactionNumber} · {money(r.total)} · {STATUS_LABEL[r.status] ?? r.status}
                </span>
                <button
                  type="button"
                  onClick={() => { setMessage(null); setTarget(r); }}
                  className="font-semibold underline underline-offset-2"
                  data-testid={`fiscal-resend-${r.id}`}
                >
                  {RESEND_TEXT.button}
                </button>
              </li>
            ))}
          </ul>
          {open.length > 5 && <p className="mt-1">+ încă {open.length - 5} (Tranzacții)</p>}
        </>
      )}
      {message && (
        <p className={message.ok ? "mt-1.5 font-semibold text-reconciled" : "mt-1.5 font-semibold"} data-testid="fiscal-resend-message">
          {message.text}
        </p>
      )}

      <Dialog open={target !== null} onOpenChange={(v) => { if (!v) close(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{RESEND_TEXT.title}</DialogTitle>
          </DialogHeader>
          {target && (
            <div className="space-y-3 text-sm">
              <p className="tabular-nums">
                {target.transactionNumber} · {money(target.total)} · {timeLabel(target.soldAt)}
              </p>
              <p className="text-attention">{RESEND_TEXT.warn}</p>
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-0.5 h-5 w-5"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                  disabled={busy}
                  data-testid="fiscal-resend-checked"
                />
                <span>{RESEND_TEXT.check}</span>
              </label>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close} disabled={busy}>
              {RESEND_TEXT.cancel}
            </Button>
            <Button type="button" onClick={() => void send()} disabled={!checked || busy} data-testid="fiscal-resend-confirm">
              {busy ? RESEND_TEXT.sending : RESEND_TEXT.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
