import { ArrowRight, CheckCircle2, ClipboardCheck, FileText, Search, Thermometer } from "lucide-react";

const steps = [
  { label: "Check", title: "Log the check", icon: Thermometer },
  { label: "Result", title: "franchisetech marks pass, warning, or fail", icon: CheckCircle2 },
  { label: "Action Taken", title: "If it fails, record action taken", icon: ClipboardCheck },
  { label: "Manager Review", title: "Manager reviews exceptions", icon: Search },
  { label: "Report", title: "Print the report", icon: FileText },
];

export function ProductStory({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "rounded-xl border border-brass/25 bg-accent p-4" : "rounded-2xl border border-border bg-card p-6"}>
      <div className="mb-4">
        <p className="font-semibold text-foreground">How franchisetech works</p>
        <p className="text-sm text-mid mt-1">Track checks, spot failed readings, record actions taken, review exceptions, and print reports.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-5">
        {steps.map((step, index) => (
          <div key={step.label} className="flex md:block items-center gap-3">
            <div className="rounded-lg border border-border bg-secondary p-3 h-full">
              <step.icon className="h-5 w-5 text-brass mb-2" />
              <p className="text-xs font-medium text-muted-foreground">{index + 1}. {step.label}</p>
              <p className="text-sm font-semibold text-foreground mt-1">{step.title}</p>
            </div>
            {index < steps.length - 1 && <ArrowRight className="hidden md:block h-4 w-4 text-muted-foreground mx-auto mt-3" />}
          </div>
        ))}
      </div>
    </div>
  );
}
