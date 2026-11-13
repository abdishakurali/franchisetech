import type { DayPoint } from "@/lib/admin/metrics";

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  pct,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  /** Change vs the previous window, in percent. null = no previous data. */
  pct?: number | null;
  hint?: string;
  tone?: "neutral" | "bad" | "good";
}) {
  const toneClass = tone === "bad" ? "border-red-300 bg-red-50 dark:bg-red-950/30" : tone === "good" ? "border-emerald-300" : "border-border";
  return (
    <div className={`rounded-xl border bg-card p-4 ${toneClass}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
        {pct !== undefined ? (
          pct === null ? (
            <span className="text-muted-foreground">fără date anterioare</span>
          ) : (
            <span className={pct >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}>
              {pct >= 0 ? "▲" : "▼"} {Math.abs(pct).toLocaleString("ro-RO")}%
            </span>
          )
        ) : null}
        {hint ? <span className="text-muted-foreground">{hint}</span> : null}
      </div>
    </div>
  );
}

/** Server-rendered daily bars (no client JS). */
export function DailyBars({
  title,
  points,
  format = (n) => n.toLocaleString("ro-RO"),
}: {
  title: string;
  points: DayPoint[];
  format?: (n: number) => string;
}) {
  const max = Math.max(1, ...points.map((p) => p.value));
  const total = points.reduce((s, p) => s + p.value, 0);
  const first = points[0]?.day;
  const last = points[points.length - 1]?.day;
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <span className="text-xs tabular-nums text-muted-foreground">total {format(Math.round(total * 100) / 100)}</span>
      </div>
      <div className="flex h-32 items-end gap-px" role="img" aria-label={`${title}: ${points.length} zile`}>
        {points.map((p) => (
          <div
            key={p.day}
            title={`${p.day}: ${format(p.value)}`}
            className={`flex-1 rounded-t-sm ${p.value > 0 ? "bg-primary/80" : "bg-secondary"}`}
            style={{ height: `${Math.max(2, (p.value / max) * 100)}%` }}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
        <span>{first}</span>
        <span>{last}</span>
      </div>
    </div>
  );
}

export function Section({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  return (
    <section className="mt-8">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {note ? <p className="mt-1 text-xs text-muted-foreground">{note}</p> : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[640px] text-left text-sm [&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2 [&_th]:text-xs [&_th]:font-medium [&_th]:text-muted-foreground [&_tbody_tr]:border-t [&_tbody_tr]:border-border">
        {children}
      </table>
    </div>
  );
}

export function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "bad" | "good" | "warn" }) {
  const cls =
    tone === "bad"
      ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
      : tone === "good"
        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
        : tone === "warn"
          ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300"
          : "bg-secondary text-muted-foreground";
  return <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{children}</span>;
}

export const lei = (n: number) => `${n.toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} lei`;
export const eur = (cents: number) => `€${(cents / 100).toLocaleString("ro-RO", { maximumFractionDigits: 2 })}`;
