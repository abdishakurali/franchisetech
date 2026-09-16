import type { SeoRoOverrides } from "./types";
import { seoRoIndustryOverrides } from "./seo-ro-industries";

/** Romanian copy for SEO pages — merged over English at render time. */
export const seoRoOverrides: Record<string, SeoRoOverrides> = {
  ...seoRoIndustryOverrides,
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
    sections: [
      {
        title: "Produse și ingrediente în același sistem",
        body: "Articolele vandabile și ingredientele pot sta în aceeași listă de produse, cu marcaje clare pentru disponibilitatea în POS și urmărirea stocului.",
      },
      {
        title: "Achizițiile actualizează imaginea stocului",
        body: "Achizițiile de la furnizori înregistrează cantități și costuri, ca valorile ingredientelor și deciziile de reaprovizionare să fie mai ușor de revizuit.",
      },
      {
        title: "Știți ce puteți face",
        body: "Cantitățile din rețete și stocul curent ajută proprietarii să înțeleagă câte porții pot fi făcute înainte de a cumpăra alte ingrediente.",
      },
    ],
    faqs: [
      {
        question: "franchisetech poate înlocui un sistem de depozit?",
        answer: "Nu. Este un instrument practic de stoc pentru operatori mici din alimentație, nu o platformă enterprise de gestiune depozit.",
      },
      {
        question: "Achizițiile pot actualiza stocul?",
        answer: "Da. Achizițiile pot fi înregistrate pe produse și furnizori, ca mișcarea de stoc să rămână clară.",
      },
      {
        question: "Vânzările din POS pot reduce stocul de ingrediente?",
        answer: "Da, când rețetele sunt configurate, vânzările pot reduce stocul ingredientelor din rețetă.",
      },
      {
        question: "Pot transfera stoc între locații?",
        answer: "Nu încă. Transferul de stoc între locații este pe roadmap — momentan, stocul fiecărei locații se urmărește separat.",
      },
    ],
    related: [
      { label: "Cost rețete", href: "/features/recipe-costing" },
      { label: "Articol despre control stoc", href: "/blog/stoc-negativ-cauze-si-solutii" },
      { label: "Restaurante", href: "/industries/restaurants" },
    ],
  },
  "recipe-costing": {
    eyebrow: "Cost rețete",
    title: "Software cost rețete pentru cafenele",
    metaTitle: "Cost rețete pentru cafenele — marjă brută per porție",
    description: "Calculați costul per porție, marja brută și câte porții puteți face din stocul curent.",
    h1: "Cost rețete și marje pentru meniul dvs.",
    intro: "Legați ingredientele de prețul de vânzare ca să vedeți marja reală înainte să schimbați meniul.",
    bullets: [
      "Constructor de rețete la nivel de ingredient",
      "Cost per porție",
      "Urmărire marjă brută",
      "Porții posibile din stocul curent",
    ],
    sections: [
      {
        title: "Construiți rețete din ingrediente",
        body: "Adăugați ingrediente precum pui, salată, dressing, pâine sau ambalaj la un produs finit și lăsați franchisetech să calculeze costul rețetei.",
      },
      {
        title: "Vedeți marja înainte să vindeți",
        body: "Comparați costul cu prețul de vânzare, ca produsele cu marjă mică să fie vizibile înainte să reducă profitul pe tăcute.",
      },
      {
        title: "Planificați din stoc",
        body: "Numărul de porții posibile ajută echipa să înțeleagă dacă stocul acoperă meniul de azi, fără ghicit.",
      },
    ],
    faqs: [
      {
        question: "Pot costa un produs Chicken Caesar?",
        answer: "Da. Adăugați pui, salată, dressing, brânză, crutoane, ambalaj și cantitățile ca să calculați cost și marjă.",
      },
      {
        question: "franchisetech include consultanță fiscală?",
        answer: "Nu. franchisetech ajută la păstrarea unor înregistrări organizate. Nu înlocuiește contabilitatea sau consultanța fiscală profesională.",
      },
      {
        question: "Rețetele se pot lega de POS?",
        answer: "Da. Produsele din rețete pot fi vândute prin POS și folosite la calculele de stoc.",
      },
    ],
    related: [{ label: "Gestionare stoc", href: "/features/stock-management" }],
  },
  "z-report": {
    eyebrow: "Închidere casă",
    title: "Raport Z și închidere casă",
    metaTitle: "Raport Z zilnic și reconciliere numerar",
    description: "Numerar deschidere, totaluri numerar/card, intrări/ieșiri și diferența la închidere.",
    h1: "Raport Z zilnic și reconciliere numerar",
    intro: "franchisetech adună cifrele de închidere zilnică ca să revizuiți vânzările fără să reconstruiți ziua din memorie.",
    bullets: [
      "Numerar deschidere",
      "Totaluri numerar și card",
      "Mișcări de numerar intrare/ieșire",
      "Numerar așteptat, numerar numărat și diferența",
    ],
    sections: [
      {
        title: "Închideți casa fără bătăi de cap",
        body: "Înregistrați numerarul numărat, note și diferența de numerar la sfârșitul zilei, ca registrul de casă să aibă un punct de închidere clar.",
      },
      {
        title: "Revizuiți vânzările pe metodă de plată",
        body: "Totalurile numerar și card ajută proprietarii să compare registrul casei cu numerarul din sertar și totalurile de la procesatorul de plăți.",
      },
      {
        title: "Păstrați înregistrări organizate",
        body: "franchisetech ajută la păstrarea unor înregistrări organizate. Nu înlocuiește consultanța contabilă, fiscală, juridică sau de siguranță alimentară profesională.",
      },
    ],
    faqs: [
      {
        question: "Ce este un raport Z?",
        answer: "Un raport Z este un rezumat de închidere a zilei la casă, care arată vânzările și reconcilierea numerarului pentru o sesiune sau o zi.",
      },
      {
        question: "Pot înregistra intrări și ieșiri de numerar?",
        answer: "Da. Mișcările de numerar pot fi înregistrate cu motiv, ca numerarul așteptat să rămână clar.",
      },
      {
        question: "Înlocuiește contabilul?",
        answer: "Nu. franchisetech ajută la păstrarea unor înregistrări organizate de vânzări și casă. Consultanța fiscală și contabilă profesională rămâne responsabilitatea dvs.",
      },
    ],
    related: [
      { label: "Raport Z explicat", href: "/resources/z-report-explained" },
      { label: "Funcționalitate POS", href: "/features/pos" },
    ],
  },
  "purchases-suppliers": {
    eyebrow: "Achiziții și furnizori",
    title: "Achiziții, furnizori și niveluri stoc",
    metaTitle: "Achiziții și furnizori pentru afaceri alimentare",
    description: "Înregistrați furnizori, achiziții și niveluri de stoc alături de vânzările POS.",
    h1: "Furnizori, achiziții și stoc într-un singur loc",
    intro: "Vedeți ce ați cumpărat, de la cine și cum se reflectă în stoc — lângă vânzările zilnice.",
    bullets: [
      "Director de furnizori cu date de contact",
      "Înregistrări de achiziții și cheltuieli per furnizor",
      "Stocul crește la recepția mărfii",
      "Import achiziții din CSV",
    ],
    sections: [
      {
        title: "Cunoașteți cheltuiala per furnizor",
        body: "Vedeți cheltuiala totală per furnizor și istoricul achizițiilor fără un fișier Excel separat.",
      },
      {
        title: "Stocul urmează achizițiile",
        body: "Achizițiile recepționate pot crește stocul de produse, ca stocul curent să rămână actualizat.",
      },
      {
        title: "Funcționează cu rețetele",
        body: "Achizițiile de ingrediente alimentează costul rețetelor și calculul porțiilor posibile.",
      },
    ],
    faqs: [
      {
        question: "Pot importa date vechi de achiziții?",
        answer: "Da. Importul CSV este disponibil pentru achiziții când migrați dintr-un alt sistem.",
      },
      {
        question: "Este un ERP complet?",
        answer: "Nu. Este o urmărire practică a achizițiilor pentru operatori mici din alimentație, nu procurement enterprise.",
      },
    ],
    related: [
      { label: "Gestionare stoc", href: "/features/stock-management" },
      { label: "Cost rețete", href: "/features/recipe-costing" },
    ],
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
    intro: "Checklist în aplicație de la înregistrare la produse demo, deschiderea casei și prima vânzare — ghidat pas cu pas, fără cost.",
    bullets: [
      "0–15 min: înregistrare și setări afacere",
      "15–45 min: produse demo și metode de plată",
      "45–60 min: deschidere casă și prima vânzare de test",
    ],
    sections: [
      {
        title: "Etape clare",
        body: "Fiecare pas trimite direct la ecranul potrivit — setări, POS sau rapoarte — ca setup-ul să rămână concentrat.",
      },
      {
        title: "Configurare ghidată, self-serve",
        body: "Înregistrarea generează automat produse demo și metode de plată. Checklist-ul ghidat urmărește progresul de la primul produs la prima vânzare — trialul de 15 zile începe de la crearea contului, fără card.",
      },
    ],
    faqs: [
      {
        question: "Cât durează configurarea?",
        answer: "Traseul de bază (înregistrare → produse demo → deschidere casă → prima vânzare): majoritatea cafenelelor termină în sub o oră. Migrarea unui catalog complet cu 200+ produse poate dura 1–2 zile — puteți întinde pe parcursul trialului.",
      },
      {
        question: "Cum arată cronologia?",
        answer: "0–15 min: cont și setări. 15–45 min: produse și metode de plată. 45–60 min: deschidere casă și prima vânzare de test. Stocul și rețetele pot aștepta după ce casa funcționează.",
      },
      {
        question: "Pot sări peste pași?",
        answer: "Da. Ghidul este un checklist, nu un blocaj. Vă puteți întoarce la orice pas mai târziu.",
      },
    ],
    related: [
      { label: "POS", href: "/features/pos" },
      { label: "Prețuri", href: "/pricing" },
    ],
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
    eyebrow: "Bon fiscal & FiscalNet",
    title: "Bon Fiscal în POS — FiscalNet, Raport Z și Pregătire QR",
    metaTitle: "Bon Fiscal POS România | FiscalNet, Raport Z, QR ANAF | franchisetech",
    description:
      "Cum gestionezi bonurile fiscale în franchisetech: POS, FiscalNet, metode de plată, TVA, raport Z și ce trebuie verificat pentru QR-ul ANAF.",
    h1: "Bon fiscal din POS, fără pași manuali între vânzare și închiderea zilei",
    intro:
      "franchisetech este pentru cafenele și restaurante mici din România care vor ca fiecare vânzare din POS să rămână legată de FiscalNet, TVA, metode de plată și raportul Z. QR-ul ANAF depinde de firmware-ul casei fiscale, dar datele operaționale trebuie să fie corecte înainte să ajungă la imprimantă.",
    bullets: [
      "Vânzarea se înregistrează în POS și se trimite către FiscalNet când integrarea este activă",
      "Metodele de plată și grupele TVA sunt mapate în setările fiscale",
      "Raportul Z și diferențele de numerar rămân în același workspace",
      "QR-ul de pe bon este generat de casa fiscală certificată, nu de POS",
      "Verifici firmware-ul QR cu furnizorul casei de marcat înainte de termenul ANAF",
    ],
    sections: [
      {
        title: "Ce face franchisetech în fluxul de bon fiscal",
        body: "Casierul finalizează vânzarea în POS, cu produse, TVA și metodă de plată. Pentru organizațiile din România cu FiscalNet configurat, franchisetech trimite datele către casa fiscală prin driverul FiscalNet și păstrează tranzacția pentru verificarea zilnică.",
      },
      {
        title: "Unde intră QR-ul ANAF",
        body: "QR-ul de pe bon este responsabilitatea casei fiscale certificate și a firmware-ului instalat de furnizorul autorizat. POS-ul nu desenează QR-ul pe bonul fiscal; POS-ul trebuie să trimită corect liniile, TVA-ul și plata către dispozitiv.",
      },
      {
        title: "Ce verifici înainte de go-live",
        body: "Confirmă cu furnizorul casei fiscale că firmware-ul suportă QR, actualizează FiscalNet, configurează CIF-ul, metodele de plată și grupele TVA, apoi rulează o vânzare de test și un raport Z împreună cu contabilul.",
      },
    ],
    faqs: [
      {
        question: "franchisetech emite bon fiscal?",
        answer:
          "Da, pentru organizațiile din România unde FiscalNet este activat și configurat corect. Verificarea fiscală finală rămâne la contabil și furnizorul casei fiscale.",
      },
      {
        question: "franchisetech generează QR-ul de pe bon?",
        answer:
          "Nu. QR-ul este generat de casa fiscală certificată. franchisetech trimite datele vânzării către FiscalNet; dispozitivul fiscal tipărește bonul conform firmware-ului instalat.",
      },
      {
        question: "Ce trebuie să verific pentru QR?",
        answer:
          "Întreabă furnizorul autorizat dacă modelul casei tale fiscale are firmware QR disponibil, apoi testează o vânzare reală cu FiscalNet înainte de termenul ANAF.",
      },
      {
        question: "Ce se întâmplă la finalul zilei?",
        answer:
          "În franchisetech închizi sesiunea POS cu raport Z, vezi totaluri cash/card, numerar așteptat, numerar numărat și diferențe notate pentru verificare.",
      },
      {
        question: "Înlocuiește franchisetech contabilul?",
        answer:
          "Nu. franchisetech organizează vânzări, TVA, FiscalNet și rapoarte operaționale. Contabilul verifică obligațiile fiscale și documentele oficiale.",
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
      "Defalcare TVA pe cote (21%, 11%, 0%)",
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
        body: "Raportul complet de inventar care combină toate mișcările în ordine cronologică: stoc inițial, intrări NIR, consum, valori vânzări din Raport Z și stoc final — defalcat pe coloane TVA (21%, 11%, 0%).",
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
  loyalty: {
    eyebrow: "Program de fidelizare",
    title: "Program de fidelizare pentru cafenele și restaurante — fără aplicație",
    metaTitle: "Program de fidelizare pe număr de telefon — card de ștampile + clienți în risc",
    description: "Card de ștampile pe numărul de telefon al clientului — fără aplicație, fără card fizic. Plus un panou cu clienții fideli care nu au mai venit de curând.",
    h1: "Un program de fidelizare fără aplicație pentru clienții fideli",
    intro: "franchisetech ține evidența ștampilelor pe numărul de telefon al clientului direct la casă — fără aplicație, fără card fizic — și arată proprietarilor care clienți fideli au încetat discret să mai vină.",
    bullets: [
      "Card de ștampile pe număr de telefon — fără aplicație sau card fizic",
      "Casierii îl folosesc direct din selectorul de clienți existent din POS",
      "Recompensă discount sau produs gratuit, configurabilă per afacere",
      "Panou clienți în risc: clienți fideli care nu au mai venit",
    ],
    sections: [
      {
        title: "Fără aplicație, fără card fizic",
        body: "Clienții sunt identificați la fel cum se întâmplă deja la casă — după nume sau telefon. Ștampilele se acumulează automat la fiecare vânzare finalizată, fără nimic în plus de gestionat pentru personal.",
      },
      {
        title: "Aflați cine se îndepărtează",
        body: "Majoritatea programelor de fidelizare se opresc la recompensarea vizitelor. franchisetech marchează și clienții care veneau regulat și nu au mai fost văzuți de o vreme, ordonați după cât au cheltuit — ca să știți pe cine merită să sunați personal.",
      },
      {
        title: "Configurabil în câteva minute",
        body: "Alegeți câte vizite aduc o recompensă, dacă este discount fix sau produs gratuit, și după câte zile de absență considerăm clientul „în risc” — totul din Setări, fără tichet de suport.",
      },
    ],
    faqs: [
      { question: "Clienții trebuie să instaleze o aplicație?", answer: "Nu. Ștampilele sunt urmărite pe baza numărului de telefon sau numelui deja folosit în selectorul de clienți din POS — nimic de instalat pentru client." },
      { question: "Pot alege recompensa?", answer: "Da — o sumă fixă de discount sau un produs gratuit anume, configurabil per afacere." },
      { question: "Ce se întâmplă dacă o vânzare este anulată?", answer: "Vânzările anulate nu contează pentru ștampile — doar vânzările finalizate se acumulează." },
      { question: "Este inclus în planul meu?", answer: "Este inclus în planurile Operations și Scale, și disponibil ca add-on pentru Starter." },
    ],
    related: [
      { label: "POS", href: "/features/pos" },
      { label: "Cafenele", href: "/industries/cafes" },
    ],
  },
  romania: {
    title: "Program de gestiune HoReCa România — FiscalNet, TVA, rapoarte contabile",
    metaTitle: "POS România | FiscalNet, NIR, Bon consum, Balanță, Export Saga | franchisetech",
    description:
      "franchisetech pentru cafenele și restaurante din România: POS în lei, FiscalNet, NIR, Bon de consum, Balanță cantitativ-valorică, Raport de gestiune și export Saga XML în planurile eligibile.",
    h1: "POS și rapoarte contabile pentru afaceri din România",
    intro:
      "franchisetech este configurat pentru piața românească: monedă lei (RON), cote TVA standard, integrare FiscalNet și pachetul complet de rapoarte pentru contabil — Bon de consum, Balanță, Raport de gestiune și export Saga.",
    bullets: [
      "Afișaj în lei (RON) — POS, rapoarte, bonuri",
      "Cote TVA românești: 21%, 11%, 0%",
      "Integrare FiscalNet pentru bonuri fiscale",
      "Registru de casă din Raport Z",
      "Bon de consum, Balanță cantitativ-valorică, Raport de gestiune",
      "Export Saga XML pentru NIR și vânzări",
      "Membri de echipă nelimitați",
    ],
    sections: [
      {
        title: "Monedă și TVA pentru România",
        body: "Toate sumele se afișează în lei (RON). Cotele TVA sunt pre-încărcate: TVA Standard 21%, TVA Redus 11% și Scutit 0%. Cotele sunt editabile oricând.",
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
          "Da. Export Saga XML pentru NIR și vânzări este inclus în planurile eligibile.",
      },
      {
        question: "Există limită de utilizatori?",
        answer: "Nu. Membri de echipă nelimitați cu roluri clare, fără taxă per casier.",
      },
    ],
    related: [
      { label: "Comparație Ebriza", href: "/compare/ebriza" },
      { label: "Raport Z", href: "/features/z-report" },
      { label: "Cafenele", href: "/industries/cafes" },
    ],
  },
};
