import type { MarketingMessages } from "@/lib/marketing/i18n/en";

type Step = MarketingMessages["partners"]["howItWorks"][number];

export function PartnerHowItWorks({
  label,
  title,
  steps,
}: {
  label: string;
  title: string;
  steps: readonly Step[];
}) {
  return (
    <section className="border-t border-slate-100 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-600">{label}</p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.step} className="rounded-2xl border border-slate-200/70 bg-white p-6">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                {step.step}
              </span>
              <h3 className="mt-4 font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
