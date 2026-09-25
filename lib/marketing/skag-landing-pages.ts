// Content for Google Ads SKAG landing pages (app/lp/[slug]). One entry per SKAG —
// slug must match the campaign's final URL path and the ad's H1 headline exactly
// (Quality Score + user trust, per google_ads/ads.md §7.3). Romanian only — these
// pages exist for Romanian-language search ad traffic, not organic/i18n visitors.
//
// Add a new entry here whenever google_ads/scripts/build_skag.py creates a new
// campaign — the SKAG's `final_url` should point at `/lp/<slug>` before unpausing.

export type SkagLandingPage = {
  slug: string;
  /** Must match the ad's pinned headline word-for-word. */
  h1: string;
  subhead: string;
  metaDescription: string;
  trustSignals: [string, string, string];
};

export const skagLandingPages: SkagLandingPage[] = [
  {
    slug: "program-gestiune-cafenea",
    h1: "Program Gestiune Cafenea",
    subhead:
      "POS, stocuri și rapoarte zilnice într-o singură platformă. Știi exact banii din casă la finalul zilei.",
    metaDescription:
      "Program de gestiune pentru cafenele: POS, stocuri în timp real, raport Z zilnic. Gratuit pentru totdeauna, suport în română.",
    trustSignals: ["Configurare în aceeași zi", "Suport în limba română", "Raport Z în 2 minute"],
  },
  {
    slug: "sistem-gestiune-cafenea",
    h1: "Sistem Gestiune Cafenea",
    subhead:
      "POS, stocuri și rapoarte zilnice într-o singură platformă. Știi exact banii din casă la finalul zilei.",
    metaDescription:
      "Sistem de gestiune pentru cafenele: POS, stocuri în timp real, raport Z zilnic. Gratuit pentru totdeauna, suport în română.",
    trustSignals: ["Configurare în aceeași zi", "Suport în limba română", "Raport Z în 2 minute"],
  },
  {
    slug: "program-gestiune-bar",
    h1: "Program Gestiune Bar",
    subhead:
      "POS, stocuri de băuturi și rapoarte zilnice într-o singură platformă. Știi exact banii din casă la finalul zilei.",
    metaDescription:
      "Program de gestiune pentru baruri: POS, stocuri băuturi în timp real, raport Z zilnic. Gratuit pentru totdeauna, suport în română.",
    trustSignals: ["Configurare în aceeași zi", "Suport în limba română", "Raport Z în 2 minute"],
  },
  {
    slug: "soft-cafenea",
    h1: "Soft Cafenea",
    subhead:
      "POS, stocuri și rapoarte zilnice într-o singură platformă. Știi exact banii din casă la finalul zilei.",
    metaDescription:
      "Soft de gestiune pentru cafenele: POS, stocuri în timp real, raport Z zilnic. Gratuit pentru totdeauna, suport în română.",
    trustSignals: ["Configurare în aceeași zi", "Suport în limba română", "Raport Z în 2 minute"],
  },
  {
    slug: "raport-z-casa-de-marcat",
    h1: "Raport Z Casă de Marcat",
    subhead:
      "Raport Z generat automat la închiderea zilei — numerar, card și TVA într-un singur ecran. Casa se potrivește cu sertarul, fără calcule manuale.",
    metaDescription:
      "Raport Z automat pentru casa de marcat: numerar, card și TVA calculate la închidere. Gratuit pentru totdeauna, suport în română.",
    trustSignals: ["Configurare în aceeași zi", "Suport în limba română", "Raport Z în 2 minute"],
  },
  {
    slug: "raport-x-casa-de-marcat",
    h1: "Raport X Casă de Marcat",
    subhead:
      "Raport X oricând în timpul zilei — vânzări, numerar, card și TVA de până acum. Nu resetează totalurile și nu închide ziua.",
    metaDescription:
      "Raport X pentru casa de marcat: citire intermediară cu vânzări, numerar și TVA, fără să închideți ziua. Gratuit pentru totdeauna, suport în română.",
    trustSignals: ["Nu resetează totalurile", "Oricâte rapoarte X pe zi", "Suport în limba română"],
  },
];

export function findSkagPage(slug: string): SkagLandingPage | undefined {
  return skagLandingPages.find((p) => p.slug === slug);
}
