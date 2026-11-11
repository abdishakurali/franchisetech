"use client";

import { Minus, Plus } from "lucide-react";

/** Touch-first [-] qty [+] control, with typing still supported for keyboard/desktop use.
 *
 *  PostHog, 30 days to 2026-11-11: 48 of the 69 rage clicks on /app/pos land on this
 *  stepper (the till-close cash counter), not on the product grid. Three session replays
 *  show the clicks are deliberate — one click per banknote, the count and "Total numărat"
 *  updating every time — so this is not an unresponsive control. It is just the slowest
 *  way to enter a number: 12 fifty-lei notes meant 12 clicks, and the field was awkward
 *  to type into, so nobody typed. Hence:
 *    - 44px buttons (Apple HIG / Material minimum), matching the cart qty buttons that
 *      were raised from 40px for the same reason;
 *    - native number spinners hidden, so the only +/- targets are the 44px buttons and
 *      not Chrome's ~8px arrows sitting inside the field (4 rage clicks landed there);
 *    - select-on-focus, so typing a count replaces it instead of appending to it
 *      (click +4 times then type "12" used to give 412).
 */
export function CashDenomStepper({
  value,
  onChange,
  disabled,
  label,
  increaseLabel,
  decreaseLabel,
}: {
  value: number;
  onChange: (next: number) => void;
  disabled?: boolean;
  label: string;
  /** Accessible name for [+], e.g. "Crește numărul de 50 lei". Falls back to English. */
  increaseLabel?: string;
  /** Accessible name for [-], e.g. "Scade numărul de 50 lei". Falls back to English. */
  decreaseLabel?: string;
}) {
  const dec = () => onChange(Math.max(0, value - 1));
  const inc = () => onChange(value + 1);

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={disabled || value <= 0}
        onClick={dec}
        aria-label={decreaseLabel ?? `Decrease ${label}`}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-mid hover:border-brass/40 hover:text-brass disabled:opacity-40 disabled:hover:border-border disabled:hover:text-mid"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        min="0"
        step="1"
        inputMode="numeric"
        disabled={disabled}
        value={value || ""}
        placeholder="0"
        aria-label={label}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
        className="h-11 w-24 flex-1 rounded-lg border border-border text-center text-sm font-semibold tabular-nums focus:border-brass focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        disabled={disabled}
        onClick={inc}
        aria-label={increaseLabel ?? `Increase ${label}`}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-mid hover:border-brass/40 hover:text-brass disabled:opacity-40"
      >
        <Plus className="h-4 w-4" />
      </button>
      <span className="w-20 shrink-0 text-right text-sm font-medium text-foreground">{label}</span>
    </div>
  );
}
