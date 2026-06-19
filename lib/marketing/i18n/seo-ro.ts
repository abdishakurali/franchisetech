import type { SeoRoOverrides } from "./types";

/** Romanian copy for SEO pages — merged over English at render time. */
export const seoRoOverrides: Record<string, SeoRoOverrides> = {
  pos: {
    eyebrow: "Casă de marcat",
    title: "POS simplu pentru cafenele și afaceri alimentare",
    metaTitle: "POS simplu pentru cafenele și afaceri alimentare mici",
    description: "Vânzări, deschidere și închidere casă, numerar/card, bonuri și înregistrări zilnice în franchisetech.",
    h1: "Casă de marcat simplă, făcută pentru afaceri alimentare mici",
    intro:
      "franchisetech ține casa de marcat practică: produse, clienți, plăți numerar/card, bonuri, retururi și închideri zilnice într-un singur loc.",
    bullets: [
      "Grilă rapidă de produse și coș",
      "Sesiuni de deschidere și închidere casă",
      "Urmărire numerar, card și alte plăți",
      "Clienți, bonuri, tranzacții, retururi și anulări",
    ],
    sections: [
      {
        title: "Casă de marcat fără aglomerare",
        body: "Personalul adaugă produse, alege metoda de plată, atașează clientul și finalizează vânzarea fără ecrane complicate.",
      },
      {
        title: "Fiecare vânzare rămâne urmăribilă",
        body: "Tranzacțiile, retururile, motivele anulărilor, bonurile și mișcările de numerar sunt înregistrate pentru revizuire după serviciu.",
      },
      {
        title: "Închide ziua cu încredere",
        body: "Numerar deschidere, vânzări numerar/card, intrări/ieșiri numerar, numerar așteptat, numerar numărat și diferența — totul pentru reconcilierea zilnică.",
      },
    ],
    faqs: [
      {
        question: "franchisetech este terminal de plată?",
        answer: "Nu. franchisetech înregistrează vânzările POS și metoda de plată. Integrarea hardware de plată este planificată, dar nu trebuie presupusă astăzi.",
      },
      {
        question: "Pot urmări retururi și anulări?",
        answer: "Da. Retururile și anulările se păstrează cu motiv, astfel încât registrul casei rămâne clar.",
      },
      {
        question: "Pot folosi pe tabletă la casă?",
        answer: "Da. franchisetech rulează în browser — laptop, tabletă sau ecran de casă.",
      },
      {
        question: "Câți angajați pot folosi casa de marcat?",
        answer: "Nelimitat. Adăugați casieri, manageri și roluri de bucătărie fără cost per utilizator.",
      },
    ],
    related: [
      { label: "Raport Z", href: "/features/z-report" },
      { label: "Cafenele", href: "/industries/cafes" },
      { label: "Ce au nevoie cafenelele de la POS", href: "/resources/pos-system-for-small-cafes" },
    ],
  },
  "stock-management": {
    eyebrow: "Control stoc",
    title: "Gestionare stoc pentru afaceri alimentare",
    metaTitle: "Gestionare stoc — ingrediente, inventar și alerte",
    description: "Urmăriți produse, ingrediente, achiziții, stoc scăzut și porții posibile cu franchisetech.",
    h1: "Gestionare stoc pentru afaceri alimentare",
    intro:
      "franchisetech conectează produsele, achizițiile, furnizorii, rețetele și vânzările ca să vedeți ce aveți în stoc și ce necesită atenție.",
    bullets: [
      "Ingrediente urmărite ca produse",
      "Achizițiile cresc stocul",
      "Vânzările din rețete pot reduce stocul de ingrediente",
      "Vizibilitate stoc scăzut și porții posibile",
    ],
  },
  "recipe-costing": {
    eyebrow: "Cost rețete",
    title: "Software cost rețete pentru cafenele",
    metaTitle: "Cost rețete pentru cafenele — marjă brută per porție",
    description: "Calculați costul per porție, marja brută și câte porții puteți face din stocul curent.",
    h1: "Cost rețete și marje pentru meniul dvs.",
    intro: "Legați ingredientele de prețul de vânzare ca să vedeți marja reală înainte să schimbați meniul.",
  },
  "z-report": {
    eyebrow: "Închidere casă",
    title: "Raport Z și închidere casă",
    metaTitle: "Raport Z zilnic și reconciliere numerar",
    description: "Numerar deschidere, totaluri numerar/card, intrări/ieșiri și diferența la închidere.",
    h1: "Raport Z zilnic și reconciliere numerar",
    intro: "franchisetech adună cifrele de închidere zilnică ca să revizuiți vânzările fără să reconstruiți ziua din memorie.",
  },
  "kitchen-display": {
    eyebrow: "Display bucătărie",
    title: "Display bucătărie pentru restaurante și cafenele",
    metaTitle: "Display bucătărie (KDS) pentru cafenele și restaurante",
    description: "Comenzile plătite din POS apar pe un panou de preparare — nou, în lucru, gata, finalizat.",
    h1: "Display bucătărie care menține ritmul serviciului",
    intro:
      "Când Display-ul de bucătărie este activ, comenzile plătite apar pe panoul de preparare — bucătăria și sala rămân aliniate fără bonuri pe hârtie.",
  },
  "purchases-suppliers": {
    eyebrow: "Achiziții și furnizori",
    title: "Achiziții, furnizori și niveluri stoc",
    metaTitle: "Achiziții și furnizori pentru afaceri alimentare",
    description: "Înregistrați furnizori, achiziții și niveluri de stoc alături de vânzările POS.",
    h1: "Furnizori, achiziții și stoc într-un singur loc",
    intro: "Vedeți ce ați cumpărat, de la cine și cum se reflectă în stoc — lângă vânzările zilnice.",
  },
  "setup-onboarding": {
    eyebrow: "Configurare ghidată",
    title: "Configurare și onboarding ghidat",
    metaTitle: "Checklist configurare franchisetech — de la produse la prima vânzare",
    description: "Checklist în aplicație pentru produse, plăți, personal și prima vânzare.",
    h1: "De la cont nou la prima vânzare — ghidat",
    intro: "Un checklist pas cu pas vă duce de la produse și metode de plată la deschiderea casei și prima vânzare de test.",
  },
  cafes: {
    eyebrow: "Cafenele",
    title: "Sistem POS pentru cafenele",
    metaTitle: "Sistem POS pentru cafenele | franchisetech",
    description:
      "franchisetech ajută cafenelele cu vânzări POS, numerar/card, produse, stoc, rețete și personal — fără taxe per loc.",
    h1: "POS și control operațional pentru cafenele",
    intro:
      "Cafenelele au nevoie de vânzări rapide, închidere clară, marje pe rețete și management simplu al echipei — fără sisteme complicate sau contracte blocate.",
  },
  restaurants: {
    eyebrow: "Restaurante",
    title: "POS restaurant — stoc, rețete, personal",
    metaTitle: "POS restaurant | cost rețete, personal, display bucătărie",
    description:
      "franchisetech ajută restaurantele mici cu POS, stoc, furnizori, rețete, personal și rapoarte zilnice.",
    h1: "POS, stoc și control rețete pentru restaurante mici",
    intro:
      "Restaurante mici au nevoie de vânzări clare, stoc ingrediente, cost alimentar vizibil și management al echipei — fără complexitate enterprise.",
  },
  takeaways: {
    eyebrow: "Livrare la pachet",
    title: "POS și stoc pentru takeaway",
    metaTitle: "POS takeaway, gestionare stoc și rapoarte",
    description: "Vânzări rapide, prețuri clare, totaluri numerar/card și stoc ușor de întreținut.",
    h1: "POS și stoc simplu pentru takeaway",
    intro: "Takeaway-urile au nevoie de viteză la casă, prețuri clare și înregistrări ușor de revizuit după serviciu.",
  },
  "food-trucks": {
    eyebrow: "Food truck",
    title: "POS și control pentru food truck",
    metaTitle: "POS food truck, numerar/card, stoc",
    description: "Casă simplă, totaluri clare și produse portabile pentru afaceri mobile.",
    h1: "POS și control operațional pentru food truck",
    intro: "Food truck-urile au nevoie de o casă simplă, totaluri clare și înregistrări pe care proprietarul le poate revizui după serviciu.",
  },
  "health-bars": {
    eyebrow: "Health bar",
    title: "POS și cost rețete pentru health bar",
    metaTitle: "POS health bar, stoc smoothie, marje",
    description: "Vânzări, ingrediente, cost rețete și marje pentru smoothie-uri, boluri și gustări.",
    h1: "POS, stoc și cost rețete pentru health bar",
    intro: "Health bar-urile depind de ingrediente proaspete, rețete consistente și marje clare pentru băuturi și gustări.",
  },
};
