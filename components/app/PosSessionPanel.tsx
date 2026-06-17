"use client";

import { useState, useRef } from "react";
import { openPosSession, posCashMovement, closePosSession } from "@/app/actions/kitchenops";

type Session = {
  id: string;
  opening_cash: number;
  expected_cash: number;
  cash_sales: number;
};

function money(v: number) {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(v);
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

// ─── Open Till (no session) ────────────────────────────────────────────────
export function OpenTillButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="h-12 px-6 bg-green-600 hover:bg-green-700 text-white text-base font-semibold rounded-xl"
      >
        Open till
      </button>
      {open && (
        <Modal title="Open till" onClose={() => setOpen(false)}>
          <form action={openPosSession as unknown as (fd: FormData) => Promise<void>} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Opening float (€)</label>
              <input
                name="opening_cash"
                type="number"
                step="0.01"
                min="0"
                placeholder="100.00"
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-xl font-semibold text-center"
                autoFocus
              />
              <p className="text-xs text-slate-400 mt-1">Enter the cash in the drawer to start.</p>
            </div>
            <button type="submit" className="h-11 w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl">
              Open POS
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}

// ─── Session action buttons (till is open) ─────────────────────────────────
export function SessionActions({ session }: { session: Session }) {
  const [modal, setModal] = useState<"cash_in" | "cash_out" | "close" | null>(null);
  const closeModal = () => setModal(null);

  return (
    <>
      {/* Buttons in the session bar */}
      <div className="flex gap-2">
        <button
          onClick={() => setModal("cash_in")}
          className="rounded-lg border border-green-200 bg-green-50 text-green-700 px-3 py-1.5 text-sm font-medium hover:bg-green-100"
        >
          Cash in
        </button>
        <button
          onClick={() => setModal("cash_out")}
          className="rounded-lg border border-amber-200 bg-amber-50 text-amber-700 px-3 py-1.5 text-sm font-medium hover:bg-amber-100"
        >
          Cash out
        </button>
        <button
          onClick={() => setModal("close")}
          className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-1.5 text-sm font-medium hover:bg-red-100 font-semibold"
        >
          Close till
        </button>
      </div>

      {/* Cash In modal */}
      {modal === "cash_in" && (
        <Modal title="Cash in" onClose={closeModal}>
          <form action={posCashMovement as unknown as (fd: FormData) => Promise<void>} className="space-y-3">
            <input type="hidden" name="session_id" value={session.id} />
            <input type="hidden" name="movement_type" value="cash_in" />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount (€)</label>
              <input name="amount" type="number" step="0.01" min="0.01" placeholder="0.00"
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-lg font-semibold text-center" autoFocus required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
              <input name="reason" placeholder="e.g. Extra float" required
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" />
            </div>
            <button type="submit" className="h-11 w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl">
              Add cash in
            </button>
          </form>
        </Modal>
      )}

      {/* Cash Out modal */}
      {modal === "cash_out" && (
        <Modal title="Cash out" onClose={closeModal}>
          <form action={posCashMovement as unknown as (fd: FormData) => Promise<void>} className="space-y-3">
            <input type="hidden" name="session_id" value={session.id} />
            <input type="hidden" name="movement_type" value="cash_out" />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount (€)</label>
              <input name="amount" type="number" step="0.01" min="0.01" placeholder="0.00"
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-lg font-semibold text-center" autoFocus required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
              <input name="reason" placeholder="e.g. Supplier payment" required
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" />
            </div>
            <button type="submit" className="h-11 w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl">
              Remove cash
            </button>
          </form>
        </Modal>
      )}

      {/* Close Till modal */}
      {modal === "close" && (
        <Modal title="Close till" onClose={closeModal}>
          <form action={closePosSession as unknown as (fd: FormData) => Promise<void>} className="space-y-3">
            <input type="hidden" name="session_id" value={session.id} />
            {/* Summary */}
            <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Opening float</span>
                <strong>{money(session.opening_cash)}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Cash sales</span>
                <strong>{money(session.cash_sales)}</strong>
              </div>
              <div className="flex justify-between font-semibold text-green-700 border-t border-slate-200 pt-1.5 mt-1">
                <span>Expected in drawer</span>
                <strong>{money(session.expected_cash)}</strong>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Counted cash (€)</label>
              <input name="counted_cash" type="number" step="0.01" min="0"
                placeholder={session.expected_cash.toFixed(2)}
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-lg font-semibold text-center" autoFocus required />
              <p className="text-xs text-slate-400 mt-1">Count the cash drawer and enter the total.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
              <input name="notes" placeholder="End of day notes"
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" />
            </div>
            <button type="submit" className="h-11 w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl">
              Close till
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
