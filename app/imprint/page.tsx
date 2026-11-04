import type { Metadata } from "next";
import Link from "next/link";
import { ClaudeMarketingShellAuth } from "@/components/marketing/ClaudeMarketingShellAuth";
import { SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_TEL } from "@/lib/marketing/contact-info";

export const metadata: Metadata = {
  title: "Company details / Date de identificare | SALUT TECH SRL",
  description: "Legal details of SALUT TECH SRL, the company that operates franchisetech.ro.",
  alternates: { canonical: "/imprint" },
};

// Exact details supplied by the owner (2026-11-04); they match lib/legal/controller.ts.
const rows: [string, string, React.ReactNode][] = [
  ["Company name", "Denumire", "SALUT TECH SRL"],
  ["VAT / tax ID (CUI)", "Cod unic de înregistrare (CUI)", "49702253"],
  ["Trade register number", "Nr. de ordine în Registrul Comerțului", "J23/1669/2024"],
  ["Registered office", "Sediul social", "Str. Orhideelor nr. 15, ap. BIR. 6, sat Dobroești, jud. Ilfov, cod 077085, Romania"],
  ["Email", "Email", <a key="e" href="mailto:info@franchisetech.ro" className="text-blue-600 hover:underline">info@franchisetech.ro</a>],
  ["Phone", "Telefon", <a key="p" href={SUPPORT_PHONE_TEL} className="text-blue-600 hover:underline">{SUPPORT_PHONE_DISPLAY}</a>],
  ["Website", "Site", "franchisetech.ro"],
];

export default function ImprintPage() {
  return (
    <ClaudeMarketingShellAuth>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900">Company details</h1>
        <p lang="ro" className="mt-1 text-lg text-slate-500">Date de identificare a societății</p>
        <p className="mt-4 text-sm leading-7 text-slate-700">
          franchisetech.ro, the franchisetech software and our Odoo services are operated by SALUT TECH SRL, a limited liability company
          registered in Romania.
          <span lang="ro" className="block text-slate-500">
            Site-ul franchisetech.ro, aplicația franchisetech și serviciile Odoo sunt operate de SALUT TECH SRL, societate cu răspundere limitată
            înregistrată în România.
          </span>
        </p>

        <dl className="mt-8 divide-y divide-slate-200 rounded-lg border border-slate-200 text-sm">
          {rows.map(([en, ro, value]) => (
            <div key={en} className="grid gap-1 px-4 py-3 sm:grid-cols-[0.9fr_1.1fr] sm:gap-4">
              <dt className="text-slate-500">
                {en}
                <span lang="ro" className="block text-xs">{ro}</span>
              </dt>
              <dd className="font-medium text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>

        <section className="mt-8 text-sm leading-7 text-slate-700">
          <h2 className="font-semibold text-slate-900">Consumer disputes / Soluționarea litigiilor</h2>
          <p>
            Our services are aimed at businesses. Consumers in the EU can find out-of-court dispute resolution bodies through the European
            Commission&rsquo;s list of ADR bodies, and in Romania through ANPC (
            <a className="text-blue-600 hover:underline" href="https://anpc.ro" target="_blank" rel="noopener noreferrer">anpc.ro</a>).
          </p>
          <p lang="ro" className="text-slate-500">
            Serviciile noastre se adresează firmelor. Consumatorii se pot adresa Autorității Naționale pentru Protecția Consumatorilor (ANPC),
            anpc.ro.
          </p>
        </section>

        <p className="mt-8 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <Link href="/privacy" className="text-blue-600 hover:underline">Privacy / Confidențialitate</Link>
          <Link href="/terms" className="text-blue-600 hover:underline">Terms / Termeni</Link>
          <Link href="/cookies" className="text-blue-600 hover:underline">Cookies</Link>
          <Link href="/odoo" className="text-blue-600 hover:underline">Odoo services</Link>
        </p>
      </div>
    </ClaudeMarketingShellAuth>
  );
}
