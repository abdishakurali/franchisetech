"use client";

type Props = {
  labels: string[];
  current: number;
  timeEstimate?: string;
  /** Pre-formatted "Pasul 2 din 6" / "Step 2 of 6" — a string, not a
   *  formatter function: this component is rendered from Server Component
   *  pages, and a function prop can't cross that boundary (RSC). */
  stepOfLabel: string;
};

/** One progress pattern: current step name + "Pasul X din Y", one bar.
 *  No separate time estimate, no per-step box grid — those duplicated
 *  the same "where am I" answer four times over. */
export function OnboardingStepper({ labels, current, stepOfLabel }: Props) {
  const total = labels.length;
  const progressPct = total > 1 ? Math.round(((current + 1) / total) * 100) : 100;
  const currentLabel = labels[current] ?? "";

  return (
    <div className="mb-6 space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-foreground">{currentLabel}</span>
        <span className="text-muted-foreground">{stepOfLabel}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${Math.max(8, progressPct)}%` }}
        />
      </div>
    </div>
  );
}
