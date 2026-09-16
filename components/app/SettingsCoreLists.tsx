import Link from "next/link";

type Props = {
  locale: "ro" | "en";
  units: string[];
  customUnits: string[];
  payments: Array<{ name: string; type: string; active: boolean }>;
  categories: string[];
  location: string;
  fiscal: { configured: boolean; attempts: number; sessions: number };
};

function ListCard({ title, meta, href, action, children }: { title: string; meta: string; href: string; action: string; children: React.ReactNode }) {
  return <section className="flex min-h-[190px] flex-col overflow-hidden rounded-2xl border border-[#DFDCD2] bg-white shadow-sm"><header className="flex items-start justify-between gap-3 border-b border-[#EDEAE1] px-5 py-4"><div><h2 className="text-[15px] font-semibold text-slate-950">{title}</h2><p className="mt-1 font-mono text-[11px] text-slate-500">{meta}</p></div><Link href={href} className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">{action}</Link></header><div className="flex-1 px-5 py-3">{children}</div></section>;
}

export function SettingsCoreLists({ locale, units, customUnits, payments, categories, location, fiscal }: Props) {
  const ro = locale === "ro";
  const empty = ro ? "Nimic configurat încă" : "Nothing configured yet";
  return <div className="space-y-5"><div><h2 className="font-display text-2xl font-semibold tracking-tight text-slate-950">{ro ? "Setări" : "Settings"}</h2><p className="mt-1 text-sm text-slate-500">{ro ? "O singură pagină pentru configurarea operațiunilor zilnice." : "One page for your daily operations setup."}</p></div><div className="grid gap-4 lg:grid-cols-2">
    <ListCard title={ro ? "Unități de măsură" : "Units of measurement"} meta={`${units.length + customUnits.length} ${ro ? "active" : "active"}`} href="?tab=units" action={ro ? "Editează" : "Edit"}><div className="flex flex-wrap gap-2">{[...units, ...customUnits].slice(0, 8).map((u) => <span key={u} className="rounded-md bg-[#FAF8F4] px-2.5 py-1 font-mono text-xs text-slate-700">{u}</span>)}</div></ListCard>
    <ListCard title={ro ? "Metode de plată" : "Payment methods"} meta={`${payments.filter((p) => p.active).length} ${ro ? "active" : "active"}`} href="?tab=payment-methods" action={ro ? "Editează" : "Edit"}><div className="space-y-2">{payments.length ? payments.slice(0, 4).map((p) => <div key={p.name} className="flex justify-between text-sm"><span className="font-medium text-slate-800">{p.name}</span><span className="font-mono text-xs text-slate-500">{p.type}</span></div>) : <p className="text-sm text-slate-500">{empty}</p>}</div></ListCard>
    <ListCard title={ro ? "Categorii de produse" : "Product categories"} meta={`${categories.length} ${ro ? "în POS" : "in POS"}`} href="?tab=categories" action={ro ? "Editează" : "Edit"}><div className="flex flex-wrap gap-2">{categories.length ? categories.slice(0, 8).map((c) => <span key={c} className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-700">{c}</span>) : <p className="text-sm text-slate-500">{empty}</p>}</div></ListCard>
    <ListCard title={ro ? "Locație" : "Location"} meta={ro ? "Locația principală" : "Primary location"} href="?tab=location" action={ro ? "Editează" : "Edit"}><p className="text-sm font-semibold text-slate-900">{location}</p><p className="mt-2 text-xs text-slate-500">{ro ? "Comutatorul apare doar când există mai multe locații." : "The switcher appears only when you have multiple locations."}</p></ListCard>
    <ListCard title="FiscalNet" meta={fiscal.configured ? (ro ? "Configurat" : "Configured") : (ro ? "Neconfigurat" : "Not configured")} href={fiscal.configured ? "?tab=fiscal" : "?tab=business"} action={ro ? "Verifică" : "Review"}><div className="flex items-center justify-between text-sm"><span className="text-slate-600">{ro ? "Bonuri testate" : "Receipt attempts"}</span><span className="font-mono font-semibold text-slate-950">{fiscal.attempts}</span></div><div className="mt-2 flex items-center justify-between text-sm"><span className="text-slate-600">{ro ? "Sesiuni închise" : "Closed sessions"}</span><span className="font-mono font-semibold text-slate-950">{fiscal.sessions}</span></div></ListCard>
  </div></div>;
}
