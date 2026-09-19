"use client";

type PosCashKeypadProps = {
  value: number | "";
  onChange: (value: number | "") => void;
  disabled?: boolean;
  clearLabel?: string;
  keypadAria?: string;
};

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"] as const;

export function PosCashKeypad({ value, onChange, disabled, clearLabel = "Clear", keypadAria = "Cash amount keypad" }: PosCashKeypadProps) {
  const str = value === "" ? "" : String(value);

  function append(key: string) {
    if (disabled) return;
    if (key === "⌫") {
      const next = str.slice(0, -1);
      onChange(next === "" || next === "." ? "" : Number(next));
      return;
    }
    if (key === ".") {
      if (str.includes(".")) return;
      onChange(str === "" ? 0 : Number(`${str}.`));
      return;
    }
    const next = str === "0" && key !== "." ? key : `${str}${key}`;
    const parsed = parseFloat(next);
    if (!Number.isFinite(parsed) || parsed < 0) return;
    onChange(Math.round(parsed * 100) / 100);
  }

  return (
    <div className="grid grid-cols-3 gap-2" role="group" aria-label={keypadAria}>
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          disabled={disabled}
          onClick={() => append(key)}
          className={`flex h-14 items-center justify-center rounded-xl border text-lg font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40 disabled:opacity-40 ${
            key === "⌫"
              ? "border-border bg-secondary text-mid hover:bg-secondary"
              : "border-border bg-white text-foreground hover:bg-secondary active:bg-accent"
          }`}
        >
          {key}
        </button>
      ))}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("")}
        className="col-span-3 flex h-11 items-center justify-center rounded-xl border border-border bg-white text-sm font-semibold text-mid hover:bg-secondary disabled:opacity-40"
      >
        {clearLabel}
      </button>
    </div>
  );
}
