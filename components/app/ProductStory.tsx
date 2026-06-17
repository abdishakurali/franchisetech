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
    <div className={compact ? "rounded-xl border border-blue-100 bg-blue-50 p-4" : "rounded-2xl border border-slate-100 bg-white p-6"}>
      <div className="mb-4">
        <p className="font-semibold text-slate-900">How franchisetech works</p>
        <p className="text-sm text-slate-600 mt-1">Track checks, spot failed readings, record actions taken, review exceptions, and print reports.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-5">
        {steps.map((step, index) => (
          <div key={step.label} className="flex md:block items-center gap-3">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 h-full">
              <step.icon className="h-5 w-5 text-blue-600 mb-2" />
              <p className="text-xs font-medium text-slate-400">{index + 1}. {step.label}</p>
              <p className="text-sm font-semibold text-slate-900 mt-1">{step.title}</p>
            </div>
            {index < steps.length - 1 && <ArrowRight className="hidden md:block h-4 w-4 text-slate-300 mx-auto mt-3" />}
          </div>
        ))}
      </div>
    </div>
  );
}
