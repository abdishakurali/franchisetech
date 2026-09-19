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
  return <section className="flex min-h-[190px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm"><header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4"><div><h2 className="text-[15px] font-semibold text-foreground">{title}</h2><p className="mt-1 font-mono text-[11px] text-muted-foreground">{meta}</p></div><Link href={href} className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary">{action}</Link></header><div className="flex-1 px-5 py-3">{children}</div></section>;
}

export function SettingsCoreLists({ locale, units, customUnits, payments, categories, location, fiscal }: Props) {
  const ro = locale === "ro";
  const empty = ro ? "Nimic configurat încă" : "Nothing configured yet";
  return <div className="space-y-5"><div><h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">{ro ? "Setări" : "Settings"}</h2><p className="mt-1 text-sm text-muted-foreground">{ro ? "O singură pagină pentru configurarea operațiunilor zilnice." : "One page for your daily operations setup."}</p></div><div className="grid gap-4 lg:grid-cols-2">
    <ListCard title={ro ? "Unități de măsură" : "Units of measurement"} meta={`${units.length + customUnits.length} ${ro ? "active" : "active"}`} href="?tab=units" action={ro ? "Editează" : "Edit"}><div className="flex flex-wrap gap-2">{[...units, ...customUnits].slice(0, 8).map((u) => <span key={u} className="rounded-md bg-card px-2.5 py-1 font-mono text-xs text-foreground">{u}</span>)}</div></ListCard>
    <ListCard title={ro ? "Metode de plată" : "Payment methods"} meta={`${payments.filter((p) => p.active).length} ${ro ? "active" : "active"}`} href="?tab=payment-methods" action={ro ? "Editează" : "Edit"}><div className="space-y-2">{payments.length ? payments.slice(0, 4).map((p) => <div key={p.name} className="flex justify-between text-sm"><span className="font-medium text-foreground">{p.name}</span><span className="font-mono text-xs text-muted-foreground">{p.type}</span></div>) : <p className="text-sm text-muted-foreground">{empty}</p>}</div></ListCard>
    <ListCard title={ro ? "Categorii de produse" : "Product categories"} meta={`${categories.length} ${ro ? "în POS" : "in POS"}`} href="?tab=categories" action={ro ? "Editează" : "Edit"}><div className="flex flex-wrap gap-2">{categories.length ? categories.slice(0, 8).map((c) => <span key={c} className="rounded-full border border-border px-2.5 py-1 text-xs text-foreground">{c}</span>) : <p className="text-sm text-muted-foreground">{empty}</p>}</div></ListCard>
    <ListCard title={ro ? "Locație" : "Location"} meta={ro ? "Locația principală" : "Primary location"} href="?tab=location" action={ro ? "Editează" : "Edit"}><p className="text-sm font-semibold text-foreground">{location}</p><p className="mt-2 text-xs text-muted-foreground">{ro ? "Comutatorul apare doar când există mai multe locații." : "The switcher appears only when you have multiple locations."}</p></ListCard>
    <ListCard title="FiscalNet" meta={fiscal.configured ? (ro ? "Configurat" : "Configured") : (ro ? "Neconfigurat" : "Not configured")} href={fiscal.configured ? "?tab=fiscal" : "?tab=business"} action={ro ? "Verifică" : "Review"}><div className="flex items-center justify-between text-sm"><span className="text-mid">{ro ? "Bonuri testate" : "Receipt attempts"}</span><span className="font-mono font-semibold text-foreground">{fiscal.attempts}</span></div><div className="mt-2 flex items-center justify-between text-sm"><span className="text-mid">{ro ? "Sesiuni închise" : "Closed sessions"}</span><span className="font-mono font-semibold text-foreground">{fiscal.sessions}</span></div></ListCard>
  </div></div>;
}
