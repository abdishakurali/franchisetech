import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, TrendingUp } from "lucide-react";
import { ClaudeMarketingShellAuth } from "@/components/marketing/ClaudeMarketingShellAuth";
import { JsonLd } from "@/components/marketing/JsonLd";
import { SITE_URL } from "@/lib/marketing/seo";

// NOT linked from nav/footer/sitemap and NOT in lib/marketing/seo.ts's
// publicPaths — reachable only by direct link until the founder has a real
// quote + photo from Dolce Nera and explicitly approves publishing it.
// Do not add this route anywhere discoverable before that sign-off.
export const metadata: Metadata = {
  title: "Dolce Nera — poveste de succes",
  description: "Cum folosește Dolce Nera franchisetech zilnic: închidere de casă în fiecare zi, vânzări în creștere, stoc și rețete la zi.",
  alternates: { canonical: `${SITE_URL}/povesti-clienti/dolce-nera` },
  robots: { index: false, follow: false },
};

const STATS = [
  { value: "31", label: "vânzări/zi în ultima săptămână din septembrie — față de ~15/zi la începutul lunii" },
  { value: "9.400 lei", label: "vânzări în 23 de zile de tranzacționare, septembrie 2026" },
  { value: "100%", label: "din zilele de tranzacționare cu deschidere și închidere de casă înregistrată" },
];

export default function DolceNeraCaseStudyPage() {
  return (
    <ClaudeMarketingShellAuth>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Acasă", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Dolce Nera", item: `${SITE_URL}/povesti-clienti/dolce-nera` },
          ],
        }}
      />

      <section className="bg-[#0B1D33] px-4 py-16 text-white sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/10 p-2">
              <Image src="/clients/dolce-nera.png" alt="Dolce Nera" width={120} height={60} className="h-8 w-auto object-contain" />
            </div>
            <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[#D9A94E]">Poveste de succes</span>
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
            Dolce Nera își dublează vânzările și închide casa în fiecare zi, fără excepție.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/70">
            O cafenea reală, cu date reale din platformă — nu cifre rotunjite pentru marketing.
          </p>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-3xl font-bold text-[#0B1D33]">{stat.value}</p>
              <p className="mt-2 text-sm text-slate-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6">
        <div className="mx-auto max-w-4xl rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">De completat înainte de publicare</p>
          <p className="mt-3 text-lg italic text-slate-400">
            &ldquo;[CITAT — de la proprietarul Dolce Nera, nu inventat]&rdquo;
          </p>
          <p className="mt-2 text-sm text-slate-400">[FOTO — locație sau echipă Dolce Nera]</p>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-4xl space-y-8">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-[#0B1D33]">
              <TrendingUp className="size-5 text-[#D9A94E]" />
              Vânzările au crescut constant pe parcursul lunii septembrie
            </h2>
            <p className="mt-2 text-slate-600">
              De la o medie de aproximativ 15 vânzări pe zi la începutul lunii, la aproximativ 31 pe zi în ultima săptămână — aproape dublu, fără o schimbare de sistem, doar folosirea zilnică a platformei.
            </p>
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-[#0B1D33]">
              <CheckCircle2 className="size-5 text-[#D9A94E]" />
              Casa se deschide și se închide în fiecare zi de lucru
            </h2>
            <p className="mt-2 text-slate-600">
              Nu doar vând prin platformă — fac disciplina completă de gestiune a numerarului: deschidere de casă la începutul zilei, închidere la sfârșit, în fiecare zi de tranzacționare, fără excepție.
            </p>
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-[#0B1D33]">
              <CheckCircle2 className="size-5 text-[#D9A94E]" />
              Stocul și rețetele sunt parte din rutina zilnică, nu un extra
            </h2>
            <p className="mt-2 text-slate-600">
              Produsele și rețetele sunt secțiunile cele mai folosite din platformă, după casa de vânzare — echipa verifică și actualizează constant ce vinde, nu doar la sfârșit de lună.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-[#0B1D33]">Vreți același lucru pentru cafeneaua voastră?</h2>
          <p className="mt-3 text-slate-600">Configurare gratuită în 48h — importăm meniul și rețetele pentru voi.</p>
          <Link href="/signup" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0B1D33] px-6 py-3 text-sm font-bold text-white hover:bg-[#0B1D33]/90">
            Creați cont gratuit <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </ClaudeMarketingShellAuth>
  );
}
