import type { SeoRoOverrides } from "./types";

/** Romanian overrides for primary 7 industry vertical landing pages. */
export const seoRoIndustryOverrides: Record<string, SeoRoOverrides> = {
  cafes: {
    eyebrow: "Cafenele",
    title: "POS pentru cafenele",
    metaTitle: "POS cafenea România — FiscalNet, cost rețete, raport Z | franchisetech",
    description:
      "Casă de marcat pentru cafenele: vânzare rapidă la tejghea, marje pe rețete, bon fiscal FiscalNet, personal nelimitat și raport Z în câteva minute.",
    h1: "Cafeneaua ta vinde rapid. Tu știi cifrele la închidere.",
    heroBefore: "Cafeneaua ta vinde rapid. Tu ",
    heroHighlight: "știi cifrele la închidere",
    heroAfter: ".",
    heroSubheadline: "POS la tejghea, stoc ingrediente și închidere casă — un singur loc, fără taxă per angajat.",
    intro:
      "Cafenelele au nevoie de viteză la rush hour, marje clare pe cafea și mâncare, și o casă care bate cu sertarul — fără hardware blocat sau preț per utilizator.",
    painPoints: [
      {
        title: "Rush hour la tejghea",
        text: "Coada crește cât timp personalul caută prin meniu. Ai nevoie de o grilă de produse cu o atingere — espresso, patiserie și extra, fără training lung.",
      },
      {
        title: "Marje invizibile în meniu",
        text: "Lapte, sirop și boabe se consumă rapid, dar nu știi ce băuturi chiar plătesc. Costul rețetelor leagă ingredientele de fiecare ceașcă.",
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
        answer: "Da. Grila de produse e făcută pentru viteză la tejghea — atingi produsul, încasezi. Rolurile limitează cine poate anula sau închide casa.",
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
    ctaTitle: "Deschide casa gratuit — 15 zile",
    ctaSubtitle: "Setup ghidat pentru cafenele: produse demo, prima vânzare și raport Z.",
  },
  restaurants: {
    eyebrow: "Restaurante",
    title: "POS restaurant — plan sală, bucătărie, raport Z",
    metaTitle: "POS restaurant România — servire la masă, KDS, FiscalNet | franchisetech",
    description:
      "POS restaurant în browser: plan sală vizual, runde la bucătărie, marje pe rețete, FiscalNet și raport Z — fără hardware POS dedicat.",
    h1: "De la comanda la masă până la raportul Z — tot într-un singur loc.",
    heroBefore: "De la comanda la masă până la ",
    heroHighlight: "raportul Z",
    heroAfter: " — tot într-un singur loc.",
    heroSubheadline: "Plan sală, display bucătărie și închidere casă pe orice tabletă din restaurant.",
    painPoints: [
      {
        title: "Comenzi pierdute între sală și bucătărie",
        text: "Ospătarii strigă sau scriu pe hârtie. Cu servirea la masă trimiți runde din casă; bucătăria vede tichetele pe display când e activat.",
      },
      {
        title: "Cost alimentar pe care nu îl vezi",
        text: "Prețurile ingredientelor se mișcă, meniul rămâne la fel. Rețetele leagă achizițiile de porții ca să știi marja pe fiecare fel.",
      },
      {
        title: "Închidere cu plăți amestecate",
        text: "Numerar, card și mese împărțite trebuie să reconcilieze un raport Z. Numerar așteptat vs numărat și totaluri card într-o sesiune.",
      },
    ],
    competitorRows: [
      ["Rulează în browser", "Da — laptop sau tabletă", "Adesea hardware dedicat"],
      ["Plan sală / mese", "Plan vizual + comenzi la masă", "Variază — module extra"],
      ["Display bucătărie", "Add-on opțional", "Adesea în pachete enterprise"],
      ["Preț lunar listat", "De la 79€/lună Operations", "Adesea doar la ofertă"],
      ["Timp setup", "Sub o oră self-serve", "Adesea proiect la fața locului"],
    ],
    faqs: [
      {
        question: "Am nevoie de casă de marcat specială?",
        answer: "Nu. franchisetech rulează în browser pe tablete. FiscalNet rulează pe PC-ul de casă pentru bonuri fiscale.",
      },
      {
        question: "Cum funcționează servirea la masă?",
        answer: "Activezi servirea la masă în Integrări. Configurezi planul, apeși masa, trimiți runde cu Trimite, încasezi o dată cu Încasează — bon fiscal la final când FiscalNet e activ.",
      },
      {
        question: "Pot separa terasa de sală?",
        answer: "Da. Secțiunile planului (sală, terasă, bar) organizează serviciul pe același plan.",
      },
      {
        question: "Există display bucătărie?",
        answer: "Da, modul opțional. Comenzile apar pe un panou în browser pentru echipa de preparare.",
      },
      {
        question: "Defalcare TVA pentru contabil?",
        answer: "Rapoartele de vânzări și exporturile includ TVA pe cote pentru organizațiile din România.",
      },
    ],
    ctaTitle: "Încearcă POS restaurant — 15 zile gratuit",
    ctaSubtitle: "Plan sală, bucătărie și închidere casă — pentru servire completă.",
  },
  takeaways: {
    eyebrow: "Takeaway & fast food",
    title: "POS takeaway — Glovo, Bolt, FiscalNet",
    metaTitle: "POS takeaway România — integrare Glovo, casă rapidă | franchisetech",
    description:
      "POS takeaway și fast food: comenzi Glovo automat, grilă rapidă la tejghea, vânzări delivery separate, FiscalNet și raport Z zilnic.",
    h1: "Glovo, Bolt și Tazz înregistrate corect. Fără bătaie de cap la ANAF.",
    heroBefore: "",
    heroHighlight: "Glovo, Bolt și Tazz înregistrate corect",
    heroAfter: ". Fără bătaie de cap la ANAF.",
    heroSubheadline: "Livrare și vânzări la tejghea într-o singură casă — canale separate, înregistrare fiscală corectă.",
    painPoints: [
      {
        title: "Comenzi delivery re-tastate la casă",
        text: "Glovo sună pe tabletă și cineva tastează din nou în casa fiscală. Importul automat pune comenzile în workspace — gata de înregistrat corect.",
      },
      {
        title: "Payout vs sertar",
        text: "Încasările platformelor și numerarul din locație sunt lucruri diferite. Vânzările pe canal te ajută să reconciliezi ce ai câștigat vs ce e în sertar.",
      },
      {
        title: "Viteză la peak",
        text: "La prânz coada nu așteaptă meniuri adânci. Grilă plată și încasare cu o atingere țin linia în mișcare.",
      },
    ],
    competitorRows: [
      ["Import Glovo automat", "Inclus în plan", "Variază — adesea modul opțional"],
      ["Bolt / Tazz automat", "Bolt/Tazz în curând", "POSnet: Glovo/Bolt/Wolt auto"],
      ["Rețete / stoc", "Plan Operations", "Variază"],
      ["Preț listat", "De la 49€/lună", "Adesea doar la ofertă"],
      ["POS browser", "Da", "Adesea client instalat"],
    ],
    faqs: [
      {
        question: "Glovo se integrează automat?",
        answer: "Da. Comenzile Glovo sosesc prin webhook când integrarea e configurată. Bolt Food și Tazz se pot înregistra în POS; import automat în curând.",
      },
      {
        question: "Vânzările delivery sunt separate de cele din locație?",
        answer: "Da. Vânzările pot fi înregistrate pe canal ca rapoartele și înregistrările fiscale să rămână clare.",
      },
      {
        question: "Funcționează cu FiscalNet?",
        answer: "Da, când FiscalNet e activ pe PC-ul de casă. Bonurile fiscale urmează hardware-ul configurat.",
      },
      {
        question: "Pot rula de pe tabletă la tejghea?",
        answer: "Da. franchisetech e în browser — ideal pentru tejgheaua compactă takeaway.",
      },
    ],
    ctaTitle: "Pornește POS takeaway — 15 zile gratuit",
    ctaSubtitle: "Glovo, vânzări la tejghea și raport Z într-un singur setup.",
  },
  "bar-pub": {
    eyebrow: "Baruri & puburi",
    title: "POS pentru baruri și puburi",
    metaTitle: "POS bar România — stoc, TVA, închidere casă | franchisetech",
    description:
      "POS bar și pub: mese pe plan sală, stoc băuturi, TVA 9% vs 19%, personal nelimitat și închidere casă rapidă după program.",
    h1: "Ții mesele deschise. La închidere, sertarul bate.",
    heroBefore: "Ții mesele deschise. La închidere, ",
    heroHighlight: "sertarul bate",
    heroAfter: ".",
    heroSubheadline: "Serviciu la bar, stoc băuturi și raport Z după program — POS în browser pe orice tabletă.",
    painPoints: [
      {
        title: "Bar aglomerat, multe mese active",
        text: "Când serviciul e pe masă, personalul alege locul pe plan, trimite runde și încasează o dată — în loc să piardă comenzi deschise.",
      },
      {
        title: "Stoc valoric de băuturi",
        text: "Spirtoasele și vinul trebuie inventariate corect. Achizițiile și nivelurile de stoc ajută să vezi pierderile înainte să lovească marja.",
      },
      {
        title: "Închidere târzie, echipă obosită",
        text: "După ultimul client vrei numerar numărat vs așteptat în două minute — nu un ritual Excel de 20 de minute.",
      },
    ],
    competitorRows: [
      ["POS browser", "Tabletă la bar", "Adesea terminale fixe"],
      ["Flux mese", "Plan sală + comenzi", "Variază"],
      ["Stoc", "Plan Operations", "Variază"],
      ["Taxă personal", "Nelimitat", "Verificați per utilizator"],
      ["Preț listat", "De la 79€/lună", "Adesea doar la ofertă"],
    ],
    faqs: [
      {
        question: "Pot ține comenzi deschise per masă?",
        answer: "Cu servirea la masă activată, fiecare loc pe plan poate avea runde deschise până la încasare și bon fiscal o singură dată.",
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
    ctaTitle: "Deschide POS bar — 15 zile gratuit",
    ctaSubtitle: "Mese pe plan, stoc și închidere casă — fără taxă per loc.",
  },
  "patisserie-bakery": {
    eyebrow: "Patiserii & brutării",
    title: "POS patiserie și brutărie",
    metaTitle: "POS patiserie România — cost rețetă, bon consum, FiscalNet",
    description:
      "POS patiserie și brutărie: cost per croissant, bon de consum pentru contabil, vânzare la bucată sau kg, stoc și FiscalNet.",
    h1: "Știi costul fiecărui croissant înainte să-l pui la vitrină.",
    heroBefore: "Știi costul fiecărui ",
    heroHighlight: "croissant înainte să-l pui la vitrină",
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
        text: "Vinzi la bucată la walk-in și la kg pentru B2B din aceeași listă de produse — cu TVA și înregistrare fiscală corectă.",
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
        answer: "Da. Adaugi ingrediente și cantități; franchisetech calculează costul per porție și marja față de prețul de vânzare.",
      },
      {
        question: "Bonul de consum e inclus?",
        answer: "Da, pentru organizații din România cu rețete configurate — consumul din vânzări alimentează raportul bon de consum.",
      },
      {
        question: "Vânzare la kg și la bucată?",
        answer: "Produsele suportă unitatea de măsură în catalog; configurezi articole pentru retail la bucată sau la greutate după nevoie.",
      },
      {
        question: "Funcționează cu FiscalNet?",
        answer: "Da, când e activ pe PC-ul de casă — același flux ca la alte afaceri alimentare.",
      },
    ],
    ctaTitle: "Începe POS patiserie — 15 zile gratuit",
    ctaSubtitle: "Rețete, bon de consum și vânzare la tejghea într-un singur loc.",
  },
  "food-trucks": {
    eyebrow: "Food truck",
    title: "POS food truck — mobil, offline, raport Z",
    metaTitle: "POS food truck România — tabletă, mod offline | franchisetech",
    description:
      "POS food truck pe tabletă: vinzi când semnalul pică cu coadă offline, sincronizare la reconectare, FiscalNet când e conectat, raport Z seara.",
    h1: "Vinde de oriunde. Raportul Z te așteaptă la seară.",
    heroBefore: "Vinde de oriunde. ",
    heroHighlight: "Raportul Z te așteaptă la seară",
    heroAfter: ".",
    heroSubheadline: "POS în browser pe tabletă — vânzări în coadă offline, sincronizare când revine conexiunea.",
    painPoints: [
      {
        title: "Semnalul moare la festival",
        text: "Datele mobile cedează când vine publicul. Modul offline pune vânzările în coadă locală și sincronizează la reconectare — serviciul nu se oprește.",
      },
      {
        title: "O persoană, trei joburi",
        text: "Gătești, vinzi și numeri casa. Un POS în trei ecrane în browser bate un back-office greoi.",
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
        answer: "Da. POS-ul pune vânzările în coadă locală în pene scurte și sincronizează când browserul se reconectează. Tipărirea fiscală depinde de FiscalNet când ești online.",
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
        answer: "O organizație; aceeași listă de produse. Add-on multi-locație când ai site-uri juridice separate.",
      },
    ],
    ctaTitle: "Încearcă POS food truck — 15 zile gratuit",
    ctaSubtitle: "Casă pe tabletă, coadă offline și raport Z.",
  },
  "multi-site": {
    eyebrow: "Multi-locație",
    title: "POS multi-locație pentru HoReCa",
    metaTitle: "POS lanț restaurante — panou centralizat | franchisetech",
    description:
      "2–10 locații: casă și raport Z per site, panou proprietar, catalog și stoc comune, export Saga — 89€/locație/lună, personal nelimitat.",
    h1: "Toate locațiile tale, un singur panou. Cifrele reale în fiecare seară.",
    heroBefore: "Toate locațiile tale, ",
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
        text: "Adaugi o locație fără să reconstruiești tot catalogul — setup consistent, sesiuni per site.",
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
