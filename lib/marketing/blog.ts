export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  locale: "ro" | "en";
  tags: string[];
  image?: string;
  relatedFeature?: string;
  sections: Array<{ heading: string; body: string }>;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "ce-este-raportul-z-si-cum-il-faci",
    title: "Ce este Raportul Z și cum îl faci corect",
    description:
      "Raportul Z este documentul de închidere a casei la sfârşitul zilei. Îți arată câți bani ai încasat, cum s-a plătit și ce diferență există față de ce ar trebui să fie în sertar.",
    publishedAt: "2026-06-23",
    locale: "ro",
    tags: ["raport-z", "pos", "inchidere-zi"],
    image: "/marketing/reports-zreport.png",
    relatedFeature: "/features/z-report",
    sections: [
      {
        heading: "Ce este Raportul Z?",
        body: "Raportul Z (sau raportul de închidere a casei) este documentul generat la sfârşitul fiecărei zile de lucru. Arată totalul vânzărilor, defalcarea pe metode de plată (numerar, card, online) și TVA-ul colectat. Numele vine de la litera Z care, în terminologia fiscală clasică, marca sfârşitul unui ciclu de raportare pe casele de marcat electronice.\n\nPentru o cafenea sau un restaurant, raportul Z este echivalentul unui bilanț zilnic: știi exact câți bani ar trebui să fie în sertar, câți au intrat pe card și dacă cifrele se potrivesc cu ce a vândut personalul în cursul zilei.",
      },
      {
        heading: "Ce trebuie să conțină un Raport Z corect?",
        body: "Un raport Z complet include:\n\n- **Total tranzacții** — numărul de vânzări din ziua respectivă\n- **Vânzări nete** — valoarea totală fără reduceri sau anulări\n- **Defalcare pe metode de plată** — numerar, card, online separat\n- **TVA colectat** — defalcat pe cote (9%, 19%, 5%, 0%)\n- **Vânzări brute** — totalul inclusiv TVA\n- **Numerar așteptat vs. numărat** — diferența față de fondul de deschidere plus încasări cash\n\nÎn franchisetech, aceste câmpuri sunt calculate automat din sesiunea POS. Nu introduci nimic manual — sistemul agregă fiecare tranzacție înregistrată în ziua respectivă.",
      },
      {
        heading: "Cum îl faci în franchisetech",
        body: "La finalul zilei, mergi la **Rapoarte → Raport Z zilnic**. Alegi data și apeși Încarcă. Raportul se generează instant din datele sesiunii POS.\n\nDe acolo poți:\n- **Tipări** raportul pentru dosar\n- **Descărca Registrul de casă** — documentul legal cu toate mișcările de numerar din ziua respectivă\n- Verifica diferența numerar (câți bani ar trebui să fie vs. câți sunt)\n\nDacă numerarul așteptat nu se potrivește cu ce numeri în sertar, raportul îți arată exact de unde vine diferența.",
      },
      {
        heading: "Cât de des trebuie generat?",
        body: "Zilnic, la finalul fiecărei ture sau la închiderea locației. Bune practici:\n\n- Generează raportul Z înainte de a scoate numerarul din sertar\n- Numără banii fizic și compară cu totalul așteptat din raport\n- Dacă există diferențe, notează motivul (rest dat incorect, corecție, etc.)\n- Arhivează o copie tipărită sau PDF pentru contabil\n\nContabilii și inspectorii fiscali pot solicita rapoartele Z pentru orice perioadă. franchisetech le păstrează pe server și le poți descărca oricând.",
      },
      {
        heading: "Diferența față de Registrul de casă",
        body: "Raportul Z și Registrul de casă sunt documente diferite, deși legate:\n\n**Raportul Z** — sumarul zilei: vânzări totale, defalcare plăți, TVA.\n\n**Registrul de casă** — jurnalul cronologic al tuturor mișcărilor de numerar: fond de deschidere, fiecare încasare, restul dat, ieșiri de numerar (plata furnizori din casă etc.), sold final.\n\nÎn franchisetech, Registrul de casă se descarcă direct de pe pagina Raportului Z, butoanele apar alături — nu trebuie să cauți în altă parte.",
      },
    ],
  },
  {
    slug: "cum-faci-nir-in-romania-fara-excel",
    title: "Cum faci NIR-ul în România fără Excel",
    description:
      "NIR (Nota de Intrare-Recepție) este documentul obligatoriu la primirea mărfii de la furnizori. Iată ce trebuie să conțină, când este obligatoriu și cum îl generezi din programul de gestiune.",
    publishedAt: "2026-06-23",
    locale: "ro",
    tags: ["nir", "achizitii", "furnizori", "contabilitate"],
    image: "/marketing/pos-hero.png",
    relatedFeature: "/features/nir",
    sections: [
      {
        heading: "Ce este NIR-ul?",
        body: "NIR (Nota de Intrare-Recepție) este documentul care atestă că o marfă a fost primită la locul de depozitare sau de consum. Este documentul primar care justifică intrarea mărfii în gestiune și servește ca bază pentru înregistrarea achizițiilor în contabilitate.\n\nFără NIR, marfa nu există oficial în gestiunea ta. Asta înseamnă că orice ieșire ulterioară (prin vânzare sau consum) nu poate fi justificată documentar față de un inspector.",
      },
      {
        heading: "Când este obligatoriu?",
        body: "NIR-ul este obligatoriu ori de câte ori primești marfă de la un furnizor, indiferent dacă vine cu factură, aviz de expediție sau bon fiscal. Conform normelor contabile românești (OMFP 2634/2015), documentul trebuie întocmit la data recepției, nu la data facturii.\n\nCazuri frecvente în HoReCa:\n- Livrare cafea de la torrefactore\n- Aprovizionare lapte, zahăr, materiale de curățenie\n- Primire alimente de la distribuitor\n- Achiziție ambalaje sau consumabile\n\nNu contează dacă furnizorul e persoană fizică sau juridică — dacă primești marfă pentru gestiunea afacerii, faci NIR.",
      },
      {
        heading: "Ce date trebuie să conțină?",
        body: "Un NIR complet include:\n\n- Numărul documentului (generat secvențial)\n- Data recepției\n- Furnizorul (nume, CIF)\n- Referința facturii sau avizului de expediție\n- Lista produselor: denumire, unitate de măsură, cantitate, preț unitar, valoare totală\n- TVA aferentă\n- Semnătura responsabilului de gestiune\n\nDin punct de vedere practic, cel mai important este că prețul din NIR să coincidă cu cel din factură și că produsele listate să fie cele efectiv primite — verificare cantitativă și calitativă la recepție.",
      },
      {
        heading: "Cum îl faci în franchisetech",
        body: "În franchisetech, NIR-ul se creează din **Stoc → Cumpărături / NIR → NIR nou**.\n\n1. Selectezi furnizorul (sau adaugi unul nou)\n2. Introduci referința facturii\n3. Adaugi produsele primite cu cantitate și preț unitar\n4. Apeși **Emite NIR** — stocul se actualizează automat\n\nCâtă vreme ai NIR în stadiul de Ciornă, stocul NU se modifică. Abia după emitere, produsele intră în gestiune și apar în rapoartele de stoc.\n\nDupă emitere, NIR-ul apare în istoricul cumpărăturilor și poate fi exportat pentru contabil (CSV sau inclus în exportul Saga XML).",
      },
      {
        heading: "NIR vs. factură — care e diferența?",
        body: "Factura vine de la furnizor și atestă obligația de plată. NIR-ul vine de la tine și atestă că ai primit marfa.\n\nPot să nu coincidă: poți primi marfa fără factură (aviz de expediție) sau poți primi factura înainte de marfă. În ambele cazuri, NIR-ul se face la data fizică a recepției.\n\nÎn practică, contabilii cer ambele documente pereche: factură + NIR aferent, pentru fiecare intrare în gestiune.",
      },
    ],
  },
  {
    slug: "cum-calculezi-costul-unei-retete-cafenea",
    title: "Cum calculezi costul unei rețete pentru cafenea",
    description:
      "Costul rețetei îți arată cât cheltuiești efectiv pentru a prepara un produs. Fără el, nu știi dacă vinzi în pierdere sau în profit. Iată cum se calculează și ce marjă este considerată sănătoasă.",
    publishedAt: "2026-06-23",
    locale: "ro",
    tags: ["retete", "cost-reteta", "marja", "menu-engineering"],
    image: "/marketing/recipe-costing-hero.png",
    relatedFeature: "/features/recipe-costing",
    sections: [
      {
        heading: "De ce contează costul rețetei?",
        body: "Mulți proprietari de cafenele setează prețul pe baza a ceea ce cer competitorii sau pe instinct. Problema: nu știi dacă faci profit sau pierzi bani la fiecare produs vândut.\n\nCostul rețetei îți arată exact câți lei cheltuiești pe ingrediente pentru un cappuccino, un smoothie sau un croissant. Diferența dintre prețul de vânzare și costul ingredientelor este marja brută — și aceasta este cifra pe care o urmărești.",
      },
      {
        heading: "Formula de calcul",
        body: "Costul rețetei = Σ (cantitate ingredient × preț unitar ingredient)\n\nMarja brută = Preț vânzare − Cost rețetă\n\nProcentaj marjă = (Marjă brută / Preț vânzare) × 100\n\nExemplu pentru un cappuccino:\n- Espresso (7g cafea): 7g × 80 lei/kg = 0.56 lei\n- Lapte (150ml): 150ml × 6 lei/l = 0.90 lei\n- Pahar + capac: 0.35 lei\n- **Cost total: 1.81 lei**\n\nDacă vinzi cappuccinoul cu 12 lei:\n- Marjă brută: 12 − 1.81 = 10.19 lei\n- Procentaj marjă: 84.9%",
      },
      {
        heading: "Ce procent de marjă este normal în HoReCa?",
        body: "În industria cafelei și a băuturilor, o marjă brută de 65–80% pe ingrediente este considerată normală. Aceasta NU înseamnă profit net — din marjă mai scazi chiria, salariile, utilitățile, amortizarea echipamentelor.\n\nOrientativ:\n- **Cafea (espresso, cappuccino):** 75–85% marjă pe ingrediente ✓\n- **Smoothie-uri, sucuri fresh:** 60–75% ✓\n- **Mâncare gătită (sendvișuri, salate):** 55–70% ✓\n- **Sub 50% marjă pe ingrediente** — revizuiește prețul sau rețeta\n\nAtentie: marja pe ingrediente nu include forța de muncă. Un cocktail care durează 5 minute să fie preparat are un cost real mai mare decât un espresso care durează 30 de secunde.",
      },
      {
        heading: "Cum introduci rețetele în franchisetech",
        body: "Din meniul **Rețete**, apăsați **Creează rețetă**:\n\n1. Selectați produsul (din lista de produse POS)\n2. Adăugați ingredientele cu cantitățile per porție\n3. Salvați rețeta\n\nSistemul calculează automat costul per porție pe baza prețurilor din stoc (introduse la NIR sau la inventariere). Dacă prețul unui ingredient se schimbă la o aprovizionare ulterioară, costul rețetei se recalculează automat.\n\nLista de rețete afișează pentru fiecare produs: preț vânzare, cost/porție, marjă și câte porții poți produce cu stocul actual.",
      },
      {
        heading: "Ce faci cu produsele cu marjă negativă?",
        body: "Dacă un produs apare cu marjă negativă (roșu în aplicație), costul ingredientelor depășește prețul de vânzare. Soluții:\n\n1. **Verifică prețul ingredientelor** — poate s-a introdus un preț greșit la ultimul NIR\n2. **Revizuiește cantitățile din rețetă** — poate porțiile sunt prea mari\n3. **Crește prețul de vânzare** — dacă piața permite\n4. **Înlocuiește ingredientul** — alternative mai ieftine cu calitate similară\n\nUn produs cu marjă negativă vândut în volum mare poate nega profitul întregii zile. Identifică-l devreme din lista de rețete.",
      },
    ],
  },
  {
    slug: "bon-de-consum-restaurant-ce-este",
    title: "Bon de consum pentru restaurant — ce este și cum îl generezi",
    description:
      "Bonul de consum documentează materiile prime consumate din gestiune pentru producție. Este obligatoriu când ai rețete și stoc gestionat. Iată ce trebuie să conțină și cum îl generezi automat.",
    publishedAt: "2026-06-23",
    locale: "ro",
    tags: ["bon-de-consum", "contabilitate", "stoc", "retete"],
    image: "/marketing/reports-zreport.png",
    relatedFeature: "/features/accountant-reports",
    sections: [
      {
        heading: "Ce este bonul de consum?",
        body: "Bonul de consum (sau nota de consum) este documentul contabil care justifică ieșirea materiilor prime din gestiune prin consum în procesul de producție. Spre deosebire de o vânzare (care generează bon fiscal), consumul de ingrediente pentru prepararea unui produs nu generează bon fiscal — el se documentează prin bonul de consum.\n\nExemplu: vinzi un cappuccino. Clientul primește bonul fiscal. Dar cafeaua, laptele și paharul ieșite din stoc sunt documentate printr-un bon de consum, nu printr-un bon fiscal.",
      },
      {
        heading: "Când este obligatoriu?",
        body: "Bonul de consum este obligatoriu pentru orice afacere care:\n- Gestionează stoc de materii prime\n- Prepară produse finite din aceste materii prime\n- Are obligația de a justifica ieșirile din gestiune față de contabil sau inspector\n\nPentru restaurante, cafenele și patiserii care operează cu rețete și stoc, bonul de consum este practic zilnic necesar. Fără el, stocul de materii prime nu poate fi scăzut documentar, ceea ce creează discrepanțe la inventariere.",
      },
      {
        heading: "Ce date trebuie să conțină?",
        body: "Conform normelor contabile (OMFP 2634/2015), bonul de consum include:\n\n- Data consumului\n- Locul de consum (unitatea, secția)\n- Lista materiilor prime: denumire, cod, unitate de măsură, cantitate, preț unitar, valoare\n- Semnătura responsabilului\n\nÎn practică, bonul de consum pentru HoReCa se generează agregat pe o perioadă (zi, săptămână, lună) — nu câte unul per produs vândut, ceea ce ar fi imposibil de gestionat manual.",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "franchisetech generează automat bonul de consum din datele de vânzări și rețete.\n\nLogica:\n1. La fiecare vânzare dintr-un produs cu rețetă, sistemul înregistrează consumul de ingrediente\n2. La finalul perioadei, mergi la **Rapoarte → Bon de consum**\n3. Selectezi intervalul de date\n4. Descărcați documentul — conține toate materiile prime consumate, cantitățile și valorile\n\nNu introduci nimic manual. Dacă ai rețetele configurate corect și ai înregistrat vânzările prin POS, bonul de consum se generează singur.",
      },
      {
        heading: "Legătura cu Balanța cantitativ-valorică",
        body: "Bonul de consum alimentează Balanța cantitativ-valorică: ieșirile din consum apar ca ieșiri în balanță, alături de ieșirile din vânzări directe.\n\nContabilul tău are nevoie de ambele documente pentru a verifica că stocul final calculat corespunde cu inventarul fizic. Dacă bonul de consum lipsește sau este incomplet, apar discrepanțe în balanță care trebuie explicate.\n\nDin franchisetech, ambele rapoarte se descarcă din aceeași secțiune Rapoarte — nu trebuie să cauți în aplicații separate.",
      },
    ],
  },
  {
    slug: "export-saga-din-program-gestiune-restaurant",
    title: "Cum exporti datele în Saga din programul de gestiune",
    description:
      "Exportul Saga XML permite transferul automat al datelor de vânzări și NIR din franchisetech în software-ul de contabilitate Saga. Elimini introducerea manuală și erorile de transcriere.",
    publishedAt: "2026-06-23",
    locale: "ro",
    tags: ["saga", "export-contabil", "contabilitate", "nir"],
    image: "/marketing/reports-zreport.png",
    relatedFeature: "/features/accountant-reports",
    sections: [
      {
        heading: "Ce este exportul Saga?",
        body: "Saga este unul dintre cele mai utilizate programe de contabilitate în România pentru IMM-uri și PFA-uri. Contabilii care lucrează cu Saga pot importa date direct în format XML, eliminând necesitatea introducerii manuale a fiecărei facturi sau note contabile.\n\nExportul Saga din franchisetech generează fișiere XML compatibile cu Saga C, Saga W și versiunile recente — formatate exact după specificațiile de import ale softului.",
      },
      {
        heading: "Ce date se exportă?",
        body: "franchisetech poate exporta în format Saga:\n\n**NIR (Achiziții):** Toate intrările de mărfuri înregistrate ca NIR emis în perioada selectată — furnizor, produse, cantități, valori, TVA.\n\n**Vânzări:** Totalizatorul vânzărilor pe perioadă, defalcat pe cote TVA — echivalentul datelor din Raportul Z zilnic, agregat lunar.\n\n**Export combinat:** NIR + Vânzări într-un singur fișier, pentru import complet într-o singură operațiune.",
      },
      {
        heading: "Cum faci exportul pas cu pas",
        body: "1. Du-te la **Rapoarte → Export audit & Saga**\n2. Selectează perioada (de obicei lunar, în concordanță cu declarațiile fiscale)\n3. Alege tipul de export: NIR, Vânzări sau Combinat\n4. Apasă **Exportă XML**\n5. Salvează fișierul și trimite-l contabilului tău\n\nContabilul importă fișierul direct în Saga: **Fișier → Import → Documente externe**. Datele apar automat în jurnalele de cumpărări și vânzări.",
      },
      {
        heading: "Condiții pentru un export corect",
        body: "Exportul Saga este fiabil doar dacă datele din franchisetech sunt corecte:\n\n- **NIR complet:** Toate achizițiile trebuie introduse cu furnizori și prețuri corecte\n- **Produse cu TVA configurat:** Cota TVA per produs trebuie setată corect în Setări → Produse\n- **Vânzări înregistrate prin POS:** Exportul preia datele din sesiunile POS, nu din estimări\n- **Periode fără lipsuri:** Dacă ai zile fără raport Z generat, exportul va reflecta acele lipsuri\n\nVerifică înainte de export că toate NIR-urile perioadei au statusul \"NIR emis\" (nu Ciornă) și că rapoartele Z sunt complete pentru fiecare zi lucrătoare.",
      },
      {
        heading: "Ce câștigă contabilul tău?",
        body: "Un contabil care primește export Saga din franchisetech vs. extrase manuale sau Excel:\n\n- **Eliminarea transcrierilor** — nu mai copiază date dintr-un sistem în altul\n- **Reducerea erorilor** — valorile, TVA-ul și furnizorii sunt preluate automat\n- **Timp mai puțin** — un import de o lună de date durează minute, nu ore\n- **Auditabilitate** — fiecare document importat are referință la sursa din franchisetech\n\nPentru afacerile care lucrează cu contabili externi, exportul Saga devine argumentul prin care explici de ce programul de gestiune plătit se justifică financiar.",
      },
    ],
  },
  {
    slug: "diferenta-dintre-ebriza-si-franchisetech-pret-real",
    title: "Ebriza vs Franchisetech — prețul real pe care îl plătești în fiecare lună",
    description:
      "Ebriza afișează €49/lună. Ce plătești de fapt: POS + stoc + KDS + Saga = €107+/lună. Comparație completă Ebriza vs Franchisetech pentru cafenele și restaurante din România.",
    publishedAt: "2026-06-23",
    locale: "ro",
    tags: ["comparatie", "preturi", "ebriza"],
    relatedFeature: "/compare/ebriza",
    sections: [
      {
        heading: "Ce afișează Ebriza și ce plătești de fapt",
        body: "Ebriza are două planuri afișate: Pro la €49/lună și Premium la €99/lună. Problema nu este prețul de bază — este ce nu este inclus în el.\n\nUn restaurant sau cafenea care are nevoie de POS, gestiune stoc, ecran bucătărie (KDS) și export Saga pentru contabil ajunge la un cost real de €107–157/lună pe Ebriza, nu €49.\n\nIată defalcarea:\n\n- **Ebriza Pro** (POS + rapoarte de bază): €49/lună\n- **Stoc + NIR + rețete**: incluse doar din planul Premium, adică +€50/lună față de Pro\n- **Ecran bucătărie (KDS)**: modul separat, +€19/lună\n- **Export Saga pentru contabil**: modul separat, +€39/lună\n\n**Total pentru o cafenea care vrea POS + stoc + KDS + Saga:**\n- Pe Ebriza Pro + add-on-uri: **€107/lună**\n- Pe Ebriza Premium + add-on-uri: **€157/lună**",
      },
      {
        heading: "Ce include Franchisetech Pro la €79/lună",
        body: "Franchisetech Pro costă €79/lună. Ce este inclus fără niciun supliment:\n\n- **POS complet** cu mod offline (funcționează fără internet, sincronizare automată la reconectare)\n- **Gestiune stoc + NIR** (notă de intrare-recepție, actualizare automată la recepție marfă)\n- **Calculator rețete** cu cost per porție și marjă brută per produs\n- **Raport Z zilnic**, raport TVA, raport gestiune\n- **Bon de consum**, Balanță cantitativ-valorică\n- **Export Saga XML** pentru contabil\n- **Ecran bucătărie (KDS)**\n- **Personal nelimitat** — nicio taxă per casier, ospătar sau manager\n\nNu există module separate de plătit pentru funcționalitățile de bază ale unui restaurant sau cafenea din România.",
      },
      {
        heading: "Comparație directă — cost lunar real pentru o cafenea medie",
        body: "Scenariul concret: o cafenea cu 2 casieri, gestiune stoc lunară, export lunar Saga pentru contabil, ecran în bar pentru preparare.\n\n**Ebriza Pro cu add-on-urile necesare:**\n- Ebriza Pro: €49\n- KDS (ecran bucătărie): +€19\n- Export Saga: +€39\n- **Total: €107/lună**\n\n**Franchisetech Pro:**\n- €79/lună — totul inclus\n\n**Diferența: €28/lună = €336/an.** Pe doi ani: €672 în plus pentru aceleași funcționalități.\n\n**Ebriza Premium cu add-on-urile necesare:**\n- Ebriza Premium: €99\n- KDS: +€19\n- Export Saga: +€39\n- **Total: €157/lună**\n\nVersus Franchisetech Pro €79: diferența este €78/lună = **€936/an**.",
      },
      {
        heading: "Ce oferă Ebriza în plus față de Franchisetech",
        body: "Comparația corectă înseamnă să recunoaștem și ce oferă Ebriza în plus.\n\nEbriza are mai multă experiență pe piața din România și o bază de clienți mai mare. Dacă ai nevoie de:\n\n- **Integrare cu platforme de delivery** (Glovo, Bolt Food) direct din POS\n- **Gestiune mese cu ospătari pe tabletă** (comandă la masă, split bill)\n- **Loializare clienți** (carduri de fidelitate, puncte)\n\n...atunci Ebriza sau alte soluții pot fi mai potrivite.\n\nFranchisetech nu are încă gestiunea meselor pentru ospătari, integrare directă cu platformele de delivery sau un modul de loializare.\n\nDacă aceste funcționalități sunt esențiale pentru tine acum, analizează toate opțiunile disponibile. Dacă operezi o cafenea sau un restaurant unde POS-ul, stocul, rețetele și rapoartele pentru contabil sunt prioritatea — prețul Franchisetech include totul fără calcule suplimentare.",
      },
      {
        heading: "Cum testezi înainte să decizi",
        body: "Ambele platforme oferă perioadă de testare gratuită. La Franchisetech: 15 zile trial, configurare gratuită în aplicație, fără card pentru a deschide contul.\n\nTestul corect pe orice platformă POS:\n\n1. Configurează produsele reale (nu demo) cu prețurile tale\n2. Fă câteva vânzări numerar + card\n3. Închide ziua (raport Z) și compară numerarul din sertar cu ce arată sistemul\n4. Înregistrează o recepție de marfă (NIR) de la un furnizor real\n5. Exportă datele pentru contabil și trimite-i fișierul\n\nDacă fluxul tău zilnic funcționează fără probleme în trial — sistemul e potrivit. Dacă dai de blocaje sau ai nevoie de suport pentru pași de bază, ia asta ca semnal.",
      },
    ],
  },
  {
    slug: "cum-alegi-un-soft-pos-pentru-cafenea-mica",
    title: "Cum alegi un soft POS pentru o cafenea mică — fără să plătești în plus pentru ce nu folosești",
    description:
      "Ghid practic pentru alegerea unui sistem POS pentru cafenele mici și mijlocii din România: ce funcționalități contează, ce poți amâna și cât costă real în 2026.",
    publishedAt: "2026-06-23",
    locale: "ro",
    tags: ["pos", "comparatie", "cafenea"],
    relatedFeature: "/features/pos",
    sections: [
      {
        heading: "Ce are nevoie o cafenea mică de la un POS",
        body: "Ghidurile de tip «cum alegi un sistem POS» sunt scrise de obicei pentru restaurante mari cu ospătari, mese numerotate și integrare cu platforme de delivery. Dacă ai o cafenea mică sau un bar cu 2–5 produse principale, nevoile tale sunt diferite.\n\nCe contează cu adevărat pentru o cafenea mică:\n\n- **Viteza la casă** — deschizi aplicația, apeși produs, încasezi. Fără pași inutili\n- **Funcționare offline** — dacă internetul cade, vânzările nu se opresc\n- **Raportul Z zilnic** — știi la final de zi câți bani ar trebui să fie în sertar\n- **Gestiunea stocului de bază** — câtă cafea, lapte și sirop mai ai\n- **Prețul lunar predictibil** — fără surprize la factură din add-on-uri\n\nCe poți amâna sau ignora complet la o cafenea mică: gestiune mese cu ospătari, integrare delivery, loializare, kiosk self-service.",
      },
      {
        heading: "Trei întrebări înainte să alegi",
        body: "**1. Funcționează offline?**\nInternetul cade. Furnizorii de conexiune au probleme. Un sistem POS care se blochează când nu are internet te lasă fără vânzări. Întreabă explicit: ce se întâmplă dacă internetul cade 30 de minute? Se salvează vânzările local? Se sincronizează automat la reconectare?\n\n**2. Cât costă lunar total — cu tot ce-mi trebuie?**\nAfișajul de pe site este deseori prețul de bază. Verifică dacă stocul, exportul pentru contabil și ecranul de preparare sunt incluse sau sunt module separate. Un preț de €49 care devine €107 cu add-on-urile necesare înseamnă €49 marketing, nu €49 produs.\n\n**3. Pot să îl configurez singur în 1–2 ore?**\nDacă ai nevoie de o echipă de implementare pentru a introduce produsele și a deschide prima casă, acesta e un semnal că sistemul e construit pentru restaurante mari, nu pentru tine.",
      },
      {
        heading: "Ce module sunt esențiale vs ce poți adăuga mai târziu",
        body: "**Esențiale de la prima zi:**\n\n- POS cu listare produse și încasare numerar/card\n- Raport Z (închidere zi, reconciliere numerar)\n- NIR — notă de intrare-recepție pentru marfa primită de la furnizori\n- Export date pentru contabil (Saga XML sau CSV)\n\n**Poți adăuga după ce îți intri în ritm:**\n\n- Calculator rețete cu cost per porție (util după 2–4 săptămâni de funcționare)\n- Alerte de stoc minim\n- Ecran bucătărie (KDS) — dacă ai preparare separată\n\n**Poți ignora complet (pentru cafenele mici):**\n\n- Gestiune mese cu ospătari\n- Loializare clienți cu carduri\n- Integrare platforme de delivery",
      },
      {
        heading: "Prețuri reale în 2026 pentru cafenele mici",
        body: "Prețurile afișate public pentru soluțiile uzuale din România:\n\n- **Noxta**: plan gratuit cu funcționalități limitate; planul complet ~€25–30/lună\n- **Franchisetech Core**: €49/lună — POS, raport Z, rapoarte vânzări, personal nelimitat\n- **Franchisetech Operations**: €79/lună — adaugă stoc, rețete, KDS, export Saga\n- **Franchisetech Scale**: €109/lună — tot ce include Operations + suport prioritar, toate modulele viitoare incluse\n- **Ebriza Pro**: €49/lună bază, dar stocul, KDS și Saga sunt add-on-uri separate care duc totalul la €107+/lună\n- **RezoSoft**: ~600 lei taxă instalare + 75 lei/lună; soluție locală, nu cloud\n\nPentru o cafenea mică care vrea stoc + export Saga inclus fără calcule, planul Operations la €79/lună este cel mai predictibil din punct de vedere al costului total lunar.",
      },
      {
        heading: "Cum testezi corect în trial",
        body: "Orice sistem POS îți va părea bun dacă îl testezi cu produse demo și scenarii simple. Testul real:\n\n1. Adaugă produsele tale reale cu prețurile și cotele TVA corecte\n2. Fă 10 vânzări — mix numerar și card\n3. Înregistrează o recepție de marfă (NIR) de la furnizorul tău de cafea\n4. Închide ziua și numără sertarul — compară cu ce arată raportul Z\n5. Exportă datele și trimite-le contabilului tău să confirme că poate importa în Saga\n\nDacă toți cei 5 pași funcționează fără să suni la suport — ai găsit sistemul potrivit.\n\nFranchisetech oferă 15 zile trial gratuit, configurare ghidată în aplicație și fără card pentru a crea contul.",
      },
    ],
  },
  {
    slug: "inchidere-zi-cafenea-cum-faci-corect",
    title: "Închiderea zilei la cafenea — ce trebuie să faci înainte să pleci acasă",
    description:
      "Ghid complet pentru închiderea corectă a zilei la cafenea sau restaurant: raport Z, numărarea sertarului, reconciliere numerar/card și arhivare. Ce se întâmplă dacă sari pași.",
    publishedAt: "2026-06-23",
    locale: "ro",
    tags: ["operatiuni", "inchidere-zi", "raport-z"],
    relatedFeature: "/features/z-report",
    sections: [
      {
        heading: "De ce contează închiderea zilei",
        body: "Majoritatea problemelor contabile dintr-o cafenea sau restaurant nu apar la control fiscal — apar zi de zi, când sertarul nu se potrivește cu ce arată sistemul și nimeni nu știe de ce.\n\nDacă la finalul zilei ai 50 de lei mai puțin decât ar trebui sau 30 de lei în plus, și nu înregistrezi diferența și nu o investighezi, la finalul lunii ai o sumă pe care contabilul nu o poate explica.\n\nÎnchiderea corectă a zilei durează 5–10 minute. Săritul ei creează probleme care durează ore să fie rezolvate ulterior.",
      },
      {
        heading: "Pașii în ordine — de la ultima vânzare la ușa închisă",
        body: "**1. Ultima vânzare înregistrată în sistem**\nNu închizi casa dacă mai ai clienți de servit. Toate vânzările din ziua respectivă trebuie să fie în sistem înainte de a genera raportul Z.\n\n**2. Generezi Raportul Z**\nDin aplicația POS, secțiunea Rapoarte → Raport Z zilnic. Selectezi data de azi. Sistemul calculează totalul vânzărilor, defalcarea pe numerar și card, TVA-ul colectat.\n\n**3. Numeri sertarul**\nNumeri fizic tot numerarul din sertar. Scazi fondul de deschidere (suma cu care ai început ziua). Ce rămâne este numerarul din vânzări.\n\n**4. Compari cu raportul Z**\nRaportul Z îți arată cât numerar ar trebui să fie în vânzări. Dacă numărul din sertar ≠ numărul din sistem — investighezi înainte de a arhiva.\n\n**5. Notezi diferența (dacă există)**\nRest dat greșit, corecție de preț, vânzare anulată — orice explicație trebuie notată. Fără notă, diferența rămâne inexplicabilă la control.\n\n**6. Arhivezi raportul Z**\nSalvezi sau tipărești raportul Z. Unii contabili cer copia fizică, alții acceptă PDF. Franchisetech păstrează toate rapoartele Z pe server — le poți descărca oricând.",
      },
      {
        heading: "Ce se întâmplă dacă sari peste raportul Z",
        body: "Raportul Z nu este opțional dacă operezi o casă de marcat fiscală. ANAF poate solicita la control rapoartele Z pentru orice perioadă.\n\nDacă raportul Z lipsește pentru o zi:\n\n- Nu poți demonstra că vânzările din ziua respectivă au fost înregistrate fiscal\n- Contabilul nu poate justifica veniturile din ziua respectivă\n- La control fiscal, zilele fără raport Z sunt tratate ca zile fără înregistrare fiscală — amendă\n\nDin punct de vedere practic: fără raport Z, numerarul din sertar nu are o origine documentată. Asta e o problemă mai mare decât diferența de 20 de lei pe care voiai să o lași pentru mâine.",
      },
      {
        heading: "Cum se face în Franchisetech",
        body: "La finalul zilei, secțiunea **Rapoarte → Raport Z zilnic**:\n\n1. Selectezi data\n2. Apeși Încarcă — raportul se generează instant din datele sesiunii POS\n3. Verifici: total vânzări, numerar așteptat, card total, TVA\n4. Dai click pe **Descarcă Registru de casă** — documentul legal cu toate mișcările de numerar\n5. Opțional: tipărești sau trimiți PDF contabilului\n\nFranchisetech arhivează automat fiecare raport Z. Dacă contabilul sau inspectorul solicită raportul Z din 14 octombrie — îl găsești în 30 de secunde.",
      },
      {
        heading: "Lista de verificare la final de zi",
        body: "Printează sau salvează această listă și pune-o la casa de marcat:\n\n- [ ] Toate vânzările din ziua de azi sunt înregistrate în sistem\n- [ ] Raportul Z a fost generat pentru data de azi\n- [ ] Sertarul a fost numărat și comparat cu totalul din raportul Z\n- [ ] Diferența (dacă există) a fost notată cu explicație\n- [ ] Registrul de casă a fost descărcat sau tipărit\n- [ ] Numerarul de depus a fost pus la loc sigur\n- [ ] Fondul de deschidere pentru mâine a rămas în sertar\n\nDacă toate cele 7 puncte sunt bifate — poți pleca acasă liniștit.",
      },
    ],
  },
  {
    slug: "cum-stii-cand-sa-reaprovizionezi-stocul-cafenea",
    title: "Cum știi când să reaprovizionezi stocul la cafenea — fără să rămâi fără cafea sau lapte",
    description:
      "Ghid practic pentru gestionarea stocului minim la cafenea: cum calculezi nivelul de reaprovizionare, ce sunt alertele de stoc și cum eviți să rămâi fără ingrediente esențiale.",
    publishedAt: "2026-06-23",
    locale: "ro",
    tags: ["stoc", "aprovizionare", "operatiuni"],
    relatedFeature: "/features/stock-management",
    sections: [
      {
        heading: "Problema reală: afli că ai terminat cafeaua când vine primul client",
        body: "Cel mai comun scenariu în cafenelele fără gestiune de stoc: luni dimineața, primul client comandă un espresso. Tu deschizi cutia de cafea — goală. Ultima pungă a fost folosită vineri seara și nimeni nu a comandat la timp.\n\nSau varianta lapte: livrarea vine miercuri, tu termini stocul joi după-amiaza și încearcă să dai de furnizor vineri la prânz — o zi pierdută fără cappuccino.\n\nAstea nu sunt probleme de organizare — sunt probleme de vizibilitate. Dacă nu știi câtă cafea ai rămas, nu poți comanda la timp.",
      },
      {
        heading: "Cum calculezi stocul minim de reaprovizionare",
        body: "Formula simplă pentru stoc minim:\n\n**Stoc minim = Consum zilnic mediu × Zile până la livrare + Buffer 20%**\n\nExemplu concret:\n- Cafea boabe: consumi în medie 500g/zi\n- Furnizorul livrează în 2 zile de la comandă\n- Stoc minim = 500g × 2 zile × 1.2 (buffer) = **1.200g (1.2 kg)**\n\nCând stocul de cafea scade sub 1.2 kg — trimiți comanda. La livrare, mai ai câteva sute de grame ca rezervă.\n\nPentru lapte:\n- Consum mediu: 3 litri/zi\n- Livrare: 1 zi\n- Stoc minim = 3 × 1 × 1.2 = **3.6 litri**\n\nFă acest calcul pentru fiecare ingredient critic: cafea, lapte, siropuri, pahare.",
      },
      {
        heading: "Alertele de stoc minim — ce sunt și cum le setezi",
        body: "O alertă de stoc minim îți spune automat când un ingredient a scăzut sub nivelul la care trebuie să comanzi. Nu mai verifici manual — sistemul verifică la fiecare vânzare.\n\nCum funcționează:\n\n1. Setezi stocul minim per ingredient (ex: cafea → 1.2 kg)\n2. La fiecare vânzare cu rețetă, sistemul scade cantitățile din stoc\n3. Când stocul de cafea ajunge la 1.2 kg sau mai puțin — apare alerta\n4. Tu trimiți comanda furnizorului — livrarea ajunge înainte să rămâi fără\n\nFără alerte, verificarea manuală a stocului depinde de cine are timp și minte să verifice. Cu alerte, sistemul verifică automat după fiecare vânzare.\n\nÎn Franchisetech, alertele de stoc minim se configurează din **Stoc → Produse → Stoc minim per produs**.",
      },
      {
        heading: "NIR-ul ca instrument de reaprovizionare",
        body: "Când marfa ajunge de la furnizor, înregistrezi o Notă de Intrare-Recepție (NIR). Aceasta nu este doar un document contabil — este momentul în care stocul tău crește în sistem.\n\nFluxul corect:\n\n1. Primești 5 kg de cafea de la furnizor\n2. Înregistrezi NIR-ul în Franchisetech (furnizor, cantitate, preț)\n3. Stocul de cafea crește automat cu 5 kg\n4. Alerta de stoc minim se resetează automat\n\nDacă nu înregistrezi NIR-ul, stocul din sistem rămâne la nivelul vechi — alertele vor fi inexacte, iar rapoartele de gestiune nu vor reflecta realitatea.\n\nNIR-ul corect înregistrat înseamnă că stocul din sistem = stocul din depozit. Asta face ca alertele de reaprovizionare să fie fiabile.",
      },
      {
        heading: "Cum arată asta în Franchisetech",
        body: "Setul complet pentru gestionarea stocului la cafenea:\n\n**Configurare inițială (o singură dată):**\n- Adaugi ingredientele în stoc cu unitățile de măsură (kg, litri, bucăți)\n- Setezi stocul minim per ingredient\n- Configurezi rețetele produselor POS (cappuccino = 7g cafea + 150ml lapte + 1 pahar)\n\n**Operare zilnică:**\n- La fiecare vânzare, cantitățile din rețetă se scad automat din stoc\n- Când un ingredient atinge stocul minim — alerta apare în dashboard\n- La livrarea de la furnizor — înregistrezi NIR-ul, stocul crește automat\n\n**Raportare:**\n- Balanța de stoc arată intrările (NIR-uri), ieșirile (vânzări + consum) și stocul curent\n- Poți vedea câte porții mai poți pregăti cu stocul actual din fiecare ingredient",
      },
    ],
  },
  {
    slug: "cum-calculezi-marja-bruta-produs-restaurant",
    title: "Cum calculezi marja brută pentru un produs din meniu — cu exemple reale",
    description:
      "Formula completă pentru calculul marjei brute în HoReCa, cu exemple reale: flat white, espresso, burger. Ce procent de marjă este normal și cum calculezi automat pentru tot meniul.",
    publishedAt: "2026-06-23",
    locale: "ro",
    tags: ["marja", "retete", "cost-reteta"],
    relatedFeature: "/features/recipe-costing",
    sections: [
      {
        heading: "Ce este marja brută și de ce e diferită de profit",
        body: "Marja brută măsoară cât din prețul de vânzare rămâne după ce scazi costul ingredientelor. Nu include chiria, salariile sau utilitățile — doar materiile prime.\n\n**Formula:**\n- Marjă brută = Preț vânzare − Cost ingrediente\n- Procent marjă = (Marjă brută / Preț vânzare) × 100\n\nDe ce e importantă dacă nu e profitul net? Pentru că marja brută pe ingrediente este singurul număr pe care îl poți controla direct la nivel de produs. Chiria e fixă. Salariile sunt relativ fixe. Dar costul ingredientelor per porție poate fi optimizat produs cu produs.\n\nUn produs cu marjă brută de 30% e un produs care contribuie puțin la acoperirea costurilor fixe. Un produs cu marjă brută de 80% contribuie mult. Dacă nu știi care e care — vinzi fără să știi ce îți aduce bani.",
      },
      {
        heading: "Exemplu complet: flat white la cafenea",
        body: "Rețetă flat white standard (250ml):\n\n- Cafea boabe 18g → 18g × 48 RON/kg = **0.86 RON**\n- Lapte 160ml → 160ml × 7.5 RON/litru = **1.20 RON**\n- Pahar de unică folosință + capac: **0.18 RON**\n\n**Cost total ingrediente: 2.24 RON**\n\nPreț de vânzare obișnuit în cafenelele din București/Cluj: **15–18 RON**\n\nLa prețul de 15 RON:\n- Marjă brută: 15 − 2.24 = **12.76 RON**\n- Procent marjă: 12.76 / 15 × 100 = **85.1%**\n\nLa prețul de 18 RON:\n- Procent marjă: (18 − 2.24) / 18 × 100 = **87.6%**\n\nAsta înseamnă că din fiecare flat white vândut la 15 RON, 12.76 RON rămân pentru a acoperi chiria, salariile și utilitățile — și eventual profit.",
      },
      {
        heading: "Exemplu: burger la restaurant",
        body: "Rețetă burger clasic (chifla + carne + topping):\n\n- Chifla brioche: **1.80 RON**\n- Carne tocată 150g → 150g × 40 RON/kg: **6.00 RON**\n- Salată, roșii, ceapă: **0.90 RON**\n- Sos special 30g: **0.60 RON**\n- Cartofi prăjiți 150g → 150g × 8 RON/kg: **1.20 RON**\n\n**Cost total ingrediente: 10.50 RON**\n\nPreț de vânzare: **38 RON**\n\n- Marjă brută: 38 − 10.50 = **27.50 RON**\n- Procent marjă: 27.50 / 38 × 100 = **72.4%**\n\nComparând: burgerul la 72.4% marjă brută contribuie mai puțin per RON vândut decât flat white-ul la 85.1%. Dar dacă burgerul costă 38 RON și flat white-ul 15 RON, valoarea absolută a marjei brute per tranzacție este mai mare la burger (27.50 RON vs 12.76 RON).\n\nAmbii indicatori contează — procent și valoare absolută.",
      },
      {
        heading: "De ce marja brută 85% pe cafea nu înseamnă că ești profitabil",
        body: "Asta e greșeala clasică: proprietarul vede 85% marjă pe cafea și crede că afacerea merge bine. Dar marja brută acoperă doar ingredientele.\n\nCe mai trebuie acoperit din acei 12.76 RON per flat white:\n\n- **Chirie**: dacă plătești 3.000 EUR/lună și vinzi 1.500 cafele pe lună → 2 EUR (≈10 RON) per cafea\n- **Salarii**: dacă ai 2 baristi cu salariu net 3.500 RON fiecare și vinzi 1.500 cafele → ≈4.67 RON per cafea\n- **Utilități, consumabile, echipamente**: 1–2 RON per cafea\n\nTotal costuri fixe per cafea: ≈15–17 RON. Marja brută per cafea: 12.76 RON.\n\n**La acest volum și la aceste costuri fixe, fiecare flat white vândut la 15 RON generează pierdere.**\n\nSoluții: crești prețul, crești volumul, reduci costurile fixe — sau combini toate trei. Dar fără marja brută calculată corect, nu știi nici de unde să începi.",
      },
      {
        heading: "Cum calculezi automat pentru toate produsele din meniu",
        body: "Calculul manual este util pentru înțelegere, dar devine imposibil de menținut când meniul are 30–50 de produse și prețurile ingredientelor se schimbă lunar.\n\nÎn Franchisetech, calculul marjei brute este automat:\n\n1. **Configurezi rețetele** — pentru fiecare produs POS, adaugi ingredientele și cantitățile per porție\n2. **Prețurile vin din NIR** — de fiecare dată când înregistrezi o recepție de marfă cu prețul nou, costul rețetelor se actualizează automat\n3. **Lista de rețete afișează per produs**: preț vânzare, cost porție, marjă brută în RON, procent marjă\n4. **Produsele cu marjă negativă** (costul depășește prețul de vânzare) apar marcate — nu le poți scăpa din vedere\n\nCând furnizorul de lapte îți mărește prețul cu 10%, nu mai calculezi manual pentru fiecare produs care conține lapte. Actualizezi prețul în NIR și toate rețetele se recalculează automat.",
      },
    ],
  },
];
