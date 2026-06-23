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
  nir: {
    eyebrow: "NIR / Achiziții",
    title: "NIR digital pentru restaurante și cafenele",
    metaTitle: "NIR digital restaurant — Notă intrare recepție în franchisetech",
    description:
      "NIR digital, furnizori, TVA achiziții și actualizare stoc la emitere — în același workspace cu POS-ul.",
    h1: "NIR și achiziții fără Excel separat",
    intro:
      "Înregistrați nota de intrare-recepție, distingeți ciorna de emis, și actualizați stocul când marfa intră — legat de vânzări și rețete.",
    bullets: [
      "NIR nou cu furnizor și linii",
      "Ciornă vs emis — stocul se actualizează doar la emitere",
      "Total achiziții și TVA achiziții",
      "Import CSV achiziții",
      "Furnizori cu CUI și istoric spend",
    ],
    sections: [
      {
        title: "Ciornă mai întâi, emitere când marfa sosește",
        body: "Salvați achiziția ca ciornă în timp ce verificați livrarea. La emiterea NIR, stocul se actualizează — fără mișcări duble din ciorne.",
      },
      {
        title: "Spend furnizori într-o singură vedere",
        body: "Total achiziții și TVA per furnizor, lângă vânzările zilnice — util pentru proprietar și contabil la sfârșit de lună.",
      },
      {
        title: "Legat de stoc și rețete",
        body: "NIR emis crește stocul de ingrediente. Cost rețete și raport marje folosesc aceleași date de produs și cost.",
      },
    ],
    faqs: [
      {
        question: "Ce este NIR în franchisetech?",
        answer: "Înregistrare achiziție / notă de intrare-recepție cu furnizor, linii, cantități, costuri și TVA — legată de stoc la emitere.",
      },
      {
        question: "Ciorna modifică stocul?",
        answer: "Nu. Doar NIR emis actualizează cantitățile din stoc.",
      },
      {
        question: "Pot importa achiziții vechi?",
        answer: "Da. Import CSV pentru achiziții la migrare din Excel sau alt sistem.",
      },
      {
        question: "Înlocuiește Saga sau SmartBill?",
        answer: "Nu. franchisetech gestionează achiziții operaționale și stoc. Contabilul poate folosi în continuare Saga/SmartBill pentru facturare fiscală.",
      },
    ],
    related: [
      { label: "Gestionare stoc", href: "/features/stock-management" },
      { label: "Achiziții și furnizori", href: "/features/purchases-suppliers" },
      { label: "România", href: "/industries/romania" },
    ],
  },
  offline: {
    eyebrow: "POS offline",
    title: "POS cu lucru offline — vânzări când pică internetul",
    metaTitle: "POS offline cafenea restaurant | franchisetech",
    description:
      "Vindeți când pică Wi-Fi-ul: franchisetech salvează local și sincronizează la reconectare — în browser, fără contract POS blocat.",
    h1: "Vindeți și când pică conexiunea — sincronizare automată",
    intro:
      "Internet instabil e normal în HoReCa. franchisetech pune vânzările în coadă locală și le sincronizează când reveniți online.",
    bullets: [
      "Salvare locală offline",
      "Sincronizare automată la reconectare",
      "Numerar, card și plăți împărțite",
      "Browser pe tabletă sau PC casă",
      "Personal nelimitat",
    ],
    sections: [
      {
        title: "Serviciul continuă",
        body: "Personalul finalizează vânzări în pene scurte. Tranzacțiile se păstrează local și se încarcă la reconectare.",
      },
      {
        title: "Status sincronizare clar",
        body: "Casa arată când sunteți offline și când vânzările din coadă s-au sincronizat.",
      },
      {
        title: "Același POS din browser",
        body: "Nu e nevoie de a doua aplicație instalată sau catalog duplicat.",
      },
    ],
    faqs: [
      {
        question: "Funcționează offline fără instalare?",
        answer: "Da. franchisetech rulează în browser. Coada offline e în POS — fără APK separat pentru vânzări de bază.",
      },
      {
        question: "Bon fiscal offline?",
        answer: "Bonul fiscal depinde de FiscalNet și dispozitivul local. Vânzarea operațională poate fi în coadă; tipărirea fiscală urmează configurarea hardware.",
      },
      {
        question: "Ce fac dacă sincronizarea eșuează?",
        answer: "Vânzările rămân în browser până reușește sync-ul. Evitați ștergerea datelor browser în timpul penei.",
      },
    ],
    related: [
      { label: "POS", href: "/features/pos" },
      { label: "Raport Z", href: "/features/z-report" },
      { label: "România", href: "/industries/romania" },
    ],
  },
  "setup-onboarding": {
    eyebrow: "Configurare ghidată",
    title: "Configurare și onboarding ghidat",
    metaTitle: "De la cont nou la prima vânzare în sub o oră | franchisetech",
    description: "Configurare gratuită în aplicație: produse demo, deschidere casă și prima vânzare de test — majoritatea cafenelelor termină pașii de bază în sub o oră.",
    h1: "De la cont nou la prima vânzare în sub o oră",
    intro: "Checklist în aplicație de la înregistrare la produse demo, deschiderea casei și prima vânzare — ghidat pas cu pas, fără cost. Configurare premium opțională (199€) pentru migrări mari sau FiscalNet.",
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
  "multi-site": {
    eyebrow: "Multi-locație",
    title: "POS multi-locație pentru restaurante și cafenele — 99€/locație",
    metaTitle: "POS multi-locație HORECA | franchisetech",
    description:
      "2–5 locații pe o platformă: casă, raport Z și stoc per site — 99€/lună per locație activă, personal nelimitat.",
    h1: "Un singur workspace pentru fiecare locație — fără taxă per angajat",
    intro:
      "Lanțuri mici și operatori cu 2–3 locații au nevoie de aceeași claritate la fiecare punct: casă vs sertar, raport Z zilnic, stoc vizibil — plus o cale simplă de a adăuga locații pe măsură ce creșteți.",
    bullets: [
      "99€/lună per locație activă — personal nelimitat la fiecare site",
      "POS, închidere casă și raport Z la fiecare locație",
      "Stoc, achiziții și rețete per locație (Pro)",
      "Display bucătărie unde e nevoie",
      "În browser — fără contracte blocate de hardware POS",
      "Setup asistat pentru locații noi (opțional 199€)",
    ],
    sections: [
      {
        title: "A doua locație fără să o luați de la zero",
        body: "Când deschideți site-ul doi, nu ar trebui să reconstruiți produsele, metodele de plată și fluxurile. Fiecare locație rulează serviciul zilnic cu sesiuni de casă și rapoarte proprii, cu modele operaționale consistente.",
      },
      {
        title: "Adevărul casei per locație",
        body: "Fiecare locație are numerar așteptat vs numărat, totaluri card și raport Z pentru acel site — fără amestec în Excel între locații.",
      },
      {
        title: "Creșteți când sunteți gata",
        body: "Începeți pe Starter la o locație. Treceți la Pro când contează stocul și rețetele. Adăugați locații pe planul multi-locație când a doua unitate este reală — nu în trial.",
      },
    ],
    faqs: [
      {
        question: "Cum se prețuiește multi-locația?",
        answer: "99€/lună per locație activă pe planul multi-locație. Personal nelimitat la fiecare site — fără taxă per utilizator.",
      },
      {
        question: "Pot gestiona produsele central?",
        answer: "Fiecare organizație rulează site-ul cu un model consistent de produse și setări. Pentru mai multe entități juridice, contactați-ne — onboarding multi-site cu setup asistat.",
      },
      {
        question: "Am nevoie de Pro înainte de a adăuga locații?",
        answer: "Mulți operatori încep Starter la locația 1, apoi Pro când contează stocul. Facturarea multi-locație se aplică când rulați mai multe site-uri active.",
      },
      {
        question: "FiscalNet funcționează la fiecare locație?",
        answer: "FiscalNet rulează pe PC-ul de casă la fiecare locație din România. Parcurgem connectorul per site la onboarding asistat.",
      },
    ],
    related: [
      { label: "Prețuri", href: "/pricing" },
      { label: "Restaurante", href: "/industries/restaurants" },
      { label: "România", href: "/industries/romania" },
      { label: "Raport Z", href: "/features/z-report" },
    ],
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
  "qr-code-receipts": {
    eyebrow: "Conformitate fiscală",
    title: "Cod QR pe Bonul Fiscal — Gata pentru ANAF Noiembrie 2026",
    metaTitle: "Cod QR Bon Fiscal România | Obligație ANAF 2026 | Casa de Marcat QR",
    description:
      "franchisetech suportă cod QR pe bonurile fiscale pentru afaceri din România. Pregătit pentru termenul ANAF din noiembrie 2026 prin integrare FiscalNet. Casa de marcat cu cod QR obligatoriu.",
    h1: "Cod QR pe bonul fiscal — pregătit pentru obligația din 2026",
    intro:
      "România obligă codul QR pe bonurile fiscale de la 1 noiembrie 2026. franchisetech este pregătit — integrarea noastră FiscalNet suportă case de marcat cu QR, astfel încât afacerea dvs. rămâne conformă fără panică de ultim moment.",
    bullets: [
      "Cod QR tipărit pe fiecare bon fiscal",
      "Format de date conform cerințelor ANAF",
      "Funcționează cu imprimante fiscale cu QR (Datecs, Tremol, Daisy, Custom)",
      "Fără configurare suplimentară — activat prin driver FiscalNet",
      "Gata astăzi pentru termenul din noiembrie 2026",
    ],
    sections: [
      {
        title: "Ce este obligația codului QR?",
        body: "De la 1 noiembrie 2026, bonurile fiscale din România trebuie să conțină un cod QR cu datele tranzacției: CIF, numărul bonului, data, totalul și defalcarea TVA. Codul QR permite ANAF să verifice bonurile instant. Afacerile fără sisteme conforme riscă amenzi de 8.000–10.000 lei.",
      },
      {
        title: "Cum gestionează franchisetech această cerință",
        body: "franchisetech trimite datele vânzării către imprimanta fiscală conectată prin FiscalNet. Generarea codului QR are loc în firmware-ul dispozitivului fiscal certificat — nu în software-ul nostru. Astfel, codul QR este generat de hardware-ul avizat ANAF, asigurând conformitatea. Casa de marcat trebuie să aibă cel mai recent update de firmware pentru generarea QR.",
      },
      {
        title: "Ce trebuie să faceți",
        body: "1) Asigurați-vă că imprimanta fiscală (casa de marcat) are firmware capabil QR — contactați distribuitorul autorizat. 2) Verificați că driver-ul FiscalNet este actualizat. 3) Continuați să folosiți franchisetech POS normal. Codul QR apare automat pe bonuri odată ce firmware-ul și driver-ul sunt actualizate.",
      },
    ],
    faqs: [
      {
        question: "Când devine obligatoriu codul QR pe bon?",
        answer:
          "1 noiembrie 2026. Sancțiunile pentru neconformitate au fost suspendate până la această dată pentru a da timp afacerilor să actualizeze firmware-ul și sistemele.",
      },
      {
        question: "franchisetech generează codul QR?",
        answer:
          "Nu. Codul QR este generat de dispozitivul fiscal certificat (casa de marcat) conform legii române. franchisetech trimite datele vânzării; dispozitivul tipărește bonul conform cu QR.",
      },
      {
        question: "Ce date conține codul QR?",
        answer:
          "Codul QR conține: CIF-ul afacerii, numărul bonului, data/ora, suma totală, defalcarea TVA și un hash de verificare. ANAF specifică structura XML exactă.",
      },
      {
        question: "Trebuie să cumpăr hardware nou?",
        answer:
          "Majoritatea dispozitivelor fiscale moderne (Datecs, Tremol, Daisy, Custom) suportă QR prin update de firmware. Verificați cu distribuitorul autorizat. Dispozitivele mai vechi pot necesita înlocuire.",
      },
      {
        question: "Ce se întâmplă dacă ratez termenul?",
        answer:
          "Amenzile variază de la 8.000 la 10.000 lei pentru emiterea bonurilor fără codul QR obligatoriu după 1 noiembrie 2026.",
      },
    ],
    related: [
      { label: "Ghid FiscalNet România", href: "/help/romania-fiscalnet" },
      { label: "POS pentru România", href: "/industries/romania" },
      { label: "Raport Z și închidere zilnică", href: "/features/z-report" },
    ],
  },
  "accountant-reports": {
    eyebrow: "Contabilitate România",
    title: "Rapoarte Contabilitate pentru Afaceri Românești — NIR, Consum, Balanță, Export Saga",
    metaTitle: "Rapoarte Contabilitate România | NIR, Bon de Consum, Balanță Cantitativ-Valorică, Export Saga | franchisetech",
    description:
      "franchisetech generează rapoartele de contabilitate obligatorii în România: Registru de casă, Bon de consum, Balanță cantitativ-valorică, Raport de gestiune și export XML pentru Saga.",
    h1: "Rapoarte contabilitate România — NIR, consum, balanță stoc și export Saga",
    intro:
      "Afacerile românești au nevoie de documente contabile specifice. franchisetech generează rapoartele cerute de contabil: Registru de casă, Bon de consum, Balanță cantitativ-valorică, Raport de gestiune complet și export XML pentru software-ul de contabilitate Saga.",
    bullets: [
      "Registru de casă — registru zilnic al mișcărilor de numerar",
      "Bon de consum — consumul de ingrediente din rețete",
      "Balanță cantitativ-valorică — stoc inițial/final per produs",
      "Raport de gestiune — raport complet mișcări stoc cu defalcare TVA",
      "Export Saga XML — NIR și vânzări în format compatibil Saga",
      "Defalcare TVA pe cote (19%, 9%, 5%, 0%)",
    ],
    sections: [
      {
        title: "Registru de casă",
        body: "Descărcați documentul legal obligatoriu al registrului zilnic de casă care arată numerarul la deschidere, mișcările de numerar, vânzările, numerarul așteptat, numerarul numărat și diferențele. Disponibil din pagina Raport Z pentru afacerile din România.",
      },
      {
        title: "Bon de consum",
        body: "Urmăriți consumul de materii prime din rețete. Când se vând produse cu rețete, franchisetech înregistrează automat utilizarea ingredientelor. Raportul Bon de consum agregă acest consum pentru orice interval de date.",
      },
      {
        title: "Balanță cantitativ-valorică",
        body: "Un raport complet de balanță a stocului care arată stocul inițial, intrările (achiziții/NIR), ieșirile (vânzări/consum) și stocul final. Calculat din mișcările reale de stoc, nu din estimări.",
      },
      {
        title: "Raport de gestiune",
        body: "Raportul complet de inventar care combină toate mișcările în ordine cronologică: stoc inițial, intrări NIR, consum, valori vânzări din Raport Z și stoc final — defalcat pe coloane TVA (19%, 9%, 5%, 0%).",
      },
      {
        title: "Export Saga XML",
        body: "Exportați datele NIR (achiziții) și vânzări în format XML compatibil cu software-ul de contabilitate Saga. Disponibil din pagina Export Audit pentru import ușor în sistemul contabilului.",
      },
    ],
    faqs: [
      {
        question: "Aceste rapoarte sunt conforme legal?",
        answer:
          "franchisetech generează rapoarte bazate pe datele înregistrate. Acuratețea depinde de introducerea corectă a datelor (produse, achiziții, vânzări, ajustări stoc). Afișăm cotele TVA reale din setările produselor — nu valori prestabilite. Verificați întotdeauna cu contabilul.",
      },
      {
        question: "Unde găsesc aceste rapoarte?",
        answer:
          "Rapoartele sunt disponibile în secțiunea Rapoarte: Rapoarte → Bon de consum, Balanță, Raport de gestiune. Registrul de casă se poate descărca din pagina Raport Z. Exportul Saga este în Export Audit.",
      },
      {
        question: "Cum se calculează TVA?",
        answer:
          "Defalcarea TVA folosește câmpul cota_tva de pe fiecare produs. Asigurați-vă că produsele au cota TVA corectă configurată în Setări → Produse.",
      },
      {
        question: "Ce fac dacă rapoartele sunt goale?",
        answer:
          "Rapoartele necesită date: achiziții (pentru NIR/intrări), vânzări de produse cu rețete (pentru consum), mișcări de stoc. Verificați intervalul de date selectat și confirmați că aveți tranzacții înregistrate.",
      },
      {
        question: "Pot exporta către Saga?",
        answer:
          "Da. Mergeți la Rapoarte → Export Audit → Export Saga XML. Alegeți export NIR, Vânzări sau Combinat pentru perioada selectată.",
      },
    ],
    related: [
      { label: "Raport Z și închidere casă", href: "/features/z-report" },
      { label: "Gestiune stoc", href: "/features/stock-management" },
      { label: "Cod QR pe bon", href: "/features/qr-code-receipts" },
    ],
  },
  romania: {
    title: "Program de gestiune HoReCa România — FiscalNet, TVA, rapoarte contabile",
    metaTitle: "POS România | FiscalNet, NIR, Bon consum, Balanță, Export Saga | franchisetech",
    description:
      "franchisetech pentru cafenele și restaurante din România: POS în lei, FiscalNet, NIR, Bon de consum, Balanță cantitativ-valorică, Raport de gestiune și export Saga XML — fără add-on-uri separate.",
    h1: "POS și rapoarte contabile pentru afaceri din România",
    intro:
      "franchisetech este configurat pentru piața românească: monedă lei (RON), cote TVA standard, integrare FiscalNet și pachetul complet de rapoarte pentru contabil — Bon de consum, Balanță, Raport de gestiune și export Saga.",
    bullets: [
      "Afișaj în lei (RON) — POS, rapoarte, bonuri",
      "Cote TVA românești: 19%, 9%, 5%, 0%",
      "Integrare FiscalNet pentru bonuri fiscale",
      "Registru de casă din Raport Z",
      "Bon de consum, Balanță cantitativ-valorică, Raport de gestiune",
      "Export Saga XML pentru NIR și vânzări",
      "Membri de echipă nelimitați",
    ],
    sections: [
      {
        title: "Monedă și TVA pentru România",
        body: "Toate sumele se afișează în lei (RON). Cotele TVA sunt pre-încărcate: TVA Standard 19%, TVA Redus 9%, TVA Super-redus 5% și Scutit 0%. Cotele sunt editabile oricând.",
      },
      {
        title: "Integrare FiscalNet completă",
        body: "franchisetech se conectează la driver-ul FiscalNet pentru emiterea bonurilor fiscale. Suportă metodele de plată mapate (cod 1–8) și transmite reducerile per articol ca comandă DP^.",
      },
      {
        title: "Rapoarte pentru contabil",
        body: "Generați documentele cerute de contabil direct din aplicație: Registru de casă (din Raport Z), Bon de consum pentru ingrediente din rețete, Balanță cantitativ-valorică cu stoc inițial/final, Raport de gestiune cu defalcare TVA și export Saga XML pentru import în software-ul contabilului.",
      },
      {
        title: "De ce contabilii recomandă franchisetech",
        body: "Majoritatea POS-urilor din România exportă doar vânzări sau Saga XML. franchisetech include Bon de consum și Balanță cantitativ-valorică — rapoarte pe care Ebriza și RezoSoft nu le oferă în același pachet. Un singur workspace în browser, fără app separată.",
      },
    ],
    faqs: [
      {
        question: "Ce rapoarte contabile sunt incluse?",
        answer:
          "Registru de casă, Bon de consum, Balanță cantitativ-valorică, Raport de gestiune și export Saga XML. Disponibile în secțiunea Rapoarte după ce aveți achiziții, vânzări și rețete configurate.",
      },
      {
        question: "Funcționează cu FiscalNet?",
        answer:
          "Da, când este activat pe stația de casă. franchisetech trimite comenzi S^ pentru articole, DP^ pentru reduceri și P^ pentru plăți.",
      },
      {
        question: "Pot exporta către Saga?",
        answer:
          "Da. Export Saga XML pentru NIR și vânzări este inclus — fără add-on de €39/lună ca la unii competitori.",
      },
      {
        question: "Există limită de utilizatori?",
        answer: "Nu. Membri de echipă nelimitați cu roluri clare, fără taxă per casier.",
      },
    ],
    related: [
      { label: "Rapoarte contabilitate", href: "/features/accountant-reports" },
      { label: "Comparație Ebriza", href: "/compare/ebriza" },
      { label: "Raport Z", href: "/features/z-report" },
      { label: "Cafenele", href: "/industries/cafes" },
    ],
  },
};
