"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CSSProperties } from "react";

type Option = {
  value: string;
  label: string;
};

type Props = {
  name: string;
  options: Option[];
  defaultValue?: string | null;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  required?: boolean;
  onValueChange?: (value: string) => void;
};

export function SearchableSelect({
  name,
  options,
  defaultValue = "",
  placeholder = "—",
  searchPlaceholder = "Search...",
  className = "",
  required = false,
  onValueChange,
}: Props) {
  const initial = defaultValue ?? "";
  const [value, setValue] = useState(initial);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const portalTarget = typeof document === "undefined" ? null : document.body;
  const selected = options.find((option) => option.value === value);
  const displayValue = open ? query : selected?.label ?? placeholder;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) => option.label.toLowerCase().includes(q));
  }, [options, query]);

  function choose(option: Option) {
    setValue(option.value);
    onValueChange?.(option.value);
    setQuery("");
    setOpen(false);
  }

  function updateMenuPosition() {
    const rect = inputRef.current?.getBoundingClientRect();
    if (!rect) return;
    const gap = 4;
    const below = window.innerHeight - rect.bottom - 12;
    const above = rect.top - 12;
    const openAbove = below < 180 && above > below;
    const maxHeight = Math.max(160, Math.min(320, openAbove ? above - gap : below - gap));
    setMenuStyle({
      position: "fixed",
      left: rect.left,
      top: openAbove ? undefined : rect.bottom + gap,
      bottom: openAbove ? window.innerHeight - rect.top + gap : undefined,
      width: Math.max(rect.width, 220),
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

  return (
    <div className={`relative min-w-0 ${className}`}>
      <input type="hidden" name={name} value={value} required={required} readOnly />
      <input
        ref={inputRef}
        type="text"
        value={displayValue}
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
        placeholder={searchPlaceholder}
        autoComplete="off"
        className="h-10 w-full min-w-0 truncate rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
      />
      {open && portalTarget && createPortal(
        <div
          style={menuStyle}
          className="z-[9999] overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg"
        >
          {!required && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                choose({ value: "", label: placeholder });
              }}
              className="w-full px-3 py-2 text-left text-sm text-slate-500 hover:bg-blue-50"
            >
              {placeholder}
            </button>
          )}
          {filtered.map((option) => (
            <button
              key={option.value}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                choose(option);
              }}
              className={`w-full min-w-0 truncate px-3 py-2 text-left text-sm hover:bg-blue-50 ${
                option.value === value ? "bg-blue-50 font-medium text-blue-700" : "text-slate-700"
              }`}
            >
              {option.label}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-3 py-2 text-xs text-slate-400">No matching option</div>
          )}
        </div>,
        portalTarget,
      )}
    </div>
  );
}
