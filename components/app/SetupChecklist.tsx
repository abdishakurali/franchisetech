import Link from "next/link";
import { Check } from "lucide-react";
import type { AppLocale } from "@/lib/app-i18n";
import type { SetupStep } from "@/lib/setup-progress";
import { cn } from "@/lib/utils";

type Props = { locale: AppLocale; steps: SetupStep[]; doneCount: number; totalCount: number; percent: number };

export function SetupChecklist({ locale, steps, doneCount, totalCount, percent }: Props) {
  const ro = locale === "ro";
  const nextIndex = steps.findIndex((step) => !step.done);
  return (
    <section className="mx-auto w-full max-w-[720px] space-y-[26px] text-[#0D0F0E]">
      <div className="flex items-center justify-between gap-4 text-[13px] text-[#78786F]">
        <span>{ro ? "Configurare" : "Setup"} · {doneCount === totalCount ? (ro ? "Completă" : "Complete") : `${ro ? "pasul" : "step"} ${nextIndex + 1} ${ro ? "din" : "of"} ${totalCount}`}</span>
        <Link href="/app" className="rounded px-2 py-2 hover:text-[#165DFC] focus-visible:outline-2 focus-visible:outline-[#165DFC]">{ro ? "Continuă mai târziu" : "Continue later"}</Link>
      </div>
      <div className="space-y-2.5">
        <h1 className="font-[family-name:var(--font-display)] text-[30px] font-bold leading-[1.1] tracking-[-0.03em] sm:text-[34px]">{ro ? "Hai să deschidem casa." : "Let’s open your till."}</h1>
        <p className="max-w-[56ch] text-[17px] leading-[1.55] text-[#5B5D57]">{ro ? "Cinci pași, fiecare cu un singur lucru de făcut. Configurează casa înainte de prima vânzare fiscală — echipa poate aștepta." : "Five steps, one thing at a time. Connect your fiscal till before the first fiscal sale — your team can wait."}</p>
      </div>
      <div role="progressbar" aria-label={ro ? "Progres configurare" : "Setup progress"} aria-valuemin={0} aria-valuemax={totalCount} aria-valuenow={doneCount} className="h-1.5 overflow-hidden rounded-full bg-[#DFDCD2]">
        <div className="h-full rounded-full bg-[#165DFC] transition-[width]" style={{ width: `${percent}%` }} />
      </div>
      <ol className="overflow-hidden rounded-xl border border-[#DFDCD2] bg-white">
        {steps.map((step, index) => {
          const active = index === nextIndex;
          return (
            <li key={step.id} className={cn("flex items-center gap-4 border-b border-[#EDEAE1] px-4 py-[18px] last:border-b-0 sm:px-5", active && "bg-[#E8EFFE]")}>
              <span aria-hidden="true" className={cn("flex size-[30px] shrink-0 items-center justify-center rounded-full text-sm font-bold", step.done ? "bg-[#00752C] text-white" : active ? "bg-[#165DFC] text-white" : "border border-[#DFDCD2] bg-white text-[#78786F]")}>
                {step.done ? <Check className="size-4" /> : index + 1}
              </span>
              <div className="min-w-0 flex-1 space-y-[3px]">
                <span className={cn("block text-[15px] font-semibold", active && "text-[#165DFC]")}>{step.title}</span>
                <span className="block text-[13px] leading-[1.45] text-[#78786F]">{step.text}</span>
              </div>
              <Link href={step.href} aria-label={`${step.done ? (ro ? "Verifică" : "Review") : (ro ? "Deschide" : "Open")}: ${step.title}`} className={cn("inline-flex min-h-11 shrink-0 items-center justify-center rounded-md px-2 text-xs font-medium focus-visible:outline-2 focus-visible:outline-[#165DFC] sm:px-3 sm:text-[13px]", active ? "bg-[#165DFC] text-white hover:bg-[#104bd1]" : step.done ? "text-[#00752C] hover:bg-[#ECFDF3]" : "text-[#78786F] hover:bg-[#F3F0E8]")}>
                {step.done ? (ro ? "Gata" : "Done") : active ? (ro ? "Continuă" : "Continue") : (ro ? "Deschide" : "Open")}
              </Link>
            </li>
          );
        })}
      </ol>
      <p className="text-[13px] leading-[1.6] text-[#78786F]">{ro ? "Casa de marcat se conectează doar din browserul casierului — serverul nu atinge niciodată echipamentul local." : "The fiscal till connects only from the cashier’s browser — the server never accesses local equipment."}</p>
    </section>
  );
}
