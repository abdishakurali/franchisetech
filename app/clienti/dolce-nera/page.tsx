import type { Metadata } from "next";
import Image from "next/image";
import { ClaudeMarketingShellAuth } from "@/components/marketing/ClaudeMarketingShellAuth";
import { DesignTrialLink } from "@/components/marketing/ClaudeMarketing";
import { SupportContactLink } from "@/components/marketing/SupportContactLink";
import { YouTubeFacade } from "@/components/marketing/YouTubeFacade";
import { TRIAL_DAYS } from "@/lib/billing/trial";
import { SUPPORT_PHONE_DISPLAY } from "@/lib/marketing/contact-info";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/marketing/seo";
import s from "@/components/marketing/ClaudeMarketing.module.css";

// Every number below is dated and was read from production (SELECT only) on
// 2026-11-05. Do not add revenue, cash differences, subscription status or
// imported-history counts. Do not call a sale "confirmed by the register"
// unless FiscalNet returned a receipt number: before 2026-11-03 the app only
// stored "command sent" (HTTP 200), see docs/strategy/growth-2026-11/16-case-study.md.
const CASE_STUDY_PATH = "/clienti/dolce-nera";

const TITLE = "Dolce Nera: o cafenea din București pe franchisetech";
const DESCRIPTION =
  "Cum lucrează Dolce Nera, o cafenea de pe Moșilor din București, cu franchisetech din iunie 2026: vânzare la casă, bon fiscal prin FiscalNet, stoc și închiderea casei. Cifre datate, verificate în aplicație.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: CASE_STUDY_PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${CASE_STUDY_PATH}`, locale: "ro_RO", siteName: "franchisetech", type: "article", images: [DEFAULT_OG_IMAGE] },
};

const USES = [
  { title: "Vânzare la casă", body: "Bonul se face în POS-ul din browser, cu produsele pe categorii și plata în numerar sau cu cardul." },
  { title: "Bon fiscal prin FiscalNet", body: "Vânzarea este trimisă automat către casa de marcat, prin FiscalNet. FiscalNet este un program al altei firme, cu licență proprie." },
  { title: "Stoc și rețete", body: "Produsele au rețete, iar vânzările scad stocul ingredientelor, ca să se vadă ce mai este în magazie." },
  { title: "Închiderea casei", body: "La sfârșitul zilei, casa se închide în aplicație: fondul de deschidere, vânzările pe metode de plată și numerarul numărat." },
];

export default function DolceNeraCaseStudyPage() {
  return (
    <ClaudeMarketingShellAuth>
      <section className={s.dark}>
        <div className={`${s.container} ${s.pageHero}`}>
          <p className={s.eyebrow}>Povestea unui client</p>
          <h1>Dolce Nera: o cafenea din București care lucrează cu franchisetech din iunie 2026</h1>
          <p className={s.lead}>
            Dolce Nera este o cafenea de pe Moșilor, în București. Din 9 iunie 2026 face vânzările, stocul și închiderea casei în franchisetech. Din 25 septembrie 2026 trimite bonurile fiscale către casa de marcat direct din aplicație.
          </p>
        </div>
      </section>

      <section className={`${s.container} ${s.split}`}>
        <div className={s.stack}>
          <Image src="/clients/dolce-nera.png" alt="Dolce Nera" width={160} height={80} className="h-14 w-auto object-contain object-left" />
          <h2>Cu vorbele Silviei</h2>
          <p className={s.body}>
            Nu am rescris părerea ei. În clip, Silvia de la Dolce Nera spune cu propriile cuvinte cum lucrează cu franchisetech.
          </p>
        </div>
        <div className="relative mx-auto aspect-[9/16] w-full max-w-[320px] overflow-hidden rounded-xl border border-[var(--border)] bg-[#111]">
          <YouTubeFacade youtubeId="Uioqt3bKenE" title="Silvia, Dolce Nera, despre franchisetech" />
        </div>
      </section>

      <section className={s.tinted}>
        <div className={`${s.container} ${s.pageSection}`}>
          <h2 className={s.sectionTitle}>Ce folosește Dolce Nera</h2>
          <div className={s.grid}>
            {USES.map(({ title, body }) => (
              <article className={s.card} key={title}>
                <h3>{title}</h3>
                <p className={s.body}>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${s.container} ${s.pageSection}`}>
        <h2 className={s.sectionTitle}>Cifre verificate în aplicație, la 5 noiembrie 2026</h2>
        <dl className={`${s.caseStats} max-w-2xl`}>
          <div><dt>Lucrează cu franchisetech din</dt><dd>9 iunie 2026</dd></div>
          <div><dt>Închideri de casă finalizate</dt><dd>140</dd></div>
          <div><dt>Vânzări transmise fără eroare către FiscalNet, din 25 septembrie 2026</dt><dd>624 din 629</dd></div>
          <div><dt>Vânzări cu număr de bon primit înapoi de la casa de marcat, din 3 noiembrie 2026</dt><dd>42 din 44</dd></div>
          <div><dt>Produse în catalog</dt><dd>250</dd></div>
        </dl>
        <p className={s.smallPrint}>
          Cifrele provin din datele aplicației, nu dintr-un audit extern. Din 3 noiembrie 2026, aplicația citește răspunsul casei de marcat și păstrează numărul bonului. Înainte de această dată, aplicația înregistra doar că FiscalNet a primit comanda, fără numărul bonului de la casă. Vânzările dinaintea datei de 25 septembrie 2026 nu sunt incluse.
        </p>
      </section>

      <section id="final-cta" className={s.glow}>
        <div className={`${s.container} ${s.finalCta}`}>
          <h2>Vreți același lucru în localul dumneavoastră?</h2>
          <p className={s.lead}>
            Configurarea este gratuită: vă ajutăm să importați meniul și să conectați FiscalNet cu casa de marcat. Încercați {TRIAL_DAYS} zile gratuit, fără card.
          </p>
          <div className={s.actions}>
            <DesignTrialLink location="case_study">Începeți perioada de probă</DesignTrialLink>
            <SupportContactLink channel="whatsapp" location="case_study" className={`${s.button} ${s.secondary}`}>Scrieți-ne pe WhatsApp</SupportContactLink>
          </div>
          <p className={s.note}>
            Sau sunați-ne: <SupportContactLink channel="phone" location="case_study">{SUPPORT_PHONE_DISPLAY}</SupportContactLink>
          </p>
        </div>
      </section>
    </ClaudeMarketingShellAuth>
  );
}
