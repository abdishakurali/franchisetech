import { ArrowRight, type LucideIcon } from "lucide-react";

/**
 * Honest replacement for a "hero screenshot": shows the real product flow
 * (accurate step names, no fabricated sales figures) instead of a mocked-up
 * dashboard with invented numbers. A hand-built mockup with fake data is the
 * same kind of claim as a stale screenshot — this shows structure, not
 * pretend evidence. See MEMORY.md for the screenshot audit this replaced.
 */
export function HomeFlowDiagram({
  steps,
  tone = "dark",
}: {
  steps: Array<{ icon: LucideIcon; label: string; detail: string }>;
  tone?: "dark" | "light";
}) {
  const isDark = tone === "dark";
  return (
    <div
      className={`flex h-full min-h-[280px] flex-col justify-center gap-4 p-6 sm:p-8 ${
        isDark ? "bg-ink text-paper" : "bg-card text-foreground"
      }`}
    >
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-start gap-4">
          <div className="flex flex-col items-center">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                isDark ? "border-brass/40 bg-brass/10" : "border-brass/30 bg-brass/10"
              }`}
            >
              <step.icon className="h-4.5 w-4.5 text-brass" strokeWidth={1.75} aria-hidden />
            </span>
            {i < steps.length - 1 && (
              <span className={`mt-1 h-6 w-px ${isDark ? "bg-paper/15" : "bg-border"}`} />
            )}
          </div>
          <div className="pt-1.5">
            <p className={`text-sm font-semibold ${isDark ? "text-paper" : "text-foreground"}`}>{step.label}</p>
            <p className={`mt-0.5 text-xs leading-relaxed ${isDark ? "text-paper/60" : "text-muted-foreground"}`}>
              {step.detail}
            </p>
          </div>
          {i < steps.length - 1 && (
            <ArrowRight className={`ml-auto mt-2.5 hidden h-3.5 w-3.5 shrink-0 sm:block ${isDark ? "text-paper/25" : "text-border"}`} aria-hidden />
          )}
        </div>
      ))}
    </div>
  );
}
