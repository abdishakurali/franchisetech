import { notFound } from "next/navigation";
import { SettingsWorkspace } from "@/components/app/SettingsWorkspace";
import { SettingsSectionNav } from "@/components/app/SettingsSectionNav";
import { SetupChecklist } from "@/components/app/SetupChecklist";
import { ReportsTrendChart } from "@/components/app/ReportsTrendChart";
import type { SetupStep } from "@/lib/setup-progress";

const DEMO_SECTIONS = [
  { id: "demo-business", label: "Business" },
  { id: "demo-fiscal", label: "Fiscal" },
  { id: "demo-units", label: "Unități de măsură" },
  { id: "demo-payments", label: "Metode de plată" },
  { id: "demo-categories", label: "Categorii" },
  { id: "demo-location", label: "Locație" },
  { id: "demo-marketplace", label: "Marketplace" },
];

export const dynamic = "force-dynamic";

export default async function DesignReviewPage({ searchParams }: { searchParams: Promise<{ section?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const section = (await searchParams).section ?? "overview";
  const steps: SetupStep[] = ["Datele firmei", "Adaugă produsele", "Conectează casa de marcat", "Invită echipa", "Prima vânzare"].map((title, i) => ({ id: String(i), title, text: "Date demonstrative pentru verificarea designului", done: i < 2, href: "#setup", label: "Continuă", section: "core" }));
  const editor = <div><label htmlFor="review-name" className="block text-sm">Nume</label><input id="review-name" defaultValue="Exemplu" className="rounded border p-2" /><p className="mt-2 text-xs">Previzualizare fără salvare.</p></div>;
  return <main className="settings-page-wrapper min-h-screen bg-[#FAF8F4] p-4 text-[#0D0F0E] sm:p-6">
    <div className="mx-auto max-w-[1232px]"><p className="mb-5 text-sm text-[#78786F]">Previzualizare locală · date demonstrative · fără conexiune la baza de date</p>
      <h1 className="text-[26px] font-bold">Setări</h1><p className="mb-4 text-sm text-[#78786F]">Cafeneaua demonstrativă · neplătitor de TVA · 4 membri</p>
      <SettingsWorkspace locale="ro" initialSection={section} canEdit units={["bucată", "kg", "g", "litru", "ml", "porție"]} customUnits={[]} payments={[{ name: "Numerar", type: "cash", active: true }, { name: "Card", type: "card", active: true }]} categories={["Cafea", "Ceai", "Răcoritoare", "Patiserie", "Sandvișuri", "Altele"]} location="Cafeneaua demonstrativă" fiscal={{ configured: true, attempts: 0, sessions: 0, zReports: 0, lastAttempt: null, status: null }} editors={{ units: editor, payments: editor, categories: editor, location: editor, fiscal: editor }} />
      <section id="setup" className="mt-12 border-t border-[#DFDCD2] py-10"><SetupChecklist locale="ro" steps={steps} doneCount={2} totalCount={5} percent={40} /></section>
      <section className="rounded-2xl border border-[#DFDCD2] bg-white p-6"><h2>Vânzări pe zi — exemplu</h2><ReportsTrendChart currency="RON" days={[{ day: "Lun", total: 200 }, { day: "Mar", total: 350 }, { day: "Mie", total: 280 }, { day: "Joi", total: 400 }]} /></section>

      <div className="mt-16 border-t border-[#DFDCD2] pt-10">
        <p className="mb-4 text-sm text-[#78786F]">Previzualizare: nav secțiuni settings (sticky + secțiune activă)</p>
        <SettingsSectionNav sections={DEMO_SECTIONS} />
        {DEMO_SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-20 border-b border-[#DFDCD2] py-16">
            <h2 className="text-lg font-semibold">{s.label}</h2>
            <p className="mt-2 text-sm text-[#78786F]">Conținut demonstrativ pentru secțiunea &quot;{s.label}&quot;.</p>
          </section>
        ))}
      </div>
    </div>
  </main>;
}
