"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { OrgVatRate } from "@/lib/vat-rates";
import { formatRatePercent, ratesMatch } from "@/lib/vat-rates";

type Props = {
  rates: OrgVatRate[];
  value: string;
  onChange?: (rate: string) => void;
  name?: string;
  disabled?: boolean;
  compact?: boolean;
  required?: boolean;
  id?: string;
  className?: string;
  settingsHint?: boolean;
};

export function VatRateSelect({
  rates,
  value,
  onChange,
  name = "vat_rate",
  disabled = false,
  compact = false,
  required = false,
  id,
  className = "",
  settingsHint = true,
}: Props) {
  const activeRates = useMemo(
    () => rates.filter((r) => r.active !== false).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.rate - b.rate),
    [rates]
  );
  const numericValue = value === "" ? NaN : Number(value);
  const matched = activeRates.find((r) => ratesMatch(r.rate, numericValue));
  const [query, setQuery] = useState(() => (matched ? formatRatePercent(matched.rate) : value !== "" ? formatRatePercent(Number(value)) : ""));
  const [open, setOpen] = useState(false);

  const filtered = activeRates.filter((r) => {
    const q = query.replace(/%/g, "").trim().toLowerCase();
    if (!q) return true;
    return String(r.rate).includes(q);
  });

  const showLegacy = value !== "" && !Number.isNaN(numericValue) && !matched;

  function selectRate(rate: OrgVatRate) {
    const next = String(rate.rate);
    setQuery(formatRatePercent(rate.rate));
    setOpen(false);
    onChange?.(next);
  }

  if (activeRates.length === 0) {
    return (
      <div className={`space-y-1 ${className}`}>
        <input type="hidden" name={name} value={value || "0"} />
        <p className="text-xs text-amber-700">
          No VAT rates configured.{" "}
          {settingsHint && (
            <Link href="/app/settings?tab=general" className="underline">
              Add rates in Settings
            </Link>
          )}
        </p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <input type="hidden" name={name} value={value} required={required} readOnly />
      <input
        id={id}
        type="text"
        value={query}
        disabled={disabled}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Rate %"
        className={
          compact
            ? "h-10 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
            : "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
        }
        autoComplete="off"
      />
      {open && (
        <ul
          className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg"
          role="listbox"
        >
          {showLegacy && (
            <li>
              <button
                type="button"
                className="flex w-full px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setQuery(formatRatePercent(numericValue));
                  setOpen(false);
                }}
              >
                {formatRatePercent(numericValue)}
              </button>
            </li>
          )}
          {filtered.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                className={`flex w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                  matched && ratesMatch(matched.rate, r.rate) ? "bg-blue-50 font-medium text-blue-700" : "text-slate-700"
                }`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectRate(r)}
              >
                {formatRatePercent(r.rate)}
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-3 py-2 text-xs text-slate-400">No matching rate</li>
          )}
        </ul>
      )}
    </div>
  );
}
