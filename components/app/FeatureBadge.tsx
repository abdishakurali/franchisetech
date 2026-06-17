import { cn } from "@/lib/utils";

type Variant = "working" | "coming-soon";

const STYLES: Record<Variant, string> = {
  "working":     "bg-green-50 text-green-700 border border-green-200",
  "coming-soon": "bg-slate-100 text-slate-500 border border-slate-200",
};

const LABELS: Record<Variant, string> = {
  "working":     "Working",
  "coming-soon": "Coming soon",
};

interface Props {
  variant: Variant;
  className?: string;
  label?: string;
}

export function FeatureBadge({ variant, className, label }: Props) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", STYLES[variant], className)}>
      {label ?? LABELS[variant]}
    </span>
  );
}
