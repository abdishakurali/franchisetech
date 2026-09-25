import type { SeoRoOverrides } from "./types";

/** Romanian overrides for primary 7 industry vertical landing pages. */
export const seoRoIndustryOverrides: Record<string, SeoRoOverrides> = {
  cafes: {
    eyebrow: "Cafenele",
    title: "POS pentru cafenele",
    metaTitle: "POS cafenea România — FiscalNet, cost rețete, raport Z | franchisetech",
    description:
      "Casă de marcat pentru cafenele: vânzare rapidă la tejghea, marje pe rețete, bon fiscal FiscalNet, personal nelimitat și raport Z în câteva minute.",
    h1: "Cafeneaua dumneavoastră vinde rapid. Știți cifrele la închidere.",
    heroBefore: "Cafeneaua dumneavoastră vinde rapid. ",
    heroHighlight: "știți cifrele la închidere",
    heroAfter: ".",
    heroSubheadline: "POS la tejghea, stoc ingrediente și închidere casă — un singur loc, fără taxă per angajat.",
    intro:
      "Cafenelele au nevoie de viteză la rush hour, marje clare pe cafea și mâncare, și o casă care bate cu sertarul — fără hardware blocat sau preț per utilizator.",
    painPoints: [
      {
        title: "Rush hour la tejghea",
        text: "Coada crește cât timp personalul caută prin meniu. Aveți nevoie de o grilă de produse cu o atingere — espresso, patiserie și extra, fără training lung.",
      },
      {
        title: "Marje invizibile în meniu",
        text: "Lapte, sirop și boabe se consumă rapid, dar nu știți ce băuturi chiar plătesc. Costul rețetelor leagă ingredientele de fiecare ceașcă.",
      },
      {
        title: "Casa vs sertar la închidere",
        text: "Total card, numerar în sertar și tichete masă trebuie să bată fără Excel. Numerar deschidere, vânzări și numerar numărat într-un singur flux raport Z.",
      },
    ],
    competitorRows: [
      ["Viteză POS la tejghea", "Grilă în browser — laptop sau tabletă", "Variază — adesea desktop"],
      ["Marje pe rețete", "Cost rețete inclus", "Adesea limitat în POS simplu"],
      ["Preț personal", "Nelimitat pe plan plătit", "Verificați taxă per terminal"],
      ["FiscalNet (RO)", "Când e activat în Setări", "Variază la furnizor"],
      ["Preț lunar listat", "De la 49€/lună pe site", "Adesea doar la ofertă"],
    ],
    faqs: [
      {
        question: "Funcționează cu imprimanta de bon pe care o am deja?",
        answer:
          "franchisetech se conectează prin FiscalNet pe PC-ul de casă când e activat. Casa de marcat tipărește bonul; noi trimitem datele vânzării. Verificați firmware QR pentru noiembrie 2026.",
      },
      {
        question: "Baristele noi pot vinde din prima zi?",
        answer: "Da. Grila de produse e făcută pentru viteză la tejghea — atingeți produsul, încasați. Rolurile limitează cine poate anula sau închide casa.",
      },
      {
        question: "Urmăresc automat lapte, cafea și siropuri?",
        answer: "Da, cu planul Operations: rețetele leagă ingredientele de produse, iar vânzările pot reduce stocul când e configurat.",
      },
      {
        question: "Numerar, card și tichete Sodexo/Benefit?",
        answer: "Metodele de plată se mapează la codurile FiscalNet unde e configurat — numerar, card, tichete masă și altele.",
      },
      {
        question: "Cât durează închiderea zilnică?",
        answer: "Majoritatea cafenelelor înregistrează numerarul numărat și revizuiesc raportul Z în câteva minute după deschiderea sesiunii.",
      },
    ],
    ctaTitle: "Deschide casa gratuit — pentru totdeauna",
    ctaSubtitle: "Setup ghidat pentru cafenele: produse demo, prima vânzare și raport Z.",
  },
  restaurants: {
    eyebrow: "Restaurante",
    title: "POS restaurant — vânzări, stoc, raport Z",
    metaTitle: "POS restaurant România — vânzări, rețete, FiscalNet | franchisetech",
    description:
      "POS restaurant în browser: vânzări rapide, marje pe rețete, FiscalNet și raport Z — fără hardware POS dedicat.",
    h1: "De la comanda la masă până la raportul Z — tot într-un singur loc.",
    heroBefore: "De la comanda la masă până la ",
    heroHighlight: "raportul Z",
    heroAfter: " — tot într-un singur loc.",
    heroSubheadline: "Vânzări, rețete, stoc și închidere casă pe orice tabletă din restaurant.",
    painPoints: [
      {
        title: "Vânzări greu de urmărit la final de zi",
        text: "Casa, numerarul, cardul și TVA-ul trebuie să se potrivească rapid, fără Excel separat.",
      },
      {
        title: "Cost alimentar pe care nu îl vedeți",
        text: "Prețurile ingredientelor se mișcă, meniul rămâne la fel. Rețetele leagă achizițiile de porții ca să știți marja pe fiecare fel.",
      },
      {
        title: "Închidere cu plăți amestecate",
        text: "Numerar, card și mese împărțite trebuie să reconcilieze un raport Z. Numerar așteptat vs numărat și totaluri card într-o sesiune.",
      },
    ],
    competitorRows: [
      ["Rulează în browser", "Da — laptop sau tabletă", "Adesea hardware dedicat"],
      ["Stoc + rețete", "Incluse în Operations", "Variază — module extra"],
      ["Raport Z / TVA", "Inclus", "Variază după pachet"],
      ["Preț lunar listat", "De la 79€/lună Operations", "Adesea doar la ofertă"],
      ["Timp setup", "Sub o oră self-serve", "Adesea proiect la fața locului"],
    ],
    faqs: [
      {
        question: "Am nevoie de casă de marcat specială?",
        answer: "Nu. franchisetech rulează în browser pe tablete. FiscalNet rulează pe PC-ul de casă pentru bonuri fiscale.",
      },
      {
        question: "Pot începe doar cu POS la tejghea?",
        answer: "Da. Fluxul principal este POS la tejghea: produse, coș, plată, bon fiscal și raport Z.",
      },
      {
        question: "Pot urmări costul rețetelor?",
        answer: "Da. Planul Operations include rețete, ingrediente, achiziții și rapoarte de marjă.",
      },
      {
        question: "Defalcare TVA pentru contabil?",
        answer: "Rapoartele de vânzări și exporturile includ TVA pe cote pentru organizațiile din România.",
      },
    ],
    ctaTitle: "Încearcă POS restaurant — gratuit pentru totdeauna",
    ctaSubtitle: "Vânzări, stoc, rețete și închidere casă — pentru control zilnic.",
  },
  takeaways: {
    eyebrow: "Takeaway & fast food",
    title: "POS takeaway — casă rapidă, FiscalNet",
    metaTitle: "POS takeaway România — casă rapidă, închidere zi | franchisetech",
    description:
      "POS takeaway și fast food: grilă rapidă la tejghea, numerar și card, bon fiscal prin FiscalNet și raport Z zilnic.",
    h1: "Comanda pleacă în trei atingeri, nu în trei ecrane.",
    heroBefore: "Comanda pleacă în ",
    heroHighlight: "trei atingeri, nu în trei ecrane",
    heroAfter: ".",
    heroSubheadline: "Grilă de produse fixă, gândită pentru viteză la oră de vârf, cu bon fiscal la fiecare vânzare.",
    painPoints: [
      {
        title: "La prânz se face coadă și greșim comenzile",
        text: "Meniurile sunt produse cu preț fix, nu configuratoare. Poziția tile-urilor nu se mută, așa că mâna învață unde să apese.",
      },
      {
        title: "Ture diferite, sertar comun",
        text: "Fiecare tură are deschidere, mișcări de numerar și închidere separate, cu responsabil pe fiecare.",
      },
      {
        title: "Nu știu ce meniu se vinde de fapt",
        text: "Raportul de vânzări arată top produse pe interval explicit. Cu Operations vezi și costul pe porție.",
      },
    ],
    competitorRows: [
      ["Grilă de produse", "Tile-uri fixe, poziții stabile", "Variază"],
      ["Rețete / stoc", "Plan Operations", "Variază"],
      ["Preț listat", "De la 49€/lună", "Adesea doar la ofertă"],
      ["POS browser", "Da", "Adesea client instalat"],
    ],
    faqs: [
      {
        question: "Funcționează cu FiscalNet?",
        answer: "Da, când FiscalNet e activ pe PC-ul de casă. Bonurile fiscale urmează hardware-ul configurat.",
      },
      {
        question: "Pot rula de pe tabletă la tejghea?",
        answer: "Da. franchisetech e în browser — ideal pentru tejgheaua compactă takeaway.",
      },
      {
        question: "Fiecare tură poate avea propria sesiune de casă?",
        answer: "Da. Fiecare tură deschide și închide propria casă, cu mișcări de numerar și un responsabil numit.",
      },
      {
        question: "Pot vedea ce se vinde de fapt?",
        answer: "Da. Rapoartele de vânzări arată top produse pe orice interval; Operations adaugă cost pe porție și marjă.",
      },
    ],
    ctaTitle: "Pornește POS takeaway — gratuit pentru totdeauna",
    ctaSubtitle: "Casă rapidă, bon fiscal prin FiscalNet și raport Z într-un singur setup.",
  },
  "bar-pub": {
    eyebrow: "Baruri & puburi",
    title: "POS pentru baruri și puburi",
    metaTitle: "POS bar România — stoc, TVA, închidere casă | franchisetech",
    description:
      "POS bar și pub: vânzare rapidă la tejghea, TVA 21% / 11%, personal nelimitat și închidere casă rapidă după program.",
    h1: "Vindeți rapid la bar. La închidere, sertarul bate.",
    heroBefore: "Vindeți rapid la bar. La închidere, ",
    heroHighlight: "sertarul bate",
    heroAfter: ".",
    heroSubheadline: "Serviciu la bar, stoc băuturi și raport Z după program — POS în browser pe orice tabletă.",
    painPoints: [
      {
        title: "Bar aglomerat, coadă la tejghea",
        text: "Personalul găsește produsul, încasează și trece imediat la următoarea comandă, fără meniuri și ecrane inutile.",
      },
      {
        title: "Stoc valoric de băuturi",
        text: "Spirtoasele și vinul trebuie inventariate corect. Achizițiile și nivelurile de stoc ajută să vedeți pierderile înainte să lovească marja.",
      },
      {
        title: "Închidere târzie, echipă obosită",
        text: "După ultimul client doriți numerar numărat vs așteptat în două minute — nu un ritual Excel de 20 de minute.",
      },
    ],
    competitorRows: [
      ["POS browser", "Tabletă la bar", "Adesea terminale fixe"],
      ["Vânzări rapide", "POS browser", "Variază"],
      ["Stoc", "Plan Operations", "Variază"],
      ["Taxă personal", "Nelimitat", "Verificați per utilizator"],
      ["Preț listat", "De la 79€/lună", "Adesea doar la ofertă"],
    ],
    faqs: [
      {
        question: "Pot vinde rapid direct la tejghea?",
        answer: "Da. Grila POS este construită pentru selectarea rapidă a produselor, plată numerar sau card și bon fiscal prin FiscalNet când este configurat.",
      },
      {
        question: "TVA diferit pe soft drinks vs alcool?",
        answer: "Da. Produsele folosesc grupele TVA configurate; grupele FiscalNet se mapează în Setări pentru România.",
      },
      {
        question: "Mai mulți barmani pe aceeași casă?",
        answer: "Da. Personal nelimitat cu roluri — fiecare vânzare e legată de utilizatorul logat în audit.",
      },
      {
        question: "Am nevoie de terminal POS fix?",
        answer: "Nu. Browser pe tabletă la bar e suficient; FiscalNet rulează pe PC-ul fiscal conectat.",
      },
    ],
    ctaTitle: "Deschide POS bar — gratuit pentru totdeauna",
    ctaSubtitle: "Mese pe plan, stoc și închidere casă — fără taxă per loc.",
  },
  "patisserie-bakery": {
    eyebrow: "Patiserii & brutării",
    title: "POS patiserie și brutărie",
    metaTitle: "POS patiserie România — cost rețetă, bon consum, FiscalNet",
    description:
      "POS patiserie și brutărie: cost per croissant, bon de consum pentru contabil, vânzare la bucată sau kg, stoc și FiscalNet.",
    h1: "Știți costul fiecărui croissant înainte să îl puneți la vitrină.",
    heroBefore: "Știți costul fiecărui ",
    heroHighlight: "croissant înainte să îl puneți la vitrină",
    heroAfter: ".",
    heroSubheadline: "Cost rețete, bon de consum și POS retail — pentru patiserii și brutării.",
    painPoints: [
      {
        title: "Marjă invizibilă pe tavă",
        text: "Untul și făina se scumpesc săptămânal. Costul rețetelor arată costul per croissant sau pâine înainte să pui prețul la vitrină.",
      },
      {
        title: "Contabilul cere bon de consum",
        text: "Consumul de ingrediente din vânzările cu rețetă alimentează raportul bon de consum — mai puțin Excel manual pentru contabil.",
      },
      {
        title: "En-gros și retail în aceeași zi",
        text: "Vindeți la bucată la walk-in și la kg pentru B2B din aceeași listă de produse — cu TVA și înregistrare fiscală corectă.",
      },
    ],
    competitorRows: [
      ["Cost rețete", "Inclus per porție", "SmartBill: focus facturare"],
      ["Bon de consum", "Din consum rețete", "Nu e focus POS"],
      ["POS + stoc împreună", "Un singur workspace", "Adesea unelte separate"],
      ["FiscalNet POS", "Când e configurat", "SmartBill: e-Factura"],
      ["Preț listat", "De la 79€/lună Operations", "Altă categorie produs"],
    ],
    faqs: [
      {
        question: "Pot calcula costul fiecărei rețete de patiserie?",
        answer: "Da. Adăugați ingrediente și cantități; franchisetech calculează costul per porție și marja față de prețul de vânzare.",
      },
      {
        question: "Bonul de consum e inclus?",
        answer: "Da, pentru organizații din România cu rețete configurate — consumul din vânzări alimentează raportul bon de consum.",
      },
      {
        question: "Vânzare la kg și la bucată?",
        answer: "Produsele suportă unitatea de măsură în catalog; configurați articole pentru retail la bucată sau la greutate după nevoie.",
      },
      {
        question: "Funcționează cu FiscalNet?",
        answer: "Da, când e activ pe PC-ul de casă — același flux ca la alte afaceri alimentare.",
      },
    ],
    ctaTitle: "Începe POS patiserie — gratuit pentru totdeauna",
    ctaSubtitle: "Rețete, bon de consum și vânzare la tejghea într-un singur loc.",
  },
  "food-trucks": {
    eyebrow: "Food truck",
    title: "POS food truck — mobil, offline, raport Z",
    metaTitle: "POS food truck România — tabletă, mod offline | franchisetech",
    description:
      "POS food truck pe tabletă: vindeți când semnalul pică cu coadă offline, sincronizare la reconectare, FiscalNet când e conectat, raport Z seara.",
    h1: "Vindeți de oriunde. Raportul Z vă așteaptă la seară.",
    heroBefore: "Vindeți de oriunde. ",
    heroHighlight: "Raportul Z vă așteaptă la seară",
    heroAfter: ".",
    heroSubheadline: "POS în browser pe tabletă — vânzări în coadă offline, sincronizare când revine conexiunea.",
    painPoints: [
      {
        title: "Semnalul moare la festival",
        text: "Datele mobile cedează când vine publicul. Modul offline pune vânzările în coadă locală și sincronizează la reconectare — serviciul nu se oprește.",
      },
      {
        title: "O persoană, trei joburi",
        text: "Gătiți, vindeți și numărați casa. Un POS în trei ecrane în browser bate un back-office greoi.",
      },
      {
        title: "Alt loc în fiecare zi",
        text: "Aceeași listă de produse la piață sau pe stradă — o organizație, rapoarte consistente.",
      },
    ],
    competitorRows: [
      ["Tabletă / browser", "Da — principal", "Square: focus hardware"],
      ["Coadă offline", "În POS", "Variază"],
      ["Stoc alimentar", "Plan Operations", "Square: retail-first"],
      ["FiscalNet România", "Când e configurat", "Square: fără fiscal RO"],
      ["Preț lunar listat", "De la 49€/lună", "Focus terminale plată"],
    ],
    faqs: [
      {
        question: "franchisetech funcționează offline?",
        answer: "Da. POS-ul pune vânzările în coadă locală în pene scurte și sincronizează când browserul se reconectează. Tipărirea fiscală depinde de FiscalNet când sunteți online.",
      },
      {
        question: "Am nevoie de laptop și tabletă?",
        answer: "Un singur dispozitiv e suficient pentru multe truck-uri. Unii folosesc tabletă la fereastră și laptop pentru rapoarte.",
      },
      {
        question: "Imprimantă fiscală portabilă?",
        answer: "Bonurile fiscale trec prin FiscalNet și dispozitivul certificat — de obicei o imprimantă fiscală compactă legată de un PC pe truck.",
      },
      {
        question: "Locații diferite în aceeași săptămână?",
        answer: "O organizație; aceeași listă de produse. Add-on multi-locație când aveți site-uri juridice separate.",
      },
    ],
    ctaTitle: "Încearcă POS food truck — gratuit pentru totdeauna",
    ctaSubtitle: "Casă pe tabletă, coadă offline și raport Z.",
  },
  "multi-site": {
    eyebrow: "Multi-locație",
    title: "POS multi-locație pentru HoReCa",
    metaTitle: "POS lanț restaurante — panou centralizat | franchisetech",
    description:
      "2–10 locații: casă și raport Z per site, panou proprietar, catalog și stoc comune, export Saga — 89€/locație/lună, personal nelimitat.",
    h1: "Toate locațiile dumneavoastră, un singur panou. Cifrele reale în fiecare seară.",
    heroBefore: "Toate locațiile dumneavoastră, ",
    heroHighlight: "un singur panou",
    heroAfter: ". Cifrele reale în fiecare seară.",
    heroSubheadline: "Închidere casă per locație, vânzări comparate și exporturi contabil — fără contracte enterprise.",
    painPoints: [
      {
        title: "Excel între magazine",
        text: "Fiecare manager trimite cifre pe WhatsApp seara. Un panou consolidat arată vânzările și statusul casei per locație dintr-o privire.",
      },
      {
        title: "A doua locație = de la zero",
        text: "Adăugați o locație fără să reconstruiți tot catalogul — setup consistent, sesiuni per site.",
      },
      {
        title: "Contabilul vrea un export",
        text: "Pachete CSV audit și XML Saga per site — un contabil, fișiere clare per locație.",
      },
    ],
    competitorRows: [
      ["Preț multi-locație listat", "89€/loc/lună pe Scale", "Nexus: ofertă ERP"],
      ["POS per site, catalog comun", "Operations + add-on multi", "Amploare ERP, proiecte lungi"],
      ["Setup self-serve", "Ore, nu luni", "Adesea proiect IT"],
      ["Personal / site", "Nelimitat", "Verificați per loc"],
      ["Export Saga", "Pro/Scale", "Variază"],
    ],
    faqs: [
      {
        question: "Cum se prețuiește multi-locația?",
        answer: "89€/lună per locație activă în plus, peste planul de bază Scale. Personal nelimitat la fiecare site.",
      },
      {
        question: "Un panou pentru toate locațiile?",
        answer: "Proprietarii comută între site-uri și revizuiesc rapoarte per locație din același cont.",
      },
      {
        question: "Fiecare locație are nevoie de FiscalNet?",
        answer: "Fiecare locație din România rulează FiscalNet pe PC-ul de casă. Ajutăm per site la onboarding asistat.",
      },
      {
        question: "Contabilul primește toate exporturile?",
        answer: "Da. Export CSV audit și XML Saga sunt disponibile per organizație/site pentru contabil.",
      },
    ],
    ctaTitle: "Crește la multi-locație — vorbește cu noi",
    ctaSubtitle: "Plan Scale + 89€/site — personal nelimitat peste tot.",
  },
};
