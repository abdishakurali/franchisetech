import Link from "next/link";

type Props = {
  locale: "ro" | "en";
  units: number;
  payments: number;
  categories: number;
  fiscalConfigured: boolean;
  fiscalAttempts: number;
  closedSessions: number;
};

export function SettingsOverview({ locale, units, payments, categories, fiscalConfigured, fiscalAttempts, closedSessions }: Props) {
  const ro = locale === "ro";
  const cards = [
    { title: ro ? "Unități de măsură" : "Units of measurement", value: units, href: "?tab=units", action: ro ? "Deschide" : "Open" },
    { title: ro ? "Metode de plată" : "Payment methods", value: payments, href: "?tab=payment-methods", action: ro ? "Deschide" : "Open" },
    { title: ro ? "Categorii de produse" : "Product categories", value: categories, href: "?tab=categories", action: ro ? "Deschide" : "Open" },
    { title: "FiscalNet", value: fiscalConfigured ? (ro ? "Configurat" : "Configured") : (ro ? "Neconfigurat" : "Not configured"), href: "?tab=fiscal", action: ro ? "Verifică" : "Review" },
  ];
  return (
    <section className="mb-8 space-y-4" aria-label={ro ? "Rezumat setări" : "Settings overview"}>
      {fiscalConfigured && fiscalAttempts === 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          <span className="rounded-md bg-amber-200 px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-wide">{ro ? "De verificat" : "Review"}</span>
          <span className="flex-1">{ro ? `FiscalNet este configurat, dar nu există bonuri testate după ${closedSessions} sesiuni închise.` : `FiscalNet is configured, but no receipt has been tested after ${closedSessions} closed sessions.`}</span>
          <Link href="?tab=fiscal" className="rounded-lg bg-slate-950 px-4 py-2 font-semibold text-white">{ro ? "Testează" : "Test"}</Link>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <div key={card.title} className="rounded-2xl border border-[#DFDCD2] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-sm font-semibold text-slate-950">{card.title}</p><p className="mt-1 font-mono text-xs text-slate-500">{typeof card.value === "number" ? `${card.value} ${ro ? "active" : "active"}` : card.value}</p></div>
              <Link href={card.href} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">{card.action}</Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
