"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const selectedLabel = matched ? `${matched.name} - ${formatRatePercent(matched.rate)}` : "";
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const displayValue = open ? query : selectedLabel;
  const portalTarget = typeof document === "undefined" ? null : document.body;

  const filtered = activeRates.filter((rate) => {
    const q = query.toLowerCase().replace("%", "").trim();
    if (!q) return true;
    return `${rate.name} ${rate.rate}`.toLowerCase().includes(q);
  });

  function selectRate(rate: OrgVatRate) {
    const nextLabel = `${rate.name} - ${formatRatePercent(rate.rate)}`;
    onChange?.(String(rate.rate));
    setQuery(nextLabel);
    setOpen(false);
  }

  function updateMenuPosition() {
    const rect = inputRef.current?.getBoundingClientRect();
    if (!rect) return;
    const gap = 4;
    const below = window.innerHeight - rect.bottom - 12;
    const above = rect.top - 12;
    const openAbove = below < 160 && above > below;
    const maxHeight = Math.max(140, Math.min(280, openAbove ? above - gap : below - gap));
    setMenuStyle({
      position: "fixed",
      left: rect.left,
      top: openAbove ? undefined : rect.bottom + gap,
      bottom: openAbove ? window.innerHeight - rect.top + gap : undefined,
      width: rect.width,
      maxHeight,
    });
  }

  useEffect(() => {
    if (!open) return;
    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open]);

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
    <div className={`relative min-w-0 ${className}`}>
      <input type="hidden" name={name} value={matched ? String(matched.rate) : ""} required={required} readOnly />
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={displayValue}
        disabled={disabled}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setQuery("");
          setOpen(true);
        }}
        onBlur={() => {
          setTimeout(() => {
            setOpen(false);
            setQuery("");
          }, 150);
        }}
        placeholder="Search VAT rate..."
        autoComplete="off"
        className={
          compact
            ? "h-10 w-full min-w-0 truncate rounded-md border border-slate-200 bg-white px-2 text-sm"
            : "h-10 w-full min-w-0 truncate rounded-md border border-slate-200 bg-white px-3 text-sm"
        }
      />
      {open && portalTarget && createPortal(
        <div
          style={menuStyle}
          className="z-[9999] overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg"
        >
          {filtered.length > 0 ? (
            filtered.map((rate) => (
              <button
                key={rate.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectRate(rate);
                }}
                className={`flex w-full min-w-0 items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-blue-50 ${
                  matched && ratesMatch(matched.rate, rate.rate) ? "bg-blue-50 font-medium text-blue-700" : "text-slate-700"
                }`}
              >
                <span className="min-w-0 truncate">{rate.name}</span>
                <span className="shrink-0 tabular-nums">{formatRatePercent(rate.rate)}</span>
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-xs text-slate-400">No matching VAT rate</div>
          )}
        </div>,
        portalTarget,
      )}
    </div>
  );
}
