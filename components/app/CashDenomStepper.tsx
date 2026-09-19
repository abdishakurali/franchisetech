"use client";

import { Minus, Plus } from "lucide-react";

/** Touch-first [-] qty [+] control, with typing still supported for keyboard/desktop use. */
export function CashDenomStepper({
  value,
  onChange,
  disabled,
  label,
}: {
  value: number;
  onChange: (next: number) => void;
  disabled?: boolean;
  label: string;
}) {
  const dec = () => onChange(Math.max(0, value - 1));
  const inc = () => onChange(value + 1);

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={disabled || value <= 0}
        onClick={dec}
        aria-label={`Decrease ${label}`}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-mid hover:border-brass/40 hover:text-brass disabled:opacity-40 disabled:hover:border-border disabled:hover:text-mid"
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
        onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
        className="h-10 w-24 flex-1 rounded-lg border border-border text-center text-sm font-semibold tabular-nums focus:border-brass focus:outline-none"
      />
      <button
        type="button"
        disabled={disabled}
        onClick={inc}
        aria-label={`Increase ${label}`}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-mid hover:border-brass/40 hover:text-brass disabled:opacity-40"
      >
        <Plus className="h-4 w-4" />
      </button>
      <span className="w-20 shrink-0 text-right text-sm font-medium text-foreground">{label}</span>
    </div>
  );
}
