"use client";

import Link from "next/link";
import { ArrowRight, Check, Circle, PartyPopper, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { AppLocale } from "@/lib/app-i18n";
import { getAppText } from "@/lib/app-i18n";
import type { SetupStep } from "@/lib/setup-progress";
import { cn } from "@/lib/utils";

const SECTION_LABEL_KEYS = {
  core: "sectionCore",
  advanced: "sectionAdvanced",
  multi_site: "sectionMultiSite",
  billing: "sectionBilling",
} as const satisfies Record<SetupStep["section"], "sectionCore" | "sectionAdvanced" | "sectionMultiSite" | "sectionBilling">;

const LOCALIZED_STEP_IDS = new Set(["products", "first_sale", "daily_report"]);

type Props = {
  locale: AppLocale;
  steps: SetupStep[];
  doneCount: number;
  totalCount: number;
  percent: number;
};

function localizeStep(step: SetupStep, locale: AppLocale): SetupStep {
  if (!LOCALIZED_STEP_IDS.has(step.id)) return step;
  const labels = getAppText(locale).setupChecklist.steps;
  const key = step.id as keyof typeof labels;
  const copy = labels[key];
  if (!copy) return step;
  return {
    ...step,
    title: copy.title,
    text: copy.text,
    label: copy.label,
    href: step.id === "first_sale" ? "/app/pos?welcome=1" : step.href,
  };
}

export function SetupChecklist({ locale, steps, doneCount, totalCount, percent }: Props) {
  const t = getAppText(locale).setupChecklist;
  const localizedSteps = steps.map((step) => localizeStep(step, locale));
  const nextStep = localizedSteps.find((s) => !s.done && s.section !== "billing");
  const allActivationDone = percent >= 100 || localizedSteps.filter((s) => s.section !== "billing").every((s) => s.done);

  const sections = [
    { key: "core" as const, items: localizedSteps.filter((s) => s.section === "core") },
    { key: "advanced" as const, items: localizedSteps.filter((s) => s.section === "advanced") },
    { key: "multi_site" as const, items: localizedSteps.filter((s) => s.section === "multi_site") },
    { key: "billing" as const, items: localizedSteps.filter((s) => s.section === "billing") },
  ].filter((section) => section.items.length > 0);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.subtitle}</p>
      </div>

      {allActivationDone ? (
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50/40">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white">
                <PartyPopper className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-green-950">{t.allDoneTitle}</p>
                <p className="mt-1 text-sm text-green-800/80">{t.allDoneDesc}</p>
              </div>
            </div>
            <Link
              href="/app/pos"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-green-700 px-4 text-sm font-medium text-white hover:bg-green-800"
            >
              {t.openPos}
            </Link>
          </CardContent>
        </Card>
      ) : nextStep ? (
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    {t.nextStep}
                  </p>
                  <p className="mt-0.5 font-semibold text-slate-950">{nextStep.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{nextStep.text}</p>
                </div>
              </div>
              <Link
                href={nextStep.href}
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
              >
                {nextStep.label}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">{t.progress(doneCount, totalCount)}</span>
          <span className="text-slate-400">{percent}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-xs text-slate-500">{t.speedBanner}</p>
      </div>

      {sections.map(({ key, items }) => (
        <section key={key} className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t[SECTION_LABEL_KEYS[key]]}
          </h2>
          <div className="space-y-2">
            {items.map((step) => {
              const isNext = nextStep?.id === step.id;
              return (
                <Card
                  key={step.id}
                  className={cn(
                    step.done && "border-green-100 bg-green-50/40",
                    isNext && !step.done && "border-blue-300 ring-2 ring-blue-100",
                  )}
                >
                  <CardContent className="flex flex-wrap items-start gap-4 p-4">
                    <div className="mt-0.5 shrink-0">
                      {step.done ? (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white">
                          <Check className="h-4 w-4" strokeWidth={2.5} />
                        </span>
                      ) : (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-200 bg-white">
                          <Circle className="h-3 w-3 text-slate-300" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900">{step.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.text}</p>
                      {step.status ? (
                        <p className="mt-1.5 text-xs font-medium text-slate-400">{step.status}</p>
                      ) : null}
                    </div>
                    {!step.done ? (
                      <Link
                        href={step.href}
                        className={cn(
                          "inline-flex h-9 shrink-0 items-center justify-center rounded-lg px-3 text-sm font-medium",
                          isNext
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
                        )}
                      >
                        {step.label}
                      </Link>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
