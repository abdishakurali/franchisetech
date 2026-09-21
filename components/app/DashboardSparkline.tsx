/** A minimal 7-bar trend indicator — not a report chart, just a glance-able
 * shape next to today's sales figure. No axes, labels, or tooltip. */
export function DashboardSparkline({ values }: { values: number[] }) {
  const max = Math.max(1, ...values);
  return (
    <div className="mt-2 flex h-8 items-end gap-1" aria-hidden>
      {values.map((v, i) => {
        const isLast = i === values.length - 1;
        const heightPct = Math.max(6, Math.round((v / max) * 100));
        return (
          <div
            key={i}
            className={`w-full rounded-sm ${isLast ? "bg-brass" : "bg-accent"}`}
            style={{ height: `${heightPct}%` }}
          />
        );
      })}
    </div>
  );
}
