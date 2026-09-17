"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Section = "units" | "payments" | "categories" | "location" | "fiscal";
export type SettingsWorkspaceProps = {
  locale: "ro" | "en";
  initialSection: string;
  canEdit: boolean;
  units: string[];
  customUnits: string[];
  payments: Array<{ name: string; type: string; active: boolean }>;
  categories: string[];
  location: string;
  fiscal: { configured: boolean; attempts: number; sessions: number; zReports: number; lastAttempt: string | null; status: string | null };
  editors: Record<Section, ReactNode>;
};

const unitCodes: Record<string, string> = { bucată: "buc", porție: "porție", litru: "l", each: "buc", portion: "porție", litre: "l" };
const paymentTypes: Record<string, string> = { cash: "Numerar", card: "Card", online: "Online", other: "Altele" };

export function SettingsWorkspace(props: SettingsWorkspaceProps) {
  const { locale, initialSection, canEdit, units, customUnits, payments, categories, location, fiscal, editors } = props;
  const ro = locale === "ro";
  const root = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState<Section | null>(null);
  useEffect(() => {
    const id = initialSection === "payment-methods" ? "payments" : initialSection;
    if (id !== "overview") root.current?.querySelector(`#settings-${id}`)?.scrollIntoView({ block: "start" });
  }, [initialSection]);

  function card(id: Section, title: string, meta: string, children: ReactNode, badge?: ReactNode) {
    return <section id={`settings-${id}`} className="min-w-0 scroll-mt-6 overflow-hidden rounded-2xl border border-[#DFDCD2] bg-white">
      <header className="flex min-h-[67px] items-center justify-between gap-3 border-b border-[#EDEAE1] px-[18px] py-[13px]">
        <div><h2 className="!font-[family-name:var(--font-body)] text-[15px] font-bold !tracking-normal text-[#0D0F0E]">{title}</h2><p className="mt-px text-xs text-[#78786F]">{meta}</p></div>
        {badge ?? (canEdit && editors[id] && <button type="button" aria-expanded={editing === id} aria-controls={`editor-${id}`} onClick={() => setEditing(editing === id ? null : id)} className="min-h-8 shrink-0 rounded-[10px] border border-[#DFDCD2] bg-white px-3 text-[13px] font-semibold hover:bg-[#FAF8F4] focus-visible:outline-2 focus-visible:outline-[#165DFC]">{editing === id ? (ro ? "Închide" : "Close") : (ro ? "Gestionează" : "Manage")}</button>)}
      </header>{children}
      {editing === id && <div id={`editor-${id}`} className="settings-inline-editor border-t border-[#EDEAE1] p-4">{editors[id]}</div>}
    </section>;
  }
  const unconfirmed = fiscal.attempts === 0 || fiscal.status !== "success";
  return <div ref={root} className="grid items-start gap-[14px] lg:grid-cols-2">
    {card("units", ro ? "Unități de măsură" : "Units of measurement", `${units.length + customUnits.length} ${ro ? "disponibile" : "available"}`,
      <ul className="divide-y divide-[#EDEAE1]">{[...units, ...customUnits].map((unit, i) => <li key={`${unit}-${i}`} className="flex min-h-10 items-center gap-2.5 px-[18px] py-[9px]"><span className="w-[60px] shrink-0 font-mono text-sm font-bold">{unitCodes[unit] ?? unit}</span><span className="min-w-0 flex-1 text-sm text-[#5B5D57]">{unit}</span><span className="rounded-md bg-[#F3F0E8] px-2 py-0.5 text-[11px] text-[#78786F]">{i < units.length ? "Standard" : "Personalizată"}</span></li>)}</ul>)}
    {card("payments", ro ? "Metode de plată" : "Payment methods", `${payments.filter(p => p.active).length} active`,
      <ul className="divide-y divide-[#EDEAE1]">{payments.map((payment, i) => <li key={`${payment.name}-${i}`} className="flex items-center gap-3 px-[18px] py-[11px]"><span className="min-w-0 flex-1 text-sm font-semibold">{payment.name}</span><span className="font-mono text-xs text-[#78786F]">{ro ? paymentTypes[payment.type] ?? payment.type : payment.type}</span><span className={`rounded-md px-2 py-0.5 text-[11px] ${payment.active ? "bg-[#ECFDF3] text-[#00752C]" : "bg-[#F3F0E8] text-[#78786F]"}`}>{payment.active ? "Activă" : "Inactivă"}</span></li>)}{!payments.length && <li className="p-[18px] text-sm text-[#78786F]">Nicio metodă de plată configurată.</li>}</ul>)}
    <div className="space-y-[14px]">
      {card("categories", ro ? "Categorii de produse" : "Product categories", `${categories.length} categorii`, <div className="flex flex-wrap gap-[7px] px-[18px] py-[14px]">{categories.map((category, i) => <span key={`${category}-${i}`} className="rounded-lg border border-[#DFDCD2] bg-[#FAF8F4] px-3 py-2 text-[13px] font-medium text-[#5B5D57]">{category}</span>)}{!categories.length && <p className="text-sm text-[#78786F]">Nicio categorie configurată.</p>}</div>)}
      {card("location", ro ? "Locație" : "Location", ro ? "Datele locației" : "Location details", <p className="px-[18px] py-[14px] text-sm font-semibold">{location}</p>)}
    </div>
    {card("fiscal", "FiscalNet — casă de marcat", `${fiscal.configured ? "Configurat" : "Neconfigurat"} · ${fiscal.zReports} rapoarte Z din ${fiscal.sessions} sesiuni`, <>
      <dl className="space-y-[9px] px-[18px] py-[14px] text-[13px]"><div className="flex justify-between gap-3"><dt className="text-[#5B5D57]">Încercări bon fiscal</dt><dd className="font-mono font-semibold">{fiscal.attempts}</dd></div><div className="flex justify-between gap-3"><dt className="text-[#5B5D57]">Ultima încercare</dt><dd className="text-right font-mono text-xs">{fiscal.lastAttempt ? new Date(fiscal.lastAttempt).toLocaleString("ro-RO") : "Niciodată"}</dd></div><div className="flex justify-between gap-3"><dt className="text-[#5B5D57]">Ultimul rezultat</dt><dd>{fiscal.status === "success" ? "Reușit" : fiscal.status ? "De verificat" : "Nicio încercare"}</dd></div></dl>
      {canEdit && editors.fiscal && <div className="px-[18px] pb-[14px]"><button type="button" aria-expanded={editing === "fiscal"} aria-controls="editor-fiscal" onClick={() => setEditing(editing === "fiscal" ? null : "fiscal")} className="min-h-[38px] w-full rounded-[10px] bg-[#165DFC] px-4 text-sm font-semibold text-white">{editing === "fiscal" ? "Închide configurarea" : "Configurare și verificare"}</button></div>}
    </>, <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-[5px] text-xs font-semibold ${unconfirmed ? "bg-[#FFFBEB] text-[#92400E]" : "bg-[#ECFDF3] text-[#00752C]"}`}><span className={`h-[7px] w-[7px] rounded-full ${unconfirmed ? "bg-[#B45309]" : "bg-[#00752C]"}`} />{unconfirmed ? "Neconfirmat" : "Bon confirmat"}</span>)}
  </div>;
}
