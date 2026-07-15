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
        body: "Un raport Z complet include:\n\n- **Total tranzacții** — numărul de vânzări din ziua respectivă\n- **Vânzări nete** — valoarea totală fără reduceri sau anulări\n- **Defalcare pe metode de plată** — numerar, card, online separat\n- **TVA colectat** — defalcat pe cote (21%, 11%, 5%, 0%)\n- **Vânzări brute** — totalul inclusiv TVA\n- **Numerar așteptat vs. numărat** — diferența față de fondul de deschidere plus încasări cash\n\nÎn franchisetech, aceste câmpuri sunt calculate automat din sesiunea POS. Nu introduci nimic manual — sistemul agregă fiecare tranzacție înregistrată în ziua respectivă.",
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
        body: "Ambele platforme oferă perioadă de testare gratuită. La Franchisetech: 15 zile trial, configurare gratuită în aplicație, cu o verificare de card de 1 € la început.\n\nTestul corect pe orice platformă POS:\n\n1. Configurează produsele reale (nu demo) cu prețurile tale\n2. Fă câteva vânzări numerar + card\n3. Închide ziua (raport Z) și compară numerarul din sertar cu ce arată sistemul\n4. Înregistrează o recepție de marfă (NIR) de la un furnizor real\n5. Exportă datele pentru contabil și trimite-i fișierul\n\nDacă fluxul tău zilnic funcționează fără probleme în trial — sistemul e potrivit. Dacă dai de blocaje sau ai nevoie de suport pentru pași de bază, ia asta ca semnal.",
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
        body: "Orice sistem POS îți va părea bun dacă îl testezi cu produse demo și scenarii simple. Testul real:\n\n1. Adaugă produsele tale reale cu prețurile și cotele TVA corecte\n2. Fă 10 vânzări — mix numerar și card\n3. Înregistrează o recepție de marfă (NIR) de la furnizorul tău de cafea\n4. Închide ziua și numără sertarul — compară cu ce arată raportul Z\n5. Exportă datele și trimite-le contabilului tău să confirme că poate importa în Saga\n\nDacă toți cei 5 pași funcționează fără să suni la suport — ai găsit sistemul potrivit.\n\nFranchisetech oferă 15 zile trial, configurare ghidată în aplicație și o verificare de card de 1 € la crearea contului.",
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
  {
    slug: "reguli-casa-de-marcat-electronica-restaurant",
    title: "Reguli pentru casa de marcat electronică la restaurant — ce spune legea în 2026",
    description:
      "Ce presupune legal casa de marcat electronică fiscală la restaurant sau cafenea: cine e obligat, conectarea la ANAF, bonul fiscal cu cod QR și riscurile dacă nu respecți regulile.",
    publishedAt: "2026-06-05",
    locale: "ro",
    tags: ["fiscal","casa-de-marcat","conformitate"],
    image: "/marketing/hero-casa-marcat.jpg",
    relatedFeature: "/features/qr-code-receipts",
    sections: [
      {
        heading: "Cine este obligat să aibă casă de marcat electronică",
        body: "Orice comerciant care încasează bani direct de la persoane fizice — cash, card sau alt instrument de plată electronică — trebuie să emită bon fiscal printr-un aparat de marcat electronic fiscal (AMEF) omologat. Restaurant, cafenea, fast-food, food truck, tonetă de cofetărie — toate intră sub aceeași obligație, indiferent de forma juridică (SRL, PFA, întreprindere individuală).\n\nBaza legală este OUG 28/1999, republicată, cu modificările ulterioare — legea care reglementează casele de marcat electronice fiscale în România. Excepțiile sunt limitate și se aplică unor categorii specifice de activități, nu comerțului cu amănuntul de alimente și băuturi. Dacă vinzi mâncare sau băutură unui client la fața locului sau la livrare, AMEF-ul este obligatoriu.",
      },
      {
        heading: "Ce înseamnă conectarea la serverele ANAF",
        body: "AMEF-urile moderne (obligatorii de câțiva ani pentru toți operatorii) trebuie conectate la internet și transmit automat datele fiscale către serverele ANAF, la intervale stabilite prin lege. Fiecare bon emis, fiecare raport Z, ajunge în evidența ANAF fără intervenția ta.\n\nDacă legătura la internet cade, aparatul continuă să funcționeze și să emită bonuri — datele se transmit când conexiunea revine. Ce nu este permis este dezactivarea deliberată a componentei de conectare sau folosirea unui aparat nefiscalizat ori neomologat pentru a evita raportarea. Asta e tratat ca abatere gravă, nu ca incident tehnic.",
      },
      {
        heading: "Ce trebuie să conțină bonul fiscal",
        body: "Un bon fiscal emis corect include:\n\n- Denumirea și CUI-ul comerciantului\n- Data și ora emiterii\n- Denumirea fiecărui produs vândut\n- Cota de TVA aplicată fiecărui produs (21%, 11%, 5% sau 0%, după caz)\n- Totalul pe fiecare cotă de TVA și totalul general\n- Numărul de ordine al bonului\n- Cod QR, obligatoriu pe toate bonurile emise de AMEF-urile actuale\n\nCodul QR permite verificarea bonului direct de către client sau de către un inspector, prin scanare — conține datele esențiale ale tranzacției într-un format care poate fi validat electronic.",
      },
      {
        heading: "Ce riști dacă nu respecți regulile",
        body: "Neemiterea bonului fiscal, folosirea unui aparat neomologat, dezactivarea conexiunii la ANAF sau manipularea datelor fiscale sunt abateri contravenționale care se sancționează cu amenzi. Valoarea exactă depinde de tipul abaterii, de recidivă și de încadrarea faptei — informează-te la zi pe portalul ANAF sau cu contabilul tău pentru cuantumul actual.\n\nLa abateri repetate sau grave, pe lângă amendă, autoritatea poate dispune suspendarea temporară a activității la punctul de lucru respectiv. Pentru o cafenea sau un restaurant, câteva zile de suspendare valorează de multe ori mai mult decât amenda în sine.",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "POS-ul franchisetech se integrează cu aparatul tău de marcat electronic fiscal: la fiecare vânzare încheiată la casă, comanda este trimisă către AMEF, care emite bonul fiscal cu cod QR și transmite datele conform cerințelor legale. Nu introduci nimic manual în aparatul fiscal — produsele, prețurile și cotele de TVA vin direct din configurarea din POS.\n\nDacă apare o problemă de conexiune la AMEF, vânzarea tot se înregistrează în sistem, ca să nu pierzi evidența ei — dar emiterea fizică a bonului fiscal depinde de funcționarea aparatului fiscal însuși, nu de aplicația POS. Cele două rămân sisteme distincte, așa cum cere legea.",
      },
    ],
  },
  {
    slug: "amenzi-control-fiscal-horeca-cele-mai-frecvente",
    title: "Cele mai frecvente amenzi la control fiscal în HoReCa și cum le eviți",
    description:
      "Cele mai frecvente abateri găsite la controalele fiscale în cafenele și restaurante — bon neemis, stoc neconciliat, sertar neexplicat — și cum le previi înainte să ajungă amendă.",
    publishedAt: "2026-06-05",
    locale: "ro",
    tags: ["fiscal","control-anaf","amenzi"],
    image: "/marketing/hero-casa-marcat.jpg",
    relatedFeature: "/features/accountant-reports",
    sections: [
      {
        heading: "Neemiterea bonului fiscal",
        body: "Cea mai frecventă abatere găsită la control în HoReCa. Apare de obicei la vânzări rapide, cash, «pe repede» — un cappuccino la plecare, o comandă dată «pe gratis» unui prieten, un produs oferit fără să treacă prin casă. Fiecare astfel de tranzacție neînregistrată este, din perspectiva inspectorului, o vânzare fără bon fiscal.\n\nProblema nu e doar amenda pentru bonul lipsă — e că, dacă inspectorul găsește un tipar (mai multe astfel de cazuri), poate extinde verificarea pe o perioadă mai lungă, presupunând că fenomenul se repetă.",
      },
      {
        heading: "Afișajul de prețuri diferit de ce se încasează la casă",
        body: "Meniul afișat clienților trebuie să corespundă exact cu prețurile din sistemul de casă. Dacă ai scumpit un produs și ai actualizat POS-ul dar nu și meniul tipărit (sau invers), inspectorul poate constata neconcordanța chiar dacă TVA-ul e calculat corect.\n\nAsta e o greșeală ușor de evitat administrativ, dar frecventă la afacerile care schimbă prețurile des fără un proces clar: cine actualizează meniul, cine actualizează POS-ul, și în ce ordine.",
      },
      {
        heading: "Discrepanțe între stoc și vânzările înregistrate",
        body: "Dacă gestiunea de stoc nu reflectă realitatea — NIR-uri emise cu întârziere sau deloc, bonuri de consum incomplete, inventar fizic care nu se potrivește cu ce arată sistemul — inspectorul nu poate verifica dacă tot ce a intrat în gestiune a fost fie vândut, fie consumat documentat.\n\nCele mai frecvente cauze: marfă primită de la furnizor și pusă direct la vânzare fără NIR, sau consum de ingrediente pentru rețete care nu se scade automat din stoc pentru că rețetele nu sunt configurate corect.",
      },
      {
        heading: "Diferență de numerar nejustificată în sertar",
        body: "Dacă la închiderea zilei numerarul din sertar nu se potrivește cu ce arată Raportul Z și nu există o notă explicativă (rest dat greșit, corecție de preț, anulare), diferența rămâne fără justificare documentată.\n\nO diferență izolată de câțiva lei rareori atrage atenția. Dar diferențe recurente, nedocumentate, pe perioade lungi, sunt exact tiparul pe care un control fiscal îl caută — pentru că sugerează vânzări care nu ajung integral în evidența fiscală.",
      },
      {
        heading: "Cum eviți majoritatea acestor amenzi",
        body: "Toate cele patru abateri de mai sus au o rădăcină comună: date incomplete sau inconsistente între ce se întâmplă fizic în locație și ce apare în sistem. Un flux simplu reduce riscul semnificativ:\n\n- Fiecare vânzare trece prin POS, fără excepții «doar de data asta»\n- Fiecare marfă primită are NIR emis în aceeași zi\n- Raportul Z se generează zilnic și diferențele de numerar se notează imediat\n- Prețurile se actualizează simultan în meniu și în POS\n\nÎn franchisetech, rapoartele Z, NIR-urile și exporturile pentru contabil se păstrează automat pe server — dacă un inspector cere documentele unei perioade, le găsești în câteva secunde, nu le reconstitui din memorie.",
      },
    ],
  },
  {
    slug: "bon-fiscal-obligatoriu-cand-si-cum",
    title: "Când ești obligat să emiți bon fiscal și ce se întâmplă dacă nu o faci",
    description:
      "Bonul fiscal e obligatoriu la orice încasare de la o persoană fizică, indiferent de sumă sau metoda de plată. Iată exact când se aplică regula și ce riști dacă sari peste ea.",
    publishedAt: "2026-06-05",
    locale: "ro",
    tags: ["fiscal","bon-fiscal","conformitate"],
    image: "/marketing/reports-zreport.png",
    relatedFeature: "/features/qr-code-receipts",
    sections: [
      {
        heading: "Regula de bază: orice încasare de la o persoană fizică",
        body: "Dacă încasezi bani — cash, card, transfer instant, orice metodă — de la o persoană fizică pentru un produs sau serviciu, ești obligat să emiți bon fiscal prin AMEF. Nu contează suma: un espresso de 8 lei intră sub aceeași regulă ca o notă de plată de 300 de lei pentru o masă de familie.\n\nNu contează nici forma de plată. Card, cash, plată prin aplicație — toate trec prin casa de marcat și generează bon fiscal, nu doar încasările în numerar.",
      },
      {
        heading: "Bonul trebuie oferit, nu doar emis la cerere",
        body: "Obligația comerciantului este să emită bonul și să îl pună la dispoziția clientului în momentul plății — nu să aștepte ca acesta să îl ceară. Clientul poate alege să nu îl ia (mulți lasă bonul pe masă la plecare), dar tu tot trebuie să îl fi emis și oferit.\n\nDin perspectiva unui control, diferența contează: un bon emis și refuzat de client este conform. O vânzare fără bon emis deloc nu este.",
      },
      {
        heading: "Cazuri unde apar confuzii — delivery și comenzi telefonice",
        body: "La livrare (delivery) sau la o comandă telefonică plătită în momentul livrării, obligația rămâne aceeași: bonul fiscal trebuie emis la momentul încasării, indiferent unde are loc fizic tranzacția.\n\nÎn practică, multe afaceri mici greșesc aici — încasează la livrare, notează comanda într-un caiet sau într-un grup de WhatsApp, și emit bonul fiscal (dacă îl emit) abia a doua zi, agregat. Asta nu respectă momentul legal de emitere și creează exact tipul de neconcordanță pe care un inspector îl caută.",
      },
      {
        heading: "Ce riști dacă nu emiți bonul fiscal",
        body: "Neemiterea bonului fiscal este o abatere contravențională, sancționată cu amendă — cuantumul depinde de încadrarea faptei și de eventuala recidivă, așa că verifică valoarea actualizată cu contabilul tău sau pe portalul ANAF.\n\nLa recidivă sau la constatarea unui tipar (mai multe vânzări fără bon, nu un incident izolat), riscul crește dincolo de amendă — poate ajunge la suspendarea temporară a activității punctului de lucru.",
      },
      {
        heading: "Cum te asiguri că nu ratezi niciun bon",
        body: "Cea mai sigură metodă de a nu rata bonuri fiscale este să elimini pasul manual din proces. În franchisetech, fiecare vânzare finalizată în POS trimite automat comanda către AMEF, care emite bonul fiscal la momentul plății — nu există un pas separat de «nu uita să bagi vânzarea în casă».\n\nAsta contează mai ales la ore de vârf, când personalul lucrează rapid și riscul de a sări un pas manual crește. Dacă bonul se emite automat odată cu finalizarea plății în POS, nu mai depinde de memoria casierului.",
      },
    ],
  },
  {
    slug: "factura-vs-bon-fiscal-diferenta",
    title: "Factură vs. bon fiscal — care e diferența și când ai nevoie de fiecare",
    description:
      "Bonul fiscal și factura nu sunt interschimbabile. Iată ce document ai nevoie pentru clienți persoane fizice, ce ceri pentru clienți companii și cum le gestionezi corect în POS.",
    publishedAt: "2026-06-06",
    locale: "ro",
    tags: ["fiscal","factura","bon-fiscal"],
    image: "/marketing/dashboard-hero.png",
    relatedFeature: "/features/qr-code-receipts",
    sections: [
      {
        heading: "Bonul fiscal — documentul standard pentru consumatorul final",
        body: "Bonul fiscal se emite automat prin AMEF la fiecare vânzare către o persoană fizică. Nu necesită nicio identificare a cumpărătorului — nume, adresă sau CUI nu apar pe bon, pentru că bonul fiscal e documentul standard pentru consumul obișnuit, nu pentru relații comerciale între firme.\n\nPentru marea majoritate a vânzărilor dintr-o cafenea sau un restaurant — clienți care vin, comandă și plătesc — bonul fiscal este singurul document necesar.",
      },
      {
        heading: "Factura — documentul cu identificare completă a cumpărătorului",
        body: "Factura conține datele complete ale cumpărătorului: denumire, CUI sau CNP, adresă. Este documentul de care are nevoie o companie pentru a înregistra cheltuiala în contabilitate și, unde e cazul, pentru a deduce TVA-ul aferent.\n\nExemplu tipic în HoReCa: o firmă care organizează un eveniment sau o masă de afaceri la restaurantul tău și are nevoie de factură pentru a justifica cheltuiala, nu doar de bonul fiscal.",
      },
      {
        heading: "Cum ceri sau emiți o factură pe baza unui bon fiscal",
        body: "Dacă un client comunică CUI-ul firmei în momentul plății, casierul poate introduce acel CUI la casa de marcat, iar bonul fiscal este emis cu CUI-ul cumpărătorului înscris pe el. Acel bon, cu CUI-ul inclus, poate sta apoi la baza emiterii facturii.\n\nDacă CUI-ul nu a fost comunicat la momentul plății, procedura de a obține ulterior o factură pe baza unui bon fiscal simplu (fără CUI) este mai greoaie și depinde de politica internă și de termenele aplicabile — cel mai simplu e să ceri clientului CUI-ul înainte de a finaliza plata, nu după.",
      },
      {
        heading: "De ce contează diferența pentru contabilitate",
        body: "Bonurile fiscale alimentează Raportul Z — venitul agregat al zilei, defalcat pe metode de plată și cote de TVA. Facturile sunt documente individuale, fiecare cu propriul cumpărător identificat, folosite pentru relații B2B.\n\nContabilul tău are nevoie de ambele fluxuri, dar separat: veniturile din bonuri fiscale (retail, consum obișnuit) și veniturile din facturi (clienți companie) nu se amestecă în aceeași evidență, chiar dacă banii ajung în același sertar sau cont.",
      },
      {
        heading: "Cum gestionezi ambele în franchisetech",
        body: "POS-ul emite bon fiscal automat la fiecare vânzare finalizată. Când un client cere factură și comunică CUI-ul înainte de plată, îl introduci în POS — bonul fiscal iese cu CUI-ul înscris, iar vânzarea rămâne marcată distinct în sistem.\n\nLa exportul pentru contabil, vânzările cu CUI asociat sunt separate de vânzările simple cu bon fiscal, ca să nu fie nevoie de triaj manual la finalul lunii.",
      },
    ],
  },
  {
    slug: "arhivare-electronica-documente-fiscale-horeca",
    title: "Arhivarea electronică a documentelor fiscale — ce cere legea și cât timp le păstrezi",
    description:
      "Ce documente fiscale trebuie păstrate, pentru cât timp și ce condiții trebuie să îndeplinească arhivarea electronică pentru a fi acceptată la un control ANAF.",
    publishedAt: "2026-06-06",
    locale: "ro",
    tags: ["fiscal","arhivare","contabilitate"],
    image: "/marketing/reports-zreport.png",
    relatedFeature: "/features/accountant-reports",
    sections: [
      {
        heading: "Ce documente fiscale trebuie arhivate",
        body: "Într-o cafenea sau un restaurant, arhiva fiscală și contabilă include cel puțin:\n\n- Rapoartele Z zilnice\n- Jurnalul electronic al aparatului de marcat fiscal\n- NIR-urile (notele de intrare-recepție) pentru marfa primită\n- Bonurile de consum pentru materiile prime\n- Facturile emise și primite\n- Registrul de casă\n\nFiecare dintre acestea poate fi cerut separat la un control, iar lipsa unuia dintre ele — chiar dacă restul sunt în regulă — creează o gaură pe care inspectorul o va observa.",
      },
      {
        heading: "Cât timp trebuie păstrate documentele",
        body: "Regula generală din legislația contabilă românească este păstrarea documentelor justificative financiar-contabile pentru o perioadă de 10 ani. Anumite documente, cum sunt statele de plată a salariilor, au termene de păstrare mai lungi.\n\nTermenele exacte pot varia pe tip de document și se pot modifica prin acte normative ulterioare — verifică întotdeauna cu contabilul tău termenul aplicabil documentului specific înainte să arunci sau să ștergi orice.",
      },
      {
        heading: "Arhivare electronică vs. fizică — ce acceptă un inspector",
        body: "Arhiva electronică este acceptată în locul celei fizice atâta timp cât documentele rămân lizibile, nealterate și pot fi prezentate la cerere în formatul solicitat. Un fișier PDF generat automat dintr-un sistem care păstrează data emiterii și conținutul original are, în practică, mai multă credibilitate decât o hârtie care s-a decolorat sau s-a pierdut.\n\nCe nu se acceptă: documente reconstituite ulterior, fără dată certă de emitere, sau arhive incomplete unde lipsesc zile sau perioade fără explicație.",
      },
      {
        heading: "Riscul arhivei incomplete",
        body: "Dacă la un control lipsește raportul Z pentru o anumită zi, sau un NIR pentru o livrare de marfă, inspectorul tratează golul ca pe o lipsă de justificare — nu ca pe o eroare administrativă minoră. Ziua respectivă poate fi tratată ca zi fără evidență fiscală corectă, chiar dacă în realitate documentul doar s-a pierdut sau nu a fost salvat corect.\n\nCu cât arhiva e ținută manual (foi tipărite, foldere pe calculator, mailuri), cu atât crește riscul ca ceva să lipsească exact când ai nevoie de el.",
      },
      {
        heading: "Cum te ajută arhivarea automată",
        body: "În franchisetech, rapoartele Z, NIR-urile și exporturile pentru contabil se salvează automat pe server, fără să depindă de cineva care își amintește să le tipărească sau să le salveze într-un folder. Dacă un contabil sau un inspector cere documentele dintr-o anumită perioadă, le descarci în câteva secunde din secțiunea Rapoarte.\n\nAsta nu elimină responsabilitatea de a înregistra corect fiecare vânzare și fiecare recepție de marfă zi de zi — dar elimină riscul ca un document corect emis să se piardă din motive administrative.",
      },
    ],
  },
  {
    slug: "cum-te-pregatesti-pentru-control-anaf",
    title: "Cum te pregătești pentru un control ANAF la cafenea sau restaurant",
    description:
      "Ghid practic pentru pregătirea unui control fiscal la cafenea sau restaurant: ce documente ți se cer primele, ce verifică inspectorii la fața locului și cum eviți greșelile frecvente.",
    publishedAt: "2026-06-07",
    locale: "ro",
    tags: ["fiscal","control-anaf"],
    image: "/marketing/hero-casa-marcat.jpg",
    relatedFeature: "/features/accountant-reports",
    sections: [
      {
        heading: "Ce declanșează de obicei un control",
        body: "Controalele pot porni dintr-o sesizare, dintr-o verificare tematică pe zonă sau sector de activitate, sau din discrepanțe observate în declarațiile depuse. Multe controale la HoReCa sunt inopinate — vin fără preaviz, exact în timpul programului, când ai clienți la mese.\n\nAsta înseamnă că «mă pregătesc când aflu că vine controlul» nu funcționează. Pregătirea trebuie să fie o stare permanentă a evidenței tale, nu un sprint de o săptămână.",
      },
      {
        heading: "Documentele pe care inspectorul le cere primele",
        body: "La un control tipic la o cafenea sau un restaurant, primele documente cerute sunt de obicei:\n\n- Rapoartele Z pentru perioada verificată\n- Registrul de casă\n- NIR-urile pentru marfa primită recent\n- Facturile de la furnizori\n- Certificatul de garanție și fișa aparatului de marcat fiscal\n- Meniul afișat, cu prețurile curente\n\nDacă toate acestea sunt organizate și accesibile rapid, controlul decurge mult mai repede și cu mai puține întrebări suplimentare.",
      },
      {
        heading: "Ce verifică efectiv la fața locului",
        body: "Pe lângă documente, inspectorii verifică practic funcționarea zilnică: pot cere emiterea unui bon fiscal pe loc pentru a confirma că aparatul funcționează și transmite corect, pot compara prețurile de pe meniu cu ce apare la casă, și pot verifica dacă stocul fizic din bucătărie sau bar corespunde cu ce arată gestiunea.\n\nDe multe ori, verificarea de fond nu e complicată — e o comparație simplă între ce spui că se întâmplă (documente) și ce se întâmplă efectiv (observație directă).",
      },
      {
        heading: "Greșeli frecvente găsite la afaceri mici",
        body: "La cafenele și restaurante mici, cele mai frecvente probleme găsite la control sunt operaționale, nu de rea-credință:\n\n- Sertarul nu a fost niciodată conciliat sistematic cu raportul Z\n- NIR-urile se fac cu întârziere, uneori săptămânal în loc de zilnic\n- Meniul tipărit nu a fost actualizat după ultima schimbare de preț\n- Bonuri de consum lipsă pentru rețetele preparate\n\nNiciuna dintre acestea nu e o fraudă intenționată, dar toate generează constatări la control — pentru că inspectorul nu poate distinge «greșeală de organizare» de «neglijență intenționată» doar din ce vede pe hârtie.",
      },
      {
        heading: "Lista de verificare înainte de control",
        body: "- Rapoartele Z sunt generate zilnic, fără goluri, și arhivate\n- Registrul de casă e la zi și diferențele de numerar sunt notate\n- Toate NIR-urile pentru marfa primită sunt emise, nu în ciornă\n- Meniul afișat corespunde exact cu prețurile din POS\n- Facturile de la furnizori sunt organizate și accesibile\n- Personalul știe unde sunt documentele și cum se generează un raport la cerere\n\nDacă poți bifa toate punctele de mai sus în orice moment, nu doar înainte de un control anunțat, ești pregătit.",
      },
    ],
  },
  {
    slug: "tva-livrare-delivery-vs-consum-local",
    title: "TVA la livrare (delivery) vs. consum local — ce cotă aplici",
    description:
      "Aceeași mâncare poate avea tratament TVA diferit după canal — consum la masă vs livrare. Iată logica din spatele distincției și de ce configurarea greșită în POS costă la control.",
    publishedAt: "2026-06-07",
    locale: "ro",
    tags: ["tva","fiscal","delivery"],
    image: "/marketing/reports-sales.png",
    relatedFeature: "/features/z-report",
    sections: [
      {
        heading: "Diferența fiscală dintre serviciul de restaurant și livrarea de produse",
        body: "Servirea mâncării la masă — preparare plus servire, cu tot ce ține de experiența de consum pe loc — este tratată fiscal ca serviciu de restaurant sau catering, care beneficiază de regulă de cota redusă de TVA în HoReCa. Livrarea unui produs alimentar fără componenta de servire poate fi tratată diferit, ca livrare de bunuri, iar regimul aplicabil depinde de tipul concret de produs.\n\nAsta înseamnă că nu poți presupune automat că «tot ce vinde restaurantul meu are aceeași cotă de TVA, indiferent de canal». Distincția între serviciu (consum pe loc) și livrare de bunuri (delivery, take-away simplu) poate schimba tratamentul fiscal.",
      },
      {
        heading: "De ce contează pentru cafenele și restaurante cu delivery",
        body: "Dacă vinzi același produs — o pizza, un meniu de prânz — atât la masă, cât și prin delivery, cota de TVA aplicabilă poate fi diferită între cele două canale, în funcție de cum este încadrat fiecare din punct de vedere fiscal. Dacă în POS ai configurat o singură cotă pentru produsul respectiv, indiferent de canal, riști fie să încasezi TVA greșit, fie să declari greșit către ANAF.\n\nAcest tip de eroare e greu de observat zilnic — vânzările par normale, sertarul se potrivește — dar apare clar la o verificare a modului de calcul al TVA-ului pe categorii de produse și canale.",
      },
      {
        heading: "Băuturile alcoolice — regim separat",
        body: "Băuturile alcoolice sunt, de regulă, taxate la cota standard de TVA, indiferent de canalul de vânzare — la masă sau la livrare. Nu beneficiază de cota redusă aplicabilă serviciilor de restaurant pentru alimente.\n\nDacă vinzi bere, vin sau alte băuturi alcoolice atât la consum local cât și pentru livrare, verifică explicit cu contabilul tău că aceste produse au cota standard configurată corect în sistem, separat de restul meniului.",
      },
      {
        heading: "Ce trebuie să verifici cu contabilul tău",
        body: "Nu configura cotele de TVA per produs «din auzite» sau prin analogie cu ce face un alt local. Cere contabilului o confirmare explicită, pe categorii, pentru:\n\n- Mâncare gătită, consumată la masă\n- Mâncare gătită, livrată (delivery/take-away)\n- Băuturi nealcoolice\n- Băuturi alcoolice\n- Produse de patiserie sau cofetărie ambalate, vândute la pachet\n\nAceste încadrări pot să difere de la o categorie de produs la alta și se pot modifica prin acte normative — o verificare făcută acum doi ani nu mai e neapărat validă azi.",
      },
      {
        heading: "Cum configurezi corect canalele în franchisetech",
        body: "POS-ul franchisetech permite setarea cotei de TVA la nivel de produs, iar dacă un produs are tratament diferit pe canal (masă vs. delivery), poți configura variante sau categorii separate astfel încât fiecare vânzare să calculeze cota corectă automat, fără decizie manuală a casierului în momentul vânzării.\n\nRaportul Z arată apoi TVA-ul colectat defalcat pe fiecare cotă, ceea ce îți dă (și contabilului tău) vizibilitate directă dacă ceva pare configurat greșit, înainte să devină o problemă la control.",
      },
    ],
  },
  {
    slug: "cote-tva-diferite-acelasi-bon-cum-se-calculeaza",
    title: "Cum se calculează bonul fiscal când produsele au cote TVA diferite",
    description:
      "Un singur bon fiscal poate avea produse cu cote TVA diferite. Iată cum se calculează corect fiecare linie, cu un exemplu numeric complet pentru trei cote diferite.",
    publishedAt: "2026-06-07",
    locale: "ro",
    tags: ["tva","fiscal","pos"],
    image: "/marketing/reports-zreport.png",
    relatedFeature: "/features/pos",
    sections: [
      {
        heading: "De ce un singur bon poate avea mai multe cote de TVA",
        body: "Un bon obișnuit la o cafenea poate conține, de exemplu, o cafea, o apă îmbuteliată și o bere — trei produse care pot avea încadrări de TVA diferite. Fiecare produs își păstrează propria cotă, configurată individual în sistem. Nu se aplică o cotă «medie» sau o cotă unică pentru tot bonul.\n\nAsta e diferit de cum gândește instinctiv multă lume — «bonul are TVA de X%» — realitatea e că bonul are mai multe totaluri de TVA, câte unul pentru fiecare cotă prezentă pe el.",
      },
      {
        heading: "Cum se calculează practic, linie cu linie",
        body: "Dacă prețul afișat pentru un produs include deja TVA (cum e normal la vânzarea către consumatori finali), TVA-ul aferent acelei linii se extrage din preț cu formula:\n\nTVA = Preț cu TVA × Cotă / (100 + Cotă)\n\nBaza impozabilă a liniei este diferența: Preț cu TVA − TVA.\n\nBonul fiscal totalizează separat baza și TVA-ul pentru fiecare cotă întâlnită pe bon (21%, 11%, 5%, 0%), apoi le adună pentru totalul general de plată. Casa de marcat face acest calcul automat pe fiecare linie, în funcție de cota configurată pentru produsul respectiv.",
      },
      {
        heading: "Exemplu concret cu trei cote diferite",
        body: "Un bon cu trei produse, fiecare la o cotă diferită de TVA:\n\n- Produs A, cotă standard 21%: preț 20,00 lei → bază 16,53 lei, TVA 3,47 lei\n- Produs B, cotă redusă 11%: preț 15,00 lei → bază 13,51 lei, TVA 1,49 lei\n- Produs C, cotă redusă 5%: preț 10,00 lei → bază 9,52 lei, TVA 0,48 lei\n\n**Total bon: 45,00 lei** — din care bază impozabilă totală 39,56 lei și TVA total colectat 5,44 lei.\n\nFiecare cotă rămâne vizibilă separat pe bon, nu doar suma finală.",
      },
      {
        heading: "Ce trebuie să apară pe bonul fiscal tipărit",
        body: "Un bon corect nu arată doar totalul general de plată. Trebuie să afișeze defalcarea pe fiecare cotă de TVA prezentă pe bon: totalul pe cota standard, totalul pe fiecare cotă redusă folosită, și totalul pentru produsele scutite (cota 0%), dacă e cazul.\n\nAceastă defalcare e ceea ce alimentează, la finalul zilei, secțiunea de TVA din Raportul Z — și, ulterior, declarațiile fiscale lunare sau trimestriale.",
      },
      {
        heading: "Riscul cotei greșite setate per produs",
        body: "Dacă un produs are cota de TVA setată greșit în sistem — de exemplu o băutură alcoolică configurată din greșeală cu cota redusă în loc de cea standard — toate bonurile emise cu acel produs sunt greșite retroactiv, de la data configurării eronate.\n\nCorectarea nu e doar o modificare de setare: implică de obicei regularizare cu ANAF pentru perioada afectată, ceea ce contabilul tău trebuie să gestioneze separat. Cu cât eroarea e descoperită mai târziu, cu atât perioada de regularizat e mai mare.",
      },
      {
        heading: "Cum previi erorile în franchisetech",
        body: "La adăugarea unui produs nou în POS, cota de TVA se setează explicit, produs cu produs — nu există o cotă implicită aplicată automat fără verificare. Raportul Z arată defalcarea colectării de TVA pe fiecare cotă, ceea ce face vizibilă rapid orice cifră care pare neobișnuită.\n\nDacă un produs ajunge să fie vândut fără o cotă de TVA configurată corect, discrepanța apare în rapoarte înainte să se acumuleze pe perioade lungi — mai ușor de corectat o săptămână greșită decât un trimestru întreg.",
      },
    ],
  },
  {
    slug: "declaratie-unica-pfa-horeca-ce-trebuie-sa-stii",
    title: "Declarația unică pentru PFA în HoReCa — ce trebuie să știi",
    description:
      "Ce este Declarația Unică pentru PFA-urile din HoReCa, ce venit declari, care sunt termenele și de ce o evidență zilnică curată a vânzărilor și achizițiilor face diferența.",
    publishedAt: "2026-06-08",
    locale: "ro",
    tags: ["fiscal","pfa","contabilitate"],
    image: "/marketing/dashboard-hero.png",
    relatedFeature: "/features/accountant-reports",
    sections: [
      {
        heading: "Ce este Declarația Unică și cine o depune",
        body: "Declarația Unică (formularul 212) este documentul prin care persoanele fizice autorizate (PFA) și alte forme de venit din activități independente își declară anual atât venitul realizat în anul fiscal anterior, cât și venitul estimat pentru anul curent.\n\nÎn HoReCa, o declarație unică se aplică tipic PFA-urilor mici — cofetării de casă, catering la scară mică, gustări sau produse de patiserie vândute direct. Dacă operezi ca SRL, regimul fiscal e diferit și nu ține de Declarația Unică în același fel.",
      },
      {
        heading: "Termenul de depunere",
        body: "Termenul standard de depunere a Declarației Unice este, de regulă, 25 mai pentru anul fiscal anterior. Autoritatea poate prelungi sau modifica acest termen de la un an la altul, așa că verifică întotdeauna data actualizată pe portalul ANAF sau cu contabilul tău înainte să presupui că termenul e neschimbat.\n\nDepunerea cu întârziere sau nedepunerea atrage penalități — merită tratat ca termen fix în calendarul afacerii, nu ca o formalitate de bifat «la un moment dat».",
      },
      {
        heading: "Ce venit declari — venit net, nu încasări brute",
        body: "Pentru PFA-urile din HoReCa, ce se declară nu este suma totală încasată de la clienți, ci venitul net: încasările din vânzări minus cheltuielile deductibile aferente activității (achiziții de marfă și ingrediente, chirie, utilități, alte cheltuieli documentate).\n\nAsta înseamnă că evidența cheltuielilor contează la fel de mult ca evidența vânzărilor. Fiecare achiziție de marfă trebuie să aibă factură sau document justificativ, iar recepția ei trebuie documentată (NIR), altfel contabilul nu o poate include ca deducere.",
      },
      {
        heading: "CAS și CASS — plafoanele legate de salariul minim",
        body: "Obligația de a plăti contribuții sociale — CAS pentru pensie, CASS pentru sănătate — depinde de venitul net estimat sau realizat, raportat la niște plafoane exprimate în număr de salarii minime brute pe economie, nu în sume fixe în lei.\n\nPentru că salariul minim se modifică periodic, plafoanele în lei se modifică odată cu el. Nu te baza pe o cifră reținută de anul trecut — cere contabilului valoarea actualizată pentru anul fiscal curent înainte de a estima venitul în declarație.",
      },
      {
        heading: "De ce evidența zilnică ușurează Declarația Unică",
        body: "Declarația Unică cere venitul net anual, dar acesta se construiește din 365 de zile de vânzări și achiziții. Dacă rapoartele Z zilnice și NIR-urile lunii sunt complete și corecte de la început, contabilul tău calculează venitul net direct din exporturi, fără să reconstituie luni întregi din bonuri răzlețe sau amintiri.\n\nÎn franchisetech, vânzările zilnice și achizițiile (NIR) sunt deja structurate și exportabile pentru contabil — exact datele de care are nevoie pentru a completa corect secțiunea de venit realizat din Declarația Unică.",
      },
    ],
  },
  {
    slug: "saf-t-horeca-ce-este-cine-e-obligat",
    title: "SAF-T pentru HoReCa — ce este, cine este obligat și cum te pregătești",
    description:
      "SAF-T (declarația D406) cere date structurate despre vânzări, achiziții și stoc raportate direct către ANAF. Iată ce este, cine e obligat și ce înseamnă pentru o afacere HoReCa mică.",
    publishedAt: "2026-06-08",
    locale: "ro",
    tags: ["fiscal","saf-t","conformitate"],
    image: "/marketing/hero-casa-marcat.jpg",
    relatedFeature: "/features/accountant-reports",
    sections: [
      {
        heading: "Ce este SAF-T",
        body: "SAF-T (Standard Audit File for Tax) este un fișier standardizat, în format XML, pe care contribuabilii îl transmit periodic către ANAF prin declarația D406. Conține date structurate și detaliate despre tranzacții: vânzări, achiziții, mișcări de stoc, active, informații generale despre firmă.\n\nScopul e să permită ANAF un audit electronic automatizat, comparând datele raportate cu tiparele așteptate, fără să fie nevoie de un control fizic extins pentru fiecare verificare de rutină.",
      },
      {
        heading: "Cine este obligat și de când",
        body: "Obligativitatea SAF-T a fost introdusă etapizat, pe categorii de contribuabili — inițial contribuabilii mari, apoi cei mijlocii, apoi treptat și cei mici. Pentru majoritatea afacerilor mici din HoReCa (PFA-uri, microîntreprinderi), încadrarea și termenul exact de intrare în obligativitate depind de categoria de contribuabil și de calendarul stabilit de ANAF, care s-a modificat de-a lungul timpului.\n\nNu presupune încadrarea ta pe baza a ce ai auzit de la alt proprietar de local — verifică explicit cu contabilul tău sau pe portalul ANAF dacă și de când firma ta are obligația de raportare SAF-T.",
      },
      {
        heading: "Ce date trebuie raportate",
        body: "Un fișier SAF-T complet include, printre altele:\n\n- Jurnalul de vânzări\n- Jurnalul de cumpărări\n- Mișcările de stoc\n- Activele fixe\n- Datele generale de identificare ale firmei\n\nPentru o cafenea sau un restaurant, cele mai relevante secțiuni practic sunt vânzările (agregate de obicei din rapoartele Z) și achizițiile (din NIR-uri) — acolo se concentrează majoritatea tranzacțiilor zilnice.",
      },
      {
        heading: "De ce contează pentru afacerea ta, nu doar pentru contabil",
        body: "SAF-T cere date structurate și consistente, nu doar corecte pe hârtie. Dacă gestiunea ta de stoc sau evidența vânzărilor are găuri — NIR-uri lipsă, vânzări care nu se potrivesc cu stocul consumat, cote de TVA setate inconsecvent — fișierul SAF-T generat va reflecta direct acele inconsistențe către ANAF.\n\nSpre deosebire de un control fizic clasic, unde un inspector vede o singură perioadă la un moment dat, SAF-T oferă autorității o imagine structurată, ușor de comparat automat pe perioade lungi. Inconsistențele mici, care ar trece neobservate la un control punctual, devin mai vizibile.",
      },
      {
        heading: "Cum te pregătești",
        body: "- Ține NIR-uri complete pentru fiecare recepție de marfă, emise la timp, nu în ciornă\n- Configurează cote de TVA corecte, per produs, verificate cu contabilul\n- Generează rapoarte Z zilnice, fără goluri\n- Păstrează bonurile de consum pentru rețetele preparate\n- Discută cu contabilul frecvența de raportare SAF-T aplicabilă categoriei tale de contribuabil\n\nPregătirea pentru SAF-T nu e un proiect separat — e, în esență, aceeași disciplină de evidență zilnică necesară oricum pentru un control clasic, dar cu un standard mai ridicat de consistență a datelor.",
      },
      {
        heading: "Cum ajută evidența digitală din franchisetech",
        body: "Vânzările structurate pe cote de TVA, NIR-urile și mișcările de stoc sunt deja păstrate digital în franchisetech și exportabile pentru contabil. În loc să reconstituie manual istoricul din bonuri de hârtie și fișiere Excel separate, contabilul tău poate folosi aceste exporturi ca bază pentru pregătirea fișierului SAF-T.\n\nAsta nu înlocuiește rolul contabilului în generarea și validarea efectivă a declarației D406 — dar reduce semnificativ timpul petrecut adunând datele brute de la zero.",
      },
    ],
  },
  {
    slug: "conectare-casa-marcat-anaf-erori-frecvente",
    title: "Conectarea casei de marcat la ANAF — erori frecvente și cum le rezolvi",
    description:
      "Casele de marcat electronice fiscale transmit bonurile către ANAF în timp real. Iată cele mai frecvente erori de conectare, ce le cauzează și cum le rezolvi fără să oprești vânzarea.",
    publishedAt: "2026-06-09",
    locale: "ro",
    tags: ["fiscal","casa-de-marcat"],
    image: "/marketing/hero-casa-marcat.jpg",
    relatedFeature: "/features/qr-code-receipts",
    sections: [
      {
        heading: "Cum funcționează conectarea la ANAF",
        body: "Orice casă de marcat electronică fiscală (AMEF) folosită în România este obligată să transmită automat, prin conexiune la internet, datele fiecărui bon fiscal emis către serverele ANAF. Conexiunea se face de obicei printr-un SIM de date montat direct în aparat sau printr-o rețea locală (Wi-Fi/cablu) conectată la un router cu internet.\n\nDacă legătura se întrerupe pentru câteva minute sau ore, aparatul nu se oprește din funcționat. Bonurile continuă să fie emise fiscal, iar datele se stochează local în memoria jurnalului electronic până când conexiunea revine — moment în care se retransmit automat, fără intervenția ta.",
      },
      {
        heading: "Cele mai frecvente erori de conectare",
        body: "În activitatea zilnică a unei cafenele sau a unui restaurant, aceleași câteva cauze explică majoritatea problemelor de conectare:\n\n- **Semnal SIM slab sau date epuizate** — mai ales în zone cu semnal instabil sau când abonamentul de date al SIM-ului fiscal a expirat\n- **Router sau rețea locală picată** — dacă aparatul e conectat prin Wi-Fi și routerul restaurantului cade, casa de marcat pierde legătura odată cu restul rețelei\n- **Certificat digital expirat** — certificatul folosit de aparat pentru autentificare la server are o perioadă de valabilitate și trebuie reînnoit\n- **Memoria jurnalului electronic aproape plină** — aparatele vechi sau neîntreținute pot ajunge la limita de stocare, ceea ce blochează transmiterea\n- **Firmware neactualizat** — ANAF actualizează periodic specificațiile de transmisie, iar un aparat cu firmware vechi poate refuza conexiunea",
      },
      {
        heading: "Ce faci când apare eroarea de conectare",
        body: "Primul pas este să identifici dacă problema e de la aparat sau de la rețea:\n\n1. Verifică dacă restul rețelei (POS-ul, routerul, telefonul cu date mobile) are internet\n2. Dacă restul rețelei funcționează dar aparatul fiscal nu, verifică semnalul SIM-ului din aparat (dacă are SIM propriu)\n3. Repornește aparatul fiscal — multe erori temporare de conectare se rezolvă printr-un restart simplu\n4. Dacă eroarea persistă, contactează distribuitorul autorizat al casei de marcat — el are acces la diagnosticare tehnică pe care tu nu o ai\n\n**Important:** vânzarea nu se oprește cât timp aparatul funcționează local. Nu refuza clienți sau nu opri activitatea doar pentru că vezi un mesaj de eroare de conectare pe ecranul casei de marcat — verifică întâi dacă bonurile chiar nu se mai emit.",
      },
      {
        heading: "Ce nu trebuie să faci niciodată",
        body: "- Nu opri sau nu deconecta manual aparatul fiscal sperând să \"resetezi\" problema, fără indicație de la distribuitorul autorizat\n- Nu ștergi sau nu încerci să resetezi jurnalul electronic pe cont propriu — este un document cu regim special\n- Nu ignora eroarea zile la rând sperând că \"se rezolvă singură\" — un aparat care nu a mai transmis date de câteva zile e un semnal de verificat imediat, nu de amânat\n- Nu schimba SIM-ul sau routerul fără să notezi ce ai schimbat — dacă distribuitorul trebuie să intervină, are nevoie de acest istoric",
      },
      {
        heading: "Bonul cu cod QR și rolul lui",
        body: "Fiecare bon fiscal emis de o casă de marcat conectată la ANAF conține un cod QR care permite verificarea autenticității bonului — clientul sau un inspector poate scana codul și confirma că bonul respectiv a fost efectiv transmis și înregistrat fiscal.\n\nÎn franchisetech, bonurile generate din vânzările POS se leagă direct de aparatul fiscal certificat conectat la stația de casă — aplicația nu emite bonuri fiscale în locul aparatului, ci trimite comanda de emitere către acesta și înregistrează rezultatul. Dacă aparatul fiscal raportează o eroare de conectare la ANAF, franchisetech afișează clar starea, nu ascunde eroarea și nu marchează vânzarea drept \"finalizată fiscal\" până nu primește confirmare reală de la aparat.",
      },
    ],
  },
  {
    slug: "obligatii-fiscale-lunare-cafenea-restaurant-lista",
    title: "Lista completă a obligațiilor fiscale lunare pentru o cafenea sau restaurant",
    description:
      "Ce declarații, rapoarte și documente trebuie pregătite lunar pentru ANAF și contabil la o cafenea sau restaurant din România — listă practică, fără termeni legali încâlciți.",
    publishedAt: "2026-06-09",
    locale: "ro",
    tags: ["fiscal","contabilitate","conformitate"],
    image: "/marketing/dashboard-hero.png",
    relatedFeature: "/features/accountant-reports",
    sections: [
      {
        heading: "De ce contează un calendar fiscal clar",
        body: "Cele mai multe amenzi și probleme la un restaurant sau o cafenea nu vin din fraudă — vin din termene ratate. O declarație depusă cu întârziere, un raport Z care lipsește dintr-o lună, un NIR neînregistrat la timp — fiecare dintre acestea devine o problemă mai mare dacă se acumulează pe parcursul lunilor.\n\nUn proprietar care știe exact ce trebuie depus și când nu depinde de \"contabilul îmi spune el\" — pentru că, în practică, contabilul are nevoie de datele tale (vânzări, achiziții, numerar) la timp ca să poată depune orice.",
      },
      {
        heading: "Obligații lunare de bază",
        body: "Pentru majoritatea cafenelelor și restaurantelor mici-mijlocii din România, obligațiile recurente lunare includ:\n\n- **Declarația de TVA** — dacă ești plătitor de TVA cu perioadă fiscală lunară\n- **Declarația privind contribuțiile salariale (D112)** — dacă ai angajați, indiferent de forma de organizare a afacerii\n- **Impozitul pe veniturile microîntreprinderilor sau impozitul pe profit** — calculat și, după caz, plătit conform regimului fiscal al firmei\n- **Arhivarea rapoartelor Z zilnice** — nu este o declarație depusă la ANAF, dar este documentul pe care un control fiscal îl poate cere pentru orice zi din lună\n- **Registrul de casă la zi** — jurnalul cronologic al tuturor mișcărilor de numerar, actualizat zilnic, nu reconstituit la final de lună",
      },
      {
        heading: "Obligații legate de achiziții și stoc",
        body: "Pe lângă declarațiile propriu-zise, contabilul are nevoie lunar de documentele care justifică mișcările de marfă și bani:\n\n- **NIR-urile (Notă de Intrare-Recepție)** pentru toate achizițiile de marfă din lună, emise la data reală a recepției, nu la data facturii\n- **Bonurile de consum** — dacă operezi cu rețete și stoc de materii prime, pentru a justifica ieșirile prin consum\n- **Facturile de achiziție** — pereche cu NIR-urile aferente\n- **Balanța cantitativ-valorică** — dacă ai gestiune de stoc, pentru a verifica stocul scriptic față de cel fizic",
      },
      {
        heading: "Ce se schimbă dacă ai angajați cu tichete de masă sau bacșiș",
        body: "Dacă acorzi tichete de masă, contabilul are nevoie de evidența lunară a acestora, separată de salariul de bază. Dacă operezi cu bacșiș încasat prin card, acesta trebuie evidențiat distinct față de vânzări — bacșișul nu este parte din veniturile din vânzarea de produse și nu se declară ca atare.\n\nAceste detalii par mărunte, dar sunt exact tipul de discrepanțe pe care un control fiscal neanunțat le verifică primele: sumele din registrul de casă coincid cu cele din rapoartele Z, iar bacșișul nu a fost amestecat în vânzările nete.",
      },
      {
        heading: "Cum pregătești lunar exportul pentru contabil",
        body: "În franchisetech, secțiunea **Rapoarte → Export audit & Saga** centralizează exact ce are nevoie contabilul la finalul lunii: NIR-urile perioadei, totalul vânzărilor defalcat pe cote de TVA și, dacă e nevoie, un export combinat în format Saga XML.\n\nPractic, în loc să aduni manual rapoarte Z, facturi și NIR-uri din surse diferite, alegi luna, apeși export și trimiți fișierul contabilului. Nu elimină nevoia unui contabil — dar elimină ora sau două petrecută lunar căutând și copiind date dintr-un loc în altul.",
      },
    ],
  },
  {
    slug: "cum-anulezi-un-bon-fiscal-emis-gresit",
    title: "Cum anulezi corect un bon fiscal emis greșit (storno)",
    description:
      "Ai emis un bon fiscal cu produsul greșit sau suma greșită? Iată procedura corectă de stornare, ce se întâmplă dacă observi greșeala după închiderea zilei și greșeli frecvente de evitat.",
    publishedAt: "2026-06-09",
    locale: "ro",
    tags: ["pos","storno","fiscal"],
    image: "/marketing/pos-hero.png",
    relatedFeature: "/features/pos",
    sections: [
      {
        heading: "Ce este stornarea unui bon fiscal",
        body: "Odată emis, un bon fiscal nu poate fi șters sau editat — casele de marcat fiscale nu permit asta prin design, tocmai pentru a preveni manipularea vânzărilor. Singura cale legală de a corecta o greșeală este **stornarea**: emiterea unui bon de stornare care anulează valoarea bonului greșit, urmat, dacă e cazul, de emiterea bonului corect.\n\nStornarea funcționează cât timp bonul greșit face parte din ziua fiscală curentă, adică înainte de generarea raportului Z de închidere a zilei respective.",
      },
      {
        heading: "Pașii pentru anularea unui bon fiscal emis greșit",
        body: "1. Identifici bonul greșit — de obicei prin numărul bonului sau ora emiterii\n2. Deschizi funcția de stornare din aplicația POS sau direct din casa de marcat\n3. Selectezi bonul (sau produsele) de anulat — sistemul cere de obicei un motiv (produs greșit, cantitate greșită, preț greșit, client renunță)\n4. Confirmi stornarea — se emite un bon de stornare care compensează exact valoarea bonului greșit\n5. Dacă vânzarea corectă trebuie totuși înregistrată, emiți un bon nou cu datele corecte\n\nÎn majoritatea sistemelor, stornarea unui bon deja plătit necesită și returnarea efectivă a banilor către client (numerar înapoi în sertar sau reversare pe card), nu doar o corecție în aplicație.",
      },
      {
        heading: "Ce faci dacă observi greșeala după închiderea zilei",
        body: "Dacă raportul Z al zilei respective a fost deja generat, bonul greșit nu mai poate fi stornat prin procedura obișnuită de casă — ziua fiscală s-a închis și jurnalul electronic al acelei zile este definitiv.\n\nÎn acest caz, corecția se face prin proceduri contabile separate (notă contabilă, discuție directă cu contabilul despre modul de tratare), nu prin sistemul POS. Din acest motiv, verificarea bonurilor emise **în aceeași zi**, înainte de închidere, este mult mai simplă decât corecția ulterioară — un motiv concret pentru care merită să arunci o privire pe lista vânzărilor zilei înainte de a genera raportul Z.",
      },
      {
        heading: "Greșeli frecvente la stornare",
        body: "- **Stornezi produsul greșit** — mai ales când bonul are mai multe articole și anulezi altă linie decât cea intenționată\n- **Nu notezi motivul stornării** — fără motiv, la control sau la verificarea internă nu poți explica de ce apare o anulare\n- **Amesteci stornarea cu discountul** — o reducere de preț nu este o stornare; dacă vrei doar să reduci prețul unui produs, folosești discount, nu anulare de bon\n- **Nu returnezi efectiv banii** — stornezi bonul în sistem dar uiți să dai banii înapoi clientului sau să reversezi tranzacția pe card, ceea ce creează diferență la numărarea sertarului",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "Stornarea unui bon în franchisetech se face direct din istoricul vânzărilor POS: cauți bonul, apeși **Stornează**, alegi motivul dintr-o listă predefinită și confirmi. Operațiunea cere autentificare — un casier obișnuit nu poate storna liber bonuri fără autorizare, exact ca să existe control asupra cine poate face această operațiune.\n\nFiecare stornare apare distinct în raportul Z al zilei, cu referință clară la bonul original și la motivul introdus — nu dispare din istoric, ci rămâne vizibilă ca linie de stornare, pentru trasabilitate completă.",
      },
    ],
  },
  {
    slug: "storno-in-horeca-ce-este-cand-se-foloseste",
    title: "Storno în HoReCa — ce este, când se folosește și ce documente generează",
    description:
      "Stornoul e mecanismul prin care corectezi o vânzare deja înregistrată fiscal, fără să ștergi nimic. Iată cazurile tipice din cafenele și restaurante și ce documente rezultă.",
    publishedAt: "2026-06-10",
    locale: "ro",
    tags: ["pos","storno"],
    image: "/marketing/pos-hero.png",
    relatedFeature: "/features/pos",
    sections: [
      {
        heading: "Ce este stornoul, concret",
        body: "Stornoul este operațiunea prin care anulezi efectul unei vânzări deja înregistrate fiscal, fără să modifici sau să ștergi bonul original. În loc de ștergere, sistemul emite un document nou — bonul de stornare — care are exact valoarea opusă bonului greșit, aducând totalul înregistrat la zero pentru acea vânzare.\n\nEste diferit de o simplă corecție în aplicație. Odată ce un bon fiscal a fost emis, el rămâne definitiv în jurnalul electronic al casei de marcat — stornoul este singura cale legală de a-i anula efectul.",
      },
      {
        heading: "Cazuri frecvente când se folosește stornoul în HoReCa",
        body: "- **Produs greșit introdus** — casierul bate \"cappuccino mare\" în loc de \"cappuccino mic\"\n- **Client renunță după plată** — comanda e deja încasată, dar clientul se răzgândește înainte de a primi produsul\n- **Plată dublă** — din grabă, aceeași comandă e încasată de două ori (frecvent la ore de vârf)\n- **Retur produs** — clientul aduce înapoi un produs (mai frecvent la produse ambalate decât la băuturi preparate)\n- **Discount uitat, aplicat după emiterea bonului** — bonul a fost deja emis fără reducere, iar clientul cere discountul promis ulterior\n\nÎn toate aceste cazuri, bonul greșit nu poate fi \"editat\" — trebuie stornat, iar dacă e nevoie, urmat de un bon nou corect.",
      },
      {
        heading: "Ce documente generează un storno",
        body: "Un storno corect generează minimum:\n\n- **Bonul de stornare** — documentul fiscal care anulează valoarea bonului greșit, cu referință la numărul bonului original\n- **Motivul stornării** — înregistrat în sistem, chiar dacă nu apare tipărit pe bon, pentru control intern\n- **Bonul nou** (dacă e cazul) — dacă vânzarea corectă trebuie totuși finalizată, cu datele corecte\n\nAceste documente apar apoi ca linii separate în raportul Z al zilei — nu se \"ascund\" în totalul net, ci sunt vizibile ca stornări distincte, alături de vânzările normale.",
      },
      {
        heading: "Cine ar trebui să aibă voie să facă storno",
        body: "În majoritatea afacerilor HoReCa bine organizate, dreptul de a storna un bon nu este liber pentru orice casier — este limitat la manager, admin sau supervizor de tură. Motivul e simplu: fără această limitare, stornoul poate deveni o portiță prin care un angajat anulează vânzări reale pentru a scoate numerar din sertar fără urmă.\n\nAsta nu înseamnă neîncredere automată în personal — înseamnă control intern de bază, aceeași logică pentru care banca îți cere PIN și nu doar cardul.",
      },
      {
        heading: "Cum ține evidența un sistem POS corect construit",
        body: "În franchisetech, fiecare storno este legat de un cont de utilizator autentificat, are oră, dată, motiv și referință la bonul original — nimic nu se pierde din istoric. Raportul Z al zilei arată separat totalul vânzărilor și totalul stornărilor, iar diferența dintre numerarul așteptat și cel numărat efectiv în sertar poate fi explicată direct din aceste înregistrări, nu din presupuneri.\n\nDacă un manager observă un număr neobișnuit de stornări într-o tură anume, are de unde porni verificarea — cine a făcut stornările, la ce oră și cu ce motiv.",
      },
    ],
  },
  {
    slug: "cum-aplici-discount-la-casa-fara-sa-strici-raportul",
    title: "Cum aplici un discount la casă fără să strici raportul Z",
    description:
      "Un discount aplicat greșit la casă poate denatura vânzările nete și TVA-ul din raportul Z. Iată tipurile de discount, pașii corecți de aplicare și cum apare reducerea în raport.",
    publishedAt: "2026-06-10",
    locale: "ro",
    tags: ["pos","discount","raport-z"],
    image: "/marketing/pos-hero.png",
    relatedFeature: "/features/pos",
    sections: [
      {
        heading: "De ce un discount aplicat greșit strică raportul",
        body: "Problema tipică: un casier, în loc să aplice reducerea prin funcția de discount a POS-ului, modifică manual prețul produsului la casă (\"îi zic 10 lei în loc de 12\"). Vânzarea se înregistrează la prețul redus, dar sistemul nu știe că a existat o reducere — o tratează ca preț normal al produsului.\n\nRezultatul: raportul Z arată vânzări nete mai mici decât realitatea, TVA-ul calculat pe acea vânzare e ușor diferit, iar la finalul lunii, când te uiți la marja produsului respectiv, cifrele nu se mai potrivesc cu rețeta și costul real. Discountul trebuie aplicat ca discount, nu simulat prin schimbarea prețului.",
      },
      {
        heading: "Tipuri de discount și când se folosește fiecare",
        body: "- **Discount procentual** (ex: -10%) — potrivit pentru reduceri gen \"happy hour\", card de fidelitate, angajat propriu\n- **Discount valoare fixă** (ex: -5 lei) — potrivit pentru corecții punctuale sau vouchere cu valoare fixă\n- **Discount pe produs** — aplicat unui singur articol din bon (ex: un croissant gratuit la o comandă)\n- **Discount pe total bon** — aplicat întregii comenzi, de obicei procentual\n\nAlegerea tipului potrivit contează pentru raportare: un discount pe produs izolat îți arată exact ce produse \"pierd\" valoare prin reduceri repetate, în timp ce un discount global pe bon nu oferă acest detaliu.",
      },
      {
        heading: "Pașii corecți pentru aplicare la casă",
        body: "1. Adaugi produsele în bon ca de obicei, la preț normal\n2. Înainte de finalizare, aplici discountul din funcția dedicată a POS-ului (nu editezi manual prețul liniei)\n3. Alegi tipul (procent sau valoare fixă) și, dacă sistemul cere, motivul reducerii\n4. Verifici totalul recalculat — inclusiv TVA-ul, care se recalculează automat pe baza noii valori\n5. Finalizezi bonul — abia acum se emite bonul fiscal, cu discountul deja reflectat corect",
      },
      {
        heading: "Reguli bune de urmat pentru discounturi",
        body: "- **Prag de autorizare** — discounturile peste un anumit procent (ex: peste 20%) ar trebui să ceară confirmare de manager, nu să fie libere pentru orice casier\n- **Motiv obligatoriu** — fidelizare, corecție, promoție, angajat — orice motiv notat e mai bun decât niciunul\n- **Nu amesteca discountul cu stornoul** — dacă bonul a fost deja emis fără reducere, nu poți \"edita\" prețul retroactiv; corecția se face prin stornare, nu prin discount aplicat pe un bon nou separat fără legătură\n- **Verifică periodic raportul de discounturi** — un procent mare de bonuri cu reducere poate însemna fie o promoție prea agresivă, fie personal care oferă reduceri neautorizate",
      },
      {
        heading: "Cum apare discountul în raportul Z",
        body: "Un raport Z corect nu ascunde discounturile în totalul net — le arată ca linie separată: **vânzări brute** (înainte de reducere), **total discounturi** și **vânzări nete** (după reducere). TVA-ul colectat se calculează pe valoarea netă, după aplicarea discountului, exact cum e reflectat și pe bonul fiscal emis clientului.\n\nÎn franchisetech, discountul se aplică din ecranul de finalizare a vânzării, cu alegere procent sau valoare fixă și câmp de motiv. Raportul Z zilnic separă clar vânzările brute de discounturile aplicate, astfel încât diferența dintre ce ar fi trebuit să încasezi la preț plin și ce ai încasat efectiv este vizibilă dintr-o privire, nu ascunsă într-un singur total.",
      },
    ],
  },
  {
    slug: "split-bill-cum-imparti-nota-intre-clienti",
    title: "Split bill — cum împarți nota de plată între mai mulți clienți",
    description:
      "Un grup de clienți vrea să plătească separat. Iată tipurile de split bill (egal, pe produse, mixt) și de ce împărțirea greșită a bonului fiscal poate crea probleme la reconciliere.",
    publishedAt: "2026-06-11",
    locale: "ro",
    tags: ["pos","split-bill"],
    image: "/marketing/hero-cafe-pos.png",
    relatedFeature: "/features/pos",
    sections: [
      {
        heading: "De ce split bill e o cerere frecventă și o bătaie de cap fără suport în POS",
        body: "\"Facem separat\" este una dintre cele mai frecvente cereri la o masă de 3-4 persoane într-un restaurant sau la un grup de colegi la o cafenea. Fără o funcție dedicată în sistemul de casă, casierul are două opțiuni proaste: fie face calcule manuale pe hârtie sau pe telefon și încasează separat fără ca sistemul să reflecte corect defalcarea, fie refuză cererea și pierde din experiența clientului.\n\nAmbele variante cresc timpul de servire la o masă și, mai grav, prima variantă introduce risc de eroare — sumele împărțite manual rareori se adună exact la totalul bonului original.",
      },
      {
        heading: "Tipuri de împărțire a notei",
        body: "- **Împărțire egală** — totalul bonului se împarte la numărul de persoane, indiferent ce a consumat fiecare (ex: 120 lei / 4 persoane = 30 lei fiecare)\n- **Împărțire pe produse** — fiecare persoană plătește exact ce a comandat (util când comenzile sunt clar diferite ca valoare)\n- **Împărțire mixtă** — o parte din notă (ex: o sticlă de vin comună) se împarte egal, restul pe produse individuale\n\nÎmpărțirea pe produse este de obicei cea mai corectă din perspectiva clientului, dar și cea mai greu de făcut manual dacă bonul are multe articole.",
      },
      {
        heading: "De ce contează cum împarți bonul fiscal, nu doar banii",
        body: "Nu este suficient să împarți corect suma de încasat — fiecare parte a notei trebuie să corespundă unui bon fiscal valid, cu TVA calculat corect pe valoarea acelei părți, nu doar o notă informală de plată. Dacă emiți un singur bon fiscal pentru tot grupul dar încasezi în realitate prin metode diferite (o parte cash, o parte card) de la persoane diferite, riști ca sumele din raportul Z să nu mai corespundă cu ce a intrat efectiv în sertar sau pe terminalul de card.\n\nUn split bill făcut corect înseamnă bonuri fiscale separate (sau o defalcare clară pe metodă de plată în cadrul aceluiași bon), astfel încât totalul lor să fie egal cu totalul comenzii originale — nici mai mult, nici mai puțin.",
      },
      {
        heading: "Exemplu concret: notă de 120 lei împărțită la 3 persoane",
        body: "O masă comandă produse în valoare totală de 120 lei. Doi clienți vor să plătească cu cardul partea lor, unul cu numerar.\n\n1. Deschizi bonul comenzii complete (120 lei, toate produsele)\n2. Alegi împărțirea — egală (40 lei fiecare) sau pe produse, în funcție de ce a comandat fiecare\n3. Pentru fiecare parte, alegi metoda de plată — card pentru doi, numerar pentru unul\n4. Sistemul emite bonurile corespunzătoare fiecărei părți, cu suma și metoda de plată corecte\n5. La final, suma celor trei bonuri = 120 lei, exact totalul comenzii inițiale\n\nDacă la pasul 5 sumele nu se adună exact la total, ceva din împărțire a fost greșit — un motiv în plus pentru care split-ul manual, fără suport în aplicație, este predispus la erori.",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "franchisetech permite împărțirea unui bon direct din ecranul de finalizare a vânzării — egal între un număr de persoane sau pe produse individuale selectate. Fiecare parte a notei poate fi încasată cu metodă de plată diferită (cash, card), iar sistemul generează bonurile fiscale corespunzătoare, cu sumele defalcate corect.\n\nLa finalul zilei, raportul Z reflectă corect totalul — indiferent câte bonuri separate au rezultat dintr-o singură comandă la masă, suma lor apare corect în defalcarea pe metode de plată, fără calcule suplimentare din partea ta.",
      },
    ],
  },
  {
    slug: "cum-inregistrezi-bacsisul-corect-in-pos",
    title: "Cum înregistrezi bacșișul corect în POS, fără să-l amesteci cu vânzarea",
    description:
      "Bacșișul nu este parte din vânzarea de produse și nu ar trebui să umfle vânzările nete sau TVA-ul. Iată cum îl înregistrezi corect, cash și pe card, și ce spune legea în România.",
    publishedAt: "2026-06-11",
    locale: "ro",
    tags: ["pos","bacsis"],
    image: "/marketing/hero-cafe-pos.png",
    relatedFeature: "/features/pos",
    sections: [
      {
        heading: "De ce bacșișul nu e parte din vânzare",
        body: "Bacșișul este o sumă oferită voluntar de client, peste prețul produselor consumate — nu este contravaloarea unui produs sau serviciu vândut de firmă. Dacă bacșișul e amestecat în totalul vânzărilor (de exemplu, adăugat direct la prețul bonului fiscal ca și cum ar fi parte din comandă), vânzările nete raportate devin artificial mai mari, iar TVA-ul se calculează greșit — pe o sumă care, de fapt, nu reprezintă vânzare de produse.\n\nÎn plus, dacă bacșișul e distribuit direct personalului (nu rămâne venit al firmei), amestecarea lui în vânzări face imposibilă separarea corectă a acestei sume pentru contabilitate.",
      },
      {
        heading: "Ce spune legea despre bacșiș în România",
        body: "Legea bacșișului (Legea nr. 106/2020) prevede că operatorii economici din HoReCa care încasează plăți prin card trebuie să permită clientului să acorde bacșiș și pe această cale, nu doar cash. Practic, un restaurant sau o cafenea cu terminal de plată card nu se mai poate limita la \"bacșișul se dă doar cash\" — trebuie să existe o opțiune și la plata cu cardul.\n\nCa regulă generală, bacșișul evidențiat distinct și distribuit integral angajaților are un tratament fiscal diferit față de o sumă care ar rămâne, nedeclarat, venit al firmei — motiv suplimentar pentru care evidența separată nu este doar o bună practică, ci și o problemă de conformitate.",
      },
      {
        heading: "Cum înregistrezi corect bacșișul, cash și pe card",
        body: "**Bacșiș cash:** de obicei rămâne direct la angajat sau se pune într-un borcan comun de bacșiș, separat fizic de sertarul de numerar al vânzărilor. Nu se adaugă la totalul de numerar din raportul Z ca venit din vânzări.\n\n**Bacșiș pe card:** trebuie să apară ca linie separată la momentul plății — fie ca opțiune distinctă pe terminalul de plată, fie ca un câmp separat în aplicația POS, nu adăugat manual la prețul produselor din bon. Suma respectivă trebuie să fie identificabilă separat în extrasul de decontare al procesatorului de plăți, nu îngropată în totalul general al zilei.",
      },
      {
        heading: "Greșeli frecvente la înregistrarea bacșișului",
        body: "- **Amestecarea bacșișului cash cu fondul de casă** — banii de bacșiș ajung în același sertar cu numerarul de vânzări, fără separare, ceea ce strică numărătoarea la închiderea zilei\n- **Neînregistrarea bacșișului cash deloc** — dacă nu există nicio evidență, nu poți verifica ulterior cât s-a încasat sau cum s-a distribuit între angajați\n- **Adăugarea bacșișului la prețul produsului pe bonul fiscal** — umflă vânzările nete și TVA-ul calculat, o eroare care se propagă în toate rapoartele ulterioare\n- **Distribuție neclară între staff** — fără o regulă scrisă (împărțire egală, pe tură, pe vânzări individuale), bacșișul devine sursă de conflict între angajați",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "În franchisetech, bacșișul se înregistrează printr-un câmp separat la finalizarea vânzării, distinct de valoarea produselor din bon. Suma de bacșiș nu intră în calculul vânzărilor nete și nu afectează TVA-ul colectat — apare ca linie proprie în raportul Z zilnic, alături de, dar separat de, totalul vânzărilor.\n\nAsta îți dă, la finalul zilei, două cifre clare: cât ai vândut efectiv în produse și cât s-a încasat separat ca bacșiș — utile atât pentru reconciliere, cât și pentru distribuirea corectă către personal.",
      },
    ],
  },
  {
    slug: "schimb-de-tura-la-casierie-fara-erori",
    title: "Schimbul de tură la casierie fără erori de numerar",
    description:
      "Momentul în care un casier predă sertarul altuia este unul dintre cele mai frecvente puncte în care apar diferențe de numerar nedescoperite. Iată procedura corectă, pas cu pas.",
    publishedAt: "2026-06-11",
    locale: "ro",
    tags: ["pos","tura","numerar"],
    image: "/marketing/reports-zreport.png",
    relatedFeature: "/features/z-report",
    sections: [
      {
        heading: "De ce schimbul de tură e un moment de risc pentru numerar",
        body: "Când un casier predă casa altuia la mijlocul zilei, fără o numărătoare clară la predare, orice diferență apărută ulterior devine imposibil de atribuit unei ture anume. Dacă la închiderea zilei lipsesc 40 de lei, dar au fost trei casieri diferiți la sertar, nimeni nu poate spune cu certitudine în care tură a apărut diferența.\n\nAcesta este exact motivul pentru care schimbul de tură are nevoie de o procedură, nu de un simplu \"las banii aici, mă duc eu\".",
      },
      {
        heading: "Pașii corecți la schimbul de tură",
        body: "1. Casierul care termină tura numără efectiv tot numerarul din sertar\n2. Se generează un raport intermediar al turei (raport X, nu Z — vezi mai jos de ce contează diferența) cu totalul vânzărilor din tura respectivă\n3. Suma numărată se compară cu suma așteptată conform raportului de tură\n4. Dacă există diferență, se notează imediat, cât timp casierul care termină tura e încă prezent\n5. Ambii casieri (cel care predă și cel care preia) confirmă predarea — ideal cu semnătură sau confirmare în aplicație, nu doar verbal\n6. Casierul care preia începe tura cu suma confirmată, nu cu o estimare",
      },
      {
        heading: "Raport X vs raport Z — diferența care contează la schimbul de tură",
        body: "**Raportul X** este un raport intermediar — arată totalul vânzărilor de la ultima resetare (de obicei de la deschiderea zilei) până în momentul curent, **fără să reseteze** contoarele casei de marcat. Poți genera oricâte rapoarte X vrei într-o zi, la fiecare schimb de tură, fără să afectezi jurnalul fiscal.\n\n**Raportul Z** închide definitiv ziua fiscală — resetează contoarele și marchează oficial sfârșitul zilei de vânzare. Se generează o singură dată, la finalul programului, nu la fiecare schimb de tură.\n\nFolosirea raportului Z la mijlocul zilei, doar pentru a verifica o tură, este o greșeală frecventă — închide ziua fiscală prematur și complică orice vânzare ulterioară din aceeași zi.",
      },
      {
        heading: "Ce faci dacă găsești o diferență la schimbul de tură",
        body: "O diferență mică (câțiva lei) poate veni din rest dat greșit sau rotunjiri repetate pe parcursul turei — se notează și se continuă activitatea. O diferență mai mare cere verificare imediată:\n\n- Verifici dacă toate vânzările turei au fost efectiv înregistrate în POS (nu doar spuse verbal)\n- Verifici dacă au existat stornări sau discounturi neînregistrate corect\n- Întrebi direct casierul care a terminat tura — de multe ori explicația e simplă (o plată cu suma greșită, un rest dat din memorie greșit)\n\nCe nu faci: să lași diferența nenotată \"pentru că oricum se rezolvă la sfârșitul zilei\". Până la raportul Z final, diferența s-ar putea acumula cu alte erori din turele următoare, iar sursa devine imposibil de identificat.",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "Fiecare casier operează cu propriul cont autentificat în franchisetech, ceea ce înseamnă că fiecare vânzare, stornare sau discount este atribuit clar unei persoane și unei ture, nu unui \"sertar generic\". La schimbul de tură, poți genera un raport intermediar al vânzărilor din tura respectivă fără să afectezi ziua fiscală curentă.\n\nAsta face ca, dacă apare o diferență de numerar mai târziu în zi, să poți urmări exact în care tură și la ce oră s-a produs — în loc să investighezi întreaga zi de la zero.",
      },
    ],
  },
  {
    slug: "deschiderea-fondului-de-casa-cat-si-cum",
    title: "Deschiderea fondului de casă — cât numerar pui și cum îl înregistrezi",
    description:
      "Fondul de casă e prima sumă de numerar din sertar, înainte de orice vânzare. Dacă nu îl înregistrezi corect, orice reconciliere de la finalul zilei pornește deja cu o cifră greșită.",
    publishedAt: "2026-06-12",
    locale: "ro",
    tags: ["pos","fond-casa"],
    image: "/marketing/reports-zreport.png",
    relatedFeature: "/features/z-report",
    sections: [
      {
        heading: "Ce este fondul de casă și de ce nu e doar \"bani puși în sertar\"",
        body: "Fondul de casă (sau fondul de rest) este suma de numerar pusă în sertar la începutul zilei, înainte de prima vânzare — folosită exclusiv pentru a da rest clienților care plătesc cash. Nu este venit, nu este parte din vânzări, este o sumă care trebuie să rămână constantă (sau apropiată) de la o zi la alta.\n\nProblema apare când fondul de casă e pus fizic în sertar dar nu e înregistrat nicăieri ca atare. La finalul zilei, când numeri sertarul și îl compari cu vânzările din raportul Z, dacă nu ai scăzut fondul de deschidere, diferența pe care o vezi este falsă — pare că ai mai mulți bani decât ai vândut de fapt, exact cu suma fondului inițial.",
      },
      {
        heading: "Cât numerar pui, în practică",
        body: "Nu există o sumă legală obligatorie pentru fondul de casă — este o decizie de business, bazată pe cât de des ai nevoie de rest și în ce cupuri.\n\nOrientativ, pentru o cafenea sau un restaurant mic-mediu din România, un fond de casă între **200 și 500 lei**, distribuit în cupuri mici (monede, bancnote de 10, 20, 50 lei), acoperă majoritatea situațiilor de rest din prima oră de funcționare. Dacă vinzi mult cu bancnote mari și rar cu cash exact, poate fi nevoie de mai mult; dacă majoritatea clienților plătesc cu cardul, poți funcționa cu un fond mai mic.\n\nCe contează mai mult decât suma exactă este **consecvența** — același fond, în fiecare zi, ca să poți compara de la o zi la alta fără variabile în plus.",
      },
      {
        heading: "Cum înregistrezi corect deschiderea",
        body: "1. Numeri fizic suma pe care o pui în sertar la începutul zilei\n2. Înregistrezi suma ca **primă mișcare** a zilei în registrul de casă, înainte de orice vânzare\n3. Confirmi deschiderea în sistemul POS (dacă aplicația cere introducerea fondului la deschiderea sesiunii)\n4. Nu amesteci fondul de casă cu bacșișul rămas din ziua anterioară sau cu alte sume care nu fac parte din fondul propriu-zis\n\nDacă sistemul tău POS nu are un pas explicit de \"deschidere fond\", riști ca prima vânzare din zi să fie tratată ca punct de plecare pentru calculul numerarului — ceea ce face imposibilă compararea corectă la finalul zilei.",
      },
      {
        heading: "Greșeli frecvente cu fondul de casă",
        body: "- **Fond variabil de la o zi la alta, fără motiv** — azi pui 300 lei, mâine 450, fără să notezi de ce; face reconcilierea confuză\n- **Neînregistrarea fondului ca mișcare separată** — banii sunt fizic în sertar dar nu apar nicăieri documentat, deci la finalul zilei calculul pleacă greșit\n- **Amestecarea cu bacșișul** — banii de bacșiș rămași necolectați ajung în același sertar cu fondul, umflând suma \"disponibilă\" fără să fie de fapt fond de casă\n- **Fondul \"împrumutat\" pentru plăți mărunte** — cineva scoate 20 lei din fond să plătească un curier, fără să noteze — la finalul zilei diferența pare inexplicabilă",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "La deschiderea unei sesiuni POS în franchisetech, introducerea fondului de casă este primul pas — suma se înregistrează explicit ca fond de deschidere, nu se presupune. Această valoare devine automat punctul de plecare pentru calculul numerarului așteptat la finalul zilei.\n\nLa generarea raportului Z, franchisetech scade automat fondul de deschidere din numerarul din sertar pentru a-ți arăta corect ce a venit efectiv din vânzări — nu trebuie să faci scăderea manual și nu riști să confunzi fondul cu încasările zilei.",
      },
    ],
  },
  {
    slug: "reconciliere-card-vs-numerar-la-final-de-zi",
    title: "Reconcilierea card vs. numerar la finalul zilei — pas cu pas",
    description:
      "Ce arată raportul Z despre plățile cu cardul nu este întotdeauna exact ce decontează banca. Iată cum reconciliezi corect cele două surse și de unde vin cel mai des discrepanțele.",
    publishedAt: "2026-06-12",
    locale: "ro",
    tags: ["pos","reconciliere","raport-z"],
    image: "/marketing/reports-zreport.png",
    relatedFeature: "/features/z-report",
    sections: [
      {
        heading: "De ce reconcilierea card vs. numerar contează",
        body: "Raportul Z îți arată ce a înregistrat sistemul POS ca vânzări cu cardul într-o zi. Extrasul de decontare de la procesatorul de plăți (sau extrasul bancar) îți arată ce a intrat efectiv în cont. Cele două cifre ar trebui să coincidă — dar în practică, diferite motive pot face să nu se potrivească exact.\n\nDacă nu verifici periodic această corespondență, poți descoperi luni mai târziu că lipsesc bani din decontări dintr-o cauză tehnică nesesizată la timp — mult mai greu de investigat retroactiv decât dacă ai fi prins diferența în ziua respectivă.",
      },
      {
        heading: "Pașii de reconciliere, pas cu pas",
        body: "1. Generezi raportul Z al zilei și notezi totalul vânzărilor cu cardul conform sistemului POS\n2. Extragi extrasul de decontare al terminalului de plată (sau al procesatorului) pentru aceeași zi\n3. Compari totalul din raportul Z cu totalul decontat\n4. Dacă cifrele coincid — bifezi și arhivezi\n5. Dacă nu coincid, identifici diferența specifică: o tranzacție lipsă, un comision neașteptat, o decontare întârziată\n6. Notezi explicația găsită, chiar dacă diferența e minoră — un istoric de explicații te ajută dacă discrepanțele devin un tipar",
      },
      {
        heading: "Motive frecvente pentru discrepanțe",
        body: "- **Comisioane reținute de procesator** — suma decontată e mai mică decât vânzarea brută cu procentul comisionului, ceea ce e normal și nu e o \"eroare\", dar trebuie contabilizat separat, nu confundat cu o lipsă\n- **Decontare întârziată (T+1 sau T+2)** — vânzările de vineri seara pot apărea în extras abia luni, ceea ce face reconcilierea \"zi cu zi\" să pară greșită dacă nu ții cont de decalaj\n- **Tranzacție eșuată dar înregistrată greșit ca reușită** — rar, dar posibil dacă terminalul are o problemă de conexiune chiar în momentul confirmării\n- **Bacșiș pe card amestecat cu vânzarea** — dacă bacșișul nu e separat corect, suma decontată totală poate părea mai mare decât vânzările din raportul Z, fără să fie o eroare reală",
      },
      {
        heading: "Cum documentezi și corectezi o discrepanță",
        body: "Odată identificată sursa diferenței, o notezi explicit — nu doar \"nu se potrivește, o las așa\". Pentru comisioane, notezi procentul reținut ca să poți verifica dacă rămâne constant. Pentru decontări întârziate, notezi decalajul (T+1, T+2) ca referință pentru reconcilierile viitoare. Pentru orice tranzacție care pare complet lipsă din decontare, contactezi procesatorul de plăți direct — nu presupune că \"se rezolvă singur\".\n\nO discrepanță nedocumentată azi devine o discuție greu de reconstituit peste trei luni, când nimeni nu-și mai amintește exact ce s-a întâmplat în ziua respectivă.",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "Raportul Z din franchisetech separă clar totalul vânzărilor pe metode de plată — numerar, card, online — exact defalcarea de care ai nevoie pentru a compara cu extrasul de decontare al procesatorului tău de plăți. Fiecare raport Z rămâne arhivat și poate fi descărcat oricând, astfel încât reconcilierea nu trebuie făcută obligatoriu în aceeași zi — poți compara și retroactiv, cu aceleași cifre exacte pe care sistemul le-a înregistrat atunci.\n\nfranchisetech nu se conectează automat la extrasul bancar sau la procesatorul de plăți — reconcilierea finală, cifră cu cifră, rămâne un pas manual, dar pornești de la o defalcare corectă și completă din partea POS-ului, nu de la un total generic.",
      },
    ],
  },
  {
    slug: "integrare-comenzi-delivery-glovo-bolt-in-pos",
    title: "Integrarea comenzilor de delivery (Glovo, Bolt Food) cu POS-ul tău",
    description:
      "Comenzile de pe platformele de delivery ajung de obicei pe o tabletă separată, ruptă de POS și de stoc. Cum funcționează integrarea prin webhook și de ce contează pentru gestiune.",
    publishedAt: "2026-06-13",
    locale: "ro",
    tags: ["pos","delivery"],
    image: "/marketing/industry-food-truck.png",
    relatedFeature: "/features/pos",
    sections: [
      {
        heading: "Problema tabletei separate de delivery",
        body: "Fiecare platformă de delivery vine cu propria tabletă și propria aplicație. Comanda apare acolo, nu în POS-ul de la casă. Cineva trebuie să o citească și să o reintroducă manual — sau, mai frecvent în orele de vârf, nu o mai reintroduce deloc.\n\nRezultatul: vânzarea există (banii vin de la platformă), dar stocul de ingrediente nu se scade nicăieri în sistemul tău de gestiune. La finalul zilei, stocul scriptic arată mai mult decât ai vândut de fapt, iar diferența e greu de explicat la inventar.",
      },
      {
        heading: "Ce înseamnă, tehnic, integrarea cu POS-ul",
        body: "Integrarea funcționează prin notificare automată (webhook): în momentul în care clientul plasează comanda pe platformă, aceasta este trimisă instant către sistemul tău, fără ca nimeni să o transcrie manual.\n\nComanda este apoi mapată la produsele din meniul tău intern, printr-o listă de corespondență între codul produsului de pe platformă și produsul din POS-ul tău. Dacă un produs nou de pe platformă nu are încă o corespondență setată, comanda tot intră în sistem — produsul nemapat este semnalat separat, nu blochează restul comenzii.",
      },
      {
        heading: "Ce se întâmplă cu stocul la o comandă venită de pe platformă",
        body: "Odată ce un produs de pe platforma de delivery este mapat corect la produsul intern cu rețetă, comanda scade stocul de ingrediente exact ca o vânzare făcută direct la casă — aceeași cantitate de cafea, lapte sau ambalaj iese din gestiune.\n\nFără mapare, acel consum rămâne invizibil. Practic vinzi produsul de două ori: o dată real, către client, și niciodată în stocul tău. Diferența se acumulează zilnic și devine vizibilă abia la inventarul fizic, când nimeni nu-și mai amintește de unde vine.",
      },
      {
        heading: "Maparea produselor — pasul care se sare cel mai des",
        body: "Maparea leagă codul (SKU) folosit de platforma de delivery de produsul din meniul tău POS, cu rețeta și prețul deja configurate acolo. Se face o singură dată per produs, nu la fiecare comandă.\n\nProblema apare când platforma adaugă un produs nou sau modifică un cod existent fără să anunțe — comanda respectivă ajunge \"nemapată\" și rămâne într-o listă de excepții de rezolvat, nu se pierde, dar nici nu se contabilizează corect în stoc până nu o rezolvi.",
      },
      {
        heading: "Ce platforme sunt suportate în practică",
        body: "Integrarea prin webhook este cea mai matură pentru Glovo — comenzile ajung automat, fără intervenție manuală. Pentru Bolt Food și Tazz, conectarea este în extindere; verifică direct cu echipa de suport dacă locația ta poate fi activată acum sau este pe lista de așteptare.\n\nIndiferent de platformă, principiul rămâne același: fără mapare corectă a produselor, integrarea aduce comanda, dar nu și acuratețea stocului.",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "Comenzile de pe Glovo ajung automat prin webhook și devin tranzacții în același POS folosit la casă, cu sursa marcată explicit \"livrare online\", separată de vânzările la fața locului în rapoarte.\n\nMaparea produselor între codurile platformei și meniul tău intern se configurează împreună cu echipa franchisetech la activare, astfel încât consumul de ingrediente pentru comenzile de delivery să se scadă din stoc la fel ca orice vânzare de la tejghea.",
      },
    ],
  },
  {
    slug: "meniu-fix-vs-a-la-carte-cum-le-configurezi-in-pos",
    title: "Meniu fix vs. à la carte — cum le configurezi corect în POS",
    description:
      "Meniul fix cu preț unic și à la carte cer configurări diferite în POS: rețete compuse, marjă pe variante și TVA pe componente mixte. Ghid practic pentru cafenele și restaurante.",
    publishedAt: "2026-06-13",
    locale: "ro",
    tags: ["pos","meniu"],
    image: "/marketing/products-list.png",
    relatedFeature: "/features/pos",
    sections: [
      {
        heading: "Diferența dintre meniu fix și à la carte, dincolo de denumire",
        body: "Meniul fix (sau meniul zilei) este un pachet cu un singur preț: de exemplu supă + fel principal + desert la 35 lei, indiferent din ce e compus fiecare element. À la carte înseamnă că fiecare produs are prețul lui propriu, iar clientul combină cum vrea — un espresso la 9 lei, un croissant la 12 lei, fiecare vândut și contabilizat separat.\n\nDiferența nu e doar de prezentare pe meniu — cere o configurare diferită în POS, mai ales la cost și la TVA.",
      },
      {
        heading: "Cum configurezi un produs de tip meniu fix",
        body: "Creezi un produs nou de sine stătător, de exemplu \"Meniu prânz zilei\", cu un preț fix de vânzare. Îi atașezi o rețetă compusă din toate componentele incluse: 250g supă, 300g fel principal, 1 pahar suc.\n\nLa vânzare, casierul apasă un singur buton — \"Meniu prânz\" — iar sistemul scade automat din stoc toate ingredientele componentelor incluse, exact ca la orice altă rețetă. Nu vinzi separat supa și felul principal, dar stocul scade la fel ca și cum ai face-o.",
      },
      {
        heading: "Capcana costului la meniuri cu variante",
        body: "Multe meniuri fixe oferă alegere: clientul poate lua felul principal cu pui sau cu vită, la același preț de 35 lei. Problema: costul real diferă în funcție de alegere, dar rețeta configurată în sistem reflectă o singură variantă.\n\nDouă soluții practice:\n\n- Configurezi o rețetă medie ponderată, bazată pe procentul obișnuit de alegere a fiecărei variante — util pentru marja estimată, nu exactă produs cu produs\n- Configurezi produse separate pentru fiecare variantă, cu același preț de vânzare afișat clientului, dar cost și marjă calculate corect pe fiecare\n\nA doua variantă cere puțin mai multă configurare inițială, dar îți arată exact care variantă de meniu fix e mai profitabilă.",
      },
      {
        heading: "TVA la meniuri fixe cu componente mixte",
        body: "Dacă un meniu fix include și o băutură alcoolică alături de mâncare, cotele de TVA ale componentelor pot fi diferite chiar dacă prețul final e unic pentru client. Nu presupune că tot pachetul se încadrează automat la o singură cotă doar pentru că are un singur preț afișat.\n\nConfigurează cota de TVA la nivel de fiecare componentă din rețetă, nu la nivelul produsului \"meniu\" ca întreg, și verifică împreună cu contabilul tău cum se defalcă TVA-ul pe bonul fiscal pentru pachete cu cote mixte.",
      },
      {
        heading: "À la carte — organizarea pentru viteză, nu doar varietate",
        body: "La à la carte, numărul de produse individuale e de obicei mult mai mare decât la un meniu fix, deci organizarea categoriilor contează direct pentru viteza la casă. Produsele cele mai vândute (cafea, apă, produsele de bază) ar trebui să fie la o singură atingere, nu îngropate în submeniuri.\n\nUn meniu à la carte prost organizat înseamnă casieri care caută produsul printre categorii în timp ce clientul așteaptă — exact opusul avantajului de viteză pe care ar trebui să-l aducă vânzarea produselor individuale.",
      },
      {
        heading: "Cum le configurezi în franchisetech",
        body: "Meniurile fixe se configurează ca produse compuse, cu propria rețetă din componente, exact ca orice alt produs cu preț și cost calculat automat. Produsele à la carte rămân individuale, organizate pe categorii proprii.\n\nPoți avea ambele active simultan pe același ecran de vânzare — meniul zilei ca buton distinct, alături de produsele à la carte obișnuite — fără să dubleze configurarea stocului sau a rețetelor.",
      },
    ],
  },
  {
    slug: "coduri-bare-produse-cafenea-merita",
    title: "Coduri de bare pentru produse — merită la o cafenea sau restaurant mic?",
    description:
      "Scanarea la casă pare rapidă, dar la un meniu de 20-30 produse preparate la comandă, atingerea directă pe ecran e adesea la fel de eficientă. Când chiar merită codul de bare și când nu.",
    publishedAt: "2026-06-13",
    locale: "ro",
    tags: ["pos","produse"],
    image: "/marketing/products-list.png",
    relatedFeature: "/features/pos",
    sections: [
      {
        heading: "Ce rezolvă, de fapt, un cod de bare la casă",
        body: "Codul de bare elimină căutarea vizuală: scanezi produsul în loc să apeși prin categorii pentru a-l găsi pe ecran. Diferența se simte mai ales la produsele ambalate care vin deja cu cod de bare tipărit din fabrică — sticle de apă, cutii de suc, batoane, pungi de cafea boabe la pachet.\n\nLa acest tip de produse, nu trebuie să generezi și să lipești nimic — codul există deja, scanerul îl citește direct.",
      },
      {
        heading: "Cazurile unde nu merită efortul",
        body: "Produsele preparate la comandă — cappuccino, sandvișuri calde, limonadă proaspătă — nu au un cod de bare fizic. Ca să le scanezi, ar trebui să printezi și să lipești etichete proprii pe fiecare variantă, ceea ce înseamnă timp și cost recurent pentru un meniu care se schimbă des.\n\nLa un meniu de 20-30 produse preparate la comandă, apăsarea directă pe ecran, cu produsele bine organizate pe categorii, este de obicei la fel de rapidă ca scanarea — fără costul suplimentar de etichetare.",
      },
      {
        heading: "Cazurile unde chiar ajută",
        body: "Codul de bare devine util real acolo unde numărul de produse individuale e mare și clienții cumpără mai multe articole diferite deodată:\n\n- Cafenele cu zonă de retail — pungi de cafea boabe, cești, produse ambalate la raft\n- Locații cu personal nou, care nu a memorat încă tot meniul și scanarea reduce erorile de selecție\n- Afaceri cu produse pre-ambalate variate (patiserie ambalată, produse la pachet pentru acasă)\n\nÎn aceste cazuri, scanarea reduce atât timpul cât și erorile de selecție a produsului greșit.",
      },
      {
        heading: "Costul real de implementare",
        body: "Un scanner USB de bază e o investiție mică și rapid amortizată. Costul real nu e hardware-ul, ci timpul: generarea și lipirea etichetelor pentru fiecare produs care nu vine deja cu cod din fabrică, plus configurarea inițială în sistem pentru fiecare SKU.\n\nPentru un meniu mic, acest efort de configurare depășește adesea beneficiul de viteză câștigat la casă.",
      },
      {
        heading: "Alternativa care funcționează pentru majoritatea cafenelelor mici",
        body: "Pentru un meniu sub 40 de produse, combinația căutare rapidă pe nume, categorii bine organizate și produsele cele mai vândute fixate pe primul ecran acoperă majoritatea nevoilor de viteză, fără costul de etichetare.\n\nCodul de bare devine relevant abia când numărul de SKU-uri crește semnificativ sau când ai o componentă de retail cu produse ambalate din fabrică.",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "Fiecare produs poate avea un cod de bare (SKU) atașat, iar un scanner USB standard funcționează direct pe ecranul de vânzare, fără configurare suplimentară de hardware.\n\nNu este însă obligatoriu — poți vinde 100% prin atingere directă pe ecran dacă meniul tău este format din produse preparate la comandă, și poți adăuga scanarea ulterior, doar pentru produsele unde chiar aduce un avantaj real.",
      },
    ],
  },
  {
    slug: "cum-organizezi-categoriile-de-produse-in-pos",
    title: "Cum organizezi categoriile de produse în POS ca să vinzi mai rapid",
    description:
      "Un casier care caută produsul prin subcategorii pierde secunde reale la fiecare comandă. Reguli practice pentru organizarea categoriilor din POS, cu exemple pentru cafenea și restaurant.",
    publishedAt: "2026-06-14",
    locale: "ro",
    tags: ["pos","produse","organizare"],
    image: "/marketing/products-list.png",
    relatedFeature: "/features/pos",
    sections: [
      {
        heading: "De ce contează organizarea categoriilor",
        body: "La ora de vârf, fiecare secundă în plus la casă înseamnă o coadă mai lungă. Un casier care trebuie să caute produsul prin 6-8 subcategorii, în loc să-l găsească dintr-o singură atingere, pierde timp real — nu teoretic — la fiecare comandă din ziua respectivă.\n\nOrganizarea categoriilor nu e o chestiune estetică. E direct legată de câți clienți poți servi într-o oră de vârf.",
      },
      {
        heading: "Regula de bază: produsele cele mai vândute, la o singură atingere",
        body: "Produsele cu volumul cel mai mare de vânzări — cafeaua de bază, apa, produsele care se vând constant — trebuie să fie pe primul ecran vizibil, nu îngropate în submeniuri. Un produs care reprezintă 30% din vânzările zilnice nu ar trebui să necesite mai mult de o atingere pentru a fi selectat.\n\nProdusele rar vândute pot merge liniștit în categorii secundare — acolo timpul pierdut la căutare contează mai puțin, pentru că apare rar.",
      },
      {
        heading: "Câte categorii sunt prea multe",
        body: "Nu există un număr universal valabil, dar o regulă utilă: dacă un casier nou are nevoie de mai mult de câteva secunde de gândire ca să știe în ce categorie caută un produs, structura e prea complicată.\n\nUn pericol frecvent este categoria \"Diverse\" — creată inițial pentru câteva produse care nu se încadrau clar nicăieri, care crește necontrolat în timp până ajunge să conțină zeci de produse fără nicio logică internă de căutare.",
      },
      {
        heading: "Exemplu de structură pentru o cafenea",
        body: "O structură care funcționează pentru majoritatea cafenelelor:\n\n- Cafea caldă (espresso, cappuccino, latte)\n- Cafea rece / frapuccino\n- Ceaiuri\n- Patiserie\n- Produse la pachet (retail — cafea boabe, cești)\n- Altele\n\nOrdinea categoriilor pe ecran contează la fel de mult ca produsele din interior — categoriile cu cel mai mare volum de vânzări ar trebui plasate primele, nu ultimele.",
      },
      {
        heading: "Exemplu pentru un restaurant",
        body: "Pentru un restaurant, structura urmează de obicei fluxul unei mese:\n\n- Aperitive\n- Fel principal\n- Garnituri\n- Deserturi\n- Băuturi\n\nDacă ai și meniuri fixe (meniul zilei), acestea merită o categorie proprie, separată de à la carte, ca ospătarul sau casierul să nu piardă timp căutând printre produsele individuale.",
      },
      {
        heading: "Cum reorganizezi categoriile în franchisetech",
        body: "Din secțiunea **Produse → Categorii**, poți reordona categoriile astfel încât cele mai vândute să apară primele pe ecranul de vânzare.\n\nCategoriile de vânzare (afișate casierului la POS) sunt separate intern de categoriile de gestiune folosite pentru stoc — reorganizarea uneia nu afectează cealaltă, deci poți structura ecranul de vânzare pentru viteză, independent de cum îți organizezi ingredientele în stoc.",
      },
    ],
  },
  {
    slug: "inventar-fizic-vs-scriptic-diferente",
    title: "Inventar fizic vs. scriptic — de unde apar diferențele și cum le corectezi",
    description:
      "Stocul scriptic e ce arată sistemul pe hârtie, stocul fizic e ce numeri pe raft. Diferențele dintre ele nu sunt un mister — au surse concrete. Cum le identifici și le corectezi.",
    publishedAt: "2026-06-14",
    locale: "ro",
    tags: ["stoc","inventar"],
    image: "/marketing/stock-report.png",
    relatedFeature: "/features/stock-management",
    sections: [
      {
        heading: "Ce înseamnă stoc scriptic și stoc fizic",
        body: "Stocul scriptic este cantitatea pe care sistemul o calculează matematic: ce ai primit prin NIR, minus ce ai consumat prin vânzări și rețete, minus scăzămintele înregistrate. Este o cifră teoretică, bazată pe documente.\n\nStocul fizic este ce numeri efectiv pe raft, în frigider sau în depozit, la un moment dat. În teorie, cele două ar trebui să coincidă. În practică, aproape niciodată nu coincid perfect — întrebarea este cât de mare e diferența și de unde vine.",
      },
      {
        heading: "De unde apar, de fapt, diferențele",
        body: "Diferențele dintre stocul fizic și cel scriptic au surse concrete, nu apar din senin:\n\n- **Scăzăminte nereportate** — un produs stricat sau expirat aruncat fără a fi înregistrat ca pierdere\n- **Porții din rețete setate greșit** — rețeta zice 18g cafea, dar barista pune constant 22g\n- **Erori la recepția NIR** — cantitatea introdusă în sistem nu corespunde cu ce a fost livrat efectiv\n- **Consum intern nedocumentat** — o cafea oferită gratuit unui client sau furnizor, fără bon și fără notă de consum\n- **Erori de casă sau furt** — mai rar, dar posibil, mai ales la produse cu valoare mare pe unitate\n\nFiecare din aceste cauze lasă o urmă diferită în tipul de discrepanță — de aceea contează să investighezi produs cu produs, nu doar valoarea totală.",
      },
      {
        heading: "Cum faci un inventar fizic corect",
        body: "Un inventar fizic fiabil urmează câțiva pași simpli, dar respectați riguros:\n\n1. Faci numărătoarea după închiderea zilei sau într-un moment cu vânzări oprite temporar, ca stocul să nu se miște în timpul numărării\n2. Numeri fizic fiecare produs, pe unitatea de măsură corectă (kg, litri, bucăți)\n3. Compari cantitatea numărată cu stocul scriptic afișat de sistem, produs cu produs\n4. Notezi diferența exactă — nu doar valoarea totală, ci și la ce produs apare\n\nUn inventar făcut în grabă, doar cu o estimare vizuală \"cam atât mai e\", nu îți dă cifre pe care te poți baza.",
      },
      {
        heading: "Cum interpretezi diferența",
        body: "O diferență mică și relativ constantă lună de lună (de obicei sub câteva procente din valoarea stocului) este normală — vine din scăzăminte naturale ale produselor perisabile și din mici erori de porționare.\n\nO diferență mare, concentrată la un singur produs sau apărută brusc într-o singură lună, nu este \"normalitate statistică\" — este un semnal specific de investigat: o rețetă greșit configurată, o recepție introdusă eronat sau o problemă de proces care merită găsită, nu ignorată pentru că \"așa se întâmplă\".",
      },
      {
        heading: "Cât de des faci inventar",
        body: "Pentru produsele perisabile cu valoare mare (cafea, carne, lactate), o verificare săptămânală ține diferențele mici și ușor de urmărit la sursă. Pentru un inventar complet, pe toate produsele din gestiune, o dată pe lună este ritmul obișnuit în HoReCa.\n\nUn inventar complet făcut o dată pe an, ca formalitate contabilă, nu ajută operațional — diferențele acumulate timp de 12 luni devin imposibil de atribuit unei cauze precise.",
      },
      {
        heading: "Cum ajută franchisetech",
        body: "Stocul scriptic se calculează automat din NIR, rețete și vânzări înregistrate prin POS, fără introducere manuală separată. Asta înseamnă că diferența constatată la inventarul fizic arată exact ce nu a fost documentat corect în cursul lunii — un scăzământ uitat, o rețetă cu porții greșite — nu o eroare de calcul a sistemului.\n\nBalanța de stoc îți arată intrările și ieșirile pe fiecare produs, deci investigarea unei diferențe mari pornește direct de la datele deja existente, nu de la zero.",
      },
    ],
  },
  {
    slug: "fifo-produse-perisabile-cafenea-restaurant",
    title: "FIFO pentru produse perisabile — cum eviți risipa la cafenea sau restaurant",
    description:
      "FIFO înseamnă că marfa intrată prima este folosită prima. La produsele perisabile, respectarea acestei reguli simple reduce direct risipa și costurile ascunse din scăzăminte.",
    publishedAt: "2026-06-15",
    locale: "ro",
    tags: ["stoc","fifo","risipa"],
    image: "/marketing/stock-report.png",
    relatedFeature: "/features/stock-management",
    sections: [
      {
        heading: "Ce este FIFO și de ce contează la perisabile",
        body: "FIFO (First In, First Out) înseamnă că marfa intrată prima în gestiune este cea folosită prima. Pare evident, dar la produsele perisabile — lapte, frișcă, produse de patiserie, legume, carne proaspătă — abaterea de la această regulă este cea mai frecventă cauză de risipă.\n\nDacă o pungă de lapte livrată luni stă în spatele frigiderului în timp ce se folosește constant punga livrată miercuri, punga de luni expiră neutilizată — deși cantitatea totală de lapte din stoc era suficientă.",
      },
      {
        heading: "Cum se aplică practic în bucătărie sau bar",
        body: "Aplicarea FIFO nu cere echipament special, doar disciplină de organizare:\n\n- La fiecare recepție nouă de marfă, produsele existente se mută în față (sau sus), iar cele noi în spate (sau jos)\n- Produsele fără dată vizibilă pe ambalaj se etichetează manual cu data recepției, la primire\n- Zona de depozitare se organizează astfel încât produsul \"următor de folosit\" să fie mereu cel mai accesibil, nu cel mai greu de ajuns la el\n\nAcești pași durează câteva minute la fiecare livrare, dar previn pierderi care altfel apar tăcut, produs cu produs.",
      },
      {
        heading: "Greșeli frecvente care rup FIFO",
        body: "Cele mai comune motive pentru care FIFO nu se respectă în practică, chiar și acolo unde regula e cunoscută:\n\n- Un angajat grăbit pune cutia nouă direct în față, pentru că e mai aproape de mână în momentul recepției\n- Produsele nu au etichetă de dată vizibilă, deci nu se poate distinge rapid lotul vechi de cel nou\n- Nu există un responsabil clar pentru rotația stocului — \"toată lumea\" înseamnă, în practică, nimeni\n\nNiciuna dintre aceste cauze nu ține de lipsă de spațiu sau de echipament — sunt probleme de proces, ușor de corectat odată identificate.",
      },
      {
        heading: "Legătura dintre FIFO și costul real al risipei",
        body: "O pungă de lapte expirată nefolosită la timp este o pierdere directă — costul acelei pungi. Dar are și un efect ascuns: dacă pierderea nu este documentată ca scăzământ, stocul scriptic rămâne fals mai mare decât realitatea.\n\nLa următorul inventar, diferența apare fără explicație clară, iar rețetele care folosesc lapte cumpărat ulterior par artificial mai scumpe, pentru că prețul de achiziție a crescut între timp și media reală a stocului nu mai reflectă corect costul.",
      },
      {
        heading: "FIFO nu e o funcție de software, e o disciplină de operare",
        body: "Niciun sistem de gestiune nu poate aplica automat FIFO pe raftul fizic — dacă angajații nu respectă rotația stocului la nivel fizic, nicio aplicație nu poate corecta asta de la distanță.\n\nCe poate face sistemul este să îți arate clar, în orice moment, cât stoc ai din fiecare produs și de când — informația pe baza căreia decizia de rotație devine una informată, nu ghicită de fiecare angajat în parte.",
      },
      {
        heading: "Cum ajută franchisetech",
        body: "Stocul curent al fiecărui produs este vizibil oricând din secțiunea de gestiune, actualizat automat la fiecare recepție (NIR) și la fiecare consum din rețete sau vânzări.\n\nOrice produs pierdut prin expirare, dacă este documentat ca scăzământ în momentul în care este aruncat, se scade automat din stoc și apare în rapoarte — astfel risipa reală ajunge vizibilă în cifrele afacerii, în loc să dispară nedocumentată până la următorul inventar fizic.",
      },
    ],
  },
  {
    slug: "pierderi-de-stoc-scazaminte-cum-le-gestionezi",
    title: "Pierderi de stoc (scăzăminte) — cum le documentezi corect",
    description:
      "Un scăzământ este orice pierdere de stoc care nu vine dintr-o vânzare — produs stricat, spart sau expirat. Fără document, stocul scriptic rămâne fals și diferența devine inexplicabilă la inventar.",
    publishedAt: "2026-06-15",
    locale: "ro",
    tags: ["stoc","scazaminte"],
    image: "/marketing/stock-report.png",
    relatedFeature: "/features/stock-management",
    sections: [
      {
        heading: "Ce este un scăzământ",
        body: "Un scăzământ este orice ieșire de stoc care nu vine dintr-o vânzare sau dintr-un consum normal de rețetă: un produs stricat descoperit la deschidere, o sticlă spartă din greșeală, o comandă preparată greșit și aruncată, o probă oferită gratuit unui client.\n\nDiferența față de o vânzare este simplă: la vânzare, marfa iese din stoc și intră bani în casă. La scăzământ, marfa iese din stoc fără nicio încasare corespunzătoare.",
      },
      {
        heading: "De ce trebuie documentat, nu doar aruncat la gunoi",
        body: "Dacă un produs stricat e pur și simplu aruncat, fără nicio înregistrare, stocul scriptic din sistem rămâne mai mare decât cel real. La următorul inventar fizic, apare o diferență fără explicație clară — iar fără document, nu poți spune contabilului dacă acea diferență e un scăzământ normal, o eroare de rețetă sau ceva mai grav.\n\nDin punct de vedere contabil, o pierdere documentată corect poate fi justificată ca atare. O pierdere nedocumentată este, pur și simplu, o discrepanță pe care nimeni nu o poate explica.",
      },
      {
        heading: "Ce trebuie să conțină un document de scăzământ",
        body: "Pentru fiecare scăzământ înregistrat, ai nevoie de:\n\n- Data la care a fost constatată pierderea\n- Produsul și cantitatea exactă\n- Motivul — stricăciune, expirare, spargere, probă oferită, eroare de preparare\n- Persoana care a constatat și înregistrat pierderea\n\nAceste date nu sunt birocrație inutilă — sunt exact ce îți permite, câteva luni mai târziu, să vezi dacă un anumit produs se pierde constant din același motiv și merită investigat la sursă (depozitare, furnizor, proces de preparare).",
      },
      {
        heading: "Scăzăminte normale vs. scăzăminte care ridică semne de întrebare",
        body: "Un procent mic de scăzăminte este normal la orice afacere cu produse perisabile — nu poți evita 100% stricăciunile ocazionale. Ce nu este normal este un scăzământ constant, mare, la același produs, lună de lună.\n\nUn scăzământ repetat la același produs indică de obicei o problemă de proces: porții greșit setate în rețetă, depozitare necorespunzătoare (temperatură greșită), comenzi de aprovizionare prea mari raportat la consumul real. Identificat devreme, se corectează ușor. Ignorat, devine un cost lunar recurent care nu apare nicăieri clar în calculul marjei.",
      },
      {
        heading: "Cum previi scăzămintele frecvente",
        body: "Câteva măsuri practice reduc scăzămintele fără efort mare:\n\n- Verifică regulat temperatura frigiderelor și congelatoarelor — o variație mică, netratată, strică marfă în timp\n- Respectă rotația FIFO la produsele perisabile, ca marfa veche să fie folosită înaintea celei noi\n- Corelează comenzile de aprovizionare cu consumul real, nu cu un obicei fix — supra-comanda produselor perisabile e o cauză directă de scăzăminte\n\nNiciuna dintre aceste măsuri nu elimină complet pierderile, dar le aduce la un nivel previzibil, nu la o surpriză lunară.",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "Un scăzământ se înregistrează ca mișcare de stoc cu motiv explicit și se scade automat din stocul curent al produsului respectiv, la fel de riguros ca o ieșire prin vânzare.\n\nAceastă mișcare apare în balanța cantitativ-valorică alături de consumul din rețete și vânzările directe, deci diferența constatată la inventarul fizic scade semnificativ dacă scăzămintele sunt notate în momentul în care apar, nu reconstituite din memorie luni mai târziu.",
      },
    ],
  },
  {
    slug: "gestiune-ambalaje-stoc-separat-de-materii-prime",
    title: "De ce gestionezi ambalajele separat de materiile prime în stoc",
    description:
      "Paharele, capacele și pungile amestecate cu cafeaua și laptele în aceeași listă de stoc fac aprovizionarea haotică. De ce merită o categorie de gestiune separată pentru ambalaje.",
    publishedAt: "2026-06-15",
    locale: "ro",
    tags: ["stoc","ambalaje"],
    image: "/marketing/stock-report.png",
    relatedFeature: "/features/stock-management",
    sections: [
      {
        heading: "Problema când ambalajele sunt amestecate cu materiile prime",
        body: "Într-o listă de stoc neorganizată, paharele, capacele, pungile și șervețelele apar amestecate cu cafeaua, laptele și făina. Devine greu de urmărit rapid ce se termină primul, iar comenzile de aprovizionare se fac pe ghicite, nu pe baza unei vederi clare.\n\nSimptomul cel mai frecvent: rămâi fără pahare de 250ml într-o vineri seară aglomerată, deși aveai stoc suficient de cafea — pentru că nimeni nu a urmărit separat consumul de ambalaje.",
      },
      {
        heading: "De ce ambalajele se comportă diferit de materiile prime",
        body: "Ambalajele au un tipar de consum și aprovizionare fundamentally diferit de materiile prime:\n\n- **Unitatea de consum e diferită** — nu ai \"150g pahar\", ai \"1 bucată pahar 250ml\" per produs vândut\n- **Furnizorii sunt de obicei diferiți** — materiile prime vin de la un distribuitor alimentar, ambalajele de la un furnizor specializat în packaging\n- **Ritmul de comandă diferă** — ambalajele se comandă de obicei mai rar, dar în cantități mari (cutii de sute sau mii de bucăți), spre deosebire de materiile prime perisabile comandate frecvent, în cantități mici\n\nAmestecate în aceeași listă, aceste diferențe se pierd din vedere.",
      },
      {
        heading: "Cum separi corect în categorii de gestiune",
        body: "Soluția practică este o categorie de gestiune distinctă — de exemplu \"Ambalaje\" — separată complet de \"Materii prime\" sau \"Ingrediente\", chiar dacă ambele apar pe aceeași factură de la un furnizor mixt sau sunt introduse prin același tip de document (NIR).\n\nAceastă separare este internă, la nivel de gestiune a stocului — nu afectează categoriile afișate casierului pe ecranul de vânzare, care rămân organizate după cu totul altă logică (viteza la casă, nu tipul de resursă).",
      },
      {
        heading: "Ambalajele tot intră în rețete și în cost",
        body: "O greșeală frecventă: rețetele includ ingredientele (cafea, lapte, sirop), dar uită ambalajul. Rezultatul e un cost per porție subestimat — pare că un cappuccino la pachet costă doar cafeaua și laptele, deși paharul și capacul adaugă un cost real.\n\nUn exemplu concret: pahar + capac de unică folosință costă în jur de 0.30-0.40 lei per unitate. Pare neglijabil per produs, dar cumulat pe câteva sute de vânzări lunare la pachet, devine o sumă relevantă în calculul marjei reale.",
      },
      {
        heading: "Greșeli frecvente la gestiunea ambalajelor",
        body: "Cele mai comune probleme întâlnite la ambalaje, comparativ cu materiile prime alimentare:\n\n- Ambalaje cumpărate cu un bon simplu de la un magazin en-gros, uitate să fie introduse în gestiune prin NIR\n- Lipsa alertelor de stoc minim la ambalaje, considerate greșit \"mai puțin importante\" decât ingredientele alimentare\n- Comenzi de ambalaje făcute reactiv, abia când se observă vizual că stocul e pe terminate, nu pe baza unui prag calculat\n\nUn stoc de ambalaje gestionat la fel de riguros ca materiile prime elimină aceste surprize.",
      },
      {
        heading: "Cum se configurează în franchisetech",
        body: "Categoriile de gestiune (folosite pentru organizarea stocului) sunt complet separate de categoriile afișate la vânzare pe POS. Poți crea o categorie de gestiune \"Ambalaje\", distinctă de \"Ingrediente\", fiecare cu propriile praguri de stoc minim și propriile alerte.\n\nAceastă separare nu complică ecranul de vânzare al casierului — el continuă să vadă doar categoriile de produse de vândut, în timp ce tu, din partea de gestiune, urmărești ambalajele și materiile prime ca fluxuri distincte.",
      },
    ],
  },
  {
    slug: "gestiune-stoc-multi-locatie-cum-eviti-haosul",
    title: "Gestiunea stocului pe mai multe locații — cum eviți haosul",
    description:
      "Cu două sau trei locații, fiecare cu ritmul ei de vânzare și livrări proprii, stocul devine rapid haotic fără o vedere unificată. Ce trebuie centralizat și ce rămâne la nivel local.",
    publishedAt: "2026-06-16",
    locale: "ro",
    tags: ["stoc","multi-locatie"],
    image: "/marketing/industry-restaurant.png",
    relatedFeature: "/features/stock-management",
    sections: [
      {
        heading: "De ce stocul pe mai multe locații devine haos rapid",
        body: "Cu o singură locație, chiar și un stoc gestionat imperfect rămâne vizibil pentru proprietar — el vede direct raftul. Cu două sau trei locații, fiecare cu propriul ritm de vânzare, propriile livrări și adesea propriul manager, această vizibilitate directă dispare.\n\nFără o vedere unificată, proprietarul nu mai știe dacă lipsa de cafea semnalată de locația 2 e o problemă reală de aprovizionare sau doar o cifră introdusă greșit într-un Excel separat, ținut diferit la fiecare locație.",
      },
      {
        heading: "Probleme specifice care apar doar la multi-locație",
        body: "Câteva probleme nu există la o singură locație, dar apar constant la mai multe:\n\n- **Transferuri de marfă nedocumentate** — cineva ia o cutie de cafea de la locația A la locația B \"pentru azi\", fără nicio hârtie, iar stocul ambelor locații devine incorect\n- **Rețete care diferă ușor între locații** — aceeași cafea, dar porții diferite pentru că fiecare barista are propriul obicei, necorelat cu rețeta standard\n- **Comenzi duplicate la furnizor** — fiecare manager comandă separat, fără să știe ce are deja celălalt, ceea ce umflă costurile de stoc general al afacerii\n\nAceste probleme nu se rezolvă prin mai multă comunicare verbală — se rezolvă prin documentare consecventă.",
      },
      {
        heading: "Cum documentezi corect un transfer între locații",
        body: "Cea mai sigură practică este să tratezi orice transfer de marfă între locații ca pe două mișcări documentate: o ieșire de stoc la locația sursă și o intrare (echivalentul unui NIR intern) la locația destinație.\n\nChiar dacă acest lucru se face manual — o notă scrisă cu cantitatea și motivul transferului — este esențial ca ambele locații să reflecte corect mișcarea. Fără document, stocul ambelor locații devine nesigur, iar diferențele la inventar devin imposibil de atribuit unei cauze clare.",
      },
      {
        heading: "Ce trebuie centralizat vs. ce rămâne local",
        body: "Nu toate deciziile de stoc trebuie luate la nivel central, dar câteva elemente merită unificate:\n\n**Centralizat, la nivel de organizație:**\n- Rețetele — un cappuccino trebuie să coste la fel, indiferent de locație\n- Furnizorii și prețurile de achiziție negociate\n- Raportarea consolidată către contabil\n\n**Local, la nivel de fiecare locație:**\n- Nivelul de stoc fizic curent\n- Pragurile de alertă de stoc minim — fiecare locație vinde în ritm diferit, deci pragul universal nu funcționează\n\nAmestecul greșit — reguli locale pentru rețete sau prețuri centralizate pentru stocul fizic — este exact sursa haosului multi-locație.",
      },
      {
        heading: "Semnul clar că ai nevoie de un sistem unificat, nu Excel separat",
        body: "Câteva semnale că gestiunea actuală pe mai multe locații nu mai funcționează:\n\n- Proprietarul află de o lipsă de stoc doar când managerul locației sună disperat\n- Rapoartele lunare durează ore întregi să fie compilate manual din fișiere separate per locație\n- Nimeni nu poate răspunde rapid la întrebarea simplă \"cât stoc de cafea avem în total, pe toate locațiile\"\n\nDacă oricare dintre aceste situații se întâmplă des, problema nu mai e organizatorică — e o problemă de infrastructură de gestiune.",
      },
      {
        heading: "Cum abordează franchisetech multi-locația",
        body: "Fiecare locație (site) își are propriile sesiuni de vânzare și tranzacții urmărite separat, deci poți vedea clar performanța fiecărei locații individual. Rețetele și prețurile de achiziție sunt comune la nivel de organizație, astfel încât un produs costă la fel indiferent de locația în care e vândut.\n\nPentru transferurile de marfă între locații, cea mai sigură practică rămâne documentarea explicită a fiecărei mișcări — nu presupunerea că stocul \"se echilibrează singur\" între locații fără nicio urmă scrisă.",
      },
    ],
  },
  {
    slug: "alerte-stoc-minim-cum-le-setezi-corect",
    title: "Alerte de stoc minim — cum le setezi ca să nu rămâi fără ingrediente",
    description:
      "Un prag de alertă setat greșit e la fel de inutil ca lipsa lui — fie afli prea târziu, fie ignori alertele constante. Cum calculezi pragul corect pentru fiecare produs, nu unul universal.",
    publishedAt: "2026-06-16",
    locale: "ro",
    tags: ["stoc","alerte"],
    image: "/marketing/stock-report.png",
    relatedFeature: "/features/stock-management",
    sections: [
      {
        heading: "Ce se întâmplă când pragul de alertă e setat greșit",
        body: "Un prag de alertă prea mic te avertizează prea târziu — ajungi cu doar câteva căni de lapte rămase exact în ziua în care ar fi trebuit deja să fi trimis comanda către furnizor.\n\nUn prag prea mare are efectul opus: primești alerte constante pentru produse care, de fapt, au încă stoc suficient pentru câteva zile. Rezultatul practic este că angajații încep să ignore alertele în general, inclusiv pe cele care chiar contează — exact fenomenul \"strigătul la lup\" aplicat gestiunii de stoc.",
      },
      {
        heading: "Formula corectă, aplicată per produs, nu universal",
        body: "Pragul de stoc minim se calculează astfel:\n\n**Stoc minim = Consum zilnic mediu × Zile până la livrare + buffer de siguranță (aproximativ 20%)**\n\nExemplu pentru cafea boabe: consum mediu 500g/zi, livrare în 2 zile de la comandă → stoc minim = 500g × 2 × 1.2 = 1.200g.\n\nGreșeala frecventă este să aplici aceeași cifră (de exemplu \"seteaz-o la 5\") la toate produsele, indiferent de cât de repede se consumă sau cât de des vine livrarea. Fiecare produs are propriul ritm — pragul trebuie calculat individual.",
      },
      {
        heading: "Produsele care au nevoie de un prag diferit de restul",
        body: "Nu toate produsele urmează aceeași logică de prag:\n\n- Produsele cu livrare rară (furnizor care vine o dată pe săptămână) au nevoie de un buffer mai mare, pentru că o comandă întârziată cu o zi înseamnă o săptămână întreagă fără stoc suplimentar disponibil\n- Produsele perisabile (lapte proaspăt, de exemplu) nu pot avea stoc mare \"de rezervă\" fără riscul să expire — pentru ele, pragul trebuie orientat spre comenzi mai frecvente, în cantități mai mici, nu spre un buffer generos\n\nAplicarea aceleiași formule fără aceste ajustări duce fie la risipă, fie la lipsuri repetate.",
      },
      {
        heading: "Cine trebuie să vadă alerta și ce face cu ea",
        body: "O alertă de stoc minim e utilă doar dacă ajunge la cineva cu responsabilitate clară de a acționa — de obicei managerul de tură sau proprietarul, nu \"toată echipa\", care în practică înseamnă nimeni în particular.\n\nDacă alerta apare pe un ecran pe care nimeni nu-l verifică zilnic, sau dacă responsabilitatea de a trimite comanda nu e clar atribuită unei persoane, alerta devine doar o notificare ignorată, indiferent cât de bine e calculat pragul.",
      },
      {
        heading: "Revizuirea pragurilor — nu le setezi o dată și uiți",
        body: "Un prag calculat corect în ianuarie poate fi greșit în iulie. Câțiva factori care schimbă pragul corect în timp:\n\n- Sezonalitatea — vara crește consumul de gheață și limonadă, iarna crește consumul de ceai și cacao\n- Schimbări de meniu — un produs nou care folosește un ingredient existent îi crește brusc rata de consum\n- Schimbarea furnizorului — un timp de livrare diferit (mai lung sau mai scurt) schimbă direct formula de calcul\n\nO revizuire a pragurilor la fiecare câteva luni, nu doar la configurarea inițială, ține alertele relevante pe termen lung.",
      },
      {
        heading: "Cum le setezi corect în franchisetech",
        body: "Stocul minim se setează per produs, din **Stoc → Produse → Stoc minim**. Alerta apare automat în dashboard imediat ce stocul scade sub pragul respectiv, calculat în timp real la fiecare vânzare sau consum din rețetă — nu necesită verificare manuală zilnică.\n\nRecomandarea practică: revizuiește pragurile lunar, nu doar o dată la configurarea inițială a contului, mai ales pentru produsele sezoniere sau pentru cele afectate de schimbări recente de meniu ori de furnizor.",
      },
    ],
  },
  {
    slug: "stoc-materii-prime-vs-produse-finite-diferenta",
    title: "Stoc de materii prime vs. produse finite — ce diferență contează",
    description:
      "Diferența dintre materii prime și produse finite în gestiunea stocului — de ce separarea lor corectă îți dă costuri reale și rapoarte fiabile la cafenea sau restaurant.",
    publishedAt: "2026-06-17",
    locale: "ro",
    tags: ["stoc","materii-prime"],
    image: "/marketing/stock-report.png",
    relatedFeature: "/features/stock-management",
    sections: [
      {
        heading: "Ce înseamnă, în practică, fiecare tip de stoc",
        body: "Materiile prime sunt ingredientele așa cum le cumperi de la furnizor: făină în saci de 25 kg, unt la cutie, cafea boabe la sac de 1 kg, lapte la bax de 12 litri. Le ții în stoc pe unități de măsură — kg, litri, bucăți — și prețul lor vine direct din factură sau NIR.\n\nProdusele finite sunt ce rezultă după preparare și ajung la client: un croissant copt, un cappuccino, o felie de tort. Nu le cumperi — le produci din materii prime, conform unei rețete, iar stocul lor se măsoară de obicei în bucăți sau porții.\n\nÎntre ele mai există o categorie pe care multe afaceri o ignoră: semifabricatele. Aluatul de foietaj pregătit dimineața pentru toată ziua, sosul de casă făcut în avans, siropul de cafea preparat săptămânal — sunt produse din materii prime, dar nu sunt încă produsul final vândut clientului.",
      },
      {
        heading: "De ce contează să le separi în gestiune",
        body: "Dacă urmărești stocul doar la nivel de produse finite (câte croissante ai copt azi), nu vezi niciodată câtă făină, unt sau ciocolată consumi real — și nu poți verifica dacă rețeta este respectată sau dacă cineva pune mai mult unt decât ar trebui.\n\nDacă urmărești stocul doar la nivel de materii prime (câtă făină mai ai în depozit), nu știi care produse din meniu sunt profitabile și care te costă bani la fiecare vânzare.\n\nAi nevoie de ambele niveluri, legate printr-o rețetă: materia primă intră în gestiune prin NIR, rețeta descrie cât consumă fiecare produs finit, iar vânzarea scade automat materia primă din stoc pe baza rețetei — nu produsul finit tratat ca o linie separată și necorelată.",
      },
      {
        heading: "Exemplu concret — un croissant cu ciocolată",
        body: "Rețeta unui croissant cu ciocolată la o patiserie mică:\n\n- Făină 45g → 45g × 4,2 lei/kg = 0,19 lei\n- Unt 30g → 30g × 32 lei/kg = 0,96 lei\n- Ciocolată 15g → 15g × 38 lei/kg = 0,57 lei\n- Drojdie, zahăr, ou pentru uns: 0,25 lei\n- Ambalaj (pungă hârtie): 0,15 lei\n\n**Cost total materii prime: 2,12 lei**\n\nÎn stoc ai două lucruri diferite: cantitatea de făină, unt și ciocolată rămasă în depozit (materie primă, în kg) și numărul de croissante coapte disponibile la vitrină (produs finit, în bucăți). Dacă vinzi croissantul cu 9 lei, marja brută este 6,88 lei — dar cifra există doar dacă ai calculat costul din materia primă, nu doar ai numărat bucățile vândute.",
      },
      {
        heading: "Greșeli frecvente când cele două se amestecă",
        body: "- **Introducerea produsului finit direct în stoc, fără rețetă** — adaugi 20 de croissante în stoc dimineața, dar nu există nicio legătură cu câtă făină sau unt s-a consumat real\n- **Unități de măsură inconsistente** — făina apare uneori în kg, alteori în «pachete», ceea ce strică orice calcul automat\n- **Semifabricatele netratate ca stoc separat** — aluatul pregătit cu o zi înainte dispare din evidență între momentul preparării și momentul coacerii\n- **Inventariere doar la produsul finit** — numeri croissantele rămase, dar nu verifici niciodată dacă stocul de făină din sistem corespunde cu ce ai fizic în depozit",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "În franchisetech, materiile prime intră în gestiune prin NIR — cu unitate de măsură, preț și furnizor. Rețetele leagă fiecare produs finit de cantitățile exacte de materie primă consumate la o porție.\n\nCând vinzi un croissant prin POS, sistemul scade automat 45g de făină, 30g de unt și 15g de ciocolată din stocul de materii prime — nu doar «un croissant» dintr-o listă separată. Rapoartele de stoc arată ambele niveluri: câtă materie primă mai ai în depozit și câte porții din fiecare produs mai poți produce cu stocul actual.",
      },
    ],
  },
  {
    slug: "transfer-stoc-intre-locatii-cum-il-documentezi",
    title: "Transfer de stoc între locații — cum îl documentezi corect",
    description:
      "Cum documentezi corect un transfer de stoc între două locații: ce trebuie să conțină bonul de transfer și de ce un mesaj pe WhatsApp nu este suficient pentru contabilitate.",
    publishedAt: "2026-06-17",
    locale: "ro",
    tags: ["stoc","transfer","multi-locatie"],
    image: "/marketing/industry-restaurant.png",
    relatedFeature: "/features/stock-management",
    sections: [
      {
        heading: "Când apare nevoia de transfer între locații",
        body: "O cafenea cu două locații are frecvent acest scenariu: locația din centru rămâne fără sirop de vanilie sâmbătă la prânz, în timp ce locația din cartier mai are patru sticle nedeschise. În loc să aștepți o comandă nouă de la furnizor, care poate dura una-două zile, muți stocul dintr-o locație în alta.\n\nAcelași lucru se întâmplă cu marfa perisabilă — lapte, frișcă, brânză proaspătă — când o locație a comandat prea mult și cealaltă riscă să rămână fără. Transferul între locații este normal și util. Problema apare când nu este documentat corect.",
      },
      {
        heading: "Ce trebuie să conțină un bon de transfer corect",
        body: "- **Data și ora transferului**\n- **Locația sursă și locația destinație**\n- **Produsele transferate** — denumire, unitate de măsură, cantitate\n- **Valoarea transferată** — pe baza costului de achiziție al produsului\n- **Persoana responsabilă la fiecare locație** — cine a scos marfa, cine a confirmat primirea\n\nFără aceste date, stocul din sistem al fiecărei locații rămâne nesincronizat cu realitatea fizică — locația sursă arată mai multă marfă decât are, locația destinație mai puțină decât a primit.",
      },
      {
        heading: "De ce un mesaj pe grupul de WhatsApp nu e suficient",
        body: "«I-am trimis lui Andrei 5 kg de cafea, notează el la el» este cea mai frecventă formă de transfer nedocumentat — și cea mai ușor de uitat până la inventariere. Câteva luni mai târziu, la inventarul general, locația sursă are un minus de 5 kg de cafea pe care nimeni nu-l poate explica, iar locația destinație are un surplus similar, nejustificat prin niciun document.\n\nContabilul nu poate justifica o diferență de stoc între locații pe baza unei conversații. La un control, o discrepanță nedocumentată între gestiunile a două puncte de lucru ale aceleiași firme ridică întrebări pe care un simplu mesaj nu le rezolvă.",
      },
      {
        heading: "Exemplu concret de înregistrare",
        body: "Locația Centru transferă către locația Nord 5 kg de cafea boabe, cost de achiziție 46 lei/kg.\n\n- Cantitate transferată: 5 kg\n- Valoare transferată: 5 × 46 = **230 lei**\n- Stoc locație Centru: scade cu 5 kg (și cu 230 lei valoare)\n- Stoc locație Nord: crește cu 5 kg (și cu 230 lei valoare)\n\nAmbele locații trebuie să reflecte mișcarea în aceeași zi, cu aceeași valoare — altfel balanța cantitativ-valorică pe fiecare gestiune nu se închide corect la finalul lunii.",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "Pentru afacerile cu mai multe locații, franchisetech are un modul dedicat de transfer intern de stoc. Alegi locația sursă și locația destinație, selectezi produsul și cantitatea, iar sistemul generează automat bonul de transfer cu valoarea calculată din costul de achiziție curent.\n\nStocul ambelor locații se actualizează instant — locația sursă scade, locația destinație crește, fără să introduci nimic manual de două ori. Istoricul transferurilor rămâne vizibil per locație, util atât pentru inventariere, cât și pentru contabil la închiderea lunii.",
      },
    ],
  },
  {
    slug: "stoc-negativ-cauze-si-solutii",
    title: "Stoc negativ în sistem — de unde apare și cum îl repari",
    description:
      "De unde apare stocul negativ în sistemul de gestiune, care sunt cauzele frecvente și pașii concreți prin care îl corectezi înainte de inventariere sau control fiscal.",
    publishedAt: "2026-06-17",
    locale: "ro",
    tags: ["stoc","stoc-negativ"],
    image: "/marketing/stock-report.png",
    relatedFeature: "/features/stock-management",
    sections: [
      {
        heading: "Ce înseamnă stoc negativ și de ce e un semnal de alarmă",
        body: "Stocul negativ apare când sistemul arată o cantitate sub zero pentru un produs — de exemplu -1,3 kg de brânză, deși fizic nu poți avea mai puțin de zero brânză în frigider. Nu este o eroare de afișare: înseamnă că, undeva în lanțul rețetă → vânzare → NIR, s-a scăzut mai multă marfă decât a intrat efectiv în gestiune.\n\nUn stoc negativ nu se repară singur. Dacă îl ignori, fiecare vânzare ulterioară a produsului respectiv adâncește diferența, iar la inventarierea fizică vei găsi o discrepanță pe care nu o mai poți reconstitui exact — nu mai știi din ce zi vine eroarea.",
      },
      {
        heading: "Cele mai frecvente cauze",
        body: "- **Rețetă cu cantități greșite** — reteta din sistem cere 120ml lapte, dar barista toarnă real 160ml la fiecare băutură\n- **Produs vândut fără rețetă configurată** — un produs nou apare în POS înainte ca rețeta lui să fie completă, deci sistemul nu scade nimic din materia primă la vânzare, iar stocul afișat rămâne fals de mare până se corectează\n- **NIR introdus cu întârziere** — marfa a ajuns fizic luni, dar NIR-ul e emis abia joi; între timp, vânzările au scăzut deja din stocul vechi, care ajunge negativ înainte ca noua cantitate să fie înregistrată\n- **Stoc inițial introdus greșit** — la configurare, cantitatea de start a fost estimată, nu numărată fizic\n- **Pierdere sau consum nedocumentat** — produs stricat, aruncat sau folosit greșit, fără o notă de ajustare de stoc",
      },
      {
        heading: "Exemplu concret cum se acumulează diferența",
        body: "O cafenea are în rețeta de cappuccino 150ml lapte per porție. Real, baristul toarnă în medie 180ml — o diferență de 20% la fiecare băutură.\n\nDacă vinzi 60 de cappuccino pe zi:\n\n- Consum conform rețetei: 60 × 150ml = 9 litri/zi\n- Consum real: 60 × 180ml = 10,8 litri/zi\n- Diferență: 1,8 litri/zi nejustificați în sistem\n\nÎn 10 zile, stocul de lapte din sistem arată cu 18 litri mai mult decât ai fizic — suficient ca, la o comandă de aprovizionare calculată pe baza sistemului, să rămâi fără lapte mai devreme decât te aștepți, sau ca stocul să treacă în negativ dacă pornești de la o cantitate deja mică.",
      },
      {
        heading: "Cum îl repari",
        body: "1. **Faci o inventariere fizică** a produsului afectat — numeri sau cântărești exact ce ai\n2. **Corectezi stocul din sistem** la valoarea reală, cu o notă de ajustare care explică diferența (nu doar o suprascriere silențioasă)\n3. **Verifici rețeta** — cantitățile din rețetă corespund cu ce se prepară real? Dacă nu, actualizezi rețeta\n4. **Verifici NIR-urile din perioada respectivă** — există recepții de marfă introduse cu întârziere sau omise complet?\n5. **Documentezi cauza** pentru contabil — o ajustare de stoc fără explicație ridică aceleași întrebări ca un transfer nedocumentat",
      },
      {
        heading: "Cum previi stocul negativ pe viitor",
        body: "În franchisetech, rapoartele de stoc semnalează vizual produsele cu cantitate negativă, ca să nu treacă neobservate până la inventarierea generală. Recalibrarea unei rețete (dacă porția reală diferă de cea configurată) se face o singură dată, iar toate vânzările ulterioare scad cantitatea corectă.\n\nDisciplina care contează cel mai mult: NIR-ul se introduce în ziua recepției, nu «mai târziu, când am timp». Un stoc negativ este aproape întotdeauna semnul unei rețete nerealiste sau al unui NIR întârziat — rareori al unui furt, deși merită verificat și acest scenariu dacă diferențele sunt mari și repetate.",
      },
    ],
  },
  {
    slug: "gestiune-stoc-sezonier-cafenea",
    title: "Gestiunea stocului sezonier la o cafenea — vară vs. iarnă",
    description:
      "Cum ajustezi stocul minim de la vară la iarnă la o cafenea, ce ingrediente variază sezonier și cum eviți atât lipsa de marfă, cât și stocul rămas nevândut la final de sezon.",
    publishedAt: "2026-06-18",
    locale: "ro",
    tags: ["stoc","sezonier","cafenea"],
    image: "/marketing/industry-cafe.png",
    relatedFeature: "/features/stock-management",
    sections: [
      {
        heading: "De ce se schimbă radical consumul între sezoane",
        body: "O cafenea care vinde predominant băuturi calde iarna și băuturi reci vara nu are doar un meniu diferit — are un consum de materii prime complet diferit, chiar dacă multe produse rămân aceleași în listă. Gheața, care iarna e aproape neglijabilă, poate deveni unul dintre cele mai consumate «ingrediente» vara, la frappe și limonade.\n\nDacă stocul minim de reaprovizionare rămâne setat la valoarea calculată în ianuarie, în iulie te trezești constant cu alerte false sau, mai rău, fără gheață și fără siropuri de vară în weekendul cu cea mai mare afluență din an.",
      },
      {
        heading: "Ce crește și ce scade pe sezon",
        body: "**Vara — crește consumul de:**\n- Gheață cuburi (pentru frappe, ice latte, limonade)\n- Lămâie, mentă proaspătă\n- Siropuri de fructe (căpșuni, piersică, fructul pasiunii)\n- Pahare reci și paie biodegradabile\n\n**Iarna — crește consumul de:**\n- Lapte (pentru băuturi calde: cappuccino, ciocolată caldă, latte)\n- Cacao, scorțișoară, ciocolată pentru topping\n- Pahare termorezistente\n- Miere, sirop de vanilie pentru băuturi calde îndulcite\n\nCafeaua boabe rămâne relativ constantă tot anul, dar cantitatea per băutură poate varia — băuturile reci de vară folosesc adesea o doză dublă de espresso pentru a compensa diluarea cu gheață.",
      },
      {
        heading: "Cum ajustezi stocul minim de reaprovizionare pe sezon",
        body: "Formula rămâne aceeași — Stoc minim = Consum zilnic mediu × Zile până la livrare + Buffer — dar consumul zilnic mediu se recalculează sezonier, nu rămâne fix tot anul.\n\nExemplu pentru gheață cuburi la o cafenea cu terasă:\n\n- **Iarnă:** consum mediu 3 kg/zi, livrare în 2 zile, buffer 20% → stoc minim = 3 × 2 × 1,2 = **7,2 kg**\n- **Vară:** consum mediu 18 kg/zi (weekend-uri cu terasă plină), aceeași livrare → stoc minim = 18 × 2 × 1,2 = **43,2 kg**\n\nDacă rămâi cu pragul de iarnă în plin sezon de vară, alerta de reaprovizionare vine mult prea târziu — comanda ajunge după ce ai rămas deja fără gheață un weekend întreg.",
      },
      {
        heading: "Capcana stocului sezonier rămas nevândut",
        body: "Riscul opus e la fel de costisitor: siropul de mentă-lime comandat în cantitate mare pentru vară, care rămâne pe raft în septembrie, când cererea scade brusc. Multe siropuri și concentrate au termen de valabilitate limitat după deschidere — un stoc mare rămas nevândut la finalul sezonului se transformă direct în pierdere.\n\nRegula practică: comenzi mai dese și în cantități mai mici pe măsură ce sezonul se apropie de final, în loc de o comandă mare «de rezervă» la începutul lui. Urmărești consumul real săptămânal și ajustezi comanda următoare, nu presupui că vinzi la fel de mult în ultima săptămână de sezon ca în prima.",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "Stocul minim per produs din franchisetech nu este fixat permanent — îl poți ajusta oricând din **Stoc → Produse → Stoc minim**, iar sistemul folosește noua valoare imediat pentru alerte. La tranziția de sezon, actualizezi pragurile pentru gheață, siropuri și lapte în câteva minute.\n\nIstoricul de consum pe perioade te ajută să vezi exact câtă gheață sau câte siropuri ai consumat în aceeași săptămână anul trecut, ca reper pentru comanda din sezonul curent — în loc să estimezi din memorie.",
      },
    ],
  },
  {
    slug: "cum-alegi-furnizorii-pentru-cafenea-mica",
    title: "Cum alegi furnizorii potriviți pentru o cafenea mică",
    description:
      "Criterii practice pentru alegerea furnizorilor unei cafenele mici — de la consistența calității la livrare și facturare — plus semnalele de alarmă la un furnizor nou.",
    publishedAt: "2026-06-18",
    locale: "ro",
    tags: ["stoc","furnizori"],
    image: "/marketing/industry-cafe.png",
    relatedFeature: "/features/purchases-suppliers",
    sections: [
      {
        heading: "Ce contează cu adevărat, nu doar prețul de listă",
        body: "Prețul per kilogram este ce vezi primul pe oferta unui furnizor, dar nu e criteriul care te doare cel mai mult pe termen lung. Pentru o cafenea mică, cinci lucruri contează mai mult decât diferența de 2-3 lei/kg între doi furnizori de cafea:\n\n- **Consistența calității** — cafeaua din lotul 5 are același gust ca din lotul 1?\n- **Frecvența și fiabilitatea livrării** — livrează în ziua promisă sau «pe undeva săptămâna asta»?\n- **Cantitatea minimă de comandă** — poți comanda 5 kg sau ești obligat la 25 kg pentru prețul bun?\n- **Documente la zi** — factură și aviz corecte, la timp, nu «vin săptămâna viitoare»\n- **Flexibilitate la variații** — poți comanda mai puțin într-o săptămână mai slabă fără penalizări?",
      },
      {
        heading: "Semnale de alarmă la un furnizor nou",
        body: "- **Nu poate oferi factură sau aviz de expediție la livrare** — fără documente, nu poți face NIR corect, iar marfa nu poate intra legal în gestiune\n- **Prețul se schimbă fără preaviz** — comanzi la un preț, primești factura cu alt preț, fără nicio comunicare în avans\n- **Livrare inconsistentă în timp** — prima comandă vine perfect, a treia vine cu o zi întârziere fără explicație\n- **Fără istoric verificabil** — nu are alți clienți HoReCa pe care să-i poți întreba despre experiență\n- **Presiune pentru comandă mare de la început** — un furnizor serios te lasă să testezi cu o comandă mică înainte să te «lege» de o cantitate mare",
      },
      {
        heading: "Cum negociezi fără volum mare de comandă",
        body: "O cafenea cu o singură locație nu are pârghia de negociere a unui lanț cu 20 de puncte de lucru — dar tot poți obține condiții rezonabile:\n\n1. **Cere prețul pentru cantitatea ta reală**, nu pentru cantitatea la care furnizorul speră să crești — un preț «de volum» pe care nu-l atingi niciodată nu ajută la nimic\n2. **Negociază frecvența, nu doar prețul** — livrare săptămânală fixă, în aceeași zi, e mai valoroasă decât o reducere de 3% cu livrare imprevizibilă\n3. **Cere o perioadă de probă** — o lună la preț standard, fără angajament pe termen lung, ca să verifici constanța calității\n4. **Compară costul total, nu doar prețul unitar** — un furnizor mai scump per kg, dar cu livrare gratuită și fără cantitate minimă, poate ieși mai ieftin per lună decât unul «ieftin» cu transport taxat separat",
      },
      {
        heading: "Cum testezi un furnizor nou fără să riști tot meniul",
        body: "Nu schimba dintr-o dată furnizorul pentru toate ingredientele principale. Testează pe un singur produs, la o comandă mică, și urmărește trei lucruri timp de 3-4 săptămâni:\n\n- **Calitatea rămâne constantă** de la o livrare la alta, nu doar la prima impresie\n- **Livrarea respectă ziua și cantitatea comandată**, fără livrări parțiale nejustificate\n- **Facturarea e corectă** — prețul de pe factură corespunde cu ce ai discutat, fără produse adăugate pe care nu le-ai comandat\n\nAbia după ce aceste trei lucruri se confirmă constant, mută și restul comenzilor la noul furnizor.",
      },
      {
        heading: "Legătura cu gestiunea stocului",
        body: "Un furnizor bun, dar fără disciplină documentară, tot îți creează probleme în gestiune — chiar dacă marfa e de calitate. Fiecare recepție are nevoie de NIR emis la timp, cu prețul corect, ca stocul și costul rețetelor să reflecte realitatea.\n\nÎn franchisetech, fiecare NIR este legat de furnizorul de la care a venit marfa, iar istoricul de prețuri per furnizor rămâne vizibil — poți vedea rapid dacă un furnizor și-a crescut prețurile constant în ultimele luni, un semnal util atât pentru negociere, cât și pentru decizia de a căuta alternative.",
      },
    ],
  },
  {
    slug: "receptie-marfa-fara-factura-ce-faci",
    title: "Recepția mărfii fără factură — ce faci și cum regularizezi ulterior",
    description:
      "Ce faci când marfa ajunge fără factură: cum înregistrezi recepția pe bază de aviz de expediție și cum regularizezi documentul când factura sosește de la furnizor.",
    publishedAt: "2026-06-19",
    locale: "ro",
    tags: ["stoc","nir","furnizori"],
    image: "/marketing/stock-report.png",
    relatedFeature: "/features/nir",
    sections: [
      {
        heading: "Situația: marfa a ajuns, factura nu",
        body: "Furnizorul de legume proaspete livrează marfa dimineața, la ora la care ai nevoie de ea pentru meniul zilei, dar factura ajunge pe email abia a doua zi sau la finalul săptămânii, când se centralizează facturile pe o perioadă. Este o practică obișnuită la mulți furnizori mici și mijlocii din HoReCa.\n\nProblema nu este întârzierea facturii în sine — este ce faci în intervalul dintre recepția fizică și primirea documentului. Marfa nu poate sta «în afara sistemului» până apare factura, pentru că între timp o și consumi sau o vinzi.",
      },
      {
        heading: "Ce faci în ziua recepției",
        body: "Recepția se documentează la data fizică a primirii mărfii, indiferent dacă factura a sosit sau nu. Ai două variante uzuale:\n\n- **Dacă furnizorul lasă aviz de expediție** — faci NIR pe baza avizului, cu prețurile agreate în comandă sau din ultima factură similară\n- **Dacă nu există niciun document la livrare** — verifici cu furnizorul cantitatea și prețul comandat (telefonic, email sau comandă scrisă în avans) și faci NIR cu prețul estimat, marcat clar ca provizoriu\n\nÎn ambele cazuri, marfa intră în gestiune la data recepției, nu la data facturii — asta este regula de bază pentru orice document de recepție în contabilitatea românească.",
      },
      {
        heading: "Cum regularizezi când factura sosește",
        body: "Când factura ajunge, o compari linie cu linie cu NIR-ul deja emis:\n\n1. **Cantitățile coincid?** Dacă nu, verifici dacă a fost o livrare parțială sau o eroare de numărare la recepție\n2. **Prețurile coincid?** Dacă furnizorul a facturat un preț diferit de cel estimat, ajustezi valoarea NIR-ului la prețul real din factură\n3. **Referința facturii se atașează la NIR** — pentru trasabilitate completă între documentul de recepție și documentul fiscal\n\nDacă diferența de preț este semnificativă, costul rețetelor care folosesc materia primă respectivă se recalculează automat cu prețul corect — o diferență ignorată la o singură recepție poate distorsiona marja calculată pentru zile întregi.",
      },
      {
        heading: "Ce nu ai voie să faci",
        body: "Nu ai voie să folosești sau să vinzi marfa fără nicio urmă documentară în gestiune, doar pentru că «vine factura mai târziu». Fără NIR, marfa nu există oficial în stoc — orice ieșire ulterioară prin vânzare sau consum rămâne nejustificată.\n\nLa un control neanunțat, marfa aflată fizic în bucătărie sau depozit dar absentă din sistemul de gestiune ridică exact tipul de întrebare la care nu vrei să răspunzi pe loc: de unde vine, cine a adus-o, de ce nu apare nicăieri înregistrată.",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "În franchisetech, poți emite un NIR pe baza avizului de expediție sau a comenzii, cu prețuri estimate, și îl marchezi pentru regularizare ulterioară. Când factura sosește, deschizi NIR-ul existent, atașezi referința facturii și ajustezi prețurile dacă e cazul — nu creezi un document nou, corectezi pe cel deja emis.\n\nStocul rămâne corect din prima zi, iar costul rețetelor se actualizează automat dacă prețul final diferă de estimarea inițială. Contabilul primește, la final, un NIR complet cu referință clară la factura aferentă.",
      },
    ],
  },
  {
    slug: "cum-stabilesti-pretul-unui-produs-nou-in-meniu",
    title: "Cum stabilești prețul unui produs nou înainte să-l pui în meniu",
    description:
      "Pașii corecți pentru a stabili prețul unui produs nou de meniu: cost rețetă, marjă țintă și praguri psihologice de preț, cu exemplu complet de calcul în lei.",
    publishedAt: "2026-06-19",
    locale: "ro",
    tags: ["retete","pret","marja"],
    image: "/marketing/recipe-costing-hero.png",
    relatedFeature: "/features/recipe-costing",
    sections: [
      {
        heading: "Greșeala de a copia prețul de la vecini",
        body: "Cea mai frecventă metodă de stabilire a prețului unui produs nou este să te uiți ce cere cafeneaua de vizavi și să pui un preț similar, poate cu un leu mai mic «ca să fii competitiv». Problema: nu știi dacă vecinul are aceleași costuri de ingrediente, chirie sau volum de vânzări ca tine.\n\nUn preț copiat fără să-ți cunoști propriul cost de rețetă poate fi profitabil pentru vecin și în pierdere pentru tine — mai ales dacă porțiile, furnizorii sau costurile fixe diferă. Prețul corect pornește de la costul tău real, nu de la ce afișează altcineva pe tablă.",
      },
      {
        heading: "Pasul 1 — calculezi costul complet al rețetei",
        body: "Costul rețetei include toate ingredientele din porție, la prețul lor real de achiziție, plus ambalajul dacă produsul se vinde și la pachet. Nu rotunji în minus «ca să iasă un număr frumos» — folosești prețul exact din ultimul NIR.\n\nFormula: Cost rețetă = Σ (cantitate ingredient × preț unitar) + cost ambalaj (dacă aplicabil).\n\nO greșeală frecventă la produsele noi: se calculează costul doar pe ingredientul principal (de exemplu carnea la un sandviș) și se ignoră sosurile, garniturile sau ambalajul — toate acestea, adunate, pot reprezenta 15-25% din costul total al porției.",
      },
      {
        heading: "Pasul 2 — aplici marja țintă",
        body: "Odată ce ai costul rețetei, calculezi prețul de vânzare pornind de la marja pe care vrei să o obții, nu invers.\n\nFormula: Preț de vânzare = Cost rețetă ÷ (1 − Marja țintă)\n\nExemplu pentru o marjă țintă de 70%: dacă un produs costă 6 lei în ingrediente, prețul minim pentru marja dorită este 6 ÷ (1 − 0,70) = 6 ÷ 0,30 = **20 lei**.\n\nMarja țintă variază pe categorie de produs — băuturile la pahar susțin de obicei marje de 75-85%, în timp ce preparatele cu carne sau pește ajung realist la 60-70%, pentru că ingredientul principal e mult mai scump.",
      },
      {
        heading: "Pasul 3 — verifici pragurile psihologice de preț",
        body: "Prețul calculat matematic nu este întotdeauna prețul afișat pe meniu. Câteva ajustări practice:\n\n- **Rotunjire la praguri familiare** — 20,50 lei se transformă adesea în 21 lei sau 19,90 lei, în funcție de poziționarea locației\n- **Consistență cu restul meniului** — un produs nou la 23 lei lângă produse similare la 17-19 lei poate părea nejustificat de scump clientului, chiar dacă marja e corectă\n- **Verifici din nou marja după rotunjire** — dacă ai rotunjit în jos «ca să sune bine», recalculează procentul de marjă rezultat, ca să știi exact cu ce lucrezi",
      },
      {
        heading: "Exemplu complet — lansarea unei limonade de zmeură",
        body: "Rețetă limonadă de zmeură (400ml, pahar la pachet):\n\n- Zmeură congelată 40g → 40g × 22 lei/kg = 0,88 lei\n- Lămâie proaspătă 30ml suc → 0,45 lei\n- Sirop de zahăr 30ml → 0,20 lei\n- Apă minerală/plată 300ml → 0,35 lei\n- Pahar + capac + pai: 0,55 lei\n\n**Cost total: 2,43 lei**\n\nCu marja țintă de 78% (obișnuită pentru băuturi non-cafea): Preț = 2,43 ÷ (1 − 0,78) = 2,43 ÷ 0,22 = **11,05 lei**, rotunjit la **11 lei**.\n\nLa 11 lei: marjă brută = 11 − 2,43 = 8,57 lei, adică 77,9% — foarte aproape de ținta propusă, deci rotunjirea nu a afectat semnificativ profitabilitatea produsului.",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "Când adaugi o rețetă nouă în franchisetech, sistemul calculează automat costul din ingredientele configurate și îți arată marja rezultată în timp real, pe măsură ce testezi diferite prețuri de vânzare — nu mai calculezi manual de fiecare dată când vrei să verifici o variantă de preț.\n\nÎnainte să publici produsul nou pe POS, poți vedea exact cum se compară marja lui cu restul meniului, ca să te asiguri că prețul ales se aliniază cu strategia generală de profitabilitate, nu doar cu instinctul de moment.",
      },
    ],
  },
  {
    slug: "menu-engineering-stele-caini-cai-de-povara",
    title: "Menu engineering — cum clasifici produsele din meniu (stele, câini, cai de povară)",
    description:
      "Ce este menu engineering și cum clasifici produsele din meniu în stele, câini, cai de povară și enigme, pe baza popularității și a marjei brute per produs.",
    publishedAt: "2026-06-19",
    locale: "ro",
    tags: ["menu-engineering","marja"],
    image: "/marketing/margins-report.png",
    relatedFeature: "/features/recipe-costing",
    sections: [
      {
        heading: "Ce este menu engineering, pe scurt",
        body: "Menu engineering este metoda prin care clasifici fiecare produs din meniu după două criterii simultan: cât de popular este (câte unități vinzi) și cât de profitabil este (ce marjă brută are). Un produs poate fi foarte vândut și în același timp să contribuie puțin la profit — sau invers, rar comandat, dar extrem de profitabil de fiecare dată când se vinde.\n\nFără această analiză, deciziile de meniu se iau după impresii — «ăsta se vinde mult, deci e bun» — fără să se țină cont dacă acel «bun» aduce și bani, sau doar volum.",
      },
      {
        heading: "Cele patru categorii",
        body: "- **Stele** (popularitate mare, marjă mare) — produsele ideale: se vând mult și aduc profit bun la fiecare unitate. Le promovezi și le păstrezi vizibile în meniu\n- **Cai de povară** (popularitate mare, marjă mică) — se vând foarte bine, dar marja e sub medie. Aduc volum și trafic, dar contribuie puțin per unitate la profit\n- **Enigme** (popularitate mică, marjă mare) — foarte profitabile când se vând, dar puțini clienți le comandă. Pot avea potențial nefolosit din lipsă de vizibilitate în meniu\n- **Câini** (popularitate mică, marjă mică) — nici nu se vând bine, nici nu sunt profitabile. Candidați clari pentru eliminare sau reconcepere",
      },
      {
        heading: "Cum calculezi cele două axe",
        body: "**Popularitatea** se calculează comparând vânzările fiecărui produs cu media vânzărilor pe toate produsele din categoria analizată. Dacă un produs vinde sub acea medie, e considerat «nepopular» în acest context — nu neapărat un eșec, doar sub restul meniului.\n\n**Profitabilitatea** se calculează comparând marja brută (procentuală sau în lei) a fiecărui produs cu marja medie a întregului meniu. Un produs sub media meniului e clasificat ca marjă mică, chiar dacă în termeni absoluți marja lui nu e neapărat proastă.\n\nAmbele praguri sunt relative la propriul tău meniu — nu există un procent universal «bun» sau «rău», contează poziția fiecărui produs față de restul.",
      },
      {
        heading: "Exemplu cu un meniu de cafenea",
        body: "O cafenea cu șase produse principale, vânzări lunare și marjă brută per produs:\n\n- Espresso: 900 buc/lună, marjă 88%\n- Cappuccino: 850 buc/lună, marjă 84%\n- Latte cu caramel: 300 buc/lună, marjă 68%\n- Ceai premium: 200 buc/lună, marjă 90%\n- Sandviș club: 150 buc/lună, marjă 55%\n- Felie de tort de ciocolată: 90 buc/lună, marjă 45%\n\nMedia vânzărilor pe produs: 415 buc/lună. Media marjei: 71,7%.\n\n**Clasificare:** Espresso și Cappuccino = **Stele** (peste medie la ambele). Latte cu caramel = **Cal de povară** (popular, dar marjă sub medie). Ceai premium = **Enigmă** (marjă foarte bună, dar puțin vândut). Sandviș club și Felie de tort = **Câini** (sub medie la ambele criterii).",
      },
      {
        heading: "Ce faci cu fiecare categorie",
        body: "- **Stele** — le păstrezi vizibile, nu le modifici fără motiv, sunt reperul meniului tău\n- **Cai de povară** — verifici dacă poți reduce costul rețetei sau crește ușor prețul, fără să le pierzi popularitatea; produse ca latte cu caramel pot suporta un preț mai mare fără să scadă cererea\n- **Enigme** — testează repoziționarea în meniu (mai vizibil, recomandat de staff) înainte să renunți la ele; profitabilitatea e deja acolo, lipsește doar vizibilitatea\n- **Câini** — reconcepe rețeta pentru cost mai mic, crește prețul semnificativ, sau elimină-le din meniu dacă nici volumul, nici marja nu se pot îmbunătăți realist",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "Raportul de marje din franchisetech calculează automat costul și marja fiecărui produs pe baza rețetelor configurate și a prețurilor curente din stoc, apoi le compară cu vânzările reale înregistrate prin POS.\n\nNu trebuie să exporți date în Excel și să faci clasificarea manual — vezi direct în raport care produse au vânzări sub medie, care au marjă sub medie, și poți identifica rapid stelele și câinii din propriul meniu, actualizat cu fiecare vânzare nouă.",
      },
    ],
  },
  {
    slug: "reteta-standard-portionare-consistenta",
    title: "Rețeta standard — cum asiguri porții consistente la fiecare preparare",
    description:
      "De ce contează o rețetă standard scrisă cu cantități exacte și cum previne ea variațiile de porție care îți erodează marja fără să observi, lună de lună.",
    publishedAt: "2026-06-20",
    locale: "ro",
    tags: ["retete","portionare"],
    image: "/marketing/recipe-costing-hero.png",
    relatedFeature: "/features/recipe-costing",
    sections: [
      {
        heading: "Ce se întâmplă când nu ai rețete standardizate",
        body: "Fără o rețetă scrisă cu cantități exacte, fiecare angajat prepară produsul «după ochi» — și «după ochi» diferă de la o persoană la alta, uneori și de la o zi la alta pentru aceeași persoană. Un barista pune 30g de brânză la sandvișul club, altul pune 45g, pentru că «așa arată mai bine plin».\n\nRezultatul nu este doar inconsistență de gust pentru client — clientul care primește sandvișul cu mai puțină brânză într-o zi și mai multă în alta observă diferența și își pierde încrederea în calitatea constantă a produsului. Iar tu pierzi bani la fiecare porție mai generoasă decât ar trebui.",
      },
      {
        heading: "Impactul financiar al porțiilor inconsistente",
        body: "Rețeta standard pentru un sandviș club prevede 30g de brânză cheddar la 68 lei/kg, adică 2,04 lei per porție. Dacă real se pune în medie 40g, costul brânzei crește la 2,72 lei — o diferență de 0,68 lei per sandviș, doar de la un singur ingredient.\n\nDacă vinzi 40 de sandvișuri club pe zi, 6 zile pe săptămână:\n\n- Diferență zilnică: 40 × 0,68 = 27,20 lei\n- Diferență lunară (24 de zile lucrătoare): 27,20 × 24 = **652,80 lei**\n\nAceasta e pierderea de la un singur ingredient, la un singur produs, dintr-un meniu care poate avea 20-30 de produse. Variații similare la mai multe produse se adună rapid la o sumă lunară vizibilă în profit, fără ca nimeni să fi «greșit» intenționat undeva.",
      },
      {
        heading: "Cum construiești o rețetă standard",
        body: "O rețetă standard utilă nu e doar o listă de ingrediente — este o specificație exactă, ușor de urmat sub presiunea orelor de vârf:\n\n- **Cantitate exactă pentru fiecare ingredient**, în grame sau mililitri, nu «un pic de» sau «după gust»\n- **Instrumentul de măsurare potrivit** — cântar digital pentru ingrediente solide, pahar gradat sau dozator pentru lichide, portionator pentru sosuri\n- **Ordinea de asamblare**, dacă afectează rezultatul (de exemplu, sosul se pune înainte sau după grill)\n- **Fotografie de referință** a produsului finit, afișată la stația de lucru — util mai ales pentru angajați noi\n- **Toleranța acceptată** — o variație de ±2g e normală la cântărire manuală rapidă, dar 10-15g diferență nu mai e toleranță, e improvizație",
      },
      {
        heading: "Cum antrenezi echipa să respecte rețeta",
        body: "O rețetă scrisă care stă într-un dosar necitit nu schimbă nimic. Pașii care fac diferența:\n\n1. **Instruire la angajare** — fiecare angajat nou prepară produsul sub supraveghere, cu cântarul la vedere, până demonstrează consistență\n2. **Verificări periodice, nu doar la început** — un angajat cu experiență poate deriva treptat de la rețetă în timp, fără să-și dea seama\n3. **Feedback imediat, nu la sfârșitul lunii** — dacă observi o porție greșită, corectezi pe loc, nu aștepți raportul de marjă din luna următoare ca să descoperi problema\n4. **Rețeta vizibilă la stația de lucru**, nu doar în capul managerului — o cartelă plastifiată sau un ecran cu rețeta activă reduce variația mai mult decât orice discurs motivațional",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "Rețetele configurate în franchisetech păstrează cantitățile exacte per ingredient, iar costul fiecărui produs se recalculează automat pe baza acestor cantități, nu pe baza a ceea ce s-a folosit real în bucătărie — de aceea vizibilitatea în rapoartele de marjă contează.\n\nDacă marja unui produs scade constant fără nicio schimbare de preț la ingrediente, primul lucru de verificat este dacă porțiile reale au deviat de la rețeta configurată. Raportul de marje îți arată exact la ce produs a scăzut profitabilitatea, chiar dacă nu-ți spune direct «cineva pune mai multă brânză» — dar te îndreaptă spre verificarea corectă.",
      },
    ],
  },
  {
    slug: "cost-ambalaj-delivery-in-pretul-produsului",
    title: "Costul ambalajului pentru delivery — de ce trebuie inclus în preț",
    description:
      "De ce costul ambalajului pentru livrare trebuie inclus explicit în prețul produsului, cu exemplu complet de calcul pentru o comandă de delivery.",
    publishedAt: "2026-06-20",
    locale: "ro",
    tags: ["retete","delivery","cost"],
    image: "/marketing/recipe-costing-hero.png",
    relatedFeature: "/features/recipe-costing",
    sections: [
      {
        heading: "De ce ambalajul e ignorat frecvent la calculul prețului",
        body: "La calculul costului unei rețete, atenția merge aproape automat spre ingrediente — carne, brânză, sosuri, garnituri. Ambalajul rămâne adesea o linie separată, cumpărată «la nevoie» și trecută direct pe cheltuieli generale, nu pe costul fiecărui produs.\n\nProblema apare la delivery: un produs care se servește pe farfurie în local nu are cost de ambalaj, dar același produs livrat la client are nevoie de cutie, capac, eventual pungă și tacâmuri — costuri reale, per comandă, care nu există când clientul mănâncă la masă. Dacă prețul de livrare e identic cu cel din local, ambalajul se plătește direct din marjă, nesesizat.",
      },
      {
        heading: "Ce intră de fapt în costul de ambalare pentru delivery",
        body: "- **Cutia sau caseta principală** — diferă ca preț în funcție de mărime și dacă e termorezistentă\n- **Pahar și capac**, separat, pentru orice băutură inclusă în comandă\n- **Punga de transport** — hârtie sau plastic, cu sau fără mâner\n- **Tacâmuri de unică folosință** — dacă platforma de livrare sau politica proprie le include automat la fiecare comandă\n- **Șervețele și sosuri la pachet** — de multe ori uitate din calcul, deși se adaugă aproape la fiecare comandă\n- **Etichetă sau sigiliu** — dacă folosești sigilare pentru siguranță alimentară",
      },
      {
        heading: "Exemplu complet — o comandă de paste la delivery",
        body: "Rețetă paste carbonara (porție 350g) plus ambalaj pentru livrare:\n\n- Cost ingrediente (paste, ouă, bacon, parmezan, smântână): **9,80 lei**\n- Cutie termorezistentă cu compartiment: 1,40 lei\n- Pungă de transport cu mâner: 0,60 lei\n- Tacâmuri de unică folosință + șervețel: 0,45 lei\n- Sos parmezan la pachet: 0,35 lei\n\n**Cost ambalaj total: 2,80 lei**\n\n**Cost total pentru livrare: 9,80 + 2,80 = 12,60 lei**\n\nDacă prețul de vânzare rămâne 34 lei, ca în local, marja la delivery este 34 − 12,60 = 21,40 lei (62,9%), față de 34 − 9,80 = 24,20 lei (71,2%) la servire în local — o diferență de peste 8 puncte procentuale doar din costul ambalajului, invizibilă dacă nu o calculezi separat.",
      },
      {
        heading: "Diferența de cost între servire în local și livrare",
        body: "Practica recomandată în multe afaceri HoReCa este să tratezi versiunea de delivery a unui produs ca pe o rețetă separată, cu propriul cost și, dacă e cazul, propriul preț. Nu înseamnă neapărat că trebuie să afișezi două prețuri diferite pe același produs — unele afaceri absorb diferența în marjă, altele o reflectă parțial în preț sau printr-o taxă de ambalare separată la finalul comenzii.\n\nCe contează este să știi exact cât te costă fiecare variantă, ca decizia despre preț să fie una asumată, nu o pierdere pe care o descoperi abia la finalul lunii, când marja generală pare mai mică decât te așteptai fără o explicație clară.",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "În franchisetech, ambalajul se adaugă ca ingredient în rețetă, la fel ca oricare alt component — cu preț unitar și cantitate. Poți configura o variantă separată de rețetă pentru delivery, cu propriul cost de ambalare, fără să afectezi costul calculat pentru servirea în local.\n\nCând prețul unei cutii sau al unei pungi de la furnizor se schimbă, actualizezi prețul o singură dată, iar costul tuturor produselor care folosesc acel ambalaj se recalculează automat — la fel ca la orice alt ingredient din stoc.",
      },
    ],
  },
  {
    slug: "marja-tinta-pe-categorie-de-produse",
    title: "Marja țintă pe categorie de produse — cafea, mâncare, băuturi",
    description:
      "Cafeaua și mâncarea gătită nu au aceeași marjă țintă. Vezi ce procent e realist pe fiecare categorie din meniu și cum depistezi rapid categoria care trage marja în jos.",
    publishedAt: "2026-06-21",
    locale: "ro",
    tags: ["marja","retete"],
    image: "/marketing/margins-report.png",
    relatedFeature: "/features/recipe-costing",
    sections: [
      {
        heading: "De ce o marjă țintă unică pentru tot meniul e o greșeală",
        body: "O cafenea sau un restaurant care își propune «marjă brută 70% pe tot meniul» pornește cu o presupunere greșită. Cafeaua, mâncarea gătită și băuturile alcoolice au structuri de cost complet diferite — nu pot avea aceeași țintă realistă.\n\nDacă forțezi 70% marjă pe o ciorbă cu carne și legume proaspete, fie prețul devine prea mare pentru piață, fie porțiile scad sub ce se așteaptă clientul. Dacă accepți 70% pe cafea, lași bani pe masă — cafeaua suportă marje mult mai mari.\n\nSoluția corectă: stabilești o marjă țintă separată pentru fiecare categorie de produse, nu un singur număr pentru tot meniul.",
      },
      {
        heading: "Ce marjă țintă e realistă pe fiecare categorie",
        body: "Pe baza structurii tipice de cost din HoReCa România, țintele orientative pe categorie sunt:\n\n- **Cafea și băuturi calde**: 78–86% — ingredientele (cafea, lapte) sunt ieftine raportat la preț\n- **Băuturi reci, limonade, smoothie-uri**: 72–82%\n- **Mâncare gătită (feluri principale)**: 60–72% — carnea, brânza și peștele scumpesc rapid rețeta\n- **Garnituri, salate simple**: 65–75%\n- **Deserturi de casă**: 65–78%\n- **Băuturi alcoolice (bere, vin la pahar)**: 68–78%\n\nAcestea sunt intervale de pornire, nu reguli fixe — depind de furnizorii tăi, de zona din țară și de poziționarea locației. Important e să ai o țintă pe fiecare categorie, nu doar una generală.",
      },
      {
        heading: "Exemplu numeric: limonadă de casă vs paste carbonara",
        body: "**Limonadă de casă (400ml):**\n- Lămâi 100g → 100g × 6 RON/kg = 0.60 RON\n- Zahăr 30g → 30g × 4 RON/kg = 0.12 RON\n- Apă minerală 300ml → 300ml × 1.5 RON/l = 0.45 RON\n- Mentă și gheață: 0.30 RON\n- Pahar și pai: 0.40 RON\n\nCost total: **1.87 RON**. La preț de vânzare 12 RON, marja e 10.13 RON, adică **84.4%** — normal pentru categoria băuturi.\n\n**Paste carbonara (porție restaurant):**\n- Paste 120g → 120g × 6 RON/kg = 0.72 RON\n- Ouă 2 buc = 2.40 RON\n- Bacon 60g → 60g × 55 RON/kg = 3.30 RON\n- Parmezan 20g → 20g × 90 RON/kg = 1.80 RON\n- Smântână și condimente: 0.80 RON\n\nCost total: **9.02 RON**. La preț de vânzare 34 RON, marja e 24.98 RON, adică **73.5%** — corect pentru categoria mâncare gătită, deși procentul e cu 10 puncte mai mic decât la limonadă. Nu înseamnă că paste carbonara e un produs slab — înseamnă că are altă structură de cost.",
      },
      {
        heading: "Cum monitorizezi abaterile de la marja țintă",
        body: "Marja țintă pe categorie nu are valoare dacă o calculezi o dată și o uiți. Trei momente când trebuie verificată din nou:\n\n- **La fiecare NIR** — dacă prețul unui ingredient crește, marja produselor care îl conțin scade automat\n- **Lunar, pe fiecare categorie** — nu doar per produs individual, ci agregat: media marjelor din categoria „mâncare gătită” a scăzut sub 60%?\n- **La schimbarea unei rețete** — dacă bucătarul mărește porția de carne „ca să fie mai generos”, marja produsului scade fără ca prețul de vânzare să se schimbe\n\nDacă nu urmărești pe categorie, poți avea câteva produse foarte profitabile care ascund o categorie întreagă cu probleme.",
      },
      {
        heading: "Ce faci când o categorie întreagă e sub țintă",
        body: "Dacă mâncarea gătită iese constant sub 60% marjă în timp ce cafeaua stă la 85%, ai câteva opțiuni, în ordinea în care merită încercate:\n\n1. **Verifică porțiile reale servite** vs. porțiile din rețetă — bucătăria mărește frecvent porțiile fără să anunțe\n2. **Renegociază cu furnizorul de carne/brânză** dacă prețul a crescut fără să fi ajustat rețetele\n3. **Revizuiește 2-3 prețuri din categorie**, nu tot meniul deodată — clienții observă schimbări bruște de preț pe tot meniul\n4. **Elimină produsele cronic neprofitabile** dacă nu se vând suficient de mult încât volumul să compenseze marja mică\n\nO categorie sub țintă nu înseamnă panică — înseamnă că ai nevoie de o ajustare țintită, nu de o schimbare generală de preț.",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "În franchisetech, fiecare produs cu rețetă configurată are marja calculată automat din costul ingredientelor și prețul de vânzare. Poți grupa produsele pe categorii și vedea marja medie pe categorie, nu doar per produs izolat.\n\nCând prețul unui ingredient se schimbă la un NIR nou, costul tuturor rețetelor care îl folosesc se recalculează automat — inclusiv media pe categorie. Nu trebuie să recalculezi manual de fiecare dată când un furnizor își schimbă lista de prețuri.",
      },
    ],
  },
  {
    slug: "recalculare-pret-meniu-la-scumpire-furnizor",
    title: "Cum recalculezi rapid prețurile din meniu când furnizorul scumpește",
    description:
      "Furnizorul a scumpit mozzarella sau uleiul cu 20%? Vezi cum recalculezi rapid costul rețetelor afectate și alegi corect între a absorbi scumpirea, a crește prețul sau a înlocui ingredientul.",
    publishedAt: "2026-06-21",
    locale: "ro",
    tags: ["retete","pret","furnizori"],
    image: "/marketing/recipe-costing-hero.png",
    relatedFeature: "/features/recipe-costing",
    sections: [
      {
        heading: "Semnalul de alarmă: cum afli de scumpire înainte să te lovească la finalul lunii",
        body: "Cel mai frecvent scenariu: furnizorul trimite factura cu un preț mai mare la mozzarella sau la ulei, tu o plătești fără să compari cu factura anterioară, și abia peste o lună observi că marja pe pizza a scăzut cu câteva puncte procentuale — fără să știi exact de ce.\n\nSemnul clar de scumpire: prețul unitar dintr-un NIR nou e diferit față de NIR-ul anterior de la același furnizor, pentru același produs. Dacă verifici asta la fiecare recepție de marfă, afli scumpirea în ziua în care se întâmplă, nu peste o lună.\n\nFurnizorii rareori anunță scumpirile în avans — apar direct pe factura următoare. Responsabilitatea de a observa cade pe tine.",
      },
      {
        heading: "Ce faci în prima oră după ce afli de scumpire",
        body: "- Identifici toate rețetele care folosesc ingredientul scumpit — nu doar produsul la care te-ai gândit prima dată\n- Recalculezi costul fiecărei rețete afectate cu noul preț\n- Verifici cu cât scade marja la prețul actual de vânzare\n- Decizi dacă abaterea e acceptabilă sau necesită ajustare de preț\n- Comunici decizia către bucătărie/bar dacă implică schimbarea unui ingredient\n\nUn ingredient comun ca mozzarella, uleiul sau făina apare de obicei în 5-15 rețete diferite. Dacă recalculezi doar produsul care ți-a atras atenția, restul rămân cu marjă eronată în sistem fără să știi.",
      },
      {
        heading: "Exemplu numeric: pizza margherita cu mozzarella scumpită",
        body: "**Rețetă înainte de scumpire:**\n- Blat 250g → 250g × 4 RON/kg = 1.00 RON\n- Sos roșii 80g → 80g × 5 RON/kg = 0.40 RON\n- Mozzarella 150g → 150g × 28 RON/kg = 4.20 RON\n- Busuioc și ulei de măsline: 0.50 RON\n\nCost total vechi: **6.10 RON**. La preț de vânzare 32 RON, marja era 25.90 RON (**80.9%**).\n\n**După scumpirea mozzarellei la 34 RON/kg (+21%):**\n- Mozzarella 150g → 150g × 34 RON/kg = 5.10 RON\n- Restul rețetei neschimbat\n\nCost total nou: **7.00 RON**. La același preț de 32 RON, marja scade la 25.00 RON (**78.1%**) — o scădere de 2.8 puncte procentuale doar din cauza unui singur ingredient.",
      },
      {
        heading: "Trei opțiuni când costul crește: absorbi, transferi în preț sau înlocuiești",
        body: "**Opțiunea 1 — Absorbi scumpirea.** Marja scade cu câteva puncte, dar rămâne peste pragul acceptabil pentru categorie. Potrivit când scumpirea e mică (sub 5%) sau produsul are volum mare de vânzări și nu vrei să riști să pierzi clienți la o schimbare de preț.\n\n**Opțiunea 2 — Transferi în preț.** Dacă vrei să păstrezi marja de 80.9%, noul preț ar trebui să fie 7.00 / (1 − 0.809) ≈ **36.6 RON**, rotunjit la 37 RON. O creștere de 5 lei pe o pizza de 32 lei e greu de observat de client dacă meniul nu se schimbă des.\n\n**Opțiunea 3 — Înlocuiești ingredientul.** Dacă scumpirea e mare sau permanentă, verifici dacă există o mozzarella alternativă de calitate similară la preț mai bun, sau discuți cu furnizorul un contract cu preț fix pe 3-6 luni.",
      },
      {
        heading: "Cum recalculezi tot meniul, nu doar produsul afectat",
        body: "Mozzarella nu apare doar în pizza margherita — de obicei apare și în alte 4-8 produse din meniu (paste, sandvișuri, salate). Dacă recalculezi manual produs cu produs, riști să uiți jumătate din ele.\n\nProcedura corectă:\n\n1. Cauți toate rețetele care conțin ingredientul scumpit\n2. Recalculezi costul fiecăreia cu noul preț\n3. Compari marja nouă cu marja țintă pe categoria respectivă\n4. Ajustezi doar produsele care au ieșit sub prag — nu tot meniul\n\nFără o listă centralizată de rețete, acest pas durează ore și e ușor să scapi produse din vedere.",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "Când înregistrezi un NIR cu un preț nou pentru un ingredient, franchisetech recalculează automat costul tuturor rețetelor care folosesc ingredientul respectiv — nu doar al unuia. Lista de rețete îți arată imediat care produse au marja sub țintă după scumpire.\n\nNu mai cauți manual în ce produse apare mozzarella sau uleiul — sistemul face legătura automat, pe baza rețetelor configurate.",
      },
    ],
  },
  {
    slug: "costing-meniu-sezonier-cafenea",
    title: "Costing pentru meniul sezonier — cum previi surprizele de marjă",
    description:
      "Un produs sezonier costat greșit la lansare poate fi profitabil în august și neprofitabil în mai. Vezi cum costezi meniul sezonier înainte să-l lansezi, nu după prima săptămână de vânzări.",
    publishedAt: "2026-06-21",
    locale: "ro",
    tags: ["retete","sezonier","marja"],
    image: "/marketing/recipe-costing-hero.png",
    relatedFeature: "/features/recipe-costing",
    sections: [
      {
        heading: "De ce meniul sezonier e cel mai expus la marjă neprevăzută",
        body: "Produsele permanente din meniu au prețuri de ingrediente relativ stabile — le cumperi constant, de la aceiași furnizori, în cantități previzibile. Meniul sezonier e diferit: fructele de pădure, sparanghelul sau dovleacul au prețuri care variază semnificativ în funcție de cât de aproape ești de vârful sezonului.\n\nGreșeala frecventă: costezi un produs sezonier o singură dată, la lansare, cu prețul din acel moment — și păstrezi același preț de vânzare toată perioada, chiar dacă prețul ingredientului se schimbă cu 30-50% pe parcurs.\n\nUn frappe cu fructe de pădure lansat la începutul verii, când fructele sunt încă scumpe la import, poate avea o marjă mult sub cea din plin sezon, când prețul local scade.",
      },
      {
        heading: "Regula de bază: costezi înainte să pui pe meniu, nu după prima săptămână",
        body: "Înainte de a adăuga un produs sezonier în meniu:\n\n- Costezi rețeta cu prețul curent al ingredientelor sezoniere\n- Verifici cu furnizorul cum variază prețul pe durata sezonului (de la primele livrări la vârful de sezon)\n- Stabilești un preț de vânzare care rămâne profitabil chiar și la prețul cel mai mare așteptat, nu doar la cel mai mic\n\nDacă lansezi produsul și abia după o săptămână de vânzări observi că marja e sub prag, ai deja vândut zeci sau sute de porții la un preț nesustenabil.",
      },
      {
        heading: "Exemplu numeric: cum variază costul aceluiași produs în funcție de sezon",
        body: "**Frappe cu fructe de pădure — rețetă (400ml):**\n- Espresso dublu 14g → 14g × 80 RON/kg = 1.12 RON\n- Lapte 100ml → 100ml × 6 RON/l = 0.60 RON\n- Fructe de pădure 40g\n- Gheață, pahar, pai: 0.55 RON\n\n**La început de sezon (mai), fructele de pădure costă 35 RON/kg** (import, cerere mare, ofertă mică):\n40g × 35 RON/kg = 1.40 RON → cost total 3.67 RON\n\n**În plin sezon (august), prețul local scade la 12 RON/kg:**\n40g × 12 RON/kg = 0.48 RON → cost total 2.75 RON\n\nLa un preț de vânzare fix de 16 RON:\n- În mai: marja e 16 − 3.67 = 12.33 RON (**77.1%**)\n- În august: marja e 16 − 2.75 = 13.25 RON (**82.8%**)\n\nDiferența de 5.7 puncte procentuale între lunile de sezon vine exclusiv din prețul fructelor — produsul, rețeta și prețul de vânzare rămân identice.",
      },
      {
        heading: "Cum setezi un preț care rezistă la fluctuațiile de sezon",
        body: "Costezi produsul la scenariul cel mai scump probabil, nu la cel mai ieftin. Dacă prețul de vânzare rămâne profitabil chiar și la 35 RON/kg pentru fructe, atunci în plin sezon marja crește suplimentar — un rezultat bun, nu o problemă.\n\nDacă în schimb costezi la prețul cel mai mic (vârf de sezon) și lansezi produsul devreme, la prețul de import mare, riști să vinzi în pierdere primele săptămâni — exact perioada în care produsul nou atrage cei mai mulți clienți curioși.",
      },
      {
        heading: "Ce faci cu produsele sezoniere la final de sezon",
        body: "Un produs sezonier care rămâne pe meniu după ce sezonul s-a încheiat revine la costul ridicat din extrasezon, dar clienții s-au obișnuit cu prețul din plin sezon.\n\n- Stabilește din start o dată de retragere din meniu, nu «cât mai durează cererea»\n- Verifică marja cu 2-3 săptămâni înainte de sfârșitul sezonului — dacă prețul ingredientului a început deja să crească, retrage produsul mai devreme\n- Anunță clar pe meniu că e ediție de sezon — pregătește clienții pentru retragere, în loc să vină o lună mai târziu și să nu-l mai găsească",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "Rețetele din franchisetech recalculează costul automat de fiecare dată când înregistrezi un NIR cu un preț nou pentru un ingredient — inclusiv pentru ingredientele sezoniere care se schimbă des în cursul unui an. Poți vedea istoricul de cost al unei rețete și observa exact în ce lună marja a scăzut sau a crescut, ca să decizi informat când lansezi și când retragi un produs sezonier.",
      },
    ],
  },
  {
    slug: "alergeni-etichetare-meniu-obligatii",
    title: "Alergeni și etichetare în meniu — ce obligații ai ca operator HoReCa",
    description:
      "Informarea despre alergeni în meniu nu e opțională pentru niciun operator HoReCa. Vezi cei 14 alergeni pe care trebuie să-i identifici în fiecare rețetă și greșelile care te expun la risc.",
    publishedAt: "2026-06-22",
    locale: "ro",
    tags: ["alergeni","etichetare","conformitate"],
    image: "/marketing/products-list.png",
    relatedFeature: "/features/recipe-costing",
    sections: [
      {
        heading: "Ce spune legea — informarea despre alergeni nu e opțională",
        body: "Legislația europeană privind informarea consumatorilor cu privire la produsele alimentare (Regulamentul UE 1169/2011) obligă orice operator care servește mâncare — inclusiv restaurante, cafenele, fast-food-uri și food truck-uri — să comunice prezența alergenilor majori în produsele vândute, indiferent dacă mâncarea e preambalată sau nu.\n\nÎn practică, asta înseamnă: dacă un client te întreabă dacă o ciorbă conține gluten sau dacă un desert conține nuci, trebuie să poți răspunde corect, pe baza rețetei reale, nu pe baza unei estimări.\n\nNerespectarea nu e doar un risc de imagine — pentru un client cu alergie reală, o informație greșită poate avea consecințe medicale grave, iar răspunderea cade pe operator.",
      },
      {
        heading: "Cei 14 alergeni pe care trebuie să-i poți identifica în orice produs din meniu",
        body: "Lista alergenilor majori reglementați la nivel european:\n\n- Cereale care conțin gluten (grâu, secară, orz, ovăz)\n- Crustacee\n- Ouă\n- Pește\n- Arahide\n- Soia\n- Lapte (inclusiv lactoză)\n- Fructe cu coajă lemnoasă (migdale, alune, nuci, caju, fistic etc.)\n- Țelină\n- Muștar\n- Susan\n- Dioxid de sulf și sulfiți (peste o anumită concentrație)\n- Lupin\n- Moluște\n\nUn produs poate conține alergeni ascunși — sosul de salată poate avea muștar, pâinea poate avea susan, un desert poate avea urme de nuci din procesul de preparare, chiar dacă nu e ingredient principal.",
      },
      {
        heading: "Cum arăți alergenii pe meniu, fără să-l transformi într-un formular",
        body: "Cea mai practică metodă folosită în HoReCa din România: simboluri sau numere lângă fiecare produs din meniu, cu o legendă la finalul meniului care explică fiecare simbol/număr.\n\nAlternativ, mulți operatori păstrează un registru de alergeni separat, la casă sau la bar, pe care personalul îl poate consulta rapid când un client întreabă direct — util mai ales dacă meniul se schimbă des și actualizarea simbolurilor pe fiecare meniu tipărit ar fi greoaie.\n\nCe contează cel mai mult: informația trebuie să fie corectă și actualizată la fiecare modificare de rețetă, nu doar completă la lansarea meniului.",
      },
      {
        heading: "Greșeli frecvente care te expun la risc",
        body: "- **Rețeta se modifică, eticheta nu** — bucătarul înlocuiește un ingredient (de exemplu adaugă smântână într-un sos care înainte nu avea lactate) fără să anunțe actualizarea informației de alergeni\n- **Contaminarea încrucișată nemenționată** — un produs fără gluten preparat pe aceeași suprafață sau tigaie cu produse care conțin gluten, fără avertisment despre riscul de urme\n- **Presupuneri fără verificare** — personalul răspunde «nu cred că are» unui client alergic, în loc să verifice rețeta reală\n- **Ingrediente ambalate schimbate fără verificare** — furnizorul schimbă rețeta unui sos sau a unei paste, iar alergenii produsului final se schimbă fără ca tu să știi",
      },
      {
        heading: "Ce se întâmplă la un control sau la o reclamație de la un client alergic",
        body: "La un control al autorităților de protecție a consumatorului sau sanitar-veterinare, lipsa informării despre alergeni sau informarea incorectă e tratată ca abatere — poți primi avertisment sau sancțiune, în funcție de gravitate și de constatările concrete.\n\nMai grav decât o sancțiune administrativă e o reacție alergică reală la un client care s-a bazat pe informația greșită oferită de personal. În acest caz, discuția depășește conformitatea și devine una de răspundere directă.\n\nDocumentarea corectă a rețetelor — cu toate ingredientele reale, nu aproximative — este prima linie de apărare în ambele situații.",
      },
      {
        heading: "Checklist practic pentru alergeni în meniu",
        body: "- [ ] Fiecare rețetă din meniu are lista completă de ingrediente reale (nu aproximative)\n- [ ] Alergenii majori sunt marcați vizibil pe meniu sau într-un registru accesibil rapid personalului\n- [ ] Personalul e instruit să verifice rețeta reală, nu să presupună, când un client întreabă\n- [ ] Orice modificare de rețetă declanșează actualizarea informației de alergeni\n- [ ] Riscul de contaminare încrucișată e comunicat explicit acolo unde există\n\nÎn franchisetech, fiecare rețetă configurată are lista completă de ingrediente — baza corectă pentru a construi informarea despre alergeni, actualizată automat de fiecare dată când modifici o rețetă.",
      },
    ],
  },
  {
    slug: "food-cost-percentage-ideal-horeca",
    title: "Food cost percentage — ce procent este sănătos în HoReCa",
    description:
      "Food cost percentage îți arată ce parte din prețul de vânzare se duce pe ingrediente. Vezi formula corectă, ce procent e sănătos pe fiecare categorie și un exemplu complet cu o shaorma la pachet.",
    publishedAt: "2026-06-22",
    locale: "ro",
    tags: ["food-cost","marja"],
    image: "/marketing/margins-report.png",
    relatedFeature: "/features/recipe-costing",
    sections: [
      {
        heading: "Ce este food cost percentage și cum se calculează",
        body: "Food cost percentage (procentul costului alimentelor) arată ce parte din prețul de vânzare se duce pe costul ingredientelor.\n\n**Formula:** Food cost % = (Cost ingrediente / Preț de vânzare) × 100\n\nE, matematic, reversul marjei brute — dar cele două cifre se citesc diferit în conversație. Dacă un manager de restaurant îți spune „avem food cost 32%”, înseamnă că 32 din fiecare 100 de lei încasați pe acel produs se duc pe materie primă. Restul de 68 de lei acoperă forța de muncă, chiria, utilitățile și, dacă rămâne ceva, profitul.",
      },
      {
        heading: "Food cost % și marja brută — fețe ale aceleiași monede",
        body: "Marja brută = Preț − Cost. Food cost % = Cost / Preț. Sunt complementare: dacă food cost % e 30%, marja brută e automat 70%.\n\nDe ce contează să le cunoști pe amândouă? Pentru că industria HoReCa vorbește în ambele limbaje. Furnizorii și consultanții de restaurant vorbesc frecvent în „food cost %”. Rapoartele de marjă din aplicațiile de gestiune, inclusiv franchisetech, vorbesc de obicei în „marjă brută”. Dacă știi conversia, nu te încurci indiferent cu cine discuți despre cifre.",
      },
      {
        heading: "Exemplu numeric: shaorma la pachet",
        body: "**Rețetă shaorma pui la pachet:**\n- Piept de pui 180g → 180g × 22 RON/kg = 3.96 RON\n- Lipie: 1.80 RON\n- Legume (varză, roșii, castraveți) 80g → 80g × 5 RON/kg = 0.40 RON\n- Sos (usturoi/maioneză) 30g: 0.60 RON\n- Cartofi prăjiți garnitură 100g → 100g × 8 RON/kg = 0.80 RON\n- Ambalaj: 0.50 RON\n\nCost total: **8.06 RON**. La preț de vânzare 26 RON:\n\nFood cost % = 8.06 / 26 × 100 = **31.0%**\n\nEchivalent, marja brută = 26 − 8.06 = 17.94 RON, adică **69.0%**. Ambele cifre descriu același produs — 31% food cost înseamnă 69% marjă brută.",
      },
      {
        heading: "Ce procent e sănătos pe fiecare categorie",
        body: "Intervale orientative de food cost % pentru HoReCa din România:\n\n- **Cafea și băuturi calde**: 14–22% (echivalent 78–86% marjă)\n- **Băuturi reci, limonade**: 18–28%\n- **Mâncare gătită, feluri principale**: 28–38%\n- **Fast-food, shaorma, sandvișuri**: 28–34%\n- **Deserturi de casă**: 22–35%\n\nUn food cost peste 40% pe mâncare gătită e semnal de alarmă — fie prețul de vânzare e prea mic, fie porțiile sunt prea mari față de ce e stabilit în rețetă, fie ai risipă mare la preparare.",
      },
      {
        heading: "Când food cost % crește fără să observi",
        body: "Food cost % nu crește de obicei printr-o singură decizie greșită — crește prin acumulare de mici derapaje:\n\n- **Porții peste rețetă** — bucătarul pune „un pic mai mult” din obișnuință sau generozitate\n- **Scumpiri de furnizor neajustate în preț** — costul crește, prețul de vânzare rămâne același luni de zile\n- **Risipă la preparare** — decupaje, arderi, produse expirate înainte de folosire\n- **Rețete neactualizate** — un ingredient a fost înlocuit cu unul mai scump, dar rețeta din sistem încă arată costul vechi\n\nFără monitorizare periodică, food cost % real poate ajunge cu 5-8 puncte procentuale peste cel calculat teoretic din rețetă — o diferență care, la volum mare, înseamnă mii de lei pe lună.",
      },
      {
        heading: "Cum urmărești food cost automat în franchisetech",
        body: "Fiecare produs cu rețetă configurată în franchisetech are costul calculat automat din prețurile de achiziție înregistrate la NIR. Lista de rețete afișează atât marja brută cât și, implicit, food cost-ul — poți urmări ambele cifre fără calcul manual.\n\nCând prețul unui ingredient se schimbă, food cost-ul produselor afectate se recalculează automat, așa că observi rapid dacă un produs a trecut peste pragul sănătos pentru categoria lui.",
      },
    ],
  },
  {
    slug: "waste-cost-tracking-cat-te-costa-risipa",
    title: "Cât te costă risipa alimentară — cum o măsori și o reduci",
    description:
      "Risipa alimentară e cheltuiala invizibilă din HoReCa — nu apare direct în niciun raport, dar se scade din profit în fiecare zi. Vezi cum o măsori în bani și acțiuni concrete care o reduc.",
    publishedAt: "2026-06-23",
    locale: "ro",
    tags: ["risipa","cost"],
    image: "/marketing/stock-report.png",
    relatedFeature: "/features/recipe-costing",
    sections: [
      {
        heading: "De ce risipa alimentară e cheltuiala invizibilă din HoReCa",
        body: "Chiria apare în contract. Salariile apar în statul de plată. Risipa alimentară nu apare nicăieri explicit — verdeața aruncată, laptele expirat, chiflele nevândute de ieri se pierd tăcut, fără să genereze o factură separată sau o linie într-un raport.\n\nDiferența e că risipa nu dispare din calculul profitului — doar dispare din vizibilitatea ta. Ai cumpărat ingredientul, l-ai plătit, dar nu l-ai vândut niciodată. Costul rămâne, doar că nimeni nu-l urmărește separat.",
      },
      {
        heading: "Cele 4 tipuri de risipă și care costă cel mai mult",
        body: "- **Risipă de preparare (prep waste)** — decupaje, coji, resturi din procesul de curățare și tăiere, parte normală a gătitului, dar poate fi excesivă dacă personalul nu e instruit\n- **Expirare (spoilage)** — ingrediente cumpărate în cantitate prea mare față de cererea reală, care expiră înainte de folosire\n- **Porții peste rețetă (overportioning)** — mai multă carne, brânză sau sos pus decât prevede rețeta, fără să fie facturat suplimentar\n- **Farfurie întoarsă (plate waste)** — clientul lasă mâncare pe farfurie, semn că porția e prea mare sau produsul nu corespunde așteptărilor\n\nÎn majoritatea afacerilor HoReCa din România, expirarea și porțiile peste rețetă cauzează cea mai mare pierdere financiară — sunt și cele mai ușor de măsurat și corectat.",
      },
      {
        heading: "Cum măsori risipa în bani, nu doar în kg aruncate",
        body: "Un exemplu de risipă săptămânală tipică într-un restaurant mediu, dacă nu e urmărită activ:\n\n- Verdeață/salată expirată: 2 kg × 12 RON/kg = **24 RON**\n- Lapte nefolosit la finalul zilei, aruncat: 4 litri × 6 RON/l = **24 RON**\n- Chifle/pâine nevândută: 15 buc × 2 RON = **30 RON**\n\nTotal risipă măsurată: **78 RON/săptămână**, doar din aceste trei categorii, fără porțiile peste rețetă care de obicei sunt greu de observat direct.\n\nExtrapolat: 78 RON × 4.3 săptămâni ≈ **335 RON/lună**, adică peste **4.000 RON/an** — bani cheltuiți pe ingrediente care nu au generat niciodată o vânzare. Și asta e doar partea vizibilă, ușor de cântărit.",
      },
      {
        heading: "Trei acțiuni concrete care reduc risipa fără să schimbi meniul",
        body: "1. **Ajustează cantitățile de comandă la consumul real** — dacă verdeața expiră constant, comanzi prea mult față de cât vinzi; reduci cantitatea comandată, nu prețul de vânzare\n2. **Rotești stocul corect (FIFO)** — ingredientele mai vechi se folosesc primele; un stoc dezordonat înseamnă produse uitate în spate care expiră nefolosite\n3. **Verifici porțiile efective vs. rețetă** — o cântărire ocazională a unei porții preparate față de rețeta configurată arată rapid dacă personalul depășește sistematic cantitățile\n\nNiciuna dintre acestea nu necesită schimbarea meniului sau a prețurilor — sunt ajustări de proces care recuperează bani deja cheltuiți degeaba.",
      },
      {
        heading: "Cât ajunge risipa la final de an dacă nu o urmărești",
        body: "335 RON pe lună pare o sumă mică izolat. Dar comparat cu marja unui produs, spune altă poveste: dacă marja medie pe un produs e de 15 RON, 335 RON de risipă lunară echivalează cu profitul pierdut la aproximativ 22 de vânzări — vânzări pe care le-ai făcut deja, dar al căror profit s-a dus pe risipă în altă parte a operațiunii.\n\nPe un an întreg, 4.000+ RON de risipă nemăsurată e o sumă comparabilă cu un upgrade de echipament sau cu câteva luni de abonament la un sistem de gestiune — bani care s-ar putea folosi productiv, nu arunca la propriu.",
      },
      {
        heading: "Cum te ajută stocul și rețetele din franchisetech să vezi risipa",
        body: "franchisetech nu elimină risipa automat — dar face vizibil ce anterior era invizibil. Balanța de stoc arată diferența dintre ce ai cumpărat (NIR), ce ai consumat conform rețetelor (bon de consum) și ce ar trebui să mai fie în stoc. O diferență mare și constantă între stocul teoretic și cel numărat fizic e semnul clar al risipei sau al porțiilor peste rețetă.\n\nCu date reale despre unde se duce ingredientul care nu ajunge în vânzare, poți decide informat unde să intervii — în loc să bănuiești.",
      },
    ],
  },
  {
    slug: "combo-meal-pricing-cum-calculezi",
    title: "Combo meal — cum calculezi prețul ca să rămâi profitabil",
    description:
      "Un combo prea generos la discount poate arăta bine pentru client și rău pentru marja ta. Vezi cum calculezi corect costul unui combo și cât discount îți permiți fără să pierzi profit.",
    publishedAt: "2026-06-23",
    locale: "ro",
    tags: ["retete","pret","combo"],
    image: "/marketing/recipe-costing-hero.png",
    relatedFeature: "/features/recipe-costing",
    sections: [
      {
        heading: "De ce combo-urile sunt capcana clasică de marjă",
        body: "Un meniu combo (produs principal + garnitură + băutură) e atractiv pentru client — pare o ofertă mai bună decât cumpărarea separată. Problema apare când reducerea acordată la combo nu ține cont de costul real al componentelor.\n\nGreșeala frecventă: proprietarul stabilește prețul combo-ului din burtă — un preț rotund care sună bine — fără să calculeze mai întâi costul însumat al celor trei componente. Rezultatul poate fi un combo care se vinde bine în volum, dar erodează marja generală a afacerii.",
      },
      {
        heading: "Cum calculezi costul real al unui combo",
        body: "Costul unui combo este suma costurilor rețetelor fiecărei componente — nu o estimare, ci suma exactă:\n\nCost combo = Cost componentă principală + Cost garnitură + Cost băutură\n\nMarja combo = Preț combo − Cost combo\n\nProcent marjă combo = (Marja combo / Preț combo) × 100\n\nPasul care lipsește frecvent: compararea cu suma prețurilor individuale ale componentelor, ca să vezi exact cât discount oferi de fapt clientului — și cât profit renunți să încasezi tu.",
      },
      {
        heading: "Exemplu numeric: meniu prânz rapid — preț separat vs preț combo",
        body: "**Componentele meniului „Prânz rapid”:**\n- Sandwich club: preț individual 22 RON, cost 7.50 RON\n- Cartofi prăjiți (porție mică): preț individual 9 RON, cost 2.20 RON\n- Limonadă de casă: preț individual 12 RON, cost 1.87 RON\n\n**Sumă preț separat: 43 RON. Cost total: 11.57 RON.** Marjă dacă ar fi vândute separat: 43 − 11.57 = 31.43 RON (**73.1%**).\n\n**Preț combo stabilit: 36 RON** (discount de 7 RON față de suma separată, adică 16.3%).\n\nMarjă combo: 36 − 11.57 = 24.43 RON (**67.9%**).\n\nDiferența: fiecare combo vândut aduce cu 7 RON mai puțin profit față de vânzarea separată a celor trei produse. Dacă volumul de combo-uri e mare, diferența se adună rapid.",
      },
      {
        heading: "Regula de reducere sănătoasă la combo",
        body: "În practică, un discount de combo care rămâne sustenabil pentru majoritatea afacerilor HoReCa se situează în jurul a **10–15% față de suma prețurilor separate** — suficient cât să pară o ofertă reală pentru client, fără să erodeze grav marja.\n\nÎn exemplul de mai sus, discountul de 16.3% e ușor peste acest interval. Dacă vrei să păstrezi marja aproape de nivelul separat, un preț combo de 38-39 RON (discount 9-11%) ar fi mai sustenabil decât 36 RON.\n\nCombo-ul rămâne justificat dacă generează volum suplimentar — clienți care altfel ar fi cumpărat doar sandwich-ul, dar cumpără tot meniul din cauza prețului atractiv. Fără date reale de vânzări, această presupunere rămâne doar o presupunere.",
      },
      {
        heading: "Ce combo NU trebuie să faci",
        body: "- **Nu combina două produse cu marjă deja mică** — dacă atât componenta principală cât și garnitura au food cost peste 35%, un combo cu discount suplimentar poate coborî marja periculos de aproape de zero\n- **Nu stabili prețul combo înainte de a calcula costul componentelor** — riști să afli abia peste o lună că meniul cel mai vândut e și cel mai puțin profitabil\n- **Nu păstra prețul combo fix când costul unei componente crește** — dacă furnizorul de cartofi scumpește, recalculezi combo-ul la fel cum recalculezi orice produs individual",
      },
      {
        heading: "Cum calculezi automat marja combo-urilor în franchisetech",
        body: "În franchisetech poți configura un produs combo ca rețetă proprie, formată din componentele sale, cu costul agregat calculat automat din costurile rețetelor individuale. Marja combo-ului apare direct în lista de rețete, alături de restul produselor din meniu.\n\nCând costul unei componente se schimbă (de exemplu cartofii, după o scumpire de furnizor), marja combo-ului se recalculează automat — nu trebuie să refaci manual calculul de fiecare dată.",
      },
    ],
  },
  {
    slug: "happy-hour-impact-marja-cum-calculezi",
    title: "Happy hour — cum calculezi impactul real asupra marjei înainte să-l lansezi",
    description:
      "Happy hour pare o strategie simplă de a atrage clienți la ore moarte, dar o reducere prea mare poate cere un volum imposibil de atins doar ca să nu pierzi profit. Vezi cum calculezi impactul real.",
    publishedAt: "2026-06-23",
    locale: "ro",
    tags: ["marja","happy-hour"],
    image: "/marketing/margins-report.png",
    relatedFeature: "/features/recipe-costing",
    sections: [
      {
        heading: "De ce happy hour sună bine dar poate să-ți scadă profitul, nu doar prețul",
        body: "Ideea din spatele happy hour e simplă: reduci prețul la anumite produse într-un interval cu trafic redus (de obicei 17:00-19:00), ca să aduci clienți care altfel nu ar veni la acea oră. Problema apare când reducerea e stabilită procentual, fără să verifici ce înseamnă asta pentru profitul în lei, nu doar pentru preț.\n\nO reducere de 30% la un produs cu marjă mare procentual poate părea sigură. Dar procentul de reducere se aplică la preț, nu la marjă — iar efectul asupra profitului real e mult mai mare decât pare din prima privire.",
      },
      {
        heading: "Formula: cu cât trebuie să crească volumul ca să nu pierzi bani",
        body: "Când reduci prețul, marja în lei per produs scade. Ca profitul total din interval să rămână același, ai nevoie de mai mult volum vândut — nu proporțional cu reducerea de preț, ci proporțional cu reducerea marjei.\n\n**Formula pentru volumul necesar la break-even de profit:**\n\nVolum nou = (Volum vechi × Marjă veche) / Marjă nouă\n\nCu cât marja e mai mică procentual la produsul redus, cu atât ai nevoie de o creștere de volum mai mare doar ca să egalezi profitul dinainte de reducere — nu ca să-l depășești.",
      },
      {
        heading: "Exemplu numeric: bere la halbă cu reducere 30%",
        body: "**Bere la halbă (400ml):**\n- Cost bere en-gros: 400ml × 9 RON/litru = 3.60 RON\n- Pierderi la tragere + pahar: 0.20 RON\n\nCost total: **3.80 RON**.\n\n**Preț normal: 14 RON.** Marjă: 14 − 3.80 = 10.20 RON (**72.9%**).\n\n**Preț happy hour (-30%): 9.80 RON.** Marjă: 9.80 − 3.80 = 6.00 RON (**61.2%**).\n\nDacă în mod normal vinzi 20 de halbe/oră, profitul e 20 × 10.20 = **204 RON/oră**.\n\nCa să obții același profit la happy hour, ai nevoie de: 204 / 6.00 = **34 de halbe/oră** — cu **70% mai mult volum** doar ca să egalezi profitul dinainte de reducere, nu ca să-l depășești.",
      },
      {
        heading: "Trei greșeli frecvente la stabilirea reducerii de happy hour",
        body: "- **Reducere procentuală identică pe tot meniul de băuturi**, indiferent de marja fiecărui produs — un cocktail cu marjă mare suportă o reducere mai mare decât o bere cu marjă deja moderată\n- **Nicio estimare a volumului necesar înainte de lansare** — reducerea se stabilește ca să sune bine (de exemplu -30%, -50%), fără calculul de mai sus\n- **Lipsa unei limite de timp clare** — happy hour fără oră de start/stop fixă devine reducere permanentă de facto, pe măsură ce clienții își ajustează comportamentul să vină mereu la preț redus",
      },
      {
        heading: "Cum alegi ce produse pui la happy hour și ce eviți",
        body: "Produsele potrivite pentru happy hour au două caracteristici: marjă suficient de mare cât să suporte reducerea, și elasticitate reală la volum — adică o reducere de preț chiar aduce clienți suplimentari, nu doar reduce ce ar fi plătit oricum clienții existenți.\n\nBerea și cocktailurile simple funcționează de obicei bine pentru happy hour tocmai pentru că au marjă solidă. Produsele cu marjă deja sub 60% (multe feluri de mâncare gătită) nu au loc de reducere suplimentară fără să intre în teritoriu neprofitabil.",
      },
      {
        heading: "Cum verifici impactul real după lansare în franchisetech",
        body: "Calculul teoretic de mai sus îți spune ce volum ai nevoie — dar doar vânzările reale îți spun dacă l-ai atins. În franchisetech, poți urmări vânzările pe interval orar și pe produs, ca să compari volumul real din intervalul de happy hour cu volumul necesar pentru break-even de profit.\n\nDacă după câteva săptămâni volumul rămâne sub pragul calculat, happy hour-ul costă bani în loc să aducă profit suplimentar — un semnal clar să ajustezi reducerea sau intervalul, nu doar să continui din inerție.",
      },
    ],
  },
  {
    slug: "cum-completezi-registrul-de-casa-corect",
    title: "Cum completezi corect Registrul de casă, pas cu pas",
    description:
      "Registrul de casă trebuie completat zilnic, fără ștersături, cu fiecare mișcare de numerar documentată. Iată structura exactă, un exemplu pas cu pas și greșelile frecvente.",
    publishedAt: "2026-06-24",
    locale: "ro",
    tags: ["registru-de-casa","raport-z"],
    image: "/marketing/reports-zreport.png",
    relatedFeature: "/features/z-report",
    sections: [
      {
        heading: "Ce este registrul de casă, mai exact",
        body: "Registrul de casă este documentul contabil care înregistrează, cronologic, fiecare mișcare de numerar din gestiunea ta: sold de la ziua anterioară, fiecare încasare, fiecare plată în numerar, sold rămas la final. Nu este raportul Z — raportul Z e sumarul vânzărilor zilei, registrul de casă e jurnalul complet al banilor fizici care intră și ies din sertar sau din casierie.\n\nDiferența contează practic: poți avea un raport Z corect (vânzările sunt înregistrate fiscal) și totuși un registru de casă incomplet, dacă ai scos bani din sertar pentru o plată către furnizor și nu ai notat-o. La control, cele două documente trebuie să se potrivească.",
      },
      {
        heading: "Structura pe coloane — ce completezi în fiecare rând",
        body: "Un registru de casă corect are aceleași coloane indiferent dacă îl ții pe hârtie sau electronic:\n\n- **Data** — ziua operațiunii\n- **Document** — tipul și numărul actului (bon fiscal, dispoziție de plată, chitanță)\n- **Explicație** — ce reprezintă mișcarea (încasări vânzări zi, plată furnizor, depunere bancă)\n- **Încasări** — suma care intră în casă\n- **Plăți** — suma care iese din casă\n- **Sold** — soldul rămas după fiecare operațiune\n\nPrima linie a fiecărei zile este soldul reportat din ziua anterioară (fondul de casă rămas). Ultima linie este soldul final, care trebuie să corespundă cu numerarul numărat fizic în sertar.",
      },
      {
        heading: "Exemplu complet, o zi de cafenea",
        body: "Iată cum arată o zi normală într-o cafenea mică:\n\n- **Sold reportat**: 300 lei (fondul de casă de la închiderea zilei anterioare)\n- **Încasări vânzări numerar** (agregat din raportul Z): 842 lei → sold 1.142 lei\n- **Plată furnizor lapte** (numerar, din sertar): −180 lei → sold 962 lei\n- **Depunere la bancă**: −682 lei → sold 280 lei\n- **Sold final**: 280 lei\n\nObservă că soldul final (280 lei) nu este identic cu fondul de casă inițial (300 lei) — diferența de 20 de lei ar trebui să apară undeva explicată (rest dat în plus, o eroare de numărare) sau, dacă fondul tău standard e 300 lei, completezi din nou până la 300 pentru ziua următoare și notezi mișcarea.",
      },
      {
        heading: "Corecțiile se fac prin stornare, nu prin ștersătură",
        body: "Registrul de casă nu se corectează prin ștersături sau prin acoperire cu marker. Dacă ai introdus o sumă greșită, adaugi o linie nouă de stornare (aceeași sumă, cu semn opus) și apoi linia corectă, cu explicație clară — «corecție rând anterior, sumă greșit introdusă».\n\nUn registru cu ștersături sau pagini rupte ridică semne de întrebare la orice control, indiferent dacă suma finală e corectă. Practic: dacă ții registrul electronic (așa cum se generează automat din sesiunile POS), problema dispare — sistemul nu permite modificarea retroactivă a unei linii deja închise, doar adăugarea unei corecții noi.",
      },
      {
        heading: "Greșeli frecvente la completare",
        body: "- **Nu notezi plățile mici din sertar** — furnizorul de pâine vine dimineața, plătești 50 lei cash, uiți să treci în registru; la final de lună, banii «lipsă» nu au explicație\n- **Amesteci fondul de casă cu încasările zilei** — dacă nu separi clar soldul reportat de vânzările zilei, nu poți verifica dacă vânzările înregistrate corespund cu banii fizici\n- **Completezi registrul o dată pe săptămână, din memorie** — orice mișcare necompletată la momentul respectiv se pierde sau se aproximează; registrul trebuie completat zilnic\n- **Nu păstrezi bonul sau documentul justificativ pentru fiecare plată din numerar** — o plată de 180 lei către furnizor fără chitanță sau bon nu poate fi verificată ulterior",
      },
      {
        heading: "Cum se generează automat în franchisetech",
        body: "Registrul de casă se descarcă direct din pagina Raportului Z, fără completare manuală. Sistemul preia automat fondul de deschidere al sesiunii, toate încasările din vânzări (numerar) și, dacă înregistrezi manual o ieșire de numerar (plată furnizor din sertar, depunere bancă), mișcarea respectivă apare ca linie separată, cu oră și utilizator.\n\nNu poți edita retroactiv o linie dintr-o zi închisă. Dacă găsești o eroare, adaugi o corecție nouă, datată la momentul descoperirii — exact logica de stornare cerută contabil, dar fără riscul unei ștersături sau al unei pagini pierdute.",
      },
    ],
  },
  {
    slug: "diferente-de-casa-cum-le-investighezi",
    title: "Diferențe de casă la închidere — cum le investighezi metodic",
    description:
      "Sertarul nu se potrivește cu raportul Z? Iată un protocol de investigare în șase pași — de la recalculare rest până la verificarea terminalului card — ca să găsești sursa.",
    publishedAt: "2026-06-24",
    locale: "ro",
    tags: ["numerar","raport-z"],
    image: "/marketing/reports-zreport.png",
    relatedFeature: "/features/z-report",
    sections: [
      {
        heading: "De ce nu ajunge doar să notezi diferența",
        body: "O diferență de 30 de lei lipsă din sertar poate însemna cinci lucruri complet diferite: rest dat greșit, o reducere aplicată dar neînregistrată corect, o plată cu cardul trecută din greșeală ca numerar, o ieșire de bani neconsemnată în registru sau, mai rar, o lipsă reală. Fiecare are o soluție diferită — și doar ultima e o problemă gravă.\n\nDacă te obișnuiești să notezi «diferență -30 lei, cauză necunoscută» și treci mai departe, nu rezolvi nimic. Peste o lună ai 20 de zile cu diferențe mici și nimeni nu-și mai amintește de ce. Investighezi metodic, în ordine, înainte să arhivezi ziua.",
      },
      {
        heading: "Pașii 1-3: verificările rapide, la sertar",
        body: "**1. Renumeri sertarul, pe bancnote și monede separat.** O greșeală de numărare e cea mai frecventă cauză reală — bancnote lipite, monede necontate. Numeri de două ori, independent, dacă se poate cu altcineva.\n\n**2. Verifici fondul de deschidere al zilei.** Dacă fondul introdus în sistem la deschidere nu corespunde cu ce ai pus fizic în sertar dimineața, diferența apare automat la închidere, fără nicio legătură cu vânzările din timpul zilei.\n\n**3. Treci prin bonurile anulate și retururile zilei.** O anulare de bon după ce clientul a plătit deja cash, fără să recuperezi fizic banii înapoi în sertar, creează exact tipul de diferență pe care-l vezi la închidere.",
      },
      {
        heading: "Pașii 4-6: verificările încrucișate",
        body: "**4. Compari totalul card din POS cu extrasul terminalului de plată.** Dacă un casier a apăsat card în POS dar clientul a plătit de fapt cash (sau invers), vânzarea e corect înregistrată ca sumă, dar greșit ca metodă de plată — sertarul are prea mulți sau prea puțini bani față de ce arată raportul.\n\n**5. Verifici toate ieșirile de numerar din timpul zilei.** Plată furnizor din sertar, avans dat unui angajat, orice ieșire care nu a fost trecută corect în sistem la momentul respectiv apare ca diferență la final.\n\n**6. Verifici predarea de tură, dacă ai mai mulți casieri.** Dacă sertarul a trecut de la un casier la altul fără o numărare intermediară documentată, nu poți ști în care tură a apărut diferența — doar că există la final de zi.",
      },
      {
        heading: "Ce faci dacă, după toate verificările, diferența rămâne",
        body: "Dacă ai trecut prin toți pașii și diferența nu are o explicație găsită, nu o ștergi și nu o ignori. Notezi în registrul de casă suma exactă, ora constatării și faptul că a rămas neexplicată după verificare. E singura variantă corectă din punct de vedere contabil — a inventa o explicație e mai rău decât a recunoaște că nu ai găsit-o.\n\nO diferență izolată de câțiva lei, într-o zi cu volum mare de tranzacții cash, e statistic normală — rotunjiri la rest, o monedă scăpată. Pragul de la care chiar merită investigat serios depinde de volumul tău, dar orice diferență peste 1-2% din vânzările cash ale zilei merită atenție imediată, nu doar o notă.",
      },
      {
        heading: "Când diferențele repetate devin un semnal de altă natură",
        body: "O diferență izolată e un incident. Aceeași direcție de diferență (mereu lipsă, niciodată în plus) la aceeași persoană, repetat pe parcursul a mai multe ture, e un tipar. Nu sari direct la concluzia de furt — de cele mai multe ori e vorba de un casier neinstruit corect pentru anulări sau reduceri. Dar tiparul merită o discuție directă și, dacă se repetă după discuție, o supraveghere mai atentă a acelor ture.\n\nFără un istoric clar al diferențelor pe zi și pe casier, nu poți vedea tiparul — doar cifre izolate care par mereu «mici, nu contează».",
      },
      {
        heading: "Cum urmărești asta în franchisetech",
        body: "Fiecare sesiune de casă din franchisetech înregistrează diferența numerar (așteptat vs. numărat) legată de casierul care a deschis și închis sesiunea respectivă, nu doar de zi. Poți filtra istoricul de diferențe pe o perioadă și vedea imediat dacă apar concentrate la o anumită persoană sau tură, în loc să răsfoiești rapoarte Z tipărite unul câte unul.",
      },
    ],
  },
  {
    slug: "raport-x-vs-raport-z-diferenta",
    title: "Raport X vs. Raport Z — care e diferența și când folosești fiecare",
    description:
      "Raportul X citește totalurile curente fără să închidă ziua fiscal, raportul Z le închide definitiv. Iată diferența practică și când folosești fiecare, cu exemple concrete.",
    publishedAt: "2026-06-25",
    locale: "ro",
    tags: ["raport-z","raport-x"],
    image: "/marketing/reports-zreport.png",
    relatedFeature: "/features/z-report",
    sections: [
      {
        heading: "Raportul X — o citire, nu o închidere",
        body: "Raportul X (numit uneori și raport intermediar sau raport de citire) îți arată totalurile curente ale sesiunii — vânzări de până acum, defalcare numerar/card, TVA colectat — fără să reseteze sau să închidă nimic. Poți genera un raport X de câte ori vrei în timpul zilei, la orice oră, fără nicio consecință fiscală.\n\nUtilitatea lui e strict operațională: verifici starea casei la prânz, înainte de o predare de tură, sau înainte de o depunere parțială de numerar la bancă, fără să afectezi contorul zilei.",
      },
      {
        heading: "Raportul Z — închiderea, o singură dată pe zi",
        body: "Raportul Z face ce numele sugerează: închide definitiv ziua fiscală curentă și reface contoarele pentru ziua următoare. Odată generat, vânzările zilei respective sunt considerate raportate fiscal — nu mai poți adăuga tranzacții din ziua anterioară după ce ai făcut Z.\n\nÎn majoritatea sistemelor, raportul Z pentru o zi calendaristică nu se poate genera de două ori — dacă ai emis deja Z pentru azi, a doua generare fie e blocată, fie pornește ziua următoare de la zero. De asta raportul Z se face o singură dată, la finalul efectiv al programului.",
      },
      {
        heading: "Când folosești X și când folosești Z",
        body: "- **Raport X** — verificare de casă la schimb de tură, fără să închizi ziua altui casier; control rapid al numerarului înainte de o depunere parțială; verificare a TVA-ului colectat până la ora respectivă, pentru o estimare\n- **Raport Z** — o singură dată, la finalul zilei de lucru, după ultima vânzare, înainte de a scoate numerarul din sertar pentru numărătoarea finală\n\nO greșeală frecventă: unii casieri generează Z de câte ori vor să vadă cum stă ziua, crezând că funcționează ca un X. Dacă sistemul permite un singur Z pe zi, asta poate încheia ziua fiscal prematur, la ora 14:00, în timp ce locația rămâne deschisă până la 22:00 — vânzările de după ora aceea rămân fără raport de închidere corect.",
      },
      {
        heading: "Ce conțin, comparativ",
        body: "Ambele rapoarte afișează, de regulă, aceleași categorii de informație — vânzări totale, defalcare pe metodă de plată, TVA pe cote — dar cu un rol diferit:\n\n- **X** — informativ, repetabil, nu modifică nimic în evidența fiscală\n- **Z** — definitiv, o dată pe zi, resetează contoarele și marchează oficial închiderea zilei\n\nDin acest motiv, raportul Z este cel arhivat și cerut la control fiscal ca dovadă a închiderii zilei — raportul X nu are această valoare, e doar un instrument de lucru.",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "În franchisetech, generarea raportului X sau Z necesită drepturi de administrator sau manager — nu orice casier poate închide ziua fiscal, exact pentru a preveni o închidere accidentală sau prematură. Raportul X îl poți genera oricând, din contul de administrator, pentru o verificare rapidă a stării casei, fără efect asupra sesiunii active.\n\nRaportul Z rămâne acțiunea finală, conștientă, făcută o singură dată — după ce te-ai asigurat că toate vânzările zilei sunt deja înregistrate.",
      },
    ],
  },
  {
    slug: "inchidere-multi-casierie-mai-multe-case-o-zi",
    title: "Închiderea zilei când ai mai multe case de marcat active",
    description:
      "Cu două sau mai multe case active simultan, închiderea zilei nu înseamnă un singur raport Z, ci unul per casă, plus o reconciliere separată pentru fiecare casier.",
    publishedAt: "2026-06-25",
    locale: "ro",
    tags: ["raport-z","multi-casierie"],
    image: "/marketing/reports-zreport.png",
    relatedFeature: "/features/z-report",
    sections: [
      {
        heading: "Problema reală: mai multe case, un singur sertar mental",
        body: "Un restaurant cu bar și zonă de mese, sau o cafenea cu două puncte de vânzare, ajunge frecvent la aceeași greșeală: la final de zi, cineva adună toți banii într-un singur teanc și îl compară cu un singur total. Problema — dacă apare o diferență, nu mai știi din care casă vine, pentru că sertarele au fost amestecate înainte de a fi numărate separat.\n\nFiecare casă de marcat (fizică sau sesiune POS separată) trebuie numărată și închisă independent, înainte de orice consolidare.",
      },
      {
        heading: "Fiecare sesiune, propriul fond și propria închidere",
        body: "Regula de bază pentru multi-casierie: fiecare casă are propriul fond de deschidere, propriile vânzări și propriul raport Z. Nu contează dacă la final banii ajung în același seif — procesul de verificare trebuie să treacă prin fiecare casă separat:\n\n- Casa 1 (bar): fond deschidere + vânzări casa 1 = numerar așteptat casa 1\n- Casa 2 (mese): fond deschidere + vânzări casa 2 = numerar așteptat casa 2\n\nNumeri sertarul 1, compari cu așteptat casa 1. Numeri sertarul 2, compari cu așteptat casa 2. Abia după ce ambele sunt verificate separat, poți consolida suma totală pentru depunere la bancă.",
      },
      {
        heading: "Cine e responsabil de fiecare casă",
        body: "Multi-casierie fără responsabilitate clară pe fiecare casă înseamnă că, la o diferență, nimeni nu poate fi tras la răspundere pentru că toată lumea a atins toate sertarele. Practicile care funcționează:\n\n- Fiecare casier deschide sesiunea pe login-ul propriu, nu pe un cont comun\n- Un casier nu operează pe casa altui casier fără o predare de tură documentată (numărare și confirmare în sistem)\n- La schimb de tură pe aceeași casă fizică, sesiunea veche se închide și se deschide una nouă — nu se continuă sesiunea altcuiva\n\nAsta transformă o diferență de casă dintr-un mister general într-o problemă atribuibilă unei persoane și unui interval orar clar.",
      },
      {
        heading: "Consolidarea la final — după, nu în loc de, verificarea individuală",
        body: "După ce fiecare casă e închisă și verificată individual, faci consolidarea: totalul vânzărilor zilei pe toată locația, defalcat pe metodă de plată, agregat din toate sesiunile. Acesta e numărul relevant pentru raportarea către contabil și pentru urmărirea performanței zilei.\n\nDar consolidarea nu înlocuiește verificarea per casă — dacă sari direct la totalul general și el se potrivește per total, poți avea o casă cu 100 lei lipsă și alta cu 100 lei în plus care se anulează reciproc în total, lăsând o problemă reală neobservată.",
      },
      {
        heading: "Cum arată în franchisetech",
        body: "franchisetech tratează fiecare sesiune de casă (fiecare casier, fiecare punct de vânzare) ca o unitate separată, cu fond de deschidere propriu, raport Z propriu și diferență numerar proprie. Nu se poate deschide o a doua sesiune activă pe aceeași casă fizică fără închiderea celei anterioare — elimină scenariul în care doi casieri operează neintenționat pe același sertar.\n\nDin **Rapoarte → Raport Z zilnic**, vezi rapoartele individuale pe casă și un total consolidat pentru toată ziua, fără să calculezi manual suma sesiunilor.",
      },
    ],
  },
  {
    slug: "numerar-in-exces-in-casa-ce-faci",
    title: "Ai prea mult numerar în casă — ce faci și ce reguli se aplică",
    description:
      "Prea mult numerar acumulat în sertar înseamnă risc de furt și evidență mai greu de verificat. Iată cum stabilești un plafon operațional și când e momentul să depui excesul.",
    publishedAt: "2026-06-25",
    locale: "ro",
    tags: ["numerar","raport-z"],
    image: "/marketing/reports-zreport.png",
    relatedFeature: "/features/z-report",
    sections: [
      {
        heading: "De ce numerarul acumulat e o problemă, chiar dacă suma e corectă",
        body: "Un sertar cu 4.000 de lei la final de zi, chiar dacă suma se potrivește exact cu raportul Z, e un risc mai mare decât un sertar cu 400 de lei plus o depunere zilnică la bancă. Riscul nu vine din discrepanțe — vine din faptul că orice incident (spargere, angajat necinstit, o eroare de predare de tură) afectează o sumă mult mai mare.\n\nExistă și un motiv practic: cu cât numerarul rămâne mai mult timp nedepus, cu atât e mai greu de reconstruit exact ce sumă corespunde cărei zile dacă apare o întrebare ulterioară din partea contabilului sau a unui control.",
      },
      {
        heading: "Cât numerar are sens să păstrezi peste noapte",
        body: "Nu există un răspuns universal, dar regula practică folosită de majoritatea operatorilor HoReCa este: păstrezi în sertar sau în seif doar fondul de casă necesar pentru a deschide ziua următoare (fondul de rezervă pentru rest), nu totalul vânzărilor zilei.\n\nExemplu: dacă fondul tău de deschidere standard e 300 lei, iar ziua a adus 1.500 lei încasări numerar, ideal depui 1.500 lei la bancă și păstrezi cei 300 lei pentru mâine — nu lași 1.800 lei în sertar peste noapte ca rezervă suplimentară.",
      },
      {
        heading: "Situații care duc la acumulare de numerar",
        body: "- **Program care nu permite depunere zilnică** — dacă închizi la 23:00 și banca s-a închis la 18:00, numerarul rămâne peste noapte inevitabil; soluția e un seif sigur, nu evitarea depunerii\n- **Volum mare de cash într-un weekend aglomerat** — dacă banca e închisă sâmbătă-duminică, numerarul se acumulează două-trei zile; unele bănci oferă automate de depunere non-stop pentru exact acest caz\n- **Amânarea repetată devenită obicei** — cea mai frecventă cauză reală nu e programul băncii, e amânarea repetată a unei sarcini administrative",
      },
      {
        heading: "Ce faci concret cu excesul",
        body: "1. **Calculezi suma de depus** — total încasări numerar din raportul Z, minus fondul de rezervă pe care îl păstrezi pentru ziua următoare\n2. **Documentezi ieșirea în registrul de casă** înainte să scoți banii din sertar — «ieșire numerar, depunere bancă, suma X»\n3. **Depui la bancă** — automat de depunere, ghișeu, sau serviciu de transport valori dacă suma e mare și recurentă\n4. **Păstrezi bonul de depunere** ca justificativ pentru registrul de casă și pentru contabil\n\nDacă suma zilnică de numerar e constant mare, un serviciu de transport de valori costă, dar elimină riscul de a transporta personal sume mari, în special dacă programul de lucru se termină seara târziu.",
      },
      {
        heading: "Cum te ajută franchisetech să vezi excesul",
        body: "Raportul Z îți arată clar suma totală de numerar încasată în ziua respectivă, separat de fondul de deschidere — vezi imediat cât e de depus versus cât rămâne ca fond pentru mâine, fără să calculezi manual diferența. Dacă operezi mai multe zile fără depunere, poți vedea din istoricul rapoartelor Z cât numerar s-a acumulat cumulat, ca semnal că e timpul pentru o depunere.",
      },
    ],
  },
  {
    slug: "cand-si-cum-depui-numerarul-la-banca",
    title: "Când și cum depui numerarul din vânzări la bancă",
    description:
      "Depunerea numerarului nu e doar drum la bancă — presupune calcul corect al sumei, documentare în registrul de casă și un ritm care nu lasă bani să se adune nejustificat.",
    publishedAt: "2026-06-26",
    locale: "ro",
    tags: ["numerar","banca"],
    image: "/marketing/reports-zreport.png",
    relatedFeature: "/features/z-report",
    sections: [
      {
        heading: "Cât de des depui, în funcție de volum",
        body: "Nu există o regulă fixă, dar ritmul depinde direct de volumul zilnic de numerar:\n\n- **Volum mic** (sub 500 lei cash/zi) — depunere de 2-3 ori pe săptămână e rezonabilă, dacă ai un seif sigur peste noapte\n- **Volum mediu-mare** (peste 1.500 lei cash/zi) — depunere zilnică, ideal în aceeași zi sau a doua zi dimineață\n- **Weekend-uri aglomerate** — dacă banca e închisă sâmbătă-duminică, folosești automatul de depunere non-stop, dacă banca ta oferă acest serviciu, sau păstrezi în seif până luni\n\nCe nu funcționează: depunerea făcută «atunci când ai timp», fără un ritm stabilit. Ajungi să porți sume mari, la intervale neregulate, ceea ce e exact profilul de risc pe care vrei să-l eviți.",
      },
      {
        heading: "Pașii unei depuneri corecte",
        body: "1. **Calculezi suma de depus** din raportul Z — numerar încasat minus fondul de rezervă păstrat\n2. **Numeri fizic suma** înainte să pleci de la locație, separat de restul sertarului\n3. **Completezi foaia de vărsământ** (sau folosești automatul de depunere, care generează bon automat)\n4. **Notezi ieșirea în registrul de casă** — data, suma, explicația «depunere bancă»\n5. **Păstrezi bonul de depunere** — justificativ pentru contabil și pentru orice verificare ulterioară a mișcării de numerar\n\nBonul de la bancă și linia din registrul de casă trebuie să corespundă exact ca sumă și dată. Dacă depui 682 lei dar în registru ai notat 700 lei ca să rotunjești, ai creat o discrepanță pe care contabilul o va găsi la reconciliere.",
      },
      {
        heading: "Riscuri de siguranță de care nu vorbește nimeni",
        body: "Depunerea de numerar e momentul cu cel mai mare risc fizic din tot ciclul zilei — mai ales dacă rutina e previzibilă (aceeași oră, aceeași persoană, același traseu). Câteva ajustări simple reduc riscul real:\n\n- Variezi ora și traseul, dacă e posibil\n- Nu anunți public, în discuții cu clienți sau pe rețele sociale, când se face depunerea\n- Pentru sume mari și recurente, iei în calcul un serviciu de transport de valori în loc să porți personal banii\n- Eviți să depui singur, seara târziu, într-o zonă slab iluminată — chiar dacă suma pare mică",
      },
      {
        heading: "Legătura cu registrul de casă și cu reconcilierea bancară",
        body: "Fiecare depunere trebuie să apară ca linie de ieșire în registrul de casă, cu suma și data exacte. Ulterior, contabilul verifică lunar dacă sumele depuse conform registrului de casă apar identic în extrasul de cont bancar — asta e reconcilierea bancă-casă. Orice diferență între ce ai notat că ai depus și ce arată banca efectiv are nevoie de explicație imediată, nu descoperită peste trei luni la un audit.\n\nDin acest motiv, disciplina la momentul depunerii (sumă corectă, notată corect, bon păstrat) economisește ore de muncă contabilă mai târziu.",
      },
      {
        heading: "Cum urmărești depunerile în franchisetech",
        body: "Când înregistrezi o ieșire de numerar pentru depunere bancă direct din sesiunea de casă, franchisetech o leagă automat de raportul Z al zilei respective — apare ca mișcare documentată în registrul de casă descărcabil, cu oră și utilizator care a făcut înregistrarea. Nu mai depinde de cineva să-și amintească să scrie manual într-un caiet.",
      },
    ],
  },
  {
    slug: "fond-de-rezerva-in-casa-cat-e-recomandat",
    title: "Fond de rezervă în casă — cât e recomandat să păstrezi",
    description:
      "Fondul de casă pentru rest trebuie să acopere primele ore de vânzare, fără să depășească necesarul. Iată cum calculezi suma potrivită și greșelile frecvente de dimensionare.",
    publishedAt: "2026-06-26",
    locale: "ro",
    tags: ["numerar","fond-casa"],
    image: "/marketing/reports-zreport.png",
    relatedFeature: "/features/z-report",
    sections: [
      {
        heading: "Ce este fondul de rezervă și ce NU este el",
        body: "Fondul de rezervă (fondul de casă, fondul de deschidere) este suma de bani cu care începi ziua în sertar, exclusiv pentru a da rest clienților care plătesc cu bancnote mari. Nu e un rezervor de siguranță pentru cheltuieli neprevăzute și nu face parte din vânzările zilei — la finalul zilei, acest fond trebuie să rămână intact, separat de banii încasați din vânzări.\n\nUn fond prea mic te forțează să refuzi clienți sau să alergi după rest la un magazin vecin. Un fond prea mare înseamnă bani inactivi expuși inutil la risc de furt sau eroare de numărare.",
      },
      {
        heading: "Cum calculezi suma potrivită",
        body: "Formula practică pornește de la structura reală a plăților tale, nu de la o sumă rotundă aleasă la nimereală:\n\n**Fond recomandat ≈ 3-5 tranzacții cu bancnotă mare × diferența medie de rest**\n\nExemplu pentru o cafenea cu bon mediu de 20 lei:\n- Clienți care plătesc cu bancnotă de 100 lei: aproximativ 5-8 pe zi în primele ore\n- Rest mediu necesar per tranzacție: ~80 lei\n- Fond recomandat: 300-400 lei, în bancnote mici și monede\n\nPentru un restaurant cu bon mediu de 60-80 lei, unde clienții plătesc frecvent cu 200 sau 500 lei, fondul necesar pentru rest e mai mare — poate ajunge la 500-800 lei, în funcție de mixul real de plăți cash observat pe câteva săptămâni.",
      },
      {
        heading: "Mixul de bancnote contează la fel de mult ca suma totală",
        body: "300 lei în bancnote de 100 nu ajută dacă ai nevoie să dai rest la o bancnotă de 100 pentru o cafea de 12 lei. Fondul de rezervă trebuie să conțină un mix realist:\n\n- Bancnote de 10 și 50 lei pentru rest curent\n- Monede pentru sume sub 10 lei\n- Câteva bancnote de 100 lei doar dacă ai nevoie să dai rest la 200 sau 500\n\nO greșeală frecventă: fondul e completat cu orice bancnote au rămas din ziua anterioară, fără verificare, și ajunge dezechilibrat — mult în bancnote mari, puțin mărunt. Primele ore de dimineață sunt exact momentul în care lipsa de mărunt creează cea mai mare frecare cu clienții.",
      },
      {
        heading: "Fondul rămâne constant — nu se amestecă cu vânzările",
        body: "Regula operațională esențială: fondul de deschidere nu se atinge în timpul zilei pentru altceva decât rest. Nu plătești furnizorul din fond pentru că «oricum sunt bani în sertar» — orice plată din numerar iese din încasările zilei, documentată separat, nu din fondul de rezervă.\n\nLa închidere, verifici: sertarul are fondul inițial plus încasările zilei minus plățile din numerar. Scazi fondul inițial înapoi (rămâne pentru mâine) și restul e ce depui la bancă. Dacă fondul s-a topit în vânzările zilei fără să-l separi, nu mai poți verifica nimic curat.",
      },
      {
        heading: "Cum gestionezi fondul în franchisetech",
        body: "La deschiderea fiecărei sesiuni de casă, introduci fondul de deschidere o singură dată — sistemul îl leagă de acea sesiune specifică și nu permite introducerea lui de două ori din greșeală (un dublu-click accidental nu dublează fondul înregistrat). La închidere, raportul Z separă clar fondul inițial de încasările efective ale zilei, așa că știi exact ce sumă rămâne ca fond pentru ziua următoare și ce sumă e de depus.",
      },
    ],
  },
  {
    slug: "audit-trail-pos-de-ce-conteaza",
    title: "Audit trail în POS — de ce contează fiecare acțiune înregistrată",
    description:
      "Un audit trail complet înseamnă că fiecare vânzare, anulare sau reducere din POS e legată de un utilizator și o oră exactă. Iată de ce contează practic, nu doar la un control.",
    publishedAt: "2026-06-27",
    locale: "ro",
    tags: ["pos","audit"],
    image: "/marketing/reports-zreport.png",
    relatedFeature: "/features/z-report",
    sections: [
      {
        heading: "Ce este, concret, un audit trail într-un POS",
        body: "Audit trail înseamnă jurnalul complet al acțiunilor din sistem: cine a deschis sesiunea de casă, cine a înregistrat fiecare vânzare, cine a aplicat o reducere, cine a anulat un bon și la ce oră exact s-a întâmplat fiecare acțiune. Nu e un raport financiar — e un jurnal de acțiuni, legat de o persoană, nu doar de o sumă.\n\nDiferența față de un raport Z: raportul Z îți spune ce s-a vândut. Audit trail-ul îți spune cine a făcut fiecare acțiune și când, inclusiv acțiunile care nu apar direct în totalul vânzărilor — anulări, reduceri, corecții.",
      },
      {
        heading: "De ce contează în activitatea zilnică, nu doar la control",
        body: "Cel mai frecvent scenariu unde lipsa unui audit trail te costă timp: un client reclamă că a fost taxat greșit, sau observi la sfârșitul zilei un bon anulat de 240 lei și nimeni nu-și amintește de ce. Fără audit trail, întrebi toată tura și primești răspunsuri vagi. Cu audit trail, verifici în două minute: ora anulării, casierul care a făcut-o, dacă a existat un motiv notat.\n\nAlt scenariu real: un angajat pleacă din echipă și, la câteva săptămâni distanță, apare o discuție despre o discrepanță din perioada cât a lucrat. Fără istoric legat de utilizator, nu poți verifica nimic retroactiv — cu audit trail, ai răspunsul indiferent de cât timp a trecut.",
      },
      {
        heading: "Ce lipsește la sistemele cu login comun sau PIN partajat",
        body: "Multe case de marcat vechi sau sisteme POS simple folosesc un singur cod PIN pentru toți angajații, din comoditate. Problema: orice acțiune înregistrată în sistem e atribuită generic «casierului», nu unei persoane anume. Practic, nimeni nu poate fi tras la răspundere pentru o anulare suspectă, pentru că oricine putea fi la casă în acel moment.\n\nAsta nu e doar o problemă teoretică de fraudă — e și o problemă de training. Dacă nu poți identifica cine a greșit la o operațiune (de exemplu, aplică greșit reducerile), nu poți corecta comportamentul specific persoanei respective.",
      },
      {
        heading: "Ce ar trebui să conțină un audit trail minim funcțional",
        body: "- **Identitate utilizator** — fiecare acțiune legată de un cont de login individual, nu de un PIN comun\n- **Marcă temporală** — data și ora exactă a fiecărei acțiuni\n- **Tip acțiune** — vânzare, anulare, reducere, deschidere sau închidere de sesiune, corecție\n- **Valoare înainte/după**, pentru acțiuni care modifică o sumă deja introdusă\n- **Imposibilitate de ștergere retroactivă** — o acțiune înregistrată rămâne în istoric, chiar dacă e ulterior corectată printr-o acțiune nouă\n\nUltimul punct e cel mai important din perspectivă de conformitate: un audit trail care poate fi editat sau șters nu mai e un audit trail, e doar un jurnal opțional.",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "Fiecare acțiune din franchisetech — vânzare, anulare, reducere, deschidere sau închidere de sesiune — este legată de contul individual al angajatului care a executat-o și de o oră exactă. Nu există PIN comun pentru toată tura; fiecare angajat are login propriu.\n\nIstoricul nu poate fi editat retroactiv din interfață — dacă o acțiune trebuie corectată, se face printr-o acțiune nouă, vizibilă separat, nu prin modificarea celei vechi. Dacă vrei să verifici o zi sau un angajat anume, istoricul e disponibil oricând, nu doar în ziua respectivă.",
      },
    ],
  },
  {
    slug: "pontaj-personal-horeca-metode",
    title: "Pontajul personalului în HoReCa — metode simple care chiar funcționează",
    description:
      "Cum ții evidența corectă a orelor lucrate de personal într-o cafenea sau restaurant cu ture variabile — metode reale, de la caietul de pontaj la aplicații dedicate.",
    publishedAt: "2026-06-27",
    locale: "ro",
    tags: ["personal","pontaj"],
    image: "/marketing/dashboard-hero.png",
    sections: [
      {
        heading: "De ce pontajul clasic nu ține pasul cu HoReCa",
        body: "Într-un birou, opt angajați lucrează opt ore, cinci zile pe săptămână, în același interval. Într-o cafenea sau restaurant, ai cinci casieri cu programe diferite, doi cu normă parțială, unul care vine doar weekend și un ospătar care schimbă tura cu un coleg fără să anunțe pe nimeni în scris.\n\nUn caiet de pontaj sau un tabel Excel actualizat «din memorie» la finalul săptămânii nu prinde realitatea: ore suplimentare nescrise, ture schimbate ad-hoc, pauze care nu se respectă. Rezultatul apare abia la calculul salariilor, când orele din statul de plată nu se potrivesc cu cine chiar a fost la muncă.",
      },
      {
        heading: "Trei metode, cu avantaje și limite reale",
        body: "**Caietul de pontaj manual.** Cel mai ieftin și cel mai fragil. Depinde de disciplina fiecărui angajat să scrie ora de intrare și ieșire corect, în timp real, nu retroactiv. Într-o tură aglomerată, primul lucru uitat e pontajul.\n\n**Excel sau Google Sheets.** Un pas peste caiet — poți calcula automat orele și costul per angajat cu formule. Problema rămâne aceeași: cineva trebuie să introducă manual ora reală, iar corecțiile ulterioare («am uitat să pontez») sunt greu de verificat.\n\n**Aplicație de pontaj dedicată sau pontaj integrat în programul de gestiune.** Angajatul se loghează cu propriul cont la începutul turei — ora se înregistrează automat, fără să depindă de memorie. Corecțiile rămân vizibile în istoric, nu se suprascriu tăcut.\n\nNu există o metodă universal corectă — depinde de câți angajați ai și cât de variabile sunt turele. O cafenea cu 2 angajați fixi poate funcționa bine cu Excel. Un restaurant cu 12 angajați pe 3 ture are nevoie de ceva automatizat.",
      },
      {
        heading: "Ce trebuie să conțină o evidență corectă a orelor",
        body: "Indiferent de metodă, o evidență a timpului de lucru trebuie să arate clar, pentru fiecare angajat și fiecare zi:\n\n- Ora exactă de intrare și ieșire\n- Pauzele luate, mai ales dacă sunt neplătite\n- Orele suplimentare, separate de programul normal\n- Tura de noapte sau de weekend, dacă se plătește diferit\n- Zilele de concediu, medicale sau învoiri, cu tip clar\n\nAceastă evidență stă la baza statului de plată și, dacă vine un control de muncă, e primul document cerut. O evidență incompletă sau completată retroactiv «pe ghicite» e mai riscantă decât lipsa completă — arată neconcordanțe pe care nu le poți explica ulterior.",
      },
      {
        heading: "Greșelile care apar cel mai des",
        body: "**Pontaj completat la sfârșitul săptămânii, din memorie.** Nimeni nu-și amintește exact dacă a plecat la 22:00 sau 22:30 vineri. Diferența pare mică, dar înmulțită la 4-5 angajați și 4 săptămâni, denaturează costul real cu personalul.\n\n**Ore suplimentare «înțelese», dar nescrise.** Un angajat rămâne o oră peste program să ajute la o comandă mare. Dacă nu se notează, ora dispare — angajatul simte că nu i se recunoaște efortul, iar tu pierzi vizibilitatea reală asupra costului cu personalul din ziua respectivă.\n\n**Schimburi de tură nedocumentate.** Doi angajați se înțeleg între ei să facă schimb, dar nimeni nu actualizează programul oficial. Dacă apare o problemă în acea tură, nu știi cu certitudine cine a fost efectiv de serviciu.",
      },
      {
        heading: "Cum legi pontajul de costul real al fiecărei ture",
        body: "Pontajul nu e doar un exercițiu de conformitate — este datele din care afli cât te costă efectiv fiecare oră de deschidere. Dacă știi câte ore a lucrat fiecare angajat într-o săptămână și la ce tarif, poți calcula costul cu personalul per zi și îl poți compara cu vânzările din aceeași zi.\n\nO tură de vineri seară cu 3 angajați care aduce 1.200 lei vânzări are o structură de cost complet diferită față de o tură de marți dimineață cu aceiași 3 angajați și 400 lei vânzări. Fără pontaj corect, cifra asta rămâne invizibilă — vezi doar costul lunar total cu salariile, fără să știi care ture sunt eficiente și care nu.",
      },
      {
        heading: "Checklist rapid pentru un pontaj care ține",
        body: "- Fiecare angajat pontează la intrare și ieșire, nu retroactiv\n- Orele suplimentare se notează separat, în ziua în care apar\n- Schimburile de tură se actualizează în programul oficial, nu doar verbal\n- Pauzele neplătite sunt marcate distinct de timpul lucrat\n- Evidența lunară se verifică înainte de calculul salariilor, nu după\n- Păstrezi evidența minimum câțiva ani, pentru orice control ulterior\n\nUn pontaj corect nu previne toate problemele de personal, dar elimină cea mai frecventă sursă de conflict: «nu-mi recunoașteți orele lucrate».",
      },
    ],
  },
  {
    slug: "cum-faci-programul-de-ture-optim",
    title: "Cum faci un program de ture optim, fără suprapuneri și găuri",
    description:
      "Ghid practic pentru a construi programul săptămânal de ture fără ore moarte sau suprapuneri costisitoare, pornind de la datele reale de vânzări pe oră, nu de la instinct.",
    publishedAt: "2026-06-27",
    locale: "ro",
    tags: ["personal","program"],
    image: "/marketing/industry-kitchen.png",
    sections: [
      {
        heading: "De ce programul «făcut din cap» costă bani",
        body: "Cel mai comun scenariu: proprietarul face programul duminică seara, pe baza a ceea ce își amintește din săptămâna trecută. Rezultatul — miercuri după-amiază ai 3 oameni la un flux de 5 clienți pe oră, iar vineri seara ai 2 oameni la un flux dublu față de miercuri.\n\nAmbele situații costă bani. Suprapunerea de personal în orele slabe înseamnă cost salarial fără vânzări care să-l justifice. Lipsa de personal în orele de vârf înseamnă clienți care așteaptă, comenzi greșite din grabă și, uneori, clienți care pleacă fără să comande.",
      },
      {
        heading: "Pornește de la datele de vânzări, nu de la instinct",
        body: "Dacă ai chiar și trei-patru săptămâni de istoric din POS, poți vedea exact orele de vârf: câte tranzacții ai pe fiecare oră a zilei, pe fiecare zi a săptămânii. Majoritatea afacerilor HoReCa au un tipar clar — de exemplu vârf de dimineață între 08:00-10:00 la o cafenea de birouri, sau vârf de seară vineri-sâmbătă la un restaurant.\n\nCompară numărul de tranzacții pe oră cu numărul de angajați programați în acel interval. Dacă ai 40 de tranzacții/oră cu 2 angajați la casă la ora de vârf și doar 5 tranzacții/oră cu tot atâția angajați la ora moartă de după-amiază, ai un dezechilibru clar de corectat.",
      },
      {
        heading: "Reguli de bază pentru un program corect",
        body: "- **Respectă odihna minimă între două ture** — un angajat care termină tura la 23:00 nu ar trebui programat la 07:00 a doua zi\n- **Evită ture duble consecutive fără pauză reală între ele** — o «tură dublă» de 12+ ore duce la oboseală și greșeli la casă\n- **Distribuie weekendul echitabil** — dacă aceiași 2 oameni lucrează mereu sâmbăta și duminica, e o rețetă sigură pentru resentiment și plecări\n- **Ai mereu un back-up pentru concedii medicale neanunțate** — cineva care poate acoperi o tură cu preaviz scurt\n- **Publică programul din timp** — cu minimum o săptămână înainte, angajații își pot organiza viața personală",
      },
      {
        heading: "Greșelile care distrug încrederea în program",
        body: "**Programul schimbat în ultimul moment, fără discuție.** Un angajat care planificase liber vineri și află joi seara că e programat, simte lipsă de respect pentru timpul lui — chiar dacă motivul e legitim, de exemplu un coleg s-a îmbolnăvit.\n\n**Favoritismul vizibil.** Dacă anumiți angajați primesc mereu turele bune, weekend liber, ore de zi, și alții mereu turele proaste, noapte, sărbători, fluctuația de personal crește exact la cei defavorizați — de obicei cei mai buni, care au și alte opțiuni.\n\n**Lipsa oricărui tipar predictibil.** Un program complet diferit în fiecare săptămână, fără nicio structură recognoscibilă, face imposibil pentru angajat să-și planifice orice altceva în viață — al doilea job, facultate, familie.",
      },
      {
        heading: "Un sistem simplu care funcționează",
        body: "1. **Construiește un șablon de bază** pornind de la orele de vârf identificate din vânzări — câți oameni ai nevoie în fiecare interval, într-o săptămână «normală»\n2. **Ajustează șablonul pentru zilele speciale** — sărbători, evenimente locale, weekend-uri prelungite, care schimbă fluxul obișnuit\n3. **Colectează disponibilitatea angajaților din timp** — cine poate sau nu poate într-o săptămână anume, înainte să faci programul, nu după\n4. **Publică programul cu cel puțin 7 zile înainte** și lasă un canal clar pentru cereri de schimb\n5. **Revizuiește lunar** — comparând orele programate cu orele efectiv lucrate din pontaj, vezi rapid dacă șablonul mai reflectă realitatea",
      },
      {
        heading: "Checklist înainte să publici programul săptămânii",
        body: "- Orele de vârf din ultimele săptămâni sunt acoperite cu suficient personal\n- Nu există suprapuneri inutile în orele moarte\n- Fiecare angajat are minimum de odihnă între ture respectat\n- Weekendul e distribuit echitabil, nu mereu pe aceiași oameni\n- Există cel puțin o persoană de back-up cunoscută pentru fiecare tură critică\n- Programul e publicat cu minimum o săptămână înainte\n\nUn program bun nu elimină toate problemele de moment, dar reduce drastic deciziile de ultimă oră luate sub presiune — care sunt, de regulă, cele mai scumpe.",
      },
    ],
  },
  {
    slug: "fluctuatie-personal-horeca-cauze-solutii",
    title: "Fluctuația mare de personal în HoReCa — cauze reale și soluții",
    description:
      "De ce pleacă des angajații din HoReCa și ce poți schimba realist, fără să crești salariile — de la programul imprevizibil la lipsa unui training structurat.",
    publishedAt: "2026-06-28",
    locale: "ro",
    tags: ["personal","fluctuatie"],
    image: "/marketing/industry-kitchen.png",
    sections: [
      {
        heading: "Fluctuația mare nu e «normală», e un cost ascuns",
        body: "HoReCa are, recunoscut, una dintre cele mai ridicate rate de fluctuație de personal dintre toate industriile — motiv pentru care mulți proprietari o tratează ca pe o normalitate cu care trebuie doar să te împaci. Realitatea: fiecare plecare are un cost concret, chiar dacă nu apare separat în contabilitate.\n\nCând un casier bun pleacă, pierzi timpul investit în training, viteza pe care o avea la casă, cunoașterea meniului și a clienților fideli. Noul angajat are nevoie de săptămâni să ajungă la același nivel — timp în care greșelile de casă, timpii de servire mai lungi și eventual clienții nemulțumiți costă bani reali.",
      },
      {
        heading: "Cauzele reale, nu cele pe care le presupui",
        body: "«Salariul mic» e explicația la care sar mulți proprietari, dar rareori e singura cauză și adesea nici cea principală. Cauze frecvente, verificabile în orice restaurant sau cafenea:\n\n- **Programul imprevizibil** — ture schimbate în ultimul moment, fără preaviz\n- **Lipsa unui training structurat** — angajatul e «aruncat la casă» din prima zi, fără să știe unde caută produsele sau ce face când greșește o vânzare\n- **Nicio claritate a rolului** — nu știe exact ce se așteaptă de la el dincolo de «fă ce-ți spun ceilalți»\n- **Șeful prezent doar când e o problemă** — feedback-ul vine exclusiv sub formă de critică, niciodată de recunoaștere\n- **Plată întârziată sau neclară** — mai ales la comisioane sau bonusuri promise verbal, nedocumentate\n\nUn angajat care pleacă după salariul mic la alt loc cu salariu identic, dar cu program stabil, îți spune ceva clar despre ce a contat de fapt.",
      },
      {
        heading: "Costul real al unei plecări",
        body: "Fă acest calcul o singură dată și vei privi altfel fluctuația:\n\n- **Timp de recrutare** — anunț, interviuri, timpul tău sau al managerului\n- **Training** — de obicei 1-2 săptămâni în care noul angajat e mai lent, face greșeli de casă, cere ajutor constant de la colegi, care la rândul lor devin mai puțin productivi\n- **Perioada de «rodaj»** — chiar și după training formal, ajungerea la viteza unui angajat experimentat durează adesea o lună sau mai mult\n- **Greșeli cu cost direct** — comenzi greșite, produse irosite, diferențe la sertar din nesiguranță în folosirea casei\n\nAdunate, aceste costuri depășesc frecvent diferența de salariu pe care ai fi economisit-o «negociind dur» cu angajatul care a plecat.",
      },
      {
        heading: "Ce poți schimba fără să crești salariile",
        body: "Nu tot ce reduce fluctuația costă bani în plus:\n\n- **Program publicat din timp și respectat** — predictibilitatea contează la fel de mult ca suma din cont pentru mulți angajați tineri\n- **Training structurat de la prima zi** — un checklist clar, nu «uită-te la colegul tău și înveți din mers»\n- **Recunoaștere vizibilă, nu doar corecție** — spui explicit când cineva a făcut o tură bună, nu doar când a greșit ceva\n- **Claritate în așteptări** — ce înseamnă exact «treabă bună» în rolul respectiv, nu presupuneri nespuse\n- **Un canal simplu pentru probleme** — angajatul știe cui să spună dacă ceva nu merge, fără să aștepte «momentul potrivit»\n\nAcestea nu elimină fluctuația, dar rezolvă partea din ea care nu ține deloc de bani.",
      },
      {
        heading: "Semnale timpurii de care ar trebui să ții cont",
        body: "Plecările rareori sunt bruște — de obicei există semnale cu săptămâni înainte:\n\n- Cereri tot mai frecvente de schimbare a turei\n- Absenteism care crește ușor, dar constant\n- Scădere vizibilă de energie sau implicare la angajați care erau proactivi\n- Întrebări despre concediu sau despre modul de calcul al salariului, puse din senin\n\nDacă observi aceste semnale la un angajat bun, o discuție directă și onestă — «cum te simți cu programul, cu rolul, ce te-ar face să rămâi?» — costă zece minute și poate preveni o plecare care te-ar costa săptămâni de recrutare și training.",
      },
      {
        heading: "Ce poți face concret săptămâna asta",
        body: "- Verifică dacă programul e publicat cu minimum o săptămână înainte, constant\n- Întreabă direct 2-3 angajați ce i-ar face să rămână mai mult\n- Verifică dacă noul angajat are un checklist clar de training sau învață «din priviri»\n- Notează, pentru fiecare plecare din ultimele 6 luni, motivul real, nu presupus, dacă poți afla\n- Calculează, măcar aproximativ, cât te-a costat ultima plecare și înlocuire\n\nFluctuația zero nu există în HoReCa — dar fluctuația «din motive pe care le poți controla» poate scădea semnificativ fără să atingi bugetul de salarii.",
      },
    ],
  },
  {
    slug: "training-casier-nou-angajat-checklist",
    title: "Training pentru un casier nou — checklist complet de prima zi",
    description:
      "Checklist complet pentru prima zi, prima săptămână și prima lună a unui casier nou — ce trebuie să știe înainte să lucreze singur la casă, fără greșeli scumpe evitabile.",
    publishedAt: "2026-06-28",
    locale: "ro",
    tags: ["personal","training","pos"],
    image: "/marketing/hero-cafe-pos.png",
    relatedFeature: "/features/pos",
    sections: [
      {
        heading: "De ce prima zi contează mai mult decât pare",
        body: "Un casier nou lăsat «să învețe din mers» într-o tură aglomerată nu doar greșește mai mult — încetinește toată tura, pentru că un coleg experimentat trebuie constant să-l ajute în loc să servească clienți. Diferențele de sertar din prima săptămână, anulările greșite, produsele vândute la preț greșit — aproape toate au aceeași cauză: lipsa unui training structurat înainte de prima vânzare reală.\n\nUn checklist scris nu înlocuiește experiența, dar previne greșelile evitabile — cele care nu țin de îndemânare, ci de faptul că nimeni nu a explicat clar un pas.",
      },
      {
        heading: "Prima oră — înainte de prima vânzare",
        body: "- Cont propriu de utilizator la casă, cu parolă proprie, niciodată contul altui angajat\n- Parcurgerea meniului sau listei de produse — ce e disponibil azi, ce lipsește din stoc\n- Unde găsește fiecare produs în sistemul de casă, pe categorii sau favorite\n- Cum arată o vânzare simplă, pas cu pas, demonstrată de un coleg\n- Cum se acceptă plata cu numerar și cu cardul, inclusiv ce face dacă terminalul de card nu răspunde\n\nÎnainte să servească primul client singur, casierul nou ar trebui să fi văzut cel puțin 5-10 vânzări complete făcute de altcineva, nu doar explicate verbal.",
      },
      {
        heading: "Prima zi — sub supraveghere directă",
        body: "- Face primele vânzări cu un coleg experimentat alături, nu la distanță\n- Învață cum se anulează corect o vânzare greșită — pas esențial, des omis la training rapid\n- Învață ce face dacă un client vrea să plătească parțial cash, parțial card\n- Știe unde caută prețul unui produs nou sau necunoscut, în loc să ghicească\n- Știe exact cui se adresează dacă apare o problemă pe care nu o poate rezolva singur\n\nGreșeala clasică la training rapid: casierul nou e lăsat singur la casă din a doua oră, «pentru că se descurcă». Rezultatul apare de obicei la finalul zilei, în diferența de sertar.",
      },
      {
        heading: "Prima săptămână — spre lucru independent",
        body: "- Înțelege cum se citește raportul de la finalul turei — chiar dacă nu îl generează el, trebuie să știe ce arată\n- Știe cum se procedează dacă sertarul nu se potrivește cu ce arată sistemul la final de tură\n- A gestionat cel puțin o situație dificilă cu supraveghere — client nemulțumit, produs terminat din stoc, coadă mare\n- Cunoaște politica exactă pentru reduceri sau produse oferite gratuit — cine aprobă, cum se înregistrează\n\nDupă prima săptămână, un casier ar trebui să poată face o tură completă fără să întrebe pași de bază — dar tot ar trebui să știe clar la cine apelează pentru excepții.",
      },
      {
        heading: "Semne că training-ul a fost prea rapid",
        body: "- Diferențe frecvente de sertar la turele lui, mai mari decât la colegii cu experiență similară\n- Întreabă repetat aceleași lucruri de bază, după prima săptămână\n- Evită anumite acțiuni din sistem, anulări, reduceri, pentru că nu e sigur cum se fac corect\n- Colegii se plâng că trebuie constant să-l ajute, chiar și după 2-3 săptămâni\n\nDacă vezi aceste semne, problema nu e neapărat angajatul — de multe ori e training-ul comprimat într-o singură zi haotică, în loc de un proces gradual de o săptămână.",
      },
      {
        heading: "Un POS simplu scurtează acest training",
        body: "Cea mai mare parte a timpului de training la casă nu se duce pe a învăța produsele — se duce pe a învăța sistemul: unde e fiecare buton, cum se face o anulare, cum se schimbă metoda de plată la jumătatea unei vânzări. Cu cât interfața POS e mai încărcată cu meniuri și pași ascunși, cu atât training-ul durează mai mult și diferențele de sertar din prima lună sunt mai mari.\n\nÎn franchisetech, ecranul de vânzare e construit să arate produsele direct, fără meniuri ascunse pentru acțiunile de bază — o vânzare, o anulare sau o schimbare de metodă de plată se fac din aceleași câteva atingeri, indiferent cine e la casă. Pentru un casier nou, asta înseamnă mai puțin de memorat și mai puține motive să greșească din nesiguranță, nu din neatenție.",
      },
    ],
  },
  {
    slug: "targeturi-vanzari-per-angajat-cum-le-stabilesti",
    title: "Cum stabilești targeturi de vânzări realiste per angajat",
    description:
      "Cum stabilești targeturi de vânzări realiste pentru barista, ospătari sau casieri, bazate pe date reale din tură, nu pe cifre alese la întâmplare, și ce faci când nu sunt atinse.",
    publishedAt: "2026-06-29",
    locale: "ro",
    tags: ["personal","vanzari"],
    image: "/marketing/reports-sales.png",
    sections: [
      {
        heading: "De ce targetul «un număr pentru toată lumea» nu funcționează",
        body: "Cea mai frecventă greșeală la stabilirea targeturilor în HoReCa: proprietarul alege o cifră rotundă — 2.000 lei pe tură, 300 de tranzacții pe săptămână — și o aplică identic pentru toți angajații, indiferent de tură, zi sau rol.\n\nProblema: o tură de sâmbătă dimineața la o cafenea de cartier are un flux de clienți complet diferit de o tură de marți după-amiază. Un barista care lucrează singur la bar are altă capacitate decât unul care lucrează alături de un coleg la casă. Dacă targetul e identic pentru toate turele, cei din turele slabe par mereu sub performanță, iar cei din turele bune par mereu peste — fără ca diferența să aibă legătură cu efortul lor.\n\nUn target realist pornește de la datele istorice ale acelei ture specifice, nu de la o cifră aleasă la birou.",
      },
      {
        heading: "Cum calculezi un target pe baza datelor reale",
        body: "Formula de bază:\n\n**Target tură = Media vânzărilor din ultimele 8-12 ture similare × factor de ajustare**\n\nFactorul de ajustare ține cont de context: eveniment local, sezon, promoție activă, zi de sărbătoare. Fără eveniment special, factorul e 1.0 — nu inventezi o creștere artificială.\n\nExemplu concret pentru o cafenea:\n\n- Media vânzărilor din ultimele 10 ture de sâmbătă dimineața: 1.850 lei\n- Fără evenimente speciale în weekendul curent: factor 1.0\n- Target tură: 1.850 lei\n\nDacă în weekendul respectiv e un târg în zonă și te aștepți la trafic suplimentar, ajustezi cu un factor rezonabil (1.15–1.2), nu dublezi cifra pe baza optimismului.\n\nRecalculezi targeturile lunar. O cafenea care crește constant cu 5-10% pe lună și păstrează targeturile de acum trei luni motivează greșit — targetul devine prea ușor de atins și nu mai reflectă potențialul real.",
      },
      {
        heading: "Target de vânzări vs. target de atașament — nu sunt același lucru",
        body: "Un target de vânzări brute (lei încasați pe tură) spune cât s-a vândut, dar nu spune nimic despre calitatea vânzării. Un barista poate atinge targetul doar din trafic mare, fără să fi contribuit cu nimic la valoarea medie a comenzii.\n\nTargetul de atașament măsoară altceva: câte comenzi includ un produs suplimentar (desert lângă cafea, sirop, mărire de porție). Exemplu:\n\n- Valoare medie comandă fără atașamente: 14 lei\n- Valoare medie comandă cu un produs atașat: 19–22 lei\n- Target atașament realist: 25-30% din comenzi cu produs suplimentar\n\nCombinarea celor două targeturi (vânzări totale + rată de atașament) dă o imagine mai corectă a contribuției individuale decât cifra brută singură.",
      },
      {
        heading: "Ce faci când targetul nu e atins",
        body: "Un target ratat nu înseamnă automat o problemă de performanță. Înainte să tragi concluzii, verifică:\n\n- A fost o zi cu trafic real mai mic decât media (vreme proastă, stradă în lucrări, eveniment concurent)?\n- A lucrat angajatul singur într-o tură normal acoperită de doi oameni?\n- A existat o problemă tehnică (POS căzut, stoc epuizat la produsul principal)?\n\nDacă targetul e ratat constant, în condiții normale, comparativ cu colegii din ture similare, atunci discuția cu angajatul are sens, dar cu date concrete în față, nu cu impresii.\n\nTargetul e un instrument de vizibilitate, nu un motiv de penalizare automată. Folosit ca amenințare, demotivează. Folosit ca reper, ajută echipa să vadă unde stă față de potențialul turei.",
      },
      {
        heading: "Cum urmărești targeturile în franchisetech",
        body: "Din **Rapoarte → Vânzări per angajat**, vezi pentru fiecare cont de utilizator (casier, barista, ospătar): valoarea totală a vânzărilor din tură, numărul de tranzacții, valoarea medie a comenzii și rata de atașament pe categorii de produse.\n\nPentru că fiecare vânzare e legată de sesiunea de casă și de utilizatorul logat, nu mai aduni manual bonuri și nu mai ceri fiecărui angajat să-și noteze cifrele. Compari direct tura de azi cu media ultimelor 10 ture similare, fără calcul separat în Excel.\n\nDatele istorice necesare pentru targeturi realiste există deja în sistem din prima săptămână de utilizare — nu trebuie să aștepți luni de date pentru primul target relevant.",
      },
    ],
  },
  {
    slug: "comision-vanzari-personal-horeca-modele",
    title: "Comision la vânzări pentru personal — modele care funcționează în HoReCa",
    description:
      "Modele de comision la vânzări pentru barista, ospătari și casieri care nu distorsionează comportamentul la casă, cu exemple de calcul și greșeli frecvente de evitat.",
    publishedAt: "2026-06-29",
    locale: "ro",
    tags: ["personal","comision"],
    image: "/marketing/reports-sales.png",
    sections: [
      {
        heading: "De ce comisionul simplu «% din vânzări» creează probleme",
        body: "Un comision de 2-3% aplicat pe toată cifra de vânzări pare simplu de calculat, dar creează un stimulent greșit: angajatul e motivat să vândă mult, nu să vândă bine sau corect.\n\nEfecte secundare frecvente:\n\n- Presiune pe clienți să comande mai mult decât vor, ceea ce afectează experiența și poate reduce vizitele viitoare\n- Favorizarea produselor scumpe indiferent de marjă (un produs cu marjă mică poate genera comision mai mare decât un produs cu marjă foarte bună, doar pentru că prețul de vânzare e mai ridicat)\n- Tentația de a nu anula corect comenzile greșite, ca să nu scadă cifra proprie\n\nComisionul pe cifră brută funcționează doar dacă îl combini cu limite clare sau îl înlocuiești cu un model orientat spre marjă.",
      },
      {
        heading: "Modele de comision care funcționează în practică",
        body: "**Comision pe prag depășit** — angajatul primește comision doar pentru vânzările peste un target minim stabilit, nu pentru toată cifra. Motivează fără să recompenseze traficul normal ca și cum ar fi merit propriu.\n\n**Comision pe produse cu marjă bună** — procent mai mare la produsele cu marjă ridicată și mai mic sau zero la produsele cu marjă redusă. Aliniază interesul angajatului cu profitabilitatea reală, nu doar cu cifra de vânzări.\n\n**Bonus de echipă lunar** — sumă fixă împărțită între toți angajații unei locații dacă cifra lunară depășește un prag. Reduce competiția internă nesănătoasă și încurajează colegii să se ajute reciproc în ture aglomerate.\n\n**Comision pe atașament, nu pe total** — procent la fiecare comandă cu produs suplimentar vândut, indiferent de valoarea totală a comenzii. Recompensează exact comportamentul dorit — sugestia unui produs în plus — nu norocul unei ture aglomerate.",
      },
      {
        heading: "Exemplu de calcul — comision pe prag depășit",
        body: "O cafenea stabilește: target lunar per barista = 18.000 lei vânzări. Peste acest prag, comision de 3% la fiecare leu suplimentar.\n\nLuna respectivă: barista a generat 21.500 lei.\n\n- Sumă peste prag: 21.500 − 18.000 = 3.500 lei\n- Comision: 3.500 × 3% = 105 lei\n\nDacă în loc de asta ai aplica 3% pe toată cifra (21.500 lei), comisionul ar fi 645 lei — de șase ori mai mult, pentru aceeași performanță reală peste target. Diferența arată de ce comisionul pe cifră brută devine rapid nesustenabil financiar pentru o afacere mică.",
      },
      {
        heading: "Ce trebuie clarificat înainte să introduci un sistem de comision",
        body: "- Comisionul trebuie scris clar — în regulamentul intern sau într-un act adițional la contract, cu formula de calcul explicită, nu doar promisă verbal\n- Comisionul nu poate înlocui salariul minim brut pe economie — este un adaos, nu o componentă de bază a salariului contractual\n- Perioada de calcul trebuie fixă — lunar, de obicei, cu dată clară de plată\n- Angajatul trebuie să poată verifica singur cifra — dacă nu vede de unde vine suma, comisionul devine sursă de neîncredere, nu de motivare\n\nUn sistem de comision netransparent, unde angajatul nu poate verifica singur calculul, generează mai multă frustrare decât motivația pe care ar trebui să o aducă.",
      },
      {
        heading: "Cum extragi datele pentru comision din franchisetech",
        body: "Raportul **Vânzări per angajat** din franchisetech oferă baza de calcul fără muncă manuală: cifra totală per cont de utilizator, defalcată pe zile și pe categorii de produse, plus numărul de comenzi cu produse atașate.\n\nPentru un model pe prag depășit sau pe atașament, extragi cifrele lunare direct din raport — nu recalculezi manual din bonuri fiscale sau din Raportul Z al fiecărei zile. Fiecare vânzare e deja asociată cu utilizatorul logat la momentul tranzacției, atât timp cât fiecare angajat are cont propriu în POS și nu lucrează toți pe un singur login comun.",
      },
    ],
  },
  {
    slug: "program-legal-de-lucru-horeca-romania",
    title: "Programul legal de lucru în HoReCa România — ce trebuie să respecți",
    description:
      "Ghid practic despre programul de lucru în HoReCa România: durata normală, repausul minim, munca de noapte, pauza de masă și evidența orelor, explicat pentru proprietari fără departament HR.",
    publishedAt: "2026-06-29",
    locale: "ro",
    tags: ["personal","legal"],
    image: "/marketing/dashboard-hero.png",
    sections: [
      {
        heading: "Durata normală a timpului de lucru",
        body: "Durata normală a timpului de lucru în România este de 8 ore pe zi și 40 de ore pe săptămână, pentru un program cu normă întreagă, conform Codului Muncii. Munca suplimentară peste acest prag este posibilă, dar trebuie compensată — fie prin plată suplimentară, fie prin timp liber corespunzător, conform regulilor stabilite prin contractul individual de muncă sau contractul colectiv aplicabil.\n\nÎn HoReCa, unde programul e frecvent organizat pe ture inegale (weekend aglomerat, zile de mijloc de săptămână mai libere), e obișnuit să se folosească evidența timpului de lucru în tură flexibilă sau în medie pe o perioadă de referință, nu strict 8 ore identice în fiecare zi — dar totalul pe perioada de referință trebuie să respecte limitele legale.",
      },
      {
        heading: "Repausul zilnic și săptămânal minim",
        body: "Codul Muncii prevede un repaus zilnic minim între două zile de muncă consecutive — un angajat care termină tura la 23:00 nu poate fi programat să înceapă tura următoare la primele ore ale dimineții imediat următoare, fără o pauză minimă de odihnă între cele două ture.\n\nRepausul săptămânal este, de regulă, de două zile consecutive, dar legea permite acordarea lui în alte zile decât weekendul, cumulat, atunci când specificul activității (cum e cazul HoReCa) nu permite oprirea completă în weekend.\n\nÎn practică, cea mai frecventă greșeală la cafenelele și restaurantele mici este programarea acelorași 2-3 angajați în toate turele de weekend, săptămână după săptămână, fără rotație — ceea ce erodează repausul cumulat pe termen mediu, chiar dacă fiecare săptămână individuală pare, pe hârtie, conformă.",
      },
      {
        heading: "Munca de noapte și pauza de masă",
        body: "Munca desfășurată în intervalul orar considerat de noapte (de regulă 22:00–06:00) trebuie compensată conform legii — fie prin reducerea programului, fie printr-un spor salarial stabilit prin contractul colectiv aplicabil sau prin contractul individual de muncă. Procentul exact de spor variază în funcție de sectorul de activitate și de ce prevede contractul aplicabil — verifică-l cu un specialist în legislația muncii sau cu contabilul care îți administrează salarizarea, nu presupune un procent standard.\n\nPentru orice zi de lucru mai lungă de 6 ore, angajatul are dreptul la o pauză de masă, a cărei durată minimă este stabilită prin contractul colectiv de muncă sau prin regulamentul intern. În HoReCa, pauza trebuie programată real — nu doar trecută pe hârtie — ceea ce înseamnă acoperire suplimentară de personal în orele de vârf, altfel angajatul rămâne fără pauză efectivă.",
      },
      {
        heading: "Evidența orelor de lucru — de ce contează",
        body: "Angajatorul are obligația de a ține evidența orelor lucrate de fiecare angajat, indiferent de tipul de contract (normă întreagă, timp parțial). La un control de muncă, lipsa evidenței sau evidența care nu corespunde cu programul real afișat este una dintre cele mai frecvente cauze de sancțiune în HoReCa.\n\nProbleme tipice descoperite la control:\n\n- Program afișat diferit de orele efectiv lucrate (angajatul vine mai devreme pentru pregătire, dar ora nu e înregistrată)\n- Ture suplimentare acoperite informal, fără actualizarea evidenței\n- Personal care lucrează fără contract sau cu contract de timp parțial, dar cu program de normă întreagă în realitate\n\nEvidența trebuie să reflecte exact orele lucrate, inclusiv timpul de pregătire înainte de deschidere și de închidere efectivă a casei după ultimul client.",
      },
      {
        heading: "Checklist practic de conformitate",
        body: "- [ ] Fiecare angajat are program de lucru documentat, corespunzător cu orele efectiv lucrate\n- [ ] Repausul zilnic minim este respectat între ture consecutive\n- [ ] Repausul săptămânal este acordat, chiar dacă nu cade mereu în weekend\n- [ ] Munca de noapte este compensată conform contractului aplicabil\n- [ ] Pauza de masă este programată real, cu acoperire de personal\n- [ ] Evidența orelor lucrate este actualizată, nu doar «pe hârtie»\n- [ ] Programările de tură sunt rotative, nu concentrate constant pe aceiași 2-3 oameni\n\nAceastă listă nu înlocuiește sfatul unui specialist în legislația muncii — pentru situații specifice (contracte de timp parțial, muncă sezonieră, program inegal), verifică detaliile cu un consultant HR sau cu contabilul care administrează salarizarea afacerii tale.",
      },
    ],
  },
  {
    slug: "checklist-deschidere-inchidere-tura",
    title: "Checklist de deschidere și închidere a turei — de lipit lângă casă",
    description:
      "Checklist scurt de deschidere și predare de tură pentru cafenea sau restaurant: ce verifici la începutul turei, la schimbul de tură și la închidere, ca sertarul să se potrivească mereu.",
    publishedAt: "2026-06-30",
    locale: "ro",
    tags: ["personal","checklist","raport-z"],
    image: "/marketing/reports-zreport.png",
    relatedFeature: "/features/z-report",
    sections: [
      {
        heading: "De ce ai nevoie de un checklist de tură, nu doar de un raport de zi",
        body: "Raportul Z închide ziua, dar multe cafenele și restaurante au mai multe ture într-o singură zi — dimineața, prânz, seară — cu angajați diferiți care se schimbă la casă. Dacă sertarul nu se potrivește la finalul zilei, dar au lucrat trei persoane diferite pe rând, nu știi cui aparține diferența.\n\nUn checklist de tură rezolvă exact problema asta: fiecare angajat numără sertarul la începutul turei lui și la predare, astfel încât o eventuală diferență să fie localizată la tura în care a apărut, nu aruncată în totalul zilei ca un mister nerezolvat.",
      },
      {
        heading: "Checklist de deschidere a turei",
        body: "- [ ] Numeri fondul de deschidere din sertar și confirmi că suma corespunde cu ce a fost lăsat de tura anterioară (sau cu suma standard de deschidere, dacă e prima tură a zilei)\n- [ ] Verifici că POS-ul funcționează și că ești logat cu contul tău propriu, nu cu al colegului\n- [ ] Verifici vizual stocul produselor principale (cafea, lapte, produse de bază pentru prima oră de vânzare)\n- [ ] Verifici echipamentul esențial (espressor, aparat de card, imprimantă bonuri) pornit și funcțional\n- [ ] Notezi ora de start a turei\n\nAceste cinci puncte durează sub două minute, dar elimină cea mai frecventă sursă de conflict: sertarul nu era corect când am preluat tura.",
      },
      {
        heading: "Checklist de predare a turei (schimb între angajați)",
        body: "Când o tură se termină și alta începe, fără să fie sfârșit de zi:\n\n- [ ] Angajatul care predă numără sertarul față în față cu cel care preia\n- [ ] Suma numărată este notată și confirmată de amândoi (verbal sau într-un caiet de tură, dacă nu ai proces digital)\n- [ ] Se comunică orice situație în desfășurare: comandă neridicată, plată în așteptare, client nemulțumit\n- [ ] Angajatul care preia se loghează cu propriul cont în POS înainte de prima vânzare\n\nPredarea față în față, cu numărare comună, este singura metodă care elimină ambiguitatea despre cine răspunde de o eventuală diferență apărută în tura anterioară.",
      },
      {
        heading: "Checklist de închidere — dacă e ultima tură a zilei",
        body: "- [ ] Ultima vânzare a zilei este înregistrată în sistem\n- [ ] Se generează Raportul Z pentru ziua respectivă\n- [ ] Sertarul este numărat și comparat cu numerarul așteptat din raport\n- [ ] Diferența, dacă există, este notată cu o explicație scurtă\n- [ ] Numerarul de depus este pus la loc sigur, iar fondul de deschidere pentru ziua următoare rămâne în sertar\n- [ ] Echipamentele se opresc conform procedurii (espressor, aragaz, aparate care necesită oprire de siguranță)\n\nDacă tura ta nu e ultima din zi, sari peste pașii legați de Raportul Z — aceia sunt responsabilitatea turei care închide efectiv locația.",
      },
      {
        heading: "Cum se leagă de sesiunile POS din franchisetech",
        body: "Fiecare deschidere de tură în franchisetech pornește o sesiune de casă separată, cu fond de deschidere propriu și cu utilizatorul logat asociat. Când tura se predă, sesiunea se închide cu numărătoarea reală a sertarului, iar diferența (dacă există) rămâne înregistrată la sesiunea respectivă — nu se pierde în totalul zilei.\n\nLa finalul zilei, Raportul Z agregă toate sesiunile din ziua respectivă, dar poți vedea în continuare, sesiune cu sesiune, care tură a avut diferență și cât de mare a fost. Practic, checklistul de mai sus și structura de sesiuni din aplicație fac exact același lucru — izolarea responsabilității pe tură, nu doar pe zi.",
      },
    ],
  },
  {
    slug: "cum-delegi-cand-managerul-lipseste",
    title: "Cum delegi responsabilitățile când managerul sau proprietarul lipsește",
    description:
      "Ce decizii poți lăsa în seama echipei când managerul sau proprietarul lipsește dintr-o cafenea sau restaurant, ce rămâne strict la nivel de conducere și cum structurezi permisiunile corect.",
    publishedAt: "2026-06-30",
    locale: "ro",
    tags: ["personal","management"],
    image: "/marketing/industry-kitchen.png",
    sections: [
      {
        heading: "Problema reală: totul se oprește când managerul nu e acolo",
        body: "O situație frecventă în afacerile mici din HoReCa: proprietarul e singurul care poate aproba o reducere, anula o comandă greșită, scoate bani din casă pentru o urgență sau decide ce faci cu un client nemulțumit. Când proprietarul lipsește — concediu, boală, altă locație — echipa fie improvizează fără autorizare, fie lasă problema nerezolvată până la întoarcerea lui.\n\nAmbele variante sunt costisitoare. Improvizația fără reguli clare duce la decizii inconsistente (un casier acordă reducere de 20%, altul refuză aceeași cerere). Amânarea duce la clienți nemulțumiți și la personal frustrat că nu poate rezolva lucruri simple.",
      },
      {
        heading: "Ce poți delega în siguranță",
        body: "- Reduceri mici, sub un prag fix — de exemplu, până la 10% pe o comandă, pentru corectarea unei probleme evidente (întârziere, comandă greșită)\n- Anularea unui produs înainte de plată — dacă clientul se răzgândește înainte de a plăti, nu e nevoie de aprobare specială\n- Gestionarea reclamațiilor simple — înlocuirea unui produs nesatisfăcător, fără cost suplimentar pentru client\n- Decizii operaționale de tură — cine ia pauza când, cum se împarte munca între casă și bar\n\nAcestea sunt decizii cu impact financiar limitat și reversibil, potrivite pentru un supervisor de tură de încredere.",
      },
      {
        heading: "Ce NU delegi fără un rol clar de administrator",
        body: "- Scoaterea de numerar din casă (cash out) pentru orice motiv — trebuie să rămână la nivel de administrator, cu justificare notată\n- Generarea Raportului Z sau X — acestea sunt raportări cu implicații fiscale, nu decizii operaționale de rutină\n- Anulări de vânzări deja închise (după bon fiscal emis) — necesită control mai strict decât o anulare înainte de plată\n- Modificarea prețurilor din catalogul de produse — o greșeală aici afectează toate vânzările ulterioare, nu doar o comandă\n\nAceste operațiuni au fost gândite să rămână la nivel de admin exact pentru că un abuz sau o greșeală aici e greu de depistat și de corectat retroactiv.",
      },
      {
        heading: "Un protocol scris, nu doar o înțelegere verbală",
        body: "Înainte de o absență planificată, notează pentru echipă:\n\n- Cine e persoana de contact în cazul unei probleme majore (telefon, nu doar «sună-mă dacă e ceva»)\n- Ce praguri de reducere/anulare sunt permise fără aprobare suplimentară\n- Ce se întâmplă cu o eventuală problemă de stoc (lipsă marfă) — cine sună furnizorul\n- Ce rapoarte trebuie generate obligatoriu în absența ta (de regulă, Raportul Z zilnic tot trebuie făcut, chiar dacă tu nu ești acolo)\n\nUn protocol scris, chiar și pe o singură pagină, elimină nevoia de decizii improvizate și oferă echipei un cadru clar de acțiune.",
      },
      {
        heading: "Cum funcționează permisiunile pe roluri în franchisetech",
        body: "franchisetech separă contul fiecărui angajat pe roluri, nu toată lumea are acces la aceleași funcții. Operațiunile sensibile — generarea Raportului Z, Raportul X, mișcările de numerar (cash in/cash out) — necesită permisiune de administrator și nu pot fi rulate de un cont de casier obișnuit.\n\nPractic, poți lăsa un supervisor de încredere să opereze POS-ul, să proceseze vânzări și să gestioneze reduceri mici din permisiunile lui, fără să-i dai acces la operațiunile care necesită rol de admin. Când te întorci, verifici din istoric exact ce s-a întâmplat cât ai lipsit — fiecare acțiune e asociată cu contul care a făcut-o.",
      },
    ],
  },
  {
    slug: "cum-evaluezi-performanta-unui-barista-ospatar",
    title: "Cum evaluezi performanța unui barista sau ospătar, dincolo de vânzări",
    description:
      "De ce cifra de vânzări nu e suficientă pentru a evalua un barista sau ospătar și ce alți indicatori operaționali contează, urmăriți din datele POS fără muncă manuală.",
    publishedAt: "2026-07-01",
    locale: "ro",
    tags: ["personal","performanta"],
    image: "/marketing/industry-cafe.png",
    sections: [
      {
        heading: "De ce cifra brută de vânzări minte uneori",
        body: "Un barista care lucrează sâmbătă dimineața, cu coadă la ușă, va avea mereu o cifră de vânzări mai mare decât unul care lucrează marți după-amiază, indiferent cât de bine își face treaba fiecare. Dacă evaluarea se bazează exclusiv pe totalul vândut, ajungi să compari efectiv traficul turelor, nu performanța oamenilor.\n\nCifra de vânzări rămâne un indicator util, dar trebuie combinată cu alții care spun ceva despre calitatea muncii, nu doar despre volumul de clienți întâmplător primiți.",
      },
      {
        heading: "Indicatori operaționali măsurabili din POS",
        body: "- Rata de anulări/corecții — câte tranzacții au fost anulate sau corectate după inițiere. O rată mare poate indica greșeli frecvente la comandă sau la operarea casei\n- Timpul mediu per tranzacție — cât durează, în medie, de la deschiderea comenzii până la finalizarea plății, util mai ales la casele cu coadă vizibilă\n- Diferența de sertar la finalul turei — un angajat cu diferențe recurente (chiar mici) merită o discuție, unul cu sertar exact de fiecare dată e un semnal pozitiv clar\n- Rata de atașament — procentul de comenzi cu produs suplimentar sugerat și acceptat de client\n\nAcești patru indicatori se extrag direct din datele POS, fără să depinzi de impresii sau de memoria cuiva despre cum a fost tura respectivă.",
      },
      {
        heading: "Indicatori calitativi — mai greu de măsurat, la fel de importanți",
        body: "- Feedback direct de la clienți — reclamații sau aprecieri primite verbal sau prin recenzii online menționând un angajat anume\n- Consistența pregătirii produselor — dacă un produs are gust diferit în funcție de cine îl prepară, e un semnal de instruire, nu neapărat de atitudine\n- Colaborarea cu echipa — cine ajută la ture aglomerate fără să i se ceară, cine lasă treaba pe jumătate la predarea turei\n\nAcești indicatori nu apar în niciun raport automat. Necesită observație directă și, ideal, o notă scurtă săptămânală din partea managerului de tură — altfel se pierd în memorie și evaluarea devine subiectivă la fiecare discuție.",
      },
      {
        heading: "Cum combini toate astea fără un tabel Excel complicat",
        body: "Nu ai nevoie de un sistem de scoring elaborat. O evaluare simplă, lunară, cu patru-cinci linii per angajat este suficientă pentru o afacere mică:\n\n- Cifra de vânzări comparată cu media turelor similare (nu cifra brută izolată)\n- Rata de anulări/corecții din luna respectivă\n- Diferența medie de sertar la predarea turei\n- O notă calitativă scurtă (colaborare, feedback clienți, consistență)\n\nDiscuția cu angajatul pornește de la aceste puncte concrete, nu de la impresia generală «mi se pare că merge bine sau rău». Angajatul înțelege exact ce se măsoară și poate contesta sau explica o cifră care nu reflectă realitatea, de exemplu o diferență de sertar cauzată de o eroare din tura anterioară, nu de el.",
      },
      {
        heading: "Ce rapoarte din franchisetech te ajută",
        body: "Din **Rapoarte → Vânzări per angajat**, vezi cifra de vânzări per cont, defalcată pe ture și zile, comparabilă cu media unor ture similare. Din istoricul sesiunilor de casă, vezi diferența de sertar per sesiune, deci per angajat și tură, nu doar pe total zi.\n\nRata de anulări/corecții e vizibilă din istoricul tranzacțiilor per utilizator — fiecare anulare e asociată cu contul care a operat-o. Combinate, aceste rapoarte îți dau baza obiectivă pentru evaluare, fără să notezi manual nimic pe parcursul lunii — datele există deja din operarea zilnică a POS-ului.",
      },
    ],
  },
  {
    slug: "legatura-dintre-pos-si-registrul-jurnal",
    title: "Legătura dintre vânzările din POS și registrul jurnal al contabilului",
    description:
      "Cum ajung datele din vânzările POS în registrul jurnal al contabilului și ce trebuie să corespundă exact între cele două, ca să nu apară discrepanțe la închiderea lunii.",
    publishedAt: "2026-07-01",
    locale: "ro",
    tags: ["contabilitate","pos"],
    image: "/marketing/dashboard-hero.png",
    relatedFeature: "/features/accountant-reports",
    sections: [
      {
        heading: "Ce este registrul jurnal și de ce te privește",
        body: "Registrul jurnal este documentul contabil obligatoriu în care se înregistrează, în ordine cronologică, toate operațiunile economice ale unei firme — vânzări, achiziții, plăți, încasări. Contabilul tău îl completează pe baza documentelor pe care i le trimiți: facturi, NIR-uri, extrase bancare și, pentru o afacere HoReCa, rapoartele zilnice de vânzări din POS.\n\nPentru tine, ca proprietar, registrul jurnal nu e ceva ce completezi direct — dar calitatea datelor pe care le trimiți contabilului determină cât de corect și de rapid poate fi completat.",
      },
      {
        heading: "Cum ajung vânzările din POS în registrul jurnal",
        body: "Fluxul obișnuit, lună de lună:\n\n1. Fiecare zi de operare generează un Raport Z — totalul vânzărilor, defalcat pe metode de plată și pe cote de TVA\n2. La finalul lunii, aceste rapoarte zilnice se agregă într-un total lunar\n3. Contabilul introduce (manual sau prin import) totalul lunar de vânzări în registrul jurnal, ca notă contabilă de venituri, cu TVA colectată defalcată corespunzător\n4. Fiecare zi lucrătoare a lunii ar trebui să aibă un Raport Z corespunzător — o zi lipsă înseamnă o zi fără justificare fiscală a vânzărilor\n\nÎn practică, contabilul nu introduce fiecare bon fiscal individual în jurnal — lucrează cu totalurile zilnice sau lunare agregate din rapoartele de casă.",
      },
      {
        heading: "Ce trebuie să corespundă exact",
        body: "- Totalul vânzărilor zilnice din Raportul Z trebuie să corespundă cu suma înregistrată în jurnal pentru ziua respectivă\n- Defalcarea pe metode de plată (numerar vs. card) trebuie să corespundă cu ce arată extrasul de cont pentru încasările cu cardul — o diferență aici semnalează fie o eroare de configurare POS, fie o tranzacție neînregistrată corect\n- TVA colectată pe cote trebuie să corespundă cu produsele vândute la cota corectă — un produs vândut cu cotă greșită denaturează atât raportul TVA, cât și nota din jurnal\n\nDacă unul dintre aceste trei elemente nu corespunde, contabilul fie cere clarificări, fie, mai rău, înregistrează o cifră aproximativă, ceea ce creează probleme la un eventual control.",
      },
      {
        heading: "De ce apar discrepanțe frecvente",
        body: "- Zile fără Raport Z generat — dacă o zi de operare nu are raport, contabilul nu are de unde lua cifra corectă pentru ziua respectivă\n- Retururi sau anulări procesate incorect — o vânzare anulată după emiterea bonului fiscal trebuie tratată diferit față de o anulare înainte de plată; confuzia între cele două denaturează totalul net\n- Încasări prin card care nu apar clar separate de numerar — dacă POS-ul nu defalcă corect metodele de plată, reconcilierea cu extrasul bancar devine un puzzle\n- Produse cu cotă de TVA configurată greșit — o schimbare de cotă TVA neaplicată în catalogul de produse denaturează sistematic totalul colectat\n\nMajoritatea discrepanțiilor nu vin din contabilitate — vin din date incomplete sau inconsistente trimise din operarea zilnică a POS-ului.",
      },
      {
        heading: "Cum simplifică franchisetech legătura cu jurnalul",
        body: "franchisetech păstrează fiecare Raport Z arhivat, asociat cu ziua și sesiunea exactă de casă, defalcat pe metode de plată și pe cote de TVA. Contabilul nu primește un total vag pe lună — primește totalurile zilnice complete, exportabile, cu istoric complet al fiecărei zile lucrătoare.\n\nDacă lipsește o zi (de exemplu, locația a fost închisă), asta e vizibil clar în istoric, nu ascuns într-un total lunar rotunjit. Practic, jurnalul contabilului se poate completa direct din exportul franchisetech, fără să reconstruiască manual cifrele din bonuri individuale sau din memorie.",
      },
    ],
  },
  {
    slug: "balanta-cantitativ-valorica-explicata-simplu",
    title: "Balanța cantitativ-valorică explicată simplu, fără jargon contabil",
    description:
      "Ce este balanța cantitativ-valorică, de ce o cere contabilul și cum se calculează pentru stocul unei cafenele sau al unui restaurant, explicat fără jargon.",
    publishedAt: "2026-07-01",
    locale: "ro",
    tags: ["contabilitate","balanta","stoc"],
    image: "/marketing/reports-sales.png",
    relatedFeature: "/features/accountant-reports",
    sections: [
      {
        heading: "Ce este, de fapt, balanța cantitativ-valorică",
        body: "Balanța cantitativ-valorică (prescurtată deseori BCV) este documentul care arată, pentru fiecare produs sau materie primă din gestiune, patru cifre: stocul de la începutul perioadei, cât a intrat, cât a ieșit și cât a rămas la final — atât în cantitate (kg, litri, bucăți), cât și în valoare (lei).\n\nNu e altceva decât o formă structurată a întrebării pe care și-o pune orice contabil sau inspector: dacă știu ce aveai la început și ce a intrat și ieșit, cifrele se potrivesc cu ce ai acum?",
      },
      {
        heading: "Formula din spatele balanței",
        body: "**Stoc final = Stoc inițial + Intrări − Ieșiri**\n\nAplicată pentru cafea boabe, la o cafenea, pe o lună:\n\n- Stoc inițial (1 a lunii): 8 kg\n- Intrări din NIR-uri (recepții de la furnizor) în cursul lunii: 40 kg\n- Ieșiri din vânzări + bon de consum: 36 kg\n- Stoc final calculat: 8 + 40 − 36 = 12 kg\n\nDacă la inventarul fizic de la finalul lunii numeri efectiv 12 kg de cafea, balanța e corectă. Dacă numeri 9 kg sau 15 kg, ai o discrepanță de investigat, nu de ignorat.",
      },
      {
        heading: "De ce contează pentru tine, nu doar pentru contabil",
        body: "Balanța cantitativ-valorică nu e doar un document cerut la control — e instrumentul care îți arată dacă stocul tău fizic corespunde cu ce spune sistemul. O discrepanță mare și recurentă înseamnă bani pierduți undeva: furt, risipă, porții mai mari decât cele din rețetă, produse expirate aruncate fără să fie scăzute corect din stoc.\n\nO cafenea care nu urmărește balanța descoperă problemele abia la inventarul anual, când diferența acumulată e prea mare ca să mai poată fi explicată punctual, produs cu produs.",
      },
      {
        heading: "De unde vin discrepanțele cel mai des",
        body: "- NIR introdus cu cantitate sau preț greșit — o eroare de tastare la recepția mărfii denaturează tot calculul ulterior\n- Consum care nu trece prin rețetă — un barista care adaugă «din ochi» mai mult dintr-un ingredient decât prevede rețeta consumă stoc care nu se reflectă corect în calculul automat\n- Produse expirate sau stricate, aruncate fără înregistrare — dacă arunci un produs expirat fără să-l scazi explicit din stoc, balanța rămâne cu o cantitate care nu mai există fizic\n- Furt sau consum intern nedocumentat — marfă consumată «pentru echipă» fără să fie trecută ca atare\n\nFiecare dintre aceste cauze e rezolvabilă odată identificată — problema apare când nimeni nu urmărește balanța suficient de des ca să prindă discrepanța cât e încă mică.",
      },
      {
        heading: "Cum se generează balanța în franchisetech",
        body: "franchisetech calculează automat balanța cantitativ-valorică pentru fiecare produs din stoc, combinând intrările din NIR-uri emise și ieșirile din vânzări (prin rețete) plus bonul de consum. Din **Rapoarte → Balanță stoc**, selectezi perioada și vezi, per produs: stoc inițial, intrări, ieșiri, stoc final calculat.\n\nDiferența față de inventarul fizic o introduci separat, ca ajustare de inventar — sistemul nu presupune că stocul calculat e automat corect, îți dă doar reperul față de care compari numărătoarea fizică. Cu verificări lunare, o discrepanță mică se prinde din timp, înainte să devină o problemă greu de explicat la inventarul anual.",
      },
    ],
  },
  {
    slug: "raport-tva-lunar-cum-il-pregatesti",
    title: "Raportul TVA lunar — cum îl pregătești din datele POS",
    description:
      "Cum extragi din datele POS totalul TVA colectat lunar, defalcat pe cote (21%, 11%, 5%, 0%), pentru decontul de TVA al contabilului, și unde apar cel mai des erorile.",
    publishedAt: "2026-07-02",
    locale: "ro",
    tags: ["tva","contabilitate"],
    image: "/marketing/reports-sales.png",
    relatedFeature: "/features/accountant-reports",
    sections: [
      {
        heading: "Ce rol are POS-ul în decontul de TVA",
        body: "Decontul de TVA lunar (sau trimestrial, în funcție de perioada fiscală a firmei) se compune din două părți: TVA deductibilă (din achizițiile și facturile primite) și TVA colectată (din vânzările efectuate). Pentru o afacere HoReCa, partea de TVA colectată vine aproape în întregime din vânzările înregistrate prin POS.\n\nContabilul are nevoie, pentru fiecare lună, de totalul vânzărilor defalcat pe cotele de TVA aplicabile — nu doar cifra totală de vânzări, ci cât din acea cifră a fost taxat la fiecare cotă în parte.",
      },
      {
        heading: "Cotele de TVA relevante în HoReCa",
        body: "România aplică patru cote de TVA: **21% (cota standard)**, **11% (cota redusă)**, **5% (cota redusă specială)** și **0% (operațiuni scutite)**.\n\nPentru o cafenea sau un restaurant, cel mai important e ca fiecare produs din catalog să aibă cota corectă configurată — servirea de mâncare și băutură în local poate intra la o cotă diferită față de produsele vândute la pachet sau anumite categorii de băuturi. Regulile exacte pe tip de produs se schimbă periodic, așa că verifică cota aplicabilă fiecărei categorii cu contabilul tău, în loc să presupui că toate produsele intră la aceeași cotă.\n\nO greșeală frecventă: catalogul de produse e configurat o singură dată, la lansare, și nu mai e revizuit niciodată, chiar dacă apar produse noi în meniu sau se schimbă regulile fiscale pentru o categorie.",
      },
      {
        heading: "Cum se calculează, cu exemplu numeric",
        body: "Presupunem o zi de vânzări la o cafenea cu produse la cote diferite:\n\n- Băuturi calde consumate în local: 1.200 lei (cotă redusă 11%) → TVA colectată: 1.200 − (1.200 / 1.11) ≈ 119 lei\n- Produse de patiserie la pachet: 400 lei (cotă redusă 5%, dacă produsul se încadrează la această categorie) → TVA colectată ≈ 19 lei\n- Băuturi alcoolice: 250 lei (cotă standard 21%) → TVA colectată ≈ 43 lei\n\nTotal TVA colectată ziua respectivă: ≈181 lei, din vânzări brute de 1.850 lei.\n\nLa nivel lunar, aceste totaluri zilnice, defalcate pe cote, se adună într-un singur raport pe care contabilul îl folosește direct pentru decont, fără să recalculeze de la zero fiecare zi.\n\nExemplul de mai sus e ilustrativ — încadrarea exactă pe cotă a fiecărui produs din meniul tău trebuie confirmată cu contabilul, în funcție de cum e servit și vândut produsul respectiv.",
      },
      {
        heading: "Erori frecvente care denaturează raportul TVA",
        body: "- Cotă de TVA greșită la un produs nou adăugat în catalog — dacă produsul e introdus rapid, fără verificare, cu cota implicită în loc de cea corectă\n- Vânzări neînregistrate prin bon fiscal — orice vânzare care ocolește POS-ul (plătită direct, fără bon) lipsește din baza de calcul, ceea ce denaturează atât raportul de vânzări, cât și TVA colectată\n- Zile fără Raport Z generat — dacă o zi lipsește din rapoartele arhivate, TVA colectată din ziua respectivă nu poate fi reconstituită corect ulterior\n- Reduceri sau promoții aplicate incorect — o reducere procentuală aplicată după calculul TVA, în loc de înainte, denaturează suma finală colectată\n\nToate aceste erori sunt mai ușor de prevenit decât de corectat retroactiv — o cotă greșită descoperită după trei luni înseamnă recalcul pentru toată perioada, nu doar pentru ziua curentă.",
      },
      {
        heading: "Cum pregătești raportul din franchisetech",
        body: "Din **Rapoarte → Raport TVA**, selectezi luna (sau perioada fiscală relevantă) și sistemul agregă automat vânzările din toate sesiunile POS închise în acea perioadă, defalcate pe fiecare cotă configurată în catalogul de produse.\n\nRaportul arată, per cotă: baza impozabilă și TVA colectată, calculate din vânzările reale, nu din estimări. Trimiți acest raport direct contabilului, alături de exportul lunar de achiziții (NIR-uri), pentru decontul complet. Condiția pentru un raport corect rămâne aceeași ca la orice alt raport contabil din sistem: catalogul de produse trebuie să aibă cotele de TVA configurate corect de la bun început.",
      },
    ],
  },
  {
    slug: "export-csv-vs-xml-pentru-contabil",
    title: "Export CSV vs. XML pentru contabil — care e mai potrivit și când",
    description:
      "Diferența practică dintre exportul CSV și XML pentru contabil: când alegi unul sau altul, ce riști dacă alegi greșit și cum decizi împreună cu contabilul tău.",
    publishedAt: "2026-07-02",
    locale: "ro",
    tags: ["contabilitate","export"],
    image: "/marketing/dashboard-hero.png",
    relatedFeature: "/features/accountant-reports",
    sections: [
      {
        heading: "Diferența simplă dintre CSV și XML",
        body: "CSV (comma-separated values) este un fișier tabelar simplu — rânduri și coloane separate prin virgulă sau punct-virgulă, care se deschide direct în Excel sau Google Sheets. Îl poate citi și modifica orice om, fără soft specializat.\n\nXML este un format structurat ierarhic, gândit să fie citit direct de un program, nu de un om. Un soft de contabilitate cu funcție de import poate «înțelege» automat un fișier XML și poate popula jurnalele contabile fără intervenție manuală, dacă structura fișierului corespunde exact cu ce așteaptă programul respectiv.\n\nDiferența practică: CSV e pentru verificare vizuală și lucru manual, XML e pentru import automatizat direct într-un soft.",
      },
      {
        heading: "Când alegi CSV",
        body: "CSV e alegerea potrivită când:\n\n- Contabilul tău lucrează în principal în Excel sau într-un soft care nu are o funcție dedicată de import automatizat\n- Vrei să verifici tu însuți datele înainte de a le trimite mai departe — un CSV se deschide și se citește direct, un XML brut e greu de citit vizual\n- Ai nevoie de o combinație rapidă de date pentru altceva decât contabilitate (analiză proprie, comparație lună pe lună)\n\nDezavantajul CSV: contabilul (sau tu) trebuie să introducă manual datele în softul de contabilitate, sau să le proceseze printr-un import parțial automatizat, ceea ce lasă loc de erori de transcriere, mai ales la volume mari de tranzacții.",
      },
      {
        heading: "Când alegi XML",
        body: "XML e alegerea potrivită când contabilul folosește un soft de contabilitate cu funcție de import automat pentru documente externe — de exemplu Saga, unul dintre cele mai răspândite softuri de acest tip în România, dar principiul e valabil pentru orice soft cu import XML dedicat.\n\nAvantajul principal: elimini pasul de transcriere manuală. Datele — NIR-uri, vânzări defalcate pe TVA — ajung direct în jurnalele contabile, fără ca cineva să retasteze cifre dintr-un fișier în altul. Pentru volume mari de tranzacții lunare, diferența de timp și de risc de eroare devine semnificativă.\n\nDezavantajul: dacă structura XML generată nu corespunde exact cu ce așteaptă softul de import, importul eșuează sau introduce date greșite fără avertisment vizibil — de aceea primul export XML către un contabil nou trebuie verificat cu atenție, nu presupus corect din prima.",
      },
      {
        heading: "Riscuri specifice fiecărui format",
        body: "Riscuri CSV:\n\n- Separatorul zecimal sau de coloane (virgulă vs. punct-virgulă) diferă între regiuni și poate produce un fișier ilizibil dacă softul destinație așteaptă alt format\n- Diacriticele românești (ă, â, î, ș, ț) se pot afișa greșit dacă encodarea fișierului nu e cea corectă\n- O coloană lipsă sau redenumită între exporturi succesive poate strica un proces de import deja configurat de contabil\n\nRiscuri XML:\n\n- Structura trebuie să corespundă exact versiunii de import așteptate de softul contabil — o versiune de soft mai veche sau mai nouă poate avea cerințe ușor diferite\n- Erorile de import XML sunt uneori tăcute — datele intră parțial sau greșit, fără mesaj clar de eroare, iar discrepanța se descoperă abia la o verificare ulterioară\n\nNiciun format nu e mai sigur în sine — siguranța vine din verificarea primului export, indiferent de format.",
      },
      {
        heading: "Cum alegi practic",
        body: "Întreabă-ți direct contabilul: «Ce format accepți pentru import — ai un soft cu import automat sau lucrezi manual în Excel?» Răspunsul lui decide formatul, nu preferința ta.\n\nDacă nu ești sigur sau contabilul nu a mai primit date dintr-un program de gestiune până acum, CSV e punctul de plecare mai sigur — poate fi verificat vizual de amândoi înainte să treceți la un flux XML automatizat. Odată ce fluxul e stabil și verificat, XML economisește timp lună de lună, mai ales dacă volumul de tranzacții e mare.\n\nfranchisetech oferă ambele formate de export din aceeași secțiune de rapoarte — alegi o dată formatul potrivit împreună cu contabilul, apoi exportul lunar devine un singur click, indiferent care variantă ai ales.",
      },
    ],
  },
  {
    slug: "documente-obligatorii-horeca-lista-completa",
    title: "Documentele obligatorii într-o cafenea sau restaurant — lista completă 2026",
    description:
      "Ce documente obligatorii trebuie să ai la o cafenea sau restaurant în 2026: autorizații, avize sanitare, rapoarte fiscale zilnice și registre de gestiune stoc.",
    publishedAt: "2026-07-03",
    locale: "ro",
    tags: ["contabilitate","conformitate"],
    image: "/marketing/dashboard-hero.png",
    relatedFeature: "/features/accountant-reports",
    sections: [
      {
        heading: "De ce nu poți improviza lista asta",
        body: "Un control neanunțat de la ANAF, DSP sau ISU nu așteaptă să găsești documentele prin sertare. Inspectorul cere ce cere, în ziua respectivă, iar «le trimit mâine» nu este un răspuns acceptat.\n\nProblema tipică într-o cafenea sau restaurant tânăr: autorizațiile s-au obținut o dată, la deschidere, și de atunci nimeni nu le-a mai văzut. Între timp au apărut angajați noi fără fișă de instructaj, NIR-uri neînregistrate sau rapoarte Z lipsă pentru câteva zile din luna trecută.\n\nLista de mai jos separă documentele pe categorii — ce ai nevoie o singură dată la deschidere, ce se reînnoiește periodic și ce se generează zilnic din activitatea curentă.",
      },
      {
        heading: "Documentele de autorizare, obținute o singură dată (sau reînnoite periodic)",
        body: "- **Certificat constatator ONRC** cu codul CAEN corespunzător activității (restaurant, cafenea, bar, catering)\n- **Autorizația de funcționare** emisă de primăria pe raza căreia funcționează locația\n- **Avizul sanitar de funcționare**, obținut de la direcția de sănătate publică județeană\n- **Avizul/autorizația de securitate la incendiu (PSI)**, dacă suprafața sau capacitatea locației o impune\n- **Contract activ cu o firmă de dezinsecție, deratizare și dezinfecție (DDD)** — verificările trebuie să fie periodice, nu doar la deschidere\n- **Planul propriu de igienă alimentară (HACCP)**, scris și aplicat efectiv, nu doar depus la dosar\n\nAceste documente nu se generează din programul de gestiune — se obțin fizic, de la instituțiile respective, și se păstrează la locație (fizic sau într-un dosar digital accesibil rapid).",
      },
      {
        heading: "Documentele fiscale, generate zilnic din activitate",
        body: "- **Bonul fiscal**, emis prin casa de marcat electronică conectată la ANAF pentru fiecare vânzare\n- **Raportul Z**, generat la finalul fiecărei zile de funcționare\n- **Registrul de casă**, cu toate mișcările de numerar din zi\n- **Declarațiile fiscale periodice** către ANAF (TVA, contribuții pentru angajați), depuse la termenele legale\n\nAceste documente sunt cele pe care un inspector le cere cel mai des, pentru că arată direct dacă vânzările înregistrate corespund cu numerarul din sertar și cu ce a fost declarat.\n\nDintr-un sistem de gestiune corect configurat, raportul Z și registrul de casă se generează automat din fiecare sesiune de vânzare — nu se completează manual la final de zi.",
      },
      {
        heading: "Documentele de gestiune stoc și producție",
        body: "- **NIR (Nota de Intrare-Recepție)** pentru fiecare livrare de marfă primită de la furnizori\n- **Bonul de consum**, care justifică ieșirea materiilor prime din gestiune prin preparare\n- **Balanța cantitativ-valorică**, care compară intrările, ieșirile și stocul rămas\n- **Inventarierea anuală**, obligatorie pentru orice gestiune de stoc, plus inventarieri la schimbarea persoanei responsabile de gestiune\n\nFără NIR pentru fiecare recepție de marfă, stocul din sistem nu mai corespunde cu stocul fizic — iar la inventarul anual apar diferențe pe care nimeni nu le mai poate explica la distanță de luni.",
      },
      {
        heading: "Documentele de personal",
        body: "- **Contractele individuale de muncă**, înregistrate în Revisal înainte ca angajatul să înceapă efectiv activitatea\n- **Fișele de instructaj SSM (securitate și sănătate în muncă) și PSI**, semnate la angajare și reînnoite periodic\n- **Fișele de aptitudine medicală** pentru personalul care manipulează alimente\n- **Regulamentul intern și pontajul**\n\nÎntr-o cafenea sau restaurant cu fluctuație mare de personal — situație frecventă în HoReCa — aceste documente se pierd cel mai ușor. Un barista angajat pentru trei săptămâni de vară fără fișă de instructaj înseamnă o problemă la control, indiferent cât de bine stă restul actelor.",
      },
      {
        heading: "Ce acoperă franchisetech și ce rămâne pe umerii tăi",
        body: "Franchisetech nu emite autorizații și nu ține evidența avizelor DSP sau ISU — acestea rămân documente fizice, obținute de la instituțiile competente și păstrate separat.\n\nCe acoperă direct: raportul Z zilnic, registrul de casă, NIR-urile la fiecare recepție de marfă, bonul de consum generat automat din vânzările cu rețetă și exportul acestor date pentru contabil. Documentele care demonstrează activitatea comercială și de gestiune curentă sunt generate și arhivate automat, cu istoric complet, oricând le poți descărca pentru un control.\n\nPractic: ține avizele și autorizațiile într-un dosar (fizic sau scanat) lângă casă, iar pentru tot ce e fiscal și de gestiune zilnică, lasă sistemul să genereze documentele — nu le reconstitui manual la final de lună.",
      },
    ],
  },
  {
    slug: "cheltuieli-deductibile-horeca-ce-poti-trece",
    title: "Cheltuieli deductibile în HoReCa — ce poți trece și ce nu",
    description:
      "Ce cheltuieli sunt deductibile fiscal într-o cafenea sau restaurant din România: categorii clar deductibile, cheltuieli cu limite legale și documentele necesare pentru fiecare.",
    publishedAt: "2026-07-03",
    locale: "ro",
    tags: ["contabilitate","cheltuieli"],
    image: "/marketing/reports-sales.png",
    relatedFeature: "/features/accountant-reports",
    sections: [
      {
        heading: "De ce contează distincția, nu doar la control",
        body: "O cheltuială trecută greșit ca deductibilă nu doar riscă o problemă la control — umflă artificial imaginea de profitabilitate pe care o vezi tu ca proprietar. Dacă în calculul tău de marjă apar cheltuieli care de fapt nu se scad din baza impozabilă, impozitul pe profit calculat de contabil va fi diferit de ce ai estimat tu, iar surpriza vine trimestrial.\n\nRegula generală: o cheltuială este deductibilă dacă este efectuată în scopul obținerii de venituri impozabile și este justificată cu document. Fără document, indiferent cât de evident e scopul ei de afacere, cheltuiala devine nedeductibilă.",
      },
      {
        heading: "Cheltuieli clar deductibile în activitatea zilnică",
        body: "- **Materie primă și marfă** — cafea, lapte, alimente, băuturi, ambalaje — cu condiția să existe NIR sau factură de achiziție\n- **Chiria spațiului** și utilitățile (curent, apă, gaz, internet)\n- **Salariile și contribuțiile aferente** personalului angajat\n- **Consumabile de curățenie și igienă**, obligatorii pentru funcționarea unei unități alimentare\n- **Mentenanța echipamentelor** — service la espressor, frigidere, cuptor\n- **Comisioanele de la procesatorul de plăți cu cardul**\n- **Chiria sau leasingul echipamentelor** (casă de marcat, POS, mobilier)\n\nToate acestea sunt deductibile integral atât timp cât sunt justificate documentar (factură, NIR, chitanță fiscală) și sunt legate de activitatea curentă.",
      },
      {
        heading: "Cheltuieli deductibile cu limite sau condiții",
        body: "Câteva categorii frecvente în HoReCa sunt deductibile doar parțial sau condiționat — verifică plafoanele exacte cu contabilul, pentru că se pot modifica de la un an fiscal la altul:\n\n- **Cheltuielile de protocol** (mese cu parteneri, degustări pentru furnizori) — deductibile doar în limita unui plafon legal, calculat ca procent din profitul contabil ajustat\n- **Cheltuielile cu autovehiculele** folosite mixt (aprovizionare + uz personal) — deductibilitate parțială dacă vehiculul nu este utilizat exclusiv pentru activitatea firmei\n- **Uniformele de lucru** — deductibile dacă sunt prevăzute în regulamentul intern ca obligatorii pentru personal\n- **Abonamentele telefonice mixte** — deductibile proporțional cu utilizarea în scop de afacere, dacă nu există un telefon dedicat exclusiv firmei\n\nAceste plafoane sunt stabilite prin legislație fiscală și pot varia — nu le calcula singur, cere-i contabilului formula exactă aplicabilă anului curent.",
      },
      {
        heading: "Cheltuieli nedeductibile frecvent greșite în HoReCa",
        body: "- **Amenzile** (ANAF, DSP, ISU, rutiere) — niciodată deductibile, indiferent de motiv\n- **Cheltuielile fără document justificativ** — bon de mână scris, achiziție de la un furnizor fără factură\n- **Cheltuielile personale trecute pe firmă** — cumpărături pentru casă, mese de familie decontate ca protocol\n- **Lipsurile de gestiune neexplicate** — diferența de stoc constatată la inventar și netrecută pe o cauză justificată (perisabilitate normată, casare documentată)\n\nCea mai frecventă greșeală pe care o vedem la afaceri mici HoReCa: proprietarul plătește un furnizor ocazional (o cutie de decorațiuni, un aranjament floral) în numerar, fără factură, și trece suma direct ca și cheltuială pe firmă. Fără document, contabilul nu o poate deduce — indiferent cât de reală a fost cheltuiala.",
      },
      {
        heading: "Ce documente justificative trebuie păstrate pentru fiecare categorie",
        body: "- Pentru marfă și materie primă: **factura furnizorului + NIR-ul aferent**\n- Pentru utilități și chirie: **factura emisă pe numele firmei**\n- Pentru salarii: **statul de plată și contractul de muncă**\n- Pentru protocol: **factura fiscală + lista participanților**, dacă este cerută de politica internă\n- Pentru mentenanță echipamente: **factura de service + certificatul de garanție**, dacă e cazul\n\nDocumentele se păstrează minimum atâta timp cât o cere legislația arhivării financiar-contabile — întreabă contabilul termenul exact aplicabil tipului de document, pentru că diferă între documente fiscale și cele de personal.",
      },
      {
        heading: "Cum te ajută franchisetech să ai justificarea la îndemână",
        body: "Franchisetech nu decide ce este deductibil — asta rămâne decizia contabilului, pe baza legislației fiscale în vigoare. Ce poate face sistemul: să păstreze NIR-urile și bonurile de consum organizate, cu furnizor, dată și valoare, astfel încât fiecare leu de marfă intrată în gestiune să aibă documentul care îl justifică.\n\nCând contabilul întreabă «de unde vine factura asta de la furnizorul de cafea», răspunsul e în NIR-ul din sistem, nu într-un teanc de facturi căutate retroactiv.",
      },
    ],
  },
  {
    slug: "reconciliere-banca-casa-lunar",
    title: "Reconcilierea bancă-casă lunară — cum o faci fără erori",
    description:
      "Cum faci reconcilierea lunară dintre bancă și casă la o cafenea sau restaurant: de unde apar diferențele frecvente și pașii corecți pentru a le închide fără ore pierdute.",
    publishedAt: "2026-07-03",
    locale: "ro",
    tags: ["contabilitate","banca","numerar"],
    image: "/marketing/reports-zreport.png",
    relatedFeature: "/features/accountant-reports",
    sections: [
      {
        heading: "Ce este reconcilierea bancă-casă și de ce diverge aproape mereu",
        body: "Reconcilierea bancă-casă înseamnă să verifici că suma încasărilor cu cardul înregistrate în sistemul de gestiune corespunde cu ce a intrat efectiv în contul bancar, iar suma numerarului din rapoartele Z corespunde cu ce ai depus fizic la bancă.\n\nÎn teorie, cele două cifre ar trebui să coincidă perfect. În practică, la o cafenea sau restaurant cu volum zilnic de tranzacții, diferențe mici apar aproape în fiecare lună — problema nu este că apar, ci că nimeni nu le investighează la timp și se acumulează.",
      },
      {
        heading: "De unde vin diferențele frecvente",
        body: "- **Comisioanele procesatorului de plăți cu cardul** — banca depune suma netă, după comision, în timp ce sistemul de gestiune înregistrează suma brută a vânzării\n- **Depunerile de numerar întârziate** — numerarul dintr-o zi de vineri poate ajunge la bancă abia luni, ceea ce creează decalaj între data vânzării și data depunerii\n- **Tranzacții card procesate în afara POS-ului principal** — un terminal secundar sau o plată prin link, neînregistrată corect în sistem\n- **Retururi și anulări** — o vânzare anulată după ce banii au fost deja procesați pe card poate apărea ca discrepanță dacă nu este marcată corect în sistem\n- **Diferențe de rotunjire la numărarea sertarului** — sume mici, dar care se adună pe parcursul unei luni\n\nFiecare dintre aceste cauze are un tipar recognoscibil — odată ce știi să le recunoști, reconcilierea devine un proces de verificare, nu de detectivism.",
      },
      {
        heading: "Pașii pentru o reconciliere lunară corectă",
        body: "1. **Extragi totalul vânzărilor pe card din sistemul de gestiune**, defalcat pe zile, pentru luna respectivă\n2. **Extragi extrasul de cont bancar** pentru aceeași perioadă și identifici depunerile aferente încasărilor card\n3. **Compari suma brută din sistem cu suma netă din bancă** — diferența ar trebui să corespundă aproximativ cu comisioanele procesatorului\n4. **Verifici depunerile de numerar** față de totalul numerarului din rapoartele Z ale perioadei\n5. **Notezi orice diferență care depășește comisioanele așteptate** și cauți tranzacția specifică care a generat-o\n6. **Confirmi cu contabilul** soldul final reconciliat înainte de închiderea lunii contabile\n\nFăcută lunar, această verificare durează 30–60 de minute. Amânată trei-patru luni, devine un proiect de o zi întreagă, pentru că trebuie reconstituit istoricul de la zero.",
      },
      {
        heading: "Ce faci când sumele tot nu se potrivesc",
        body: "Dacă după verificarea comisioanelor și a depunerilor întârziate tot rămâne o diferență neexplicată:\n\n- Verifică dacă toate sesiunile POS din perioadă au fost închise corect cu raport Z — o sesiune neînchisă poate lăsa tranzacții în afara raportării\n- Verifică dacă a existat vreo zi cu funcționare offline (fără internet) în care vânzările s-au sincronizat cu întârziere\n- Caută tranzacții duplicate sau anulate incorect procesate\n- Dacă diferența este mică și constantă lunar, poate fi vorba de un comision suplimentar al procesatorului netrecut clar în contract — cere clarificare\n\nO diferență lunară sub 0.5% din volumul total de vânzări este, de regulă, normală și acoperă comisioane și rotunjiri. Peste acest nivel, merită investigată punctual, tranzacție cu tranzacție dacă e nevoie.",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "Fiecare raport Z generat în franchisetech păstrează defalcarea exactă pe metode de plată — numerar, card, online — pentru fiecare zi. La final de lună, agregi rapoartele Z din **Rapoarte → Raport Z zilnic** pe intervalul dorit și obții totalul de card pe perioadă, gata de comparat cu extrasul bancar.\n\nDeoarece fiecare tranzacție rămâne asociată cu data, ora și metoda de plată, când apare o diferență poți căuta punctual ziua sau tranzacția în cauză, în loc să reconstruiești manual o lună întreagă de vânzări dintr-un caiet sau un fișier Excel.",
      },
    ],
  },
  {
    slug: "ce-rapoarte-cere-contabilul-de-la-tine-lunar",
    title: "Ce rapoarte îți cere contabilul în fiecare lună și de unde le iei rapid",
    description:
      "Lista completă a rapoartelor cerute lunar de contabil de la o cafenea sau restaurant — raport Z, NIR-uri, bon de consum, extras bancar — și cum le obții rapid, fără căutări.",
    publishedAt: "2026-07-04",
    locale: "ro",
    tags: ["contabilitate","rapoarte"],
    image: "/marketing/dashboard-hero.png",
    relatedFeature: "/features/accountant-reports",
    sections: [
      {
        heading: "De ce contabilul cere aceleași documente în fiecare lună",
        body: "Contabilul nu cere documentele din curiozitate — fiecare are un rol specific în întocmirea balanței lunare, a declarației de TVA și a calculului impozitului pe profit. Fără unul dintre ele, o parte din contabilitatea lunii rămâne incompletă, iar declarațiile se depun cu date estimate, nu confirmate.\n\nProblema tipică: proprietarul trimite documentele fragmentat, pe parcursul a două-trei săptămâni, iar contabilul așteaptă ultima piesă lipsă ca să poată închide luna — de obicei chiar înainte de termenul de depunere a declarațiilor.",
      },
      {
        heading: "Lista completă a rapoartelor cerute lunar",
        body: "- **Rapoartele Z pentru fiecare zi lucrătoare a lunii** — vânzări totale, defalcare pe metode de plată, TVA colectat\n- **Toate NIR-urile emise în luna respectivă** — recepțiile de marfă, cu furnizor, cantitate și valoare\n- **Bonul de consum agregat pe lună** — materiile prime consumate prin preparare\n- **Extrasul de cont bancar** pentru perioada respectivă\n- **Statul de salarii și pontajul** personalului\n- **Facturile de cheltuieli** (chirie, utilități, mentenanță) neincluse deja în NIR\n\nDacă oricare dintre acestea lipsește sau este incomplet, contabilul fie estimează (risc), fie amână închiderea lunii (întârziere la declarații).",
      },
      {
        heading: "De ce întârzii tu livrarea acestor documente, de obicei",
        body: "Cele mai frecvente motive pentru care proprietarii de cafenele și restaurante întârzie pachetul lunar:\n\n- Rapoartele Z sunt tipărite și puse într-un dosar fizic care se rătăcește sau se pierde parțial\n- NIR-urile sunt introduse cu întârziere, uneori la sfârșitul lunii, «din memorie»\n- Facturile de la furnizori mici ajung pe WhatsApp sau email și se pierd printre alte mesaje\n- Nimeni din echipă nu este responsabil clar cu strângerea documentelor — fiecare presupune că altcineva se ocupă\n\nSoluția nu este muncă suplimentară la final de lună, ci ca fiecare document să fie introdus în sistem în momentul în care se produce — NIR-ul la recepția mărfii, raportul Z la închiderea zilei — nu reconstituit ulterior.",
      },
      {
        heading: "Cum arată un pachet lunar complet",
        body: "Un pachet lunar pe care contabilul îl poate procesa fără întrebări suplimentare conține:\n\n- Rapoartele Z ale tuturor zilelor lucrătoare, fără lipsuri\n- NIR-urile emise (nu în stadiul de ciornă) pentru toate recepțiile lunii\n- Bonul de consum generat pentru perioadă\n- Extrasul bancar descărcat din internet banking\n- Facturile de cheltuieli fixe, scanate sau în format electronic\n\nDacă toate cinci sunt complete și corespund calendaristic cu luna în cauză, contabilul poate închide luna fără să aștepte clarificări de la tine.",
      },
      {
        heading: "Cum le generezi rapid din franchisetech",
        body: "Din secțiunea **Rapoarte → Export audit & Saga**, selectezi perioada lunară și exporți NIR-urile și vânzările direct în format compatibil cu programele de contabilitate uzuale. Rapoartele Z individuale rămân disponibile oricând în **Rapoarte → Raport Z zilnic**, cu istoric complet.\n\nÎn loc să aduni documentele manual din dosare, emailuri și WhatsApp, trimiți contabilului un singur export lunar plus accesul la rapoartele arhivate — pachetul e gata în minute, nu în zile.",
      },
    ],
  },
  {
    slug: "checklist-deschidere-cafenea-de-la-zero",
    title: "Checklist complet pentru deschiderea unei cafenele de la zero",
    description:
      "Checklist pas cu pas pentru deschiderea unei cafenele în România: acte și autorizații, amenajare, furnizori, casă de marcat și configurare POS, personal și prima zi de funcționare.",
    publishedAt: "2026-07-04",
    locale: "ro",
    tags: ["cafenea","checklist","deschidere"],
    image: "/marketing/industry-cafe.png",
    relatedFeature: "/features/setup-onboarding",
    sections: [
      {
        heading: "Etapa legală și administrativă — înainte să semnezi contractul de spațiu",
        body: "- Înființarea firmei (SRL, cel mai frecvent pentru o cafenea cu angajați) cu codul CAEN corespunzător activității de baruri/cafenele\n- Verificarea destinației spațiului — nu orice spațiu comercial are avizul necesar pentru activitate de alimentație publică, verifică asta înainte de a semna contractul de închiriere\n- Obținerea autorizației de funcționare de la primărie\n- Avizul sanitar de la direcția de sănătate publică\n- Contract cu firmă de dezinsecție-deratizare\n\nAceastă etapă durează de obicei mai mult decât estimează proprietarii la prima deschidere — plănuiește câteva săptămâni, nu câteva zile, între semnarea spațiului și prima zi de funcționare legală.",
      },
      {
        heading: "Amenajare și echipamente esențiale",
        body: "- **Espressor profesional** — dimensionat pentru volumul estimat, nu pentru cel dorit; un espressor subdimensionat cedează în weekend-uri aglomerate\n- **Râșniță de cafea** dedicată, calibrată pentru tipul de boabe ales\n- **Vitrină frigorifică** pentru patiserie și produse perisabile\n- **Frigider/congelator de rezervă** pentru stoc de lapte, siropuri, materie primă\n- **Mobilier și zonă de servire** dimensionate pentru fluxul de clienți estimat, nu doar pentru aspect\n- **Casă de marcat fiscală** conectată la ANAF — obligatorie de la prima vânzare\n\nO greșeală frecventă la deschidere: se investește disproporționat în amenajare (design, mobilier) și insuficient în echipamentul de bază care determină viteza de servire — un espressor bun compensează mult mai mult decât un decor scump.",
      },
      {
        heading: "Furnizori și meniul de lansare",
        body: "Pentru o cafenea nouă, meniul de lansare nu trebuie să fie extins — trebuie să fie fiabil. Un meniu de 8–12 produse bine executate constant depășește un meniu de 30 de produse cu calitate inconsistentă.\n\n- Alege furnizorul de cafea pe baza unui test de câteva săptămâni, nu doar a unei degustări unice\n- Stabilește un furnizor de lapte cu livrare frecventă (lactatele nu se stochează în cantitate mare la o cafenea mică)\n- Pentru patiserie: decide de la început dacă produci intern sau cumperi de la un furnizor — combinația e posibilă, dar clarific-o dinainte pentru calculul costurilor\n\nÎnainte de deschidere, calculează costul fiecărei rețete din meniul de lansare — cappuccino, flat white, ceai, câte un produs de patiserie — ca să știi din prima zi ce marjă ai, nu să afli după o lună de vânzări.",
      },
      {
        heading: "Sistemul de casă și configurarea gestiunii",
        body: "1. **Instalezi casa de marcat fiscală** și o conectezi la ANAF, conform cerințelor legale\n2. **Configurezi produsele în sistemul POS** — denumire, preț, cotă TVA corectă per produs\n3. **Introduci rețetele** pentru produsele cu ingrediente (cafea, lapte, siropuri) ca să ai calculul de cost automat de la prima vânzare\n4. **Setezi stocul inițial** pe baza primei recepții de marfă (NIR)\n5. **Configurezi utilizatorii** — cine are acces la casă, cine poate face anulări sau reduceri\n\nAcest pas se face înainte de deschidere, nu în prima săptămână de funcționare — o cafenea care deschide fără produsele configurate corect în POS pierde timp la fiecare vânzare din primele zile, exact când clienții testează afacerea pentru prima dată.",
      },
      {
        heading: "Personal și instruire înainte de prima zi",
        body: "- Angajarea baristilor cu contract de muncă înregistrat în Revisal înainte de prima zi lucrată\n- Instruirea pe casa de marcat și sistemul POS — minimum o sesiune de exersare cu vânzări simulate\n- Fișele de instructaj SSM și PSI, semnate la angajare\n- Un ghid scris (chiar simplu, o pagină) cu procedura de deschidere și închidere a zilei — cine numără sertarul, cine generează raportul Z\n\nO cafenea nouă are, de regulă, personal nou și proceduri neconsolidate în același timp. Documentarea procedurilor de bază de la început reduce dependența de memoria unei singure persoane.",
      },
      {
        heading: "Ziua de deschidere și primele două săptămâni",
        body: "Multe cafenele fac o deschidere «soft» — câteva zile de funcționare fără promovare, pentru ca personalul și sistemul să se roteze fără presiunea unui val mare de clienți din prima zi.\n\nÎn primele două săptămâni:\n\n- Generează raportul Z în fiecare zi, fără excepție — obișnuiește-te cu procesul cât timp volumul e încă gestionabil\n- Verifică zilnic dacă stocul scade conform așteptărilor sau apar diferențe neexplicate\n- Ajustează meniul pe baza vânzărilor reale — produsele care nu se vând deloc în primele două săptămâni rareori decolează mai târziu fără o schimbare\n\nFranchisetech oferă configurare ghidată în aplicație pentru produse, rețete și prima sesiune de casă, plus 15 zile de trial — util exact pentru etapa asta, când vrei sistemul funcțional înainte de ziua de deschidere, nu în timpul ei.",
      },
    ],
  },
  {
    slug: "checklist-deschidere-restaurant-de-la-zero",
    title: "Checklist complet pentru deschiderea unui restaurant de la zero",
    description:
      "Checklist pas cu pas pentru deschiderea unui restaurant în România: autorizații, amenajare bucătărie, furnizori, meniu, personal de sală și bucătărie, sistem POS și prima lună.",
    publishedAt: "2026-07-05",
    locale: "ro",
    tags: ["restaurant","checklist","deschidere"],
    image: "/marketing/industry-restaurant.png",
    relatedFeature: "/features/setup-onboarding",
    sections: [
      {
        heading: "Etapa legală — mai complexă decât la o cafenea",
        body: "Un restaurant cu bucătărie proprie trece prin mai multe verificări decât o cafenea fără preparare la cald:\n\n- Firma (SRL) cu codul CAEN pentru activitate de restaurante\n- Autorizația de funcționare de la primărie, care ia în calcul și capacitatea sălii (număr de locuri)\n- Avizul sanitar de funcționare, cu verificare specifică pentru bucătărie — fluxul alimentelor, zonele de depozitare, temperaturile de păstrare\n- Avizul PSI, obligatoriu la capacitățile mai mari de public\n- Plan HACCP implementat efectiv, nu doar depus la dosar — inspectorii verifică aplicarea lui în bucătărie, nu doar existența documentului\n\nDatorită bucătăriei, verificarea sanitară pentru un restaurant este de regulă mai amănunțită decât pentru o cafenea — plănuiește timp suplimentar pentru această etapă.",
      },
      {
        heading: "Amenajarea bucătăriei și a sălii",
        body: "- **Zonarea bucătăriei** pe fluxul alimentelor — recepție marfă, depozitare rece/uscată, preparare, gătit, servire — separate fizic pentru a evita contaminarea încrucișată\n- **Echipamente de gătit** dimensionate pentru capacitatea sălii — un aragaz subdimensionat creează întârzieri la orele de vârf\n- **Spații de depozitare rece separate** pentru carne, lactate, legume — nu toate materiile prime pot sta în același frigider\n- **Zona de spălat vase** dimensionată corect — subestimată frecvent, devine blocajul serviciului în seri aglomerate\n- **Planul sălii** — numărul de mese, fluxul ospătarilor, distanța până la bucătărie\n\nCapacitatea bucătăriei, nu numărul de locuri din sală, este de obicei limita reală a unui restaurant nou — o sală de 60 de locuri cu o bucătărie gândită pentru 30 va avea probleme constante la ore de vârf.",
      },
      {
        heading: "Furnizori și structura meniului",
        body: "Un meniu de lansare pentru restaurant beneficiază de aceeași regulă ca la cafenea — mai puține preparate, executate constant, depășesc un meniu stufos cu calitate inconsistentă.\n\n- Stabilește furnizori principali pentru carne, legume, lactate — cu livrări programate, nu aprovizionare ad-hoc\n- Calculează costul fiecărei rețete din meniul de lansare înainte de a stabili prețurile — inclusiv garniturile, care sunt deseori omise din calcul\n- Verifică disponibilitatea constantă a ingredientelor cheie — un preparat vedetă din meniu care depinde de un ingredient sezonier greu de găsit creează probleme repetate\n\nPentru fiecare preparat, cunoaște de la început costul de ingrediente pe porție și marja rezultată la prețul stabilit — nu aștepta prima lună de vânzări ca să afli care preparate pierd bani.",
      },
      {
        heading: "Sistemul POS și configurarea pentru un flux cu ospătari",
        body: "1. **Configurezi produsele și meniul în POS**, cu cotele TVA corecte per categorie\n2. **Introduci rețetele** pentru fiecare preparat, cu ingrediente și cantități per porție\n3. **Setezi stocul inițial** pe baza primelor recepții de marfă\n4. **Instruiești personalul de sală** pe fluxul de comandă — de la preluarea comenzii la transmiterea către bucătărie\n5. **Configurezi utilizatorii cu roluri diferite** — ospătar, bucătar, manager — fiecare cu accesul potrivit\n\nUn restaurant cu ospătari are un flux de operare mai complex decât o cafenea la tejghea — testează întregul flux de comandă înainte de deschidere, cu comenzi simulate, nu doar configurarea produselor individuale.",
      },
      {
        heading: "Personal — sală și bucătărie",
        body: "- Angajarea și înregistrarea în Revisal a întregii echipe — bucătari, ospătari, personal de curățenie — înainte de prima zi lucrată\n- Fișele de instructaj SSM și PSI pentru toți angajații, cu atenție suplimentară pentru personalul de bucătărie (echipamente cu risc)\n- Fișele de aptitudine medicală pentru personalul care manipulează alimente\n- Instruire pe procedurile de deschidere/închidere a zilei — cine generează raportul Z, cine numără sertarul, cine verifică stocul de bucătărie la final de tură\n\nUn restaurant are, de regulă, o echipă mai mare de la început decât o cafenea — coordonarea dintre sală și bucătărie contează la fel de mult ca instruirea individuală.",
      },
      {
        heading: "Prima lună de funcționare",
        body: "- Generează raportul Z zilnic, fără excepții, chiar dacă volumul e mic în primele săptămâni\n- Urmărește care preparate din meniu au marjă negativă sau sub așteptări, pe baza rețetelor introduse în sistem\n- Ajustează meniul pe baza vânzărilor reale, nu doar pe baza feedback-ului verbal al clienților\n- Verifică lunar dacă stocul din sistem corespunde cu inventarul fizic din bucătărie\n\nFranchisetech oferă configurare ghidată pentru meniu, rețete și rolurile de personal, plus 15 zile trial — suficient pentru a avea sistemul rodat înainte ca sala să fie plină în fiecare seară.",
      },
    ],
  },
  {
    slug: "provocari-gestiune-food-truck-romania",
    title: "Provocările gestiunii unui food truck în România și cum le rezolvi",
    description:
      "Cele mai frecvente provocări operaționale ale unui food truck din România — mobilitate, conexiune la internet, stoc limitat, vreme — și cum le gestionezi fără să pierzi vânzări.",
    publishedAt: "2026-07-05",
    locale: "ro",
    tags: ["food-truck","gestiune"],
    image: "/marketing/industry-food-truck.png",
    relatedFeature: "/features/pos",
    sections: [
      {
        heading: "Mobilitatea schimbă regulile față de o locație fixă",
        body: "Un food truck nu funcționează în același loc în fiecare zi — se mută între evenimente, piețe, zone de birouri sau festivaluri, uneori de mai multe ori pe săptămână. Asta schimbă practic tot ce se aplică unei cafenele sau unui restaurant cu locație fixă.\n\nFiecare locație nouă poate avea reguli diferite: unele primării cer autorizație separată pentru comerț ambulant sau ocuparea domeniului public, unele evenimente au taxă de participare inclusă în contract, altele cer dovada avizului sanitar valabil pentru vehicul. Verifică cerințele specifice ale fiecărei locații înainte de a te muta acolo — nu presupune că autorizația de la locul anterior acoperă automat locul următor.",
      },
      {
        heading: "Conexiunea la internet nu este garantată nicăieri",
        body: "Un festival în aer liber, o parcare industrială sau o piață stradală nu au întotdeauna semnal stabil. Dacă sistemul de casă depinde complet de conexiune permanentă la internet ca să înregistreze o vânzare, o oră de semnal slab înseamnă o oră de vânzări pierdute sau notate manual, cu risc de eroare la reconciliere ulterioară.\n\nUn sistem POS pentru food truck trebuie să funcționeze offline — să înregistreze vânzarea local, pe dispozitiv, și să sincronizeze automat datele când conexiunea revine. Verifică explicit acest lucru înainte de a alege un sistem — pentru un food truck contează mai mult decât pentru orice altă locație HoReCa.",
      },
      {
        heading: "Stocul limitat, într-un spațiu de câțiva metri pătrați",
        body: "Un food truck nu are depozit de rezervă — ce nu încape în vehicul, nu există pentru ziua respectivă. Asta înseamnă că aprovizionarea trebuie calculată cât mai aproape de vânzarea estimată, fără marjă mare de eroare în ambele direcții.\n\n- Prea puțin stoc → rămâi fără un produs de bază la jumătatea unui eveniment aglomerat\n- Prea mult stoc → transporți materie primă perisabilă înapoi și înainte, cu risc de pierdere\n\nȚinerea unui istoric de vânzări per locație și per tip de eveniment (festival de weekend vs. zonă de birouri în timpul săptămânii) ajută la calibrarea comenzilor viitoare mult mai bine decât o estimare generală.",
      },
      {
        heading: "Vremea și evenimentele schimbă vânzările de la o zi la alta, radical",
        body: "O ploaie neașteptată poate reduce la jumătate vânzările unui food truck într-o piață stradală, în timp ce un festival bine promovat poate tripla volumul obișnuit față de o zi normală. Diferența e mult mai mare decât la o locație fixă, unde clienții vin oricum, indiferent de vreme.\n\nAceastă variație face imposibilă o aprovizionare «standard» pentru fiecare zi. Merită să urmărești separat vânzările din fiecare tip de context (festival, piață stradală, eveniment corporate) ca să ai o bază reală de estimare, nu o singură medie generală care ascunde diferențele mari dintre tipurile de zile.",
      },
      {
        heading: "Personal redus, presiune mare pe viteză",
        body: "Majoritatea food truck-urilor operează cu 1–2 persoane, uneori 3 la evenimente mari. Fără personal de rezervă la fața locului, orice blocaj — o casă de marcat care se blochează, un sistem POS lent — se traduce direct în coadă vizibilă și clienți care renunță.\n\nViteza la casă contează disproporționat de mult pentru un food truck comparativ cu o locație fixă: clienții de la un festival nu așteaptă 5 minute pentru o comandă simplă, indiferent cât de bună e mâncarea. Un flux de comandă cu cât mai puțini pași — selectezi produsul, încasezi, următorul client — face diferența reală la orele de vârf.",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "POS-ul franchisetech funcționează offline — vânzările se înregistrează local pe dispozitiv chiar și fără conexiune la internet, iar datele se sincronizează automat de îndată ce semnalul revine. Pentru un food truck care se mută constant între locații cu conexiune inconsistentă, asta înseamnă că nu pierzi nicio vânzare din cauza semnalului slab dintr-o parcare sau un festival în aer liber.\n\nRaportul Z rămâne disponibil pentru fiecare zi/locație, iar stocul se actualizează la fiecare NIR — util pentru un food truck unde fiecare kilogram de marfă transportată trebuie contabilizat corect, indiferent unde a fost vândut.",
      },
    ],
  },
  {
    slug: "stoc-perisabil-patiserie-cum-il-gestionezi",
    title: "Stocul perisabil la o patiserie — cum îl gestionezi fără risipă",
    description:
      "Cum gestionezi stocul perisabil la o patiserie din România: planificare producție, rotație FIFO, reduceri de final de zi — ca să reduci risipa fără să pierzi vânzări.",
    publishedAt: "2026-07-05",
    locale: "ro",
    tags: ["patiserie","stoc","risipa"],
    image: "/marketing/industry-kitchen.png",
    relatedFeature: "/features/stock-management",
    sections: [
      {
        heading: "Risipa la patiserie e diferită de risipa la restaurant",
        body: "Un restaurant poate ajusta producția aproape în timp real — un preparat se gătește la comandă. O patiserie produce dimineața (sau cu o zi înainte pentru anumite produse) o cantitate fixă, iar ce nu se vinde până seara rămâne stoc care își pierde valoarea rapid — de la produs proaspăt la produs de reducere, la aruncat, în câteva zile sau chiar câteva ore la unele sortimente.\n\nDouă erori opuse costă bani în feluri diferite: prea puțină producție înseamnă clienți care pleacă fără ce au vrut să cumpere (vânzare pierdută, vizibilă imediat), prea multă producție înseamnă marfă aruncată la final de zi (cost invizibil, care se adună lunar fără să fie observat imediat).",
      },
      {
        heading: "Cum calculezi producția zilnică pe baza istoricului, nu pe intuiție",
        body: "Cea mai comună greșeală la o patiserie tânără: producția se stabilește după «cât cred eu că se vinde», ajustată subiectiv de la o zi la alta. Rezultatul: zile cu stoc epuizat până la prânz și zile cu jumătate din vitrină rămasă seara.\n\nO abordare mai fiabilă:\n\n- Urmărește vânzările per produs, per zi a săptămânii, timp de câteva săptămâni consecutive\n- Identifică tiparele — vineri și sâmbătă vând de obicei mai mult decât luni și marți, produsele cu ciocolată se vând diferit de cele cu fructe\n- Calculează producția zilei pe baza mediei zilei respective din săptămânile anterioare, nu pe baza mediei generale a lunii\n- Ajustează treptat, nu radical — o schimbare de 10–15% la un moment dat, nu dublarea producției dintr-o singură decizie",
      },
      {
        heading: "Rotația stocului de materii prime — FIFO și perisabilitate diferențiată",
        body: "Materiile prime dintr-o patiserie au termene de valabilitate foarte diferite: frișca și ouăle se strică în câteva zile, făina și zahărul rezistă luni, iar untul e undeva la mijloc. Gestionarea lor la fel, cu aceeași regulă de rotație, duce fie la risipă la produsele rapid perisabile, fie la comenzi inutil de frecvente la cele stabile.\n\n- **FIFO strict** (primul intrat, primul ieșit) pentru materii prime perisabile — lactate, ouă, fructe proaspete\n- **Comenzi programate cu buffer mai mic** pentru materii prime cu durată scurtă, ca să nu stea în stoc mai mult decât e necesar\n- **Verificare vizuală zilnică** a zonelor de depozitare rece, nu doar bazată pe data teoretică de expirare — unele produse se degradează vizibil înainte de data înscrisă pe ambalaj, mai ales după deschidere\n\nO recepție de marfă (NIR) corect datată face diferența între a ști exact ce a intrat când și a ghici, la o săptămână distanță, care lot de frișcă e mai vechi.",
      },
      {
        heading: "Reduceri de final de zi — recuperezi cost, nu profit",
        body: "Produsele de patiserie rămase la final de zi valorează mai mult vândute la reducere decât aruncate integral. O reducere de 30–40% aplicată cu 1–2 ore înainte de închidere recuperează cel puțin costul ingredientelor, chiar dacă marja e redusă aproape de zero pe acele produse specifice.\n\nCâteva reguli practice:\n\n- Stabilește o oră fixă de la care se aplică reducerea, ca să fie predictibilă pentru echipă (și eventual pentru clienții obișnuiți care știu să vină atunci)\n- Separă vizual produsele la reducere de cele proaspete, pentru transparență față de client\n- Urmărește separat vânzările la preț întreg față de cele la reducere — dacă procentul vândut la reducere crește constant lună de lună, problema e la producție, nu la vânzare",
      },
      {
        heading: "Cum urmărești risipa ca și cost real, nu doar ca senzație",
        body: "Fără o evidență clară, risipa la o patiserie rămâne o senzație vagă («simt că aruncăm prea mult») fără o cifră concretă atașată. Documentarea produselor casate — printr-un bon de casare sau o notă similară — transformă risipa dintr-o presupunere într-un cost lunar măsurabil.\n\nDacă produsele casate reprezintă, de exemplu, 8% din producția lunară în valoare, asta e o cifră pe care o poți urmări lună de lună și reduce treptat prin ajustarea producției — fără evidență, nu ai cum să știi dacă lucrurile se îmbunătățesc sau se înrăutățesc.",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "Rapoartele de vânzări per produs, per zi a săptămânii, din franchisetech ajută exact la calibrarea producției descrisă mai sus — vezi tiparele reale de vânzare, nu presupuneri. NIR-urile la fiecare recepție de materii prime păstrează data intrării, util pentru rotația FIFO a lactatelor și fructelor proaspete.\n\nCând configurezi rețetele produselor de patiserie cu costul ingredientelor per porție, poți calcula rapid cât recuperezi dintr-un produs vândut la reducere de final de zi — și dacă acoperă măcar costul materiei prime.",
      },
    ],
  },
  {
    slug: "marje-juice-bar-health-bar-romania",
    title: "Marjele reale la un juice bar sau health bar din România",
    description:
      "Cât costă real un smoothie sau un fresh la un juice bar din România și ce marjă rămâne după fructe, legume și risipă — cu exemple de calcul și praguri de profitabilitate.",
    publishedAt: "2026-07-06",
    locale: "ro",
    tags: ["health-bar","marja"],
    image: "/marketing/margins-report.png",
    relatedFeature: "/features/recipe-costing",
    sections: [
      {
        heading: "De ce un juice bar pare profitabil pe hârtie și deseori nu e",
        body: "Un pahar de smoothie sau fresh vândut cu 18–22 lei arată, la prima vedere, ca un produs cu marjă foarte bună — la fel cum arată și o cafea. Diferența majoră față de cafea: fructele și legumele proaspete costă mult mai mult per porție decât cafeaua și laptele, se strică rapid și au preț variabil sezonier, în timp ce cafeaua boabe se păstrează luni și are preț relativ stabil.\n\nUn juice bar care nu calculează costul exact per rețetă tinde să supraestimeze marja — pentru că baza de comparație mentală («e doar fructe și apă») subestimează cât costă efectiv fructele proaspete de calitate.",
      },
      {
        heading: "Costul real al unui smoothie — exemplu de calcul",
        body: "Rețetă smoothie fructe de pădure (400ml):\n\n- Banană 100g → 100g × 6 lei/kg = **0.60 lei**\n- Fructe de pădure congelate 80g → 80g × 28 lei/kg = **2.24 lei**\n- Iaurt/lapte vegetal 150ml → 150ml × 9 lei/litru = **1.35 lei**\n- Miere/îndulcitor 15g → **0.45 lei**\n- Pahar + capac + pai: **0.40 lei**\n\n**Cost total ingrediente: 5.04 lei**\n\nPreț de vânzare obișnuit: **20 lei**\n\n- Marjă brută: 20 − 5.04 = **14.96 lei**\n- Procent marjă: 14.96 / 20 × 100 = **74.8%**\n\nProcentul arată bine, dar comparativ cu un espresso (marjă tipică peste 80%), costul absolut per porție e de câteva ori mai mare — iar fructele congelate cresc sezonier de preț, spre deosebire de cafeaua boabe.",
      },
      {
        heading: "Risipa de fructe și legume — costul ascuns care erodează marja",
        body: "Fructele și legumele proaspete se strică în zile, nu în luni. O banană prea coaptă, un mănunchi de spanac ofilit sau portocale care nu mai sunt bune de stors reprezintă cost pierdut înainte ca produsul să genereze vreun venit.\n\nUn juice bar care cumpără fructe proaspete «cu ochiul», fără să urmărească vânzările reale per produs, sfârșește frecvent cu o parte semnificativă din materia primă aruncată lunar — o cifră care, nefiind urmărită, nu apare niciodată explicit în calculul de marjă, dar erodează profitul real la fel de sigur ca o reducere de preț.\n\nSoluția practică: comandă fructe proaspete în cicluri scurte (la 2–3 zile, nu săptămânal) și urmărește care sortimente de fresh au cea mai mare rată de risipă, ca să ajustezi cantitatea comandată specific pentru ele.",
      },
      {
        heading: "Prețul pe care piața îl acceptă vs. costul real",
        body: "Un fresh de portocale sau un smoothie nu poate fi facturat la fel de liber ca un preparat de restaurant — clienții au un reper de preț mental pentru «un pahar de suc», format din experiența cu alte locuri și cu prețul fructelor cumpărate direct din piață.\n\nAsta creează o presiune reală: dacă prețul fructelor crește sezonier (portocalele iarna, fructele de pădure vara devin mai ieftine, dar alte sortimente se scumpesc), marja se comprimă fără ca prețul de vânzare să poată crește proporțional — pentru că piața nu acceptă prețuri variabile de la o săptămână la alta pe același produs.\n\nAceastă constrângere face esențial calculul de cost per rețetă actualizat constant, nu stabilit o dată la deschidere și uitat.",
      },
      {
        heading: "Cum crești marja fără să reduci calitatea",
        body: "- **Rotește sortimentele sezoniere** — promovează activ fresh-urile din fructe aflate la preț bun sezonier, în locul celor scumpite temporar\n- **Standardizează porțiile** — o cană de măsurare fixă per rețetă previne variația de cost de la un barista la altul\n- **Renegociază cu furnizorii pe volum**, dacă vânzările susțin comenzi mai mari și mai rare în locul comenzilor zilnice mici\n- **Elimină din meniu sortimentele cu vânzare foarte mică** — un fresh exotic comandat rar înseamnă fructe cumpărate special care se strică înainte să fie folosite integral\n\nNiciuna dintre aceste măsuri nu înseamnă ingrediente mai ieftine sau porții mai mici perceptibil — sunt ajustări operaționale care reduc risipa și cresc predictibilitatea costului.",
      },
      {
        heading: "Cum calculezi automat în franchisetech",
        body: "Din secțiunea **Rețete**, introduci ingredientele fiecărui smoothie sau fresh cu cantitățile exacte per porție. Costul se recalculează automat de fiecare dată când înregistrezi o recepție de marfă (NIR) cu un preț nou pentru fructe sau legume — util într-un domeniu unde prețurile materiei prime variază constant, sezonier și de la un furnizor la altul.\n\nLista de rețete arată direct care sortimente au marjă sub așteptări, ca să le identifici înainte ca vânzarea lor în volum mare să erodeze profitul întregii luni.",
      },
    ],
  },
  {
    slug: "franciza-vs-locatie-proprie-ce-alegi",
    title: "Franciză vs. locație proprie — ce alegi când deschizi o afacere HoReCa",
    description:
      "Diferența reală dintre a deschide sub o franciză și a porni o locație proprie în HoReCa: costuri, control asupra meniului și furnizorilor, și întrebări care te ajută să decizi.",
    publishedAt: "2026-07-06",
    locale: "ro",
    tags: ["franciza","strategie"],
    image: "/marketing/industry-restaurant.png",
    relatedFeature: "/features/setup-onboarding",
    sections: [
      {
        heading: "Ce cumperi de fapt cu o franciză",
        body: "O franciză HoReCa îți oferă un pachet: brand recunoscut, rețete și proceduri standardizate, suport în deschidere, uneori acces preferențial la furnizori și, teoretic, un flux de clienți mai previzibil datorită recunoașterii brandului.\n\nCe primești în schimb costă, de regulă, în două forme: o taxă de intrare (plătită o singură dată, la semnarea contractului) și o redevență lunară (calculată de obicei ca procent din vânzări, nu ca sumă fixă). Structura exactă diferă foarte mult de la un brand la altul — verifică termenii specifici direct cu francizorul, nu presupune o formulă standard valabilă pentru toate francizele.",
      },
      {
        heading: "Ce câștigi cu o locație proprie",
        body: "O locație proprie înseamnă control total: meniu, prețuri, furnizori, program, identitate vizuală — toate deciziile rămân ale tale, fără aprobare de la un francizor și fără redevență lunară care scade din profit indiferent de cât de bine merge afacerea.\n\nCosturile din spate sunt de obicei mai puțin evidente inițial: dezvolți singur brandul de la zero, testezi meniul fără rețete deja validate pe piață, negociezi singur cu fiecare furnizor și construiești procedurile operaționale (deschidere, închidere, instruire personal) fără un manual gata făcut de la francizor.\n\nRiscul e mai mare la început — nu ai un brand cunoscut care aduce clienți automat — dar plafonul de profit pe termen lung nu este limitat de o redevență fixă.",
      },
      {
        heading: "Ce control pierzi într-o franciză",
        body: "- **Meniul** — de regulă nu poți adăuga sau elimina produse liber, meniul e stabilit central de francizor\n- **Prețurile** — multe francize impun un interval de preț sau prețuri fixe pe categorii\n- **Furnizorii** — unele contracte de franciză obligă la achiziția anumitor materii prime exclusiv de la furnizori aprobați de francizor, uneori la preț mai mare decât ai găsi independent\n- **Marketingul local** — campaniile și identitatea vizuală sunt de obicei standardizate, cu spațiu limitat pentru inițiativă locală\n\nAceste limitări nu sunt neapărat negative — standardizarea e parte din motivul pentru care francizele funcționează previzibil — dar contează să știi dinainte exact cât de rigide sunt clauzele, mai ales cele legate de furnizori impuși, pentru că acestea afectează direct marja ta pe fiecare produs.",
      },
      {
        heading: "Riscurile specifice locației proprii",
        body: "- **Validarea meniului cade integral pe tine** — fiecare produs nou testat costă timp și materie primă, fără garanția că se vinde\n- **Recunoașterea brandului pornește de la zero** — primele luni depind mai mult de locație și recomandări decât de brand\n- **Toate procedurile operaționale trebuie create de la zero** — deschidere, închidere, instruire personal, gestiune stoc — nimic nu vine pre-scris\n- **Negocierea cu furnizorii se face singur**, fără puterea de cumpărare a unui lanț de francize\n\nAceste riscuri nu dispar niciodată complet, dar se reduc pe măsură ce afacerea capătă istoric propriu — după 1–2 ani de funcționare, o locație proprie bine gestionată are avantajul flexibilității complete, exact ce lipsește într-o franciză.",
      },
      {
        heading: "Întrebări care te ajută să decizi",
        body: "- Ai deja o rețetă/concept validat de piață, sau ai nevoie de sistemul și rețetele deja testate ale unei francize?\n- Poți suporta financiar taxa de intrare plus câteva luni de redevență înainte ca afacerea să genereze profit constant?\n- Cât de important e pentru tine controlul total asupra meniului și furnizorilor, față de siguranța unui brand cunoscut?\n- Ai experiență operațională HoReCa proprie, sau te bazezi pe suportul și procedurile gata făcute ale unui francizor?\n- Ce se întâmplă contractual dacă vrei să ieși din franciză peste câțiva ani — există clauze de neconcurență care te-ar limita?\n\nNu există răspuns universal corect — depinde de cât capital ai, cât de mult vrei să controlezi și cât de mult riști să testezi singur un concept netestat local.",
      },
      {
        heading: "Indiferent ce alegi, ai nevoie de propriile tale numere",
        body: "Fie că operezi sub franciză, fie pe cont propriu, dashboard-ul francizorului (dacă există unul) nu îți arată neapărat imaginea completă a cash-ului și marjelor tale locale — multe rapoarte de la francizor sunt agregate la nivel de rețea, nu detaliate pe locația ta specifică.\n\nRaportul Z zilnic, calculul de marjă per produs și reconcilierea de numerar rămân responsabilitatea ta directă, indiferent de cine e proprietarul brandului de deasupra ușii. Franchisetech funcționează la fel sub ambele modele — configurezi produsele (respectând, dacă e cazul, meniul impus de francizor), urmărești vânzările și marjele reale ale locației tale, fără să depinzi exclusiv de raportarea centralizată a francizorului.",
      },
    ],
  },
  {
    slug: "checklist-a-doua-locatie-extindere",
    title: "Checklist înainte să deschizi a doua locație",
    description:
      "Ghid practic cu checklist financiar și operațional înainte de a deschide a doua locație: capital necesar, breakeven separat, personal și gestiune multi-locație.",
    publishedAt: "2026-07-07",
    locale: "ro",
    tags: ["extindere","checklist","multi-locatie"],
    image: "/marketing/industry-restaurant.png",
    relatedFeature: "/features/setup-onboarding",
    sections: [
      {
        heading: "De ce a doua locație nu e ca prima",
        body: "La prima locație ai învățat din greșeli fără să știi că înveți: câtă marfă comanzi într-o săptămână obișnuită, cât personal îți trebuie sâmbăta, cât durează să se stabilizeze vânzările după deschidere. La a doua locație nu mai ai luxul ăsta — o gestionezi de la distanță, în paralel cu prima, și orice presupunere greșită costă bani reali din prima lună.\n\nCea mai frecventă greșeală: tratezi a doua locație ca pe o copie a primei. Are altă vad, alt profil de clienți, alt breakeven, alt program optim. Dacă nu separi cifrele celor două de la început, nu vei ști niciodată care dintre ele chiar face profit.",
      },
      {
        heading: "Checklist financiar înainte de semnare",
        body: "Înainte să semnezi contractul de închiriere, treci prin aceste puncte:\n\n- Capitalul total necesar până la prima zi de vânzare — nu doar chiria și amenajarea, ci și un fond de rulment pentru primele luni cu vânzări mai mici decât normalul\n- Un calcul de breakeven separat pentru locația nouă, făcut cu costurile ei reale (chirie, personal, utilități), nu cu cifrele de la prima locație\n- O verificare că prima locație poate susține financiar 2-3 luni de pierderi la a doua, fără să afecteze cash flow-ul general al afacerii\n- Clauze de ieșire în contractul de chirie, în caz că locația nouă nu performează cum ai estimat în primele 6 luni\n\nExemplu concret pentru o cafenea de 40 mp: chirie lunară 4.500 lei + garanție 2 luni (9.000 lei) + amenajare completă 65.000 lei + echipamente (espressor, vitrină, POS) 35.000 lei + stoc inițial 8.000 lei + fond de rulment pentru 3 luni la cheltuieli fixe de 18.000 lei/lună (54.000 lei) = **aproximativ 171.000 lei** capital necesar înainte de prima cafea vândută.",
      },
      {
        heading: "Checklist operațional",
        body: "Partea financiară e doar jumătate din pregătire. Cealaltă jumătate:\n\n- Sistem de gestiune care separă rapoartele pe fiecare locație — vânzări, stoc și marje distincte, nu amestecate într-un singur total\n- Stoc gestionat separat per locație, pentru că două locații rareori consumă identic, chiar dacă meniul e același\n- Rețete standardizate identic pe ambele locații — același cost, aceeași calitate, indiferent cine gătește\n- Un manager de încredere la locația nouă, pentru că tu nu poți fi fizic în două locuri în același timp\n- Proces de deschidere și închidere a zilei documentat în scris și predat, nu explicat verbal o singură dată",
      },
      {
        heading: "Erori frecvente la extindere — și cum le eviți",
        body: "Cea mai frecventă greșeală e subestimarea fondului de rulment: proprietarii bugetează amenajarea și echipamentele, dar uită că primele 2-3 luni de la o locație nouă rareori acoperă costurile fixe integral. A doua greșeală: presupunerea că locația nouă va performa de la prima săptămână la fel ca prima locație, care are deja clienți fideli și reputație locală construită în timp.\n\nA treia greșeală, mai subtilă: mutarea celui mai bun angajat de la prima locație la a doua, ca să o pornească. Asta slăbește prima locație exact când tu ești ocupat cu deschiderea celei noi. A patra: lipsa unor rapoarte comparabile — dacă nu poți pune alături vânzările, marjele și costul de personal ale celor două locații cu aceleași reguli de calcul, nu știi de fapt care dintre ele are nevoie de atenție.",
      },
      {
        heading: "Cum funcționează gestiunea multi-locație în franchisetech",
        body: "franchisetech ține stocul, rețetele și rapoartele separate pe fiecare locație, dar îți dă o privire consolidată de proprietar peste toate. Poți vedea vânzările, marja brută și diferențele de numerar ale fiecărei locații fără să exporți manual din două sisteme separate și să le pui cap la cap în Excel.\n\nCând deschizi a doua locație, configurarea produselor și rețetelor de la prima poate fi refolosită direct — nu repornești de la zero cu introducerea manuală a fiecărui produs și a fiecărei rețete.",
      },
    ],
  },
  {
    slug: "dark-kitchen-delivery-only-gestiune",
    title: "Dark kitchen (delivery-only) — cum arată gestiunea fără sală de servire",
    description:
      "Ce înseamnă operațional și financiar un dark kitchen fără sală de servire: structura costurilor, comisioane delivery și cum calculezi marja reală per comandă.",
    publishedAt: "2026-07-07",
    locale: "ro",
    tags: ["dark-kitchen","delivery"],
    image: "/marketing/industry-kitchen.png",
    relatedFeature: "/features/pos",
    sections: [
      {
        heading: "Ce este un dark kitchen și cum diferă de un restaurant clasic",
        body: "Un dark kitchen (bucătărie delivery-only) este o bucătărie fără spațiu de servire pentru clienți — nu ai sală, nu ai chelneri, nu ai vitrină stradală. Comenzile vin exclusiv prin platforme de livrare sau telefonic, iar produsul ajunge la client prin curier, nu la masă.\n\nModelul e atractiv pentru costul de pornire mai mic — poți funcționa dintr-un spațiu mai ieftin, într-o zonă fără trafic pietonal, fără să investești în decor de sală. Dar structura costurilor se schimbă fundamental față de un restaurant clasic, și mulți proprietari calculează prețurile ca și cum ar avea sală, ceea ce le distruge marja fără să-și dea seama.",
      },
      {
        heading: "Structura costurilor — ce dispare și ce apare în loc",
        body: "Ce dispare față de un restaurant clasic:\n\n- Costul sălii — chelneri, mese, decor, vitrină stradală într-o zonă scumpă de trafic\n- Chiria pentru un spațiu vizibil, cu vad pietonal\n\nCe apare în loc:\n\n- Comisionul platformelor de livrare, de obicei undeva între 25% și 35% din valoarea comenzii, în funcție de platformă și de contract\n- Costul ambalajelor de transport (cutii termorezistente, pungi, sigilii de siguranță), care la un restaurant cu sală era un cost marginal\n- Riscul de a nu controla ultimii 15-20 de minute ai experienței — temperatura produsului la livrare, întârzierea curierului — factori care afectează recenziile, dar nu depind direct de bucătărie",
      },
      {
        heading: "Cum calculezi marja reală după comisionul de livrare",
        body: "Exemplu: o comandă de shaorma cu cartofi la 32 lei pe platforma de livrare.\n\n- Cost ingrediente: 9,50 lei\n- Comision platformă (30% din 32 lei): 9,60 lei\n- Cost ambalaj de transport: 1,80 lei\n\n**Marjă reală: 32 − 9,50 − 9,60 − 1,80 = 11,10 lei (34,7%)**\n\nDacă te uiți doar la marja brută pe ingrediente — (32 − 9,50) / 32 = 70,3% — pare o afacere excelentă. Dar după ce scazi comisionul platformei, marja reală scade la mai puțin de jumătate din procentul aparent. Multe dark kitchen-uri stabilesc prețurile după marja brută pe ingrediente și descoperă abia la finalul lunii că nu au făcut profit.",
      },
      {
        heading: "Erori frecvente și gestiunea operațională specifică",
        body: "Cea mai frecventă greșeală: calculezi prețul ca la un restaurant cu sală și uiți complet de comision în calculul de marjă. A doua: aplici același preț pe toate platformele, deși fiecare are un comision diferit negociat separat — un produs poate fi profitabil pe o platformă și în pierdere pe alta, la același preț afișat. A treia: nu crești prețul pe meniul de livrare cu 10-15% față de prețul practicat la vânzarea directă (dacă ai și fereastră de ridicare), ca să compensezi comisionul.\n\nOperațional, un dark kitchen are nevoie de timpi de preparare vizibili pe ecranul de bucătărie pentru a respecta target-ul de timp al platformei (comenzile întârziate scad scorul contului pe platformă), de o gestiune de stoc mai atentă — fără vânzarea directă la vitrină ca rezervă vizuală — și de rețete standardizate strict, pentru că orice produs care nu arată ca în poza de pe platformă generează recenzii proaste fără să existe un chelner care să calmeze situația la masă.",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "Calculatorul de rețete din franchisetech calculează costul real per porție din prețurile efective de aprovizionare (introduse la NIR), iar tu poți adăuga separat costul ambalajului de transport ca ingredient în rețetă — nu doar costul alimentar. Asta îți arată marja reală per produs, nu doar marja brută pe ingrediente, chiar dacă franchisetech nu calculează automat comisionul fiecărei platforme de livrare (acela rămâne un procent pe care îl introduci tu, pentru că diferă de la contract la contract).\n\nEcranul de bucătărie (KDS) și rapoartele de vânzări îți arată timpii de preparare și volumul pe oră, util pentru un dark kitchen unde viteza afectează direct scorul pe platformele de livrare.",
      },
    ],
  },
  {
    slug: "facturare-catering-evenimente-horeca",
    title: "Facturarea pentru catering și evenimente — ce trebuie să știi",
    description:
      "Ce documente și reguli de facturare se aplică la catering și evenimente în HoReCa: avans, contract, TVA și cum eviți problemele la control fiscal.",
    publishedAt: "2026-07-07",
    locale: "ro",
    tags: ["catering","facturare"],
    image: "/marketing/reports-sales.png",
    relatedFeature: "/features/accountant-reports",
    sections: [
      {
        heading: "Ce e diferit la catering față de o vânzare normală la casă",
        body: "O vânzare normală la casă e simplă: clientul cumpără, plătește, primește bon fiscal, tranzacția se închide în câteva secunde. Catering-ul funcționează pe alt ciclu — comanda vine cu zile sau săptămâni înainte, adesea de la o firmă sau un organizator de eveniment, poate implica un avans, un contract sau o comandă scrisă cu specificații, iar facturarea finală se face separat de momentul preparării.\n\nDacă tratezi catering-ul ca pe o vânzare obișnuită de la POS — fără documente scrise, fără factură pe firmă — riști să nu poți justifica veniturile respective la control și, mai practic, să te cerți cu clientul pe ce s-a comandat de fapt dacă nu ai nimic scris.",
      },
      {
        heading: "Documentele necesare și TVA",
        body: "Pentru un eveniment de catering, documentele tipice sunt:\n\n- Contract sau comandă scrisă, cu meniul stabilit, numărul de persoane, data și locația evenimentului\n- Factură de avans, dacă solicitați o parte din plată înainte de eveniment\n- Aviz de însoțire a mărfii, dacă transporți produse finite către locația evenimentului (nu prepari pe loc)\n- Factura finală, emisă la livrare sau la finalul prestației\n- Bon fiscal doar în cazul în care plata se face direct la fața locului, de o persoană fizică, fără factură pe firmă\n\nLa TVA, nu presupune o cotă fără să verifici — regimul de TVA pentru servicii de catering poate diferi de cel aplicat la vânzarea directă a produsului în locație, iar dacă evenimentul include și băuturi alcoolice, regimul poate fi diferit și pentru acea parte a comenzii. Discută fiecare tip de eveniment cu contabilul tău înainte să stabilești prețul final, nu după ce ai emis deja factura.",
      },
      {
        heading: "Cum calculezi prețul unui eveniment de catering",
        body: "Exemplu: un eveniment pentru 50 de persoane, meniu cu 3 feluri.\n\n- Cost materii prime: 28 lei/persoană → 1.400 lei total\n- Personal suplimentar (2 persoane × 4 ore × 40 lei/oră = 320 lei) → 6,40 lei/persoană\n- Transport și ambalaje: 4 lei/persoană → 200 lei total\n\n**Cost total per persoană: 38,40 lei | Cost total comandă: 1.920 lei**\n\nDacă prețul practicat este 85 lei/persoană (4.250 lei total):\n\n**Marjă: 85 − 38,40 = 46,60 lei/persoană (54,8%) | Marjă totală: 2.330 lei**\n\nCea mai frecventă greșeală la calculul prețului de catering: se ia costul materiilor prime și se aplică aceeași marjă ca la vânzarea zilnică, fără să se adauge costul de personal suplimentar și de transport, care la catering sunt reale și pot reprezenta 25-30% din costul total al comenzii.",
      },
      {
        heading: "Greșeli frecvente la facturarea evenimentelor",
        body: "- Uită să emită factură de avans separat de factura finală, ceea ce complică reconcilierea plăților pentru contabil\n- Nu documentează schimbările de ultim moment (numărul de persoane crescut cu o zi înainte) printr-un act adițional sau o comandă actualizată\n- Calculează prețul per persoană fără să includă costul de personal suplimentar și transport, ceea ce erodează marja reală fără să observe\n- Nu păstrează dovada de livrare (aviz semnat de client) pentru eventuale contestații ulterioare privind cantitatea sau calitatea livrată",
      },
      {
        heading: "Cum te ajută franchisetech",
        body: "Vânzările de catering pot fi înregistrate și urmărite alături de vânzările zilnice din locație, în același set de rapoarte — nu ai nevoie de un tabel Excel separat pentru evenimente. Exportul pentru contabil (Saga XML sau CSV) include aceste date agregat, astfel încât contabilul are toate veniturile într-un singur loc, indiferent dacă vin din vânzări zilnice sau din comenzi de catering facturate separat.",
      },
    ],
  },
  {
    slug: "gestiune-terasa-vara-sezon-estival",
    title: "Gestiunea terasei vara — stoc, personal și program sezonier",
    description:
      "Ghid practic pentru vara la terasă: cum ajustezi stocul, programul de lucru și personalul sezonier fără să rămâi fără produse în weekend-urile aglomerate.",
    publishedAt: "2026-07-08",
    locale: "ro",
    tags: ["terasa","sezonier","cafenea"],
    image: "/marketing/industry-cafe.png",
    relatedFeature: "/features/stock-management",
    sections: [
      {
        heading: "De ce vara schimbă tot modelul de operare",
        body: "Vara, o terasă poate vedea o creștere de 40-60% a vânzărilor față de sala interioară de iarnă, dar nu e doar despre volum mai mare — se schimbă și structura produselor vândute. Cafeaua caldă și ciorbele lasă loc limonadei, băuturilor reci și înghețatei, iar programul se extinde: deschidere mai devreme, închidere mai târziu, weekend-uri suprasolicitate care nu seamănă deloc cu un weekend obișnuit de iarnă.\n\nDacă intri în sezon cu aceleași praguri de stoc, același personal și același program din februarie, primele weekend-uri calde te prind nepregătit — și clienții observă imediat când rămâi fără gheață sau fără limonadă la ora 16:00 într-o zi de 32 de grade.",
      },
      {
        heading: "Stocul sezonier — ce trebuie reconfigurat",
        body: "- Gheața trece de la un consum marginal la unul central — o terasă medie poate consuma 15-20 kg de gheață într-o zi de weekend aglomerată, o cantitate greu de estimat dacă nu o urmărești explicit\n- Fructe proaspete pentru limonade și smoothie-uri, cu termen de valabilitate scurt — comanzi mai des, în cantități mai mici, ca să nu arunci\n- Ambalaje suplimentare specifice verii — pahare pentru băuturi reci, capace, paie\n- Pragurile de stoc minim calculate iarna nu mai sunt valabile vara — dacă formula ta de reaprovizionare (consum mediu zilnic × zile până la livrare × buffer) folosește încă cifrele de consum din ianuarie, vei declanșa comenzi prea târziu față de consumul real de vară",
      },
      {
        heading: "Personalul sezonier — angajare, program, cost",
        body: "Majoritatea teraselor angajează personal suplimentar pentru vară, adesea studenți disponibili pentru weekend-uri și ture de seară. Exemplu de calcul: o terasă cu 3 angajați fix pe timpul anului angajează încă 2 persoane sezoniere pentru weekend-uri de vară.\n\nCost suplimentar: 2 persoane × 8 ore × 25 lei/oră = 400 lei/zi, adică 800 lei pentru un weekend (sâmbătă + duminică). Dacă vânzările suplimentare de weekend cresc cu 1.500-2.000 lei pe zi față de o zi obișnuită — adică 3.000-4.000 lei în plus doar pe cele două zile — costul de personal suplimentar se acoperă de mai multe ori din vânzările incrementale, atâta timp cât ai suficient stoc ca să onorezi cererea.",
      },
      {
        heading: "Programul extins și planificarea aprovizionării",
        body: "Extinderea programului (deschidere mai devreme, închidere mai târziu) crește costurile variabile — personal, utilități — dar nu și costurile fixe precum chiria. Are sens doar dacă orele suplimentare aduc vânzări care acoperă cu mult acele costuri variabile. Nu presupune automat că merită — urmărește vânzările din orele nou-adăugate în primele două-trei săptămâni și decide pe baza cifrelor reale, nu a intuiției.\n\nPentru aprovizionare, comandă produsele perisabile mai devreme în săptămână, având ca reper vânzările din weekend-ul anterior, și ajustează cantitățile în funcție de prognoza meteo — un val de căldură anunțat înseamnă cerere mai mare de băuturi reci și înghețată, iar comanda trebuie plasată cu 1-2 zile înainte, nu în dimineața zilei respective.",
      },
      {
        heading: "Cum te ajută franchisetech",
        body: "Alertele de stoc minim se recalculează pe baza consumului real înregistrat din vânzări, nu pe o valoare fixă setată o singură dată la începutul anului — dacă consumul de gheață sau de limonadă crește brusc odată cu vara, pragurile de alertă reflectă acest lucru din datele efective de vânzare, nu dintr-o estimare manuală refăcută de tine în fiecare sezon.\n\nRețetele sezoniere (limonadă, înghețată, băuturi reci) se configurează o singură dată, la fel ca rețetele de iarnă, iar NIR-ul înregistrează corect fiecare aprovizionare suplimentară fără să amesteci stocul de vară cu cel de iarnă.",
      },
    ],
  },
  {
    slug: "cum-calculezi-pragul-de-rentabilitate-breakeven",
    title: "Cum calculezi pragul de rentabilitate (breakeven) pentru afacerea ta",
    description:
      "Formula completă pentru calculul pragului de rentabilitate în HoReCa, cu exemplu real: costuri fixe, marjă medie pe bon și câte vânzări trebuie să faci zilnic ca să nu pierzi bani.",
    publishedAt: "2026-07-08",
    locale: "ro",
    tags: ["breakeven","marja","financiar"],
    image: "/marketing/margins-report.png",
    relatedFeature: "/features/recipe-costing",
    sections: [
      {
        heading: "Ce este pragul de rentabilitate și de ce trebuie să-l știi",
        body: "Pragul de rentabilitate (breakeven) este punctul în care veniturile totale acoperă exact costurile totale — fixe și variabile. Sub acest punct, pierzi bani. Deasupra lui, faci profit.\n\nMajoritatea proprietarilor de HoReCa află dacă au făcut profit abia la finalul lunii, când adună tot. Problema e că, până atunci, o lună proastă e deja consumată — nu mai poți interveni la timp. Dacă știi pragul de rentabilitate zilnic (câte bonuri trebuie să faci, sau câți lei trebuie să vinzi), poți observa în ziua 10 a lunii că ești sub ritm și reacționezi imediat, nu în ziua 31.",
      },
      {
        heading: "Formula de calcul",
        body: "Marja procentuală medie = (Preț mediu bon − Cost variabil mediu per bon) / Preț mediu bon\n\nPragul de rentabilitate (în lei) = Costuri fixe lunare / Marja procentuală medie\n\nPragul de rentabilitate (în număr de bonuri) = Costuri fixe lunare / Marja medie per bon (în lei)\n\nAi nevoie de trei cifre ca să faci acest calcul: costurile fixe lunare totale, prețul mediu al unui bon și costul variabil mediu per bon (materii prime, ambalaje, comision de card).",
      },
      {
        heading: "Exemplu complet: un bistro cu bon mediu de 45 lei",
        body: "Costuri fixe lunare: chirie 6.000 lei + salarii fixe pentru 2 angajați cu normă întreagă 9.000 lei + utilități 1.800 lei + abonamente (gestiune, contabilitate, internet) 900 lei + alte costuri fixe (asigurări, mentenanță) 800 lei = **18.500 lei/lună**\n\nBon mediu: 45 lei. Cost variabil mediu per bon: 16,50 lei food cost + 0,68 lei comision procesator card ≈ **17,18 lei**\n\nMarjă per bon: 45 − 17,18 = **27,82 lei (61,8%)**\n\n**Pragul de rentabilitate lunar: 18.500 / 0,618 ≈ 29.935 lei vânzări** — sau, echivalent, 18.500 / 27,82 ≈ **665 bonuri pe lună, adică aproximativ 22 de bonuri pe zi** (pentru o lună de 30 de zile).\n\nDacă bistro-ul face sub 22 de bonuri pe zi la acest bon mediu, pierde bani în luna respectivă, indiferent de câte ore stă deschis sau cât de bine arată sala.",
      },
      {
        heading: "Ce faci dacă ești sub prag — și de ce nu e un calcul static",
        body: "Dacă vânzările sunt sub prag, ai patru pârghii, de obicei combinate:\n\n- Crește bonul mediu (upsell, meniuri combo, recomandări la casă)\n- Reduce costurile fixe negociabile (renegociere chirie, anulare abonamente nefolosite)\n- Reduce costul variabil per bon (renegociere furnizori, control mai strict al porțiilor)\n- Crește numărul de bonuri (marketing local, program extins în orele de vârf, dacă acestea sunt cu adevărat profitabile)\n\nPragul de rentabilitate nu e o cifră calculată o singură dată la deschidere și uitată. Se schimbă de fiecare dată când chiria crește, angajezi personal nou sau un furnizor își scumpește produsele — de aceea are sens să-l recalculezi lunar, nu doar în anul de deschidere.",
      },
      {
        heading: "Cum te ajută franchisetech",
        body: "franchisetech nu introduce pentru tine cifra finală a pragului de rentabilitate — costurile fixe (chirie, salarii, abonamente) nu trec prin POS și trebuie introduse de tine. Dar îți dă gratuit jumătatea grea a calculului: marja medie reală per bon, calculată din costul rețetelor și din vânzările efective înregistrate, nu dintr-o estimare. Ai deja acest număr actualizat lunar, în loc să-l reconstitui manual dintr-un Excel la finalul fiecărei luni.",
      },
    ],
  },
  {
    slug: "costuri-fixe-vs-variabile-horeca",
    title: "Costuri fixe vs. variabile în HoReCa — de ce contează să le separi",
    description:
      "Diferența dintre costurile fixe și variabile într-un restaurant sau cafenea, cu exemple reale în lei și de ce separarea lor stă la baza oricărei decizii de preț.",
    publishedAt: "2026-07-09",
    locale: "ro",
    tags: ["costuri","financiar"],
    image: "/marketing/margins-report.png",
    relatedFeature: "/features/recipe-costing",
    sections: [
      {
        heading: "Ce sunt costurile fixe și ce sunt costurile variabile",
        body: "Costurile fixe rămân aproximativ constante indiferent de câte vânzări faci într-o lună — chiria nu scade dacă vinzi mai puțin, salariul unui angajat cu normă întreagă nu se ajustează automat cu numărul de clienți. Costurile variabile cresc și scad direct proporțional cu volumul de vânzări — cu cât vinzi mai mult, cu atât cheltuiești mai mult pe materii prime și ambalaje.\n\nSepararea corectă a celor două categorii nu e un exercițiu contabil abstract — stă la baza pragului de rentabilitate, a deciziilor de preț și a răspunsului la întrebarea dacă merită să extinzi programul sau să angajezi încă o persoană.",
      },
      {
        heading: "Exemple de costuri fixe într-o cafenea sau restaurant tipic",
        body: "- Chiria spațiului\n- Salariile fixe (contracte cu normă întreagă, indiferent de volumul de vânzări din luna respectivă)\n- Abonamentele (soft de gestiune, contabilitate, internet, chirie terminal de card dacă e taxă fixă)\n- Asigurările\n- Amortizarea sau rata de leasing pentru echipamente",
      },
      {
        heading: "Exemple de costuri variabile",
        body: "- Materiile prime — cost direct proporțional cu ce vinzi\n- Ambalajele de unică folosință\n- Comisionul procesatorului de card, de obicei 1-2,5% din valoarea fiecărei tranzacții cu cardul\n- Comisioanele platformelor de livrare, dacă vinzi și prin acest canal\n- Orele suplimentare de personal chemat special pentru un weekend aglomerat",
      },
      {
        heading: "Costurile mixte și de ce contează separarea",
        body: "Nu toate costurile intră curat într-o singură categorie. Utilitățile, de exemplu, au o componentă fixă (abonamentul, taxa de racordare) și una variabilă (consumul electric crește cu orele de funcționare a echipamentelor și cu clima). În loc să pui tot costul de utilități la fix, estimează o împărțire rezonabilă — chiar aproximativă — între cele două componente.\n\nFără separarea corectă, nu poți calcula un prag de rentabilitate real, nu poți decide dacă extinderea programului se justifică (orele suplimentare adaugă cost variabil, dar costul fix rămâne neschimbat), și riști să compari greșit profitabilitatea a două produse. Exemplu: produsul A are marjă de 70% dar se vinde puțin (20 buc/zi la 20 lei, cost variabil 6 lei) — contribuție zilnică la costurile fixe: 280 lei. Produsul B are marjă de doar 55% dar se vinde mult mai mult (80 buc/zi la 15 lei, cost variabil 6,75 lei) — contribuție zilnică: 660 lei. Produsul B, cu procent de marjă mai mic, contribuie de peste două ori mai mult la acoperirea costurilor fixe, pentru că volumul compensează procentul.",
      },
      {
        heading: "Cum vezi această separare în franchisetech",
        body: "Costul variabil per produs (materii prime, calculat din prețurile reale de la ultima aprovizionare) vine automat din calculatorul de rețete, actualizat de fiecare dată când introduci un NIR cu preț nou. Costurile fixe (chirie, salarii, abonamente) rămân în afara sistemului, pentru că nu trec prin vânzări sau stoc — dar cu jumătate din calcul deja făcut corect și automat, separarea fixe/variabile devine un exercițiu de câteva minute, nu o reconstituire manuală de la zero în fiecare lună.",
      },
    ],
  },
  {
    slug: "pricing-psihologic-meniu-cum-influenteaza-vanzarile",
    title: "Pricing psihologic în meniu — cum influențează ce comandă clienții",
    description:
      "Tehnici de pricing psihologic pentru meniul de restaurant sau cafenea: poziționare, prețuri fără simbol monetar și cum ghidezi clienții spre produsele cu marjă mai mare.",
    publishedAt: "2026-07-09",
    locale: "ro",
    tags: ["pret","meniu","psihologie"],
    image: "/marketing/products-list.png",
    relatedFeature: "/features/recipe-costing",
    sections: [
      {
        heading: "Ce este pricing psihologic și de ce nu e o păcăleală",
        body: "Pricing psihologic înseamnă felul în care prezinți prețul, nu produsul sau valoarea lui reală — aceleași produse, la aceleași prețuri, pot genera comenzi diferite în funcție de cum sunt afișate în meniu. Diferența față de a păcăli clientul: tehnicile bune fac meniul mai ușor de citit și scot în evidență produsele bune, fără să ascundă informații sau să inducă în eroare asupra a ce primește clientul și cât plătește pentru el.\n\nUn meniu prost organizat nu doar că vinde mai puțin — obosește clientul, care ajunge să comande primul lucru care-i sare în ochi, nu neapărat ce și-ar fi dorit.",
      },
      {
        heading: "Renunță la simbolul monetar și la formatul cu zecimale",
        body: "Prețurile scrise fără simbolul monetar (**18** în loc de **18,00 lei**) reduc senzația de cheltuială resimțită de client la citirea meniului — funcționează mai bine în restaurantele sit-down, unde experiența contează la fel de mult ca prețul. În fast-casual și la produse de impuls (cafea la pachet, gustări), prețurile cu zecimale (**14,90 lei** în loc de **15 lei**) tind să pară mai accesibile, pentru că ochiul se oprește pe prima cifră.\n\nNu există o regulă universal corectă — depinde de tipul locației și de segmentul de clienți. Ce contează e alegerea deliberată a formatului, nu copierea automată a stilului altui meniu fără să te gândești dacă se potrivește cu poziționarea ta.",
      },
      {
        heading: "Poziționarea produsului-ancoră",
        body: "Un produs cu preț mai mare, plasat vizibil în meniu (adesea la începutul unei categorii), face ca celelalte produse din aceeași categorie să pară mai accesibile prin comparație — chiar dacă nimeni nu-l cumpără des.\n\nExemplu: un meniu de cafenea listează întâi **Cafea de specialitate origine unică — 22 lei**, urmată de **Cappuccino — 14 lei** și **Espresso — 9 lei**. Clientul ancorează mental la 22 de lei, iar cei 14 lei pentru cappuccino par rezonabili prin comparație — fără ancoră, aceeași sumă ar putea părea scumpă pentru o cafenea de cartier.",
      },
      {
        heading: "Engineering de meniu și combo-uri care cresc bonul mediu",
        body: "Produsele cu marjă mare merită poziționate acolo unde privirea clientului ajunge prima dată — de regulă în partea de sus sau centrul unei categorii — și pot fi evidențiate cu un chenar sau o etichetă de tip recomandat de casă. Un produs cu marjă de 78% poziționat jos, la finalul listei de deserturi, unde puțini clienți ajung să citească, nu vinde mai bine doar pentru că are marjă bună pe hârtie.\n\nCombo-urile funcționează similar: un sandwich la 18 lei și o limonadă la 9 lei, vândute separat, fac 27 lei. Un combo sandwich + limonadă la 24 lei pare o economie de 3 lei pentru client, dar costul variabil al combo-ului e cu doar 2 lei mai mic decât suma celor două produse separate — pentru tine, marja absolută per tranzacție crește, pentru că mulți clienți care ar fi cumpărat doar sandwich-ul acum cumpără și băutura.",
      },
      {
        heading: "Cum te ajută franchisetech să vezi ce funcționează",
        body: "Calculatorul de rețete îți arată marja reală per produs, iar rapoartele de vânzări îți arată ce se vinde efectiv, nu ce crezi tu că se vinde. Combinate, poți testa o repoziționare în meniu sau un combo nou și verifici peste 2-3 săptămâni, din date reale, dacă bonul mediu sau volumul produsului respectiv s-a schimbat — în loc să te bazezi pe impresia că parcă merge mai bine.",
      },
    ],
  },
  {
    slug: "5-metode-reducere-food-cost",
    title: "5 metode dovedite de reducere a food cost-ului, fără să scazi calitatea",
    description:
      "Cinci metode practice de reducere a food cost-ului într-un restaurant sau cafenea din România, fără compromisuri pe calitate: porții, furnizori, risipă, meniu și preț.",
    publishedAt: "2026-07-09",
    locale: "ro",
    tags: ["food-cost","marja"],
    image: "/marketing/margins-report.png",
    relatedFeature: "/features/recipe-costing",
    sections: [
      {
        heading: "Ce este food cost-ul și de ce crește fără să observi",
        body: "Food cost-ul (%) = costul materiilor prime dintr-o perioadă / vânzările din aceeași perioadă × 100. Nu crește de obicei printr-o decizie explicită — crește prin acumularea unor schimbări mici: furnizorul scumpește un ingredient cu 5-8% și nimeni nu recalculează prețul de vânzare, un angajat pune constant puțin mai mult decât cere rețeta, o parte din legumele proaspete se alterează înainte de folosire și dispar în cost fără să fie urmărite separat, iar prețul din meniu rămâne neschimbat de un an.\n\nUn restaurant care pornește cu 28% food cost la deschidere ajunge, un an mai târziu, la 35%, fără ca proprietarul să fi luat vreo decizie conștientă în acest sens — doar suma efectelor mici pe care nimeni nu le-a măsurat.",
      },
      {
        heading: "Metoda 1 — standardizarea rețetelor și controlul porțiilor",
        body: "Fără o rețetă scrisă cu gramaj exact și fără un cântar de bucătărie, fiecare angajat pune cât i se pare. Exemplu: o rețetă de paste carbonara cere 120g pastă (8 lei/kg) și 40g bacon (50 lei/kg) — cost ingrediente pentru aceste două: 0,96 + 2,00 = 2,96 lei. Fără cântar, un angajat pune din ochi 150g pastă și 55g bacon — cost: 1,20 + 2,75 = 3,95 lei.\n\nDiferența: aproape 1 leu per porție, doar din supra-porționare la aceste două ingrediente. La 40 de porții pe zi, asta înseamnă 40 de lei pierduți zilnic — peste 1.200 lei pe lună, doar pentru că lipsește un cântar de bucătărie și o rețetă scrisă vizibilă la stație.",
      },
      {
        heading: "Metoda 2 — renegocierea și diversificarea furnizorilor",
        body: "Verifică prețurile furnizorilor trimestrial, nu doar când primești o notificare de scumpire. Compară cel puțin doi furnizori pentru fiecare categorie critică de ingrediente, chiar dacă rămâi fidel unuia — asta îți dă un punct de referință real la negociere. Negociază praguri de preț pe volum, nu accepta automat prima ofertă.\n\nO problemă frecventă: furnizorul scumpește cu 8% fără preaviz, iar dacă nu ai istoricul prețurilor documentat din NIR-urile anterioare, nu poți demonstra cât și când a crescut prețul, nici argumenta pentru o renegociere sau pentru schimbarea furnizorului.",
      },
      {
        heading: "Metoda 3 — reducerea risipei prin FIFO și urmărirea pierderilor",
        body: "Rotația stocului după principiul FIFO (primul intrat, primul ieșit) reduce alterarea produselor perisabile — marfa mai veche se folosește prima, nu rămâne în spatele rafturilor până expiră. La fel de important: urmărește explicit risipa (produse aruncate din cauza alterării, greșeli de preparare), nu o lăsa să se piardă în cifra generală de food cost fără cauză vizibilă.\n\nExemplu: legumele proaspete cu o rată de pierdere de 12% înainte de folosire, cauzată de comenzi prea mari față de consumul real sau de depozitare necorespunzătoare. Fără o evidență separată a risipei, aceasta apare doar ca food cost mai mare luna asta, fără ca nimeni să știe exact de unde vine.",
      },
      {
        heading: "Metoda 4 și 5 — optimizarea meniului și ajustarea targetată a prețului",
        body: "Metoda 4: revizuiește periodic produsele cu marjă mică și volum mic de vânzări — cele care ocupă loc în meniu, consumă timp de preparare și stoc, dar nu contribuie relevant la vânzări sau la marjă. Fie le refaci rețeta ca să reduci costul, fie le scoți din meniu.\n\nMetoda 5: când costul unui ingredient crește, ajustează prețul produselor care conțin acel ingredient în cantitate mare, nu tot meniul deodată. O creștere generală de preț pe tot meniul, ca reacție la scumpirea unui singur ingredient, afectează inutil produsele care oricum aveau marjă bună și pot reduce volumul lor de vânzări fără niciun beneficiu real.",
      },
      {
        heading: "Cum urmărești food cost-ul lunar în franchisetech",
        body: "Costul fiecărei rețete se calculează automat din prețurile reale introduse la NIR, nu dintr-o estimare făcută o singură dată la configurare. Rapoartele de vânzări arată veniturile per produs și per categorie, astfel încât food cost-ul procentual devine vizibil direct din aplicație, fără o reconciliere manuală lunară într-un fișier separat.",
      },
    ],
  },
  {
    slug: "profitabilitate-per-ora-cafenea-restaurant",
    title: "Profitabilitate per oră — de ce contează mai mult decât profitul pe zi",
    description:
      "De ce profitul total pe zi ascunde ore neprofitabile și cum calculezi profitabilitatea per oră ca să decizi corect programul de lucru și personalul.",
    publishedAt: "2026-07-10",
    locale: "ro",
    tags: ["profitabilitate","financiar"],
    image: "/marketing/reports-sales.png",
    relatedFeature: "/features/recipe-costing",
    sections: [
      {
        heading: "De ce profitul pe zi te poate păcăli",
        body: "O zi cu profit pozitiv la final poate ascunde ore întregi în care afacerea pierde bani, acoperite de orele bune din aceeași zi. Ora de prânz aduce suficient profit cât să compenseze o oră moartă de după-amiază, iar totalul zilei tot arată bine — dar acea oră moartă pierde bani în fiecare zi, tăcut, fără ca nimeni să observe pentru că nu se uită niciodată la nivel de oră, doar la totalul zilnic.",
      },
      {
        heading: "Cum calculezi profitabilitatea per oră",
        body: "Profit per oră = (Vânzări din ora respectivă × marja medie) − Cost personal prezent în ora respectivă − Cost fix alocat per oră\n\nCostul fix alocat per oră = Costuri fixe lunare / Numărul total de ore de funcționare din lună\n\nAi nevoie de trei date pentru fiecare interval orar analizat: vânzările efective din acel interval, marja medie a produselor vândute și câți angajați lucrau în acel moment.",
      },
      {
        heading: "Exemplu complet: o cafenea deschisă 12 ore pe zi",
        body: "Costuri fixe lunare: 16.000 lei. Program: 12 ore/zi × 30 zile = 360 ore/lună → cost fix alocat: 16.000 / 360 ≈ **44,4 lei/oră**\n\n**Ora de vârf (8:00-10:00):** vânzări medii 850 lei/oră, marjă medie 65% → marjă brută 552,50 lei. Personal: 2 persoane × 25 lei/oră = 50 lei. Profit orar: 552,50 − 50 − 44,4 ≈ **458 lei**\n\n**Ora moartă (16:00-17:00):** vânzări medii 120 lei/oră, marjă medie 65% → marjă brută 78 lei. Personal: 2 persoane × 25 lei/oră = 50 lei. Profit orar: 78 − 50 − 44,4 ≈ **−16,4 lei**\n\nOra moartă pierde aproximativ 16,4 lei în fiecare zi. Pe o lună de 30 de zile, doar acea oră costă afacerea **aproximativ 493 lei** — o sumă invizibilă în totalul zilnic, dar reală în bilanțul lunar.",
      },
      {
        heading: "Ce faci cu orele neprofitabile — și când nu tragi concluzii pripite",
        body: "Câteva opțiuni, în funcție de situație:\n\n- Reduci personalul în orele moarte (1 persoană în loc de 2, dacă volumul chiar permite)\n- Scurtezi programul dacă ora neprofitabilă e la marginea zilei (ultima oră înainte de închidere, de exemplu)\n- Testezi o promoție targetată doar pentru acel interval, ca să crești volumul suficient cât să acopere costurile\n\nNu tăia mecanic o oră doar pentru că un singur calcul arată pierdere. Unele ore moarte susțin orele din jur — clienți care intră la 16:00 și rămân până la 19:00, sau timp de pregătire necesar pentru ora de vârf următoare. Urmărește tendința pe câteva săptămâni, nu o singură zi, înainte să schimbi programul sau personalul.",
      },
      {
        heading: "Cum vezi asta în franchisetech",
        body: "Rapoartele de vânzări arată distribuția vânzărilor pe interval orar, direct din tranzacțiile POS — poți vedea unde e ora de vârf și unde e ora moartă fără să numeri manual bonurile pe ceas. Alocarea costurilor fixe și de personal pe fiecare oră rămâne un calcul pe care îl faci tu, pentru că acele costuri nu trec prin sistemul de vânzări, dar partea grea — datele reale de vânzări pe oră — e deja acolo, actualizată automat.",
      },
    ],
  },
  {
    slug: "kpi-uri-de-urmarit-saptamanal-horeca",
    title: "KPI-urile pe care ar trebui să le urmărești săptămânal în HoReCa",
    description:
      "Lista KPI-urilor esențiale de urmărit săptămânal într-un restaurant sau cafenea: bon mediu, food cost %, marjă brută, diferență de numerar și cum le citești corect.",
    publishedAt: "2026-07-10",
    locale: "ro",
    tags: ["kpi","rapoarte"],
    image: "/marketing/reports-sales.png",
    relatedFeature: "/features/z-report",
    sections: [
      {
        heading: "De ce săptămânal, nu doar lunar",
        body: "Analiza lunară e prea lentă ca să prindă probleme la timp — două săptămâni proaste se pierd ușor într-o lună bună per total, iar cifra finală tot arată acceptabil. Analiza săptămânală e suficient de deasă cât să observi o tendință (food cost care crește constant, bon mediu care scade) înainte să se transforme într-o pierdere reală acumulată, dar nu atât de deasă încât o zi de marți mai slabă să te facă să reacționezi excesiv la zgomot statistic normal.",
      },
      {
        heading: "KPI 1-3: vânzări, bon mediu și număr de tranzacții",
        body: "- **Vânzări totale săptămânale** — compară cu săptămâna anterioară și cu aceeași săptămână din luna trecută, nu doar cu ziua de ieri\n- **Bon mediu** — vânzări totale împărțite la numărul de tranzacții, arată dacă fiecare client cumpără mai mult sau mai puțin per vizită\n- **Numărul de tranzacții** — arată dacă vin mai mulți clienți sau dacă aceiași clienți cheltuiesc diferit\n\nSepararea acestor doi factori contează pentru că soluțiile sunt diferite: dacă bonul mediu scade, lucrezi la upsell și meniu; dacă numărul de tranzacții scade, lucrezi la trafic și marketing local.",
      },
      {
        heading: "KPI 4-7: food cost, marjă brută, numerar și cost de personal",
        body: "- **Food cost %** — cost materii prime / vânzări × 100. Ținta sănătoasă variază pe categorie: 15-25% pentru cafea și băuturi, 28-35% pentru mâncare gătită\n- **Marja brută medie** pe categorii de produse — dacă scade săptămânal, ceva s-a schimbat (preț furnizor, porții, risipă) și merită investigat imediat, nu la închiderea lunii\n- **Diferența de numerar la închidere**, cumulată din rapoartele Z ale săptămânii — o diferență izolată de câțiva lei e normală, dar o tendință constantă în minus, mai ales în aceeași zi sau tură, e un semnal de investigat\n- **Costul de personal ca procent din vânzări** — dacă orele lucrate cresc dar vânzările nu țin pasul, procentul crește și marjele se erodează, chiar dacă food cost-ul rămâne stabil",
      },
      {
        heading: "Cum arată un tablou săptămânal simplu",
        body: "Exemplu de comparație săptămână-pe-săptămână pentru o cafenea:\n\n- Vânzări: 34.200 lei (față de 31.800 lei săptămâna trecută, +7,5%)\n- Bon mediu: 42 lei (față de 39 lei)\n- Număr tranzacții: 814 (față de 815 — aproape identic)\n- Food cost: 31,2% (țintă 30%, ușor peste, dar în limite acceptabile)\n- Diferență numerar cumulată: −18 lei pe toată săptămâna (nesemnificativ)\n\nInterpretare: creșterea de vânzări vine aproape în întregime din bonul mediu mai mare, nu din mai mulți clienți — numărul de tranzacții e practic neschimbat. Asta sugerează că un combo nou sau o ajustare de preț a funcționat, nu o campanie de atragere de clienți noi, și îți spune unde să investighezi mai departe dacă vrei să înțelegi cauza exactă.",
      },
      {
        heading: "Cum le vezi automat în franchisetech",
        body: "Fiecare din acești indicatori există deja în rapoartele zilnice Z și în datele de cost al rețetelor — nu ai nevoie de un fișier separat reconstituit manual în fiecare săptămână. Recomandarea practică: deschide secțiunea de Rapoarte în aceeași zi în fiecare săptămână (luni dimineața, de exemplu), nu doar atunci când ceva pare să meargă prost. Tendințele se văd cel mai bine când le urmărești constant, nu doar când apare o problemă vizibilă.",
      },
    ],
  },
  {
    slug: "buget-lunar-model-cafenea-mica",
    title: "Model de buget lunar pentru o cafenea mică",
    description:
      "Un model simplu de buget lunar pentru o cafenea mică din România: venituri, costuri fixe și variabile, praguri sănătoase și cum urmărești execuția față de plan.",
    publishedAt: "2026-07-11",
    locale: "ro",
    tags: ["buget","financiar","cafenea"],
    image: "/marketing/dashboard-hero.png",
    relatedFeature: "/features/accountant-reports",
    sections: [
      {
        heading: "De ce ai nevoie de un buget lunar, chiar dacă ești mic",
        body: "Multe cafenele mici funcționează fără buget scris — proprietarul verifică soldul din bancă și estimează «merge bine» sau «merge greu» după cât a rămas la final de lună. Problema: fără un buget, afli că ai o problemă abia când banii au dispărut deja, nu când mai poți interveni.\n\nUn buget lunar simplu îți arată dinainte cât ar trebui să câștigi, cât ar trebui să cheltuiești pe fiecare categorie și unde exact se duce banul dacă ceva nu se potrivește. Nu ai nevoie de un tabel complicat — ai nevoie de 6-8 categorii urmărite consecvent, lună de lună.",
      },
      {
        heading: "Structura bugetului: cele 4 blocuri de costuri",
        body: "Un buget de cafenea mică se împarte în patru blocuri:\n\n- **Costul mărfii vândute (COGS)** — cafea, lapte, siropuri, pahare, produse de patiserie cumpărate. De regulă 25-35% din venituri într-o cafenea\n- **Costuri fixe** — chirie, utilități, abonamente software, asigurări. Nu variază cu vânzările\n- **Costuri cu personalul** — salarii, contribuții, ture suplimentare în weekend\n- **Alte costuri operaționale** — marketing, mentenanță echipamente, ambalaje, contabilitate externă\n\nVenitul lunar minus aceste patru blocuri îți dă profitul operațional. Dacă nu poți răspunde rapid «cât reprezintă COGS din venituri luna asta?», nu ai încă un buget funcțional — ai doar cheltuieli notate.",
      },
      {
        heading: "Exemplu concret pentru o cafenea cu 2 angajați",
        body: "Cafenea mică, un singur punct de lucru, venituri lunare estimate 45.000 lei:\n\n- Venituri: 45.000 lei\n- COGS (cafea, lapte, patiserie, ambalaje): 13.500 lei (30%)\n- Chirie + utilități: 8.000 lei\n- Salarii (2 baristi + contribuții): 14.000 lei\n- Alte costuri (contabilitate, mentenanță, marketing): 2.500 lei\n- **Total costuri: 38.000 lei**\n- **Profit operațional: 7.000 lei (15.5%)**\n\nDacă COGS urcă la 35% pentru că un furnizor a scumpit cafeaua fără preaviz, profitul scade de la 7.000 la 4.750 lei — o diferență de 2.250 lei doar dintr-o categorie. De asta contează să urmărești COGS lunar, nu doar la final de an.",
      },
      {
        heading: "Praguri sănătoase pentru fiecare categorie",
        body: "Orientativ pentru o cafenea din România, ca procent din venituri:\n\n- **COGS**: 25-32% — peste 35% înseamnă preț de vânzare prea mic sau rețete cu porții prea generoase\n- **Costuri cu personalul**: 28-35% — variază mult după cât personal ai per tură\n- **Chirie + utilități**: 15-20% — peste 22% e greu de susținut fără volum mare\n- **Alte costuri**: 5-8%\n\nAceste praguri nu sunt reguli fixe — o cafenea din centrul unui oraș mare are chirie mai mare dar și volum mai mare. Ce contează e să știi unde te situezi față de propriul tău istoric, nu doar față de un procent generic.",
      },
      {
        heading: "Cum urmărești execuția față de plan",
        body: "Bugetul e inutil dacă îl faci o dată pe an și nu-l compari cu realitatea. Rutina lunară minimă:\n\n1. La final de lună, extragi venitul total din raportul de vânzări\n2. Aduni costurile reale pe cele 4 categorii\n3. Compari fiecare categorie cu procentul planificat\n4. Pentru orice categorie care depășește cu peste 3-4 puncte procentuale planul, cauți cauza înainte de luna următoare\n\nDacă vezi COGS crescând două luni la rând, nu aștepta finalul trimestrului să investighezi — verifică prețurile din ultimele recepții de marfă și rețetele produselor cu volum mare.",
      },
      {
        heading: "Cum te ajută franchisetech",
        body: "Rapoartele de gestiune din franchisetech îți dau lunar, fără calcul manual, venitul total, defalcarea pe metode de plată și — dacă ai rețetele configurate — costul real al mărfii vândute din vânzările efective, nu dintr-o estimare. Combinat cu exportul pentru contabil, ai în câteva minute cifrele de care ai nevoie ca să completezi cele 4 blocuri ale bugetului lunar, în loc să le reconstitui din facturi și bonuri împrăștiate.",
      },
    ],
  },
  {
    slug: "cash-flow-horeca-cum-il-gestionezi",
    title: "Cash flow în HoReCa — cum îl gestionezi ca să nu rămâi fără lichiditate",
    description:
      "Ghid practic despre cash flow în cafenele și restaurante din România: diferența față de profit, cauze de blocaj și cum construiești un buffer de siguranță.",
    publishedAt: "2026-07-11",
    locale: "ro",
    tags: ["cash-flow","financiar"],
    image: "/marketing/dashboard-hero.png",
    relatedFeature: "/features/accountant-reports",
    sections: [
      {
        heading: "Profit pe hârtie vs. bani reali în cont",
        body: "O lună poate arăta profitabilă în raportul de vânzări și tot să te lase fără bani în cont dacă plățile către furnizori, chirie și salarii cad toate în aceeași săptămână. Cash flow-ul măsoară altceva decât profitul: nu «cât ai câștigat», ci «câți bani ai disponibili în fiecare moment ca să plătești ce trebuie plătit».\n\nÎn HoReCa, decalajul e frecvent: încasezi zilnic, în numerar și card, dar plătești furnizorii la 15-30 de zile, chiria lunar în avans și salariile la date fixe. Dacă nu urmărești separat cash flow-ul, profitul de pe hârtie nu te avertizează că vinerea viitoare nu ai lichiditate pentru factura de marfă.",
      },
      {
        heading: "De ce HoReCa are un tipar de cash flow specific",
        body: "Trei factori fac cash flow-ul în restaurante și cafenele mai imprevizibil decât în alte afaceri mici:\n\n- **Sezonalitate puternică** — o terasă poate face 60% din venitul anual în 4 luni de vară, dar plătește chirie și salarii constant tot anul\n- **Stoc perisabil** — nu poți «îngheța» bani în stoc pe termen lung ca într-un magazin; marfa expiră, deci cumperi des, în cantități mici, ceea ce înseamnă plăți frecvente\n- **Zile slabe fixe** — luni și marți sunt de regulă cele mai slabe zile de încasări în majoritatea locațiilor, dar costurile fixe (chirie, salarii) nu scad în acele zile\n\nAstea nu sunt probleme de gestionat o dată — sunt un tipar recurent pe care trebuie să-l planifici lunar.",
      },
      {
        heading: "Cele mai frecvente cauze de blocaj de lichiditate",
        body: "Din experiența operațională, blocajele de cash apar aproape mereu din aceleași cauze:\n\n- **Supra-stocare** — comanzi cantități mari «ca să nu rămâi fără» și blochezi bani în marfă care stă în frigider sau depozit în loc să fie disponibilă ca lichiditate\n- **Plăți concentrate** — chiria, salariile și o factură mare de furnizor cad în aceeași săptămână pentru că nu ai eșalonat termenele de plată\n- **Creștere rapidă fără buffer** — deschizi un al doilea punct de lucru și consumi rezerva de cash a primului pentru investiția inițială\n- **Confuzie între numerar de vânzări și numerar disponibil** — banii din sertar nu sunt automat «profit disponibil»; o parte e deja alocată pentru TVA de plătit sau facturi scadente",
      },
      {
        heading: "Cum construiești un calendar simplu de cash flow",
        body: "Nu ai nevoie de un instrument complex — un calendar lunar cu intrări și ieșiri estimate e suficient pentru o afacere mică:\n\n1. Notezi pe zile toate plățile programate (chirie — de obicei 1 ale lunii, salarii — de obicei 10-15, furnizori — după termenele de plată negociate)\n2. Estimezi încasările zilnice pe baza mediei ultimelor 4-8 săptămâni, ajustat pentru zile de weekend vs. zile de mijlocul săptămânii\n3. Calculezi soldul cumulat zi de zi, nu doar totalul lunar\n4. Orice zi cu sold cumulat negativ e un semnal să muți o plată, accelerezi o încasare sau ai deja bani puși deoparte\n\nDacă vezi că data de 5 a lunii (după chirie și înainte de weekend-ul cu încasări mari) e mereu punctul cel mai strâns, poți negocia cu proprietarul o dată de plată a chiriei mai târziu în lună, sau cu furnizorii termene de plată la 20-25 de zile în loc de 10.",
      },
      {
        heading: "Rezerva de siguranță — cât e suficient",
        body: "Regula orientativă pentru HoReCa: o rezervă de cash echivalentă cu 3-4 săptămâni de costuri fixe (chirie + salarii + utilități), separată de contul curent operațional.\n\nDe ce 3-4 săptămâni și nu mai puțin: o lună slabă neașteptată (vreme proastă în sezonul de terasă, o stradă închisă pentru lucrări, un concurent nou care îți ia temporar din clienți) poate reduce încasările cu 20-30% pentru câteva săptămâni. Fără rezervă, orice astfel de eveniment normal de piață devine o criză de lichiditate.\n\nRezerva se construiește treptat — 5-10% din profitul lunar pus deoparte constant, nu dintr-o dată.",
      },
      {
        heading: "Cum te ajută franchisetech",
        body: "Cash flow-ul se gestionează corect doar dacă știi exact, zilnic, cât ai încasat și pe ce metodă de plată — numerar vs. card contează diferit pentru lichiditate imediată. Raportul Z zilnic din franchisetech îți dă această cifră fără reconstituire manuală, iar rapoartele de gestiune lunare îți arată tendința de venituri pe care o poți folosi ca bază pentru calendarul de cash flow, în loc să estimezi din memorie.",
      },
    ],
  },
  {
    slug: "7-greseli-frecvente-gestiune-stoc-horeca",
    title: "7 greșeli frecvente în gestiunea stocului la cafenele și restaurante",
    description:
      "Cele mai frecvente 7 greșeli de gestiune a stocului în cafenele și restaurante din România — de la recepția mărfii până la inventariere — și cum le corectezi.",
    publishedAt: "2026-07-11",
    locale: "ro",
    tags: ["stoc","greseli"],
    image: "/marketing/stock-report.png",
    relatedFeature: "/features/stock-management",
    sections: [
      {
        heading: "De ce gestiunea stocului stă la baza marjei tale",
        body: "Stocul e locul unde dispar cei mai mulți bani fără ca proprietarul să observe imediat — nu printr-un eveniment mare, ci prin pierderi mici, repetate: o pungă de cafea nenumărată la recepție, o porție servită puțin mai mare decât rețeta, o cutie de roșii uitată în frigider până se strică. Fiecare, izolat, pare neglijabil. Cumulat lunar, poate reprezenta 3-5 puncte procentuale din marjă.\n\nCele 7 greșeli de mai jos sunt cele mai frecvente pe care le vedem la cafenele și restaurante mici din România — nu sunt teoretice, sunt tipare care se repetă.",
      },
      {
        heading: "Greșeli la recepția mărfii",
        body: "**1. Marfa intră în bucătărie fără verificare cantitativă.** Furnizorul lasă cutiile, cineva semnează de primire fără să numere, iar dacă lipsește o pungă de cafea din 5, nimeni nu observă până la următoarea inventariere.\n\n**2. NIR-ul se face «din memorie», la sfârșitul săptămânii, nu la recepție.** Dacă nota de intrare-recepție nu se completează în ziua în care marfa fizic intră, prețurile și cantitățile se reconstituie aproximativ din facturi vechi, iar stocul din sistem nu mai corespunde cu ce e efectiv pe raft.\n\n**3. Prețul din NIR nu se actualizează când furnizorul scumpește.** Dacă introduci mereu același preț vechi «ca să nu complici lucrurile», costul real al rețetelor rămâne subestimat, iar marja calculată e falsă — arată mai bine decât e în realitate.",
      },
      {
        heading: "Greșeli în urmărirea zilnică a consumului",
        body: "**4. Consumul de ingrediente nu e legat de rețete, ci estimat global.** Fără rețete configurate cu cantități exacte per porție, nu poți ști dacă un barista toarnă 150ml sau 180ml de lapte la fiecare cappuccino — diferența pe 500 de cappuccino-uri pe lună înseamnă 15 litri de lapte în plus, nefacturați nicăieri ca cost real.\n\n**5. Nu există alerte de stoc minim, deci reaprovizionarea se face «pe ochi».** Fie comanzi prea des în cantități mici (costuri de transport mai mari, timp pierdut), fie rămâi fără un ingredient critic exact în weekend-ul aglomerat.",
      },
      {
        heading: "Greșeli de inventariere și control",
        body: "**6. Inventarierea fizică se face rar sau deloc.** Fără o numărare periodică (lunar, ideal) care compară stocul fizic cu cel din sistem, discrepanțele se acumulează luni la rând nedetectate — până când un control sau un bilanț de sfârșit de an scoate la iveală o diferență mare și greu de explicat.\n\n**7. Risipa și pierderile nu se documentează separat de vânzări.** Un produs stricat, o porție greșită aruncată, o cană spartă — dacă nu sunt notate ca pierdere, stocul din sistem rămâne «corect» pe hârtie dar greșit în realitate, iar diferența apare confuz la inventariere, fără cauză clară.",
      },
      {
        heading: "Cum eviți aceste greșeli sistematic",
        body: "- Faci NIR-ul în ziua recepției, cu verificare cantitativă la livrare, nu din memorie ulterior\n- Actualizezi prețul din NIR de fiecare dată când se schimbă, chiar dacă e o creștere mică\n- Configurezi rețetele cu cantități exacte per porție pentru produsele cu volum mare\n- Setezi stoc minim per ingredient critic, cu alertă automată\n- Faci inventariere fizică lunară și compari cu stocul din sistem\n- Notezi separat orice pierdere sau risipă, cu motiv\n\nNiciuna dintre acestea nu ia mai mult de câteva minute pe zi dacă e parte din rutină — dar lipsa lor costă ore de reconciliere confuză la final de lună.",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "franchisetech leagă NIR-ul, rețetele și vânzările în același sistem: la fiecare vânzare cu rețetă configurată, cantitățile se scad automat din stoc, iar prețul folosit pentru cost e cel din ultima recepție înregistrată. Alertele de stoc minim apar automat în dashboard, iar Balanța cantitativ-valorică îți arată intrările, ieșirile prin vânzare, ieșirile prin consum și stocul curent — fără să reconstitui manual ce s-a întâmplat cu marfa în ultima lună.",
      },
    ],
  },
  {
    slug: "greseli-frecvente-la-raportul-z",
    title: "Greșeli frecvente la raportul Z și cum le eviți",
    description:
      "Cele mai frecvente greșeli făcute la generarea și verificarea raportului Z zilnic în cafenele și restaurante — și cum le previi ca să nu ai probleme la control.",
    publishedAt: "2026-07-12",
    locale: "ro",
    tags: ["raport-z","greseli"],
    image: "/marketing/reports-zreport.png",
    relatedFeature: "/features/z-report",
    sections: [
      {
        heading: "De ce raportul Z e sensibil la greșeli mici",
        body: "Raportul Z e documentul care leagă ce s-a vândut fizic de ce arată casa de marcat fiscal. E generat o dată pe zi, de obicei sub presiunea sfârșitului de tură — angajatul vrea să plece acasă, casa e aglomerată sau, dimpotrivă, e liniște și nimeni nu mai verifică cu atenție. Exact în acel moment se strecoară greșelile care, adunate pe o lună, devin diferențe greu de explicat contabilului sau unui inspector.",
      },
      {
        heading: "Greșeli legate de numerar",
        body: "**Sertarul nu se numără fizic, doar se «estimează».** Angajatul verifică din ochi că «pare cam atât» și bifează raportul ca fiind conform, fără numărare bănuț cu bănuț.\n\n**Fondul de deschidere nu se scade corect.** Dacă ziua a început cu 200 de lei fond de casă, iar la calculul numerarului din vânzări cineva uită să scadă acei 200 de lei, diferența raportată e sistematic greșită cu exact suma fondului.\n\n**Restul dat greșit nu se documentează.** Un rest calculat greșit la o tranzacție (5 lei în plus sau în minus) e o diferență minoră izolat, dar dacă se întâmplă des și nu se notează niciodată, la final de lună nimeni nu mai poate reconstitui de unde vine discrepanța cumulată.",
      },
      {
        heading: "Greșeli legate de momentul generării",
        body: "**Raportul se generează înainte de ultima vânzare a zilei.** Un client de la ora închiderii plătește, dar raportul Z a fost deja generat cu 10 minute înainte — vânzarea rămâne în afara raportului zilei respective sau apare confuz în ziua următoare.\n\n**Lipsesc rapoarte pentru zile întregi.** Zile aglomerate, zile de sărbătoare sau pur și simplu uitare — dacă o zi nu are raport Z generat, nu există niciun document care să demonstreze ce s-a vândut fiscal în acea zi. La control, o zi fără raport Z e tratată ca zi fără înregistrare fiscală.",
      },
      {
        heading: "Greșeli legate de diferențe neinvestigate",
        body: "Cea mai costisitoare greșeală nu e o diferență izolată — e obiceiul de a o ignora. Un sertar cu 30 de lei în minus, dacă nu e investigat și notat, se repetă. Peste o lună, 30 de lei aproape zilnic înseamnă 600-900 de lei fără explicație, sumă pe care contabilul nu o poate justifica și pe care, la un control amănunțit, un inspector o poate interpreta ca venit neînregistrat.\n\nDiferența trebuie tratată ca semnal, nu ca rutină: verifici dacă a fost o eroare de rest, o anulare nedocumentată sau o vânzare neîncasată corect — și notezi concluzia, chiar dacă e «eroare de rest, corectat».",
      },
      {
        heading: "Checklist de prevenire",
        body: "- Generezi raportul Z abia după ultima vânzare confirmată a zilei\n- Numeri sertarul fizic, bănuț cu bănuț, nu estimativ\n- Scazi fondul de deschidere înainte de a compara cu totalul din raport\n- Notezi orice diferență, oricât de mică, cu motivul identificat\n- Generezi raportul în fiecare zi de operare, fără excepție\n- Arhivezi raportul (fizic sau digital) imediat, nu «mai târziu»",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "Raportul Z din franchisetech se generează din datele reale ale sesiunii POS — nu poți genera un raport pentru vânzări care nu au fost încă înregistrate, iar totalul de numerar așteptat scade automat fondul de deschidere. Fiecare raport rămâne arhivat pe server, căutabil pe dată, astfel încât o zi din urmă cu trei luni e la fel de accesibilă ca ziua de azi dacă un contabil sau un inspector o solicită.",
      },
    ],
  },
  {
    slug: "mituri-despre-sistemele-pos-scumpe",
    title: "5 mituri despre sistemele POS „scumpe” pe care le poți ignora",
    description:
      "Cinci mituri frecvente despre sistemele POS pentru cafenele și restaurante — de la cost la implementare — separate de realitate, cu explicații concrete.",
    publishedAt: "2026-07-12",
    locale: "ro",
    tags: ["pos","mituri"],
    image: "/marketing/pos-hero.png",
    relatedFeature: "/features/pos",
    sections: [
      {
        heading: "De ce persistă aceste mituri",
        body: "Mulți proprietari de cafenele mici amână trecerea de la caiet și Excel la un sistem POS cloud pentru că au auzit — de la alți proprietari, de la un contabil, dintr-o experiență veche — că «e complicat» sau «e doar pentru restaurante mari». O parte din aceste convingeri au fost adevărate acum 8-10 ani, când sistemele POS erau într-adevăr scumpe și greu de instalat. Realitatea de azi e diferită, dar mitul a rămas.",
      },
      {
        heading: "Mitul 1: «E doar pentru restaurante mari, nu pentru o cafenea mică»",
        body: "Realitate: cele mai multe sisteme POS cloud din 2026 au planuri gândite explicit pentru afaceri mici — un singur punct de lucru, 2-5 angajați, meniu de 15-30 de produse. Nu plătești pentru module de gestiune a mai multor locații sau ospătari pe tabletă dacă nu ai nevoie de ele.\n\nO cafenea cu 2 baristi și un meniu simplu are nevoie doar de POS, raport Z și stoc de bază — exact planurile de intrare ale majorității furnizorilor sunt construite pentru acest profil, nu pentru lanțuri.",
      },
      {
        heading: "Mitul 2: «Implementarea durează săptămâni și trebuie oprită afacerea»",
        body: "Realitate: introducerea produselor, prețurilor și a cotelor TVA într-un sistem POS cloud durează, pentru un meniu de cafenea, 1-2 ore, nu săptămâni. Nu ai nevoie de o echipă de implementare la fața locului — configurezi produsele din interfață, deschizi prima sesiune de casă și începi să vinzi.\n\nAmânarea reală apare mai des din motive de teamă («ce se întâmplă dacă se strică internetul în plin prânz») decât din complexitate tehnică efectivă.",
      },
      {
        heading: "Mitul 3: «Trebuie hardware scump — imprimantă fiscală nouă, tabletă specială»",
        body: "Realitate: majoritatea sistemelor POS cloud moderne funcționează pe un tablet sau laptop obișnuit, conectat la casa de marcat fiscală existentă printr-un driver sau agent local. Nu trebuie să înlocuiești echipamentul fiscal dacă e deja compatibil — investiția e de regulă în licența software, nu în hardware nou de la zero.",
      },
      {
        heading: "Mitul 4: «E doar o casă de marcat mai scumpă, nu văd diferența»",
        body: "Realitate: o casă de marcat fiscală clasică înregistrează vânzări și emite bonuri. Un sistem POS cloud face asta plus gestiune de stoc, calculul automat al costului rețetelor, raport Z reconciliat automat cu numerarul așteptat și export direct pentru contabil. Diferența nu e în funcția de bază (ambele emit bon fiscal) — e în tot ce se întâmplă în jurul acelei funcții, care altfel se face manual, în Excel, cu risc de eroare.",
      },
      {
        heading: "Mitul 5: «Costul real e mult mai mare decât prețul afișat»",
        body: "Ăsta e uneori adevărat, dar nu peste tot — și aici contează cum verifici înainte să semnezi. Unele sisteme afișează un preț de bază atractiv, dar stocul, exportul pentru contabil sau ecranul de bucătărie sunt module separate, plătite în plus, care umflă factura reală lunară considerabil peste prețul afișat inițial.\n\nÎnainte de a decide, cere lista completă de funcționalități incluse în prețul afișat, nu doar prețul de listă. franchisetech include POS, stoc, rețete, raport Z și export pentru contabil în același plan, fără module ascunse — dar indiferent de furnizorul pe care îl alegi, întrebarea «ce NU e inclus în acest preț?» merită pusă explicit înainte de semnare.",
      },
    ],
  },
  {
    slug: "costing-meniu-de-craciun-horeca",
    title: "Cum faci costing pentru meniul de Crăciun fără să pierzi marjă",
    description:
      "Ghid practic pentru calcularea costului meniului de Crăciun în restaurante și cafenele din România: ingrediente sezoniere, prețuri volatile și cum stabilești prețul corect.",
    publishedAt: "2026-07-13",
    locale: "ro",
    tags: ["sezonier","craciun","retete"],
    image: "/marketing/industry-restaurant.png",
    relatedFeature: "/features/recipe-costing",
    sections: [
      {
        heading: "De ce meniul de Crăciun e o capcană de marjă",
        body: "În perioada de Crăciun, prețurile la carne de porc, somon, fructe de mare și anumite legume urcă frecvent cu 15-30% față de restul anului, din cauza cererii concentrate pe aceeași perioadă la nivel național. Dacă stabilești prețul meniului festiv pe baza costurilor din noiembrie sau din anul trecut, riști să servești fiecare porție la o marjă mult mai mică decât planificat — uneori sub pragul de acoperire a costurilor fixe.\n\nMeniul de Crăciun are de obicei și porții mai generoase (fripturi întregi, platouri, meniuri festive cu mai multe feluri), ceea ce amplifică efectul unei creșteri de preț la ingredientul principal.",
      },
      {
        heading: "Cum calculezi costul unui meniu festiv — exemplu concret",
        body: "Meniu festiv de Crăciun, 3 feluri (supă cremă, friptură de porc cu garnitură, cozonac):\n\n- Supă cremă de legume (porție 300ml): 4.20 lei\n- Friptură de porc 250g + garnitură (cartofi, varză călită): carnea de porc la preț de sezon ~38 lei/kg → 250g = 9.50 lei; garnitură 3.80 lei → **13.30 lei**\n- Cozonac (felie 100g): 5.50 lei\n\n**Cost total ingrediente: 23 lei**\n\nDacă prețul de vânzare al meniului e 65 lei:\n- Marjă brută: 65 − 23 = 42 lei\n- Procent marjă: 64.6%\n\nDacă însă carnea de porc urcă în ultima săptămână înainte de Crăciun la 46 lei/kg (nu neobișnuit) și nu ajustezi prețul de vânzare, costul crește la 25 lei, iar marja scade la 61.5% — o diferență care, pe 200 de meniuri vândute în cele 2 săptămâni de sezon, înseamnă 400 de lei profit pierdut doar din acest fel.",
      },
      {
        heading: "Greșeala frecventă: prețul fixat cu săptămâni înainte, pe costuri vechi",
        body: "Mulți proprietari stabilesc meniul de Crăciun și prețul lui în noiembrie, tipăresc materiale de promovare și rămân blocați la acel preț chiar dacă ingredientele se scumpesc semnificativ până la 20-24 decembrie. Odată promovat un preț, pare neprofesional să-l schimbi — dar servirea la pierdere timp de două săptămâni nu e o soluție mai bună.\n\nAlternativa practică: promovezi meniul cu un preț de bază, dar lași o marjă de siguranță de 10-15% în calculul inițial, exact pentru volatilitatea așteptată a ingredientelor de sezon. Dacă prețurile nu cresc atât de mult, marja finală e mai bună decât planificat — dacă cresc, tot ești acoperit.",
      },
      {
        heading: "Cum stabilești prețul de vânzare corect",
        body: "Pornește de la marja țintă, nu de la ce «sună bine» ca preț:\n\n1. Calculezi costul ingredientelor cu prețurile actualizate cât mai aproape de perioada de servire (verifici NIR-urile recente de la furnizori, nu prețuri din urmă cu 2 luni)\n2. Aplici marja țintă (65-70% e rezonabil pentru un meniu festiv cu porții generoase)\n3. Rotunjești la un preț «rotund» psihologic (65 lei, nu 63.40 lei)\n4. Verifici că prețul rămâne competitiv față de piața locală, fără să compari cu concurenți specifici — doar cu percepția generală de piață din zona ta",
      },
      {
        heading: "Gestionarea risipei specifice sezonului",
        body: "Meniurile festive au porții mai mari și ingrediente perisabile cumpărate în avans pentru volum crescut — combinația ideală pentru risipă dacă estimarea de vânzări e greșită. Câteva măsuri practice:\n\n- Comandă ingredientele perisabile (carne proaspătă, fructe de mare) în tranșe mici, aproape de data servirii, nu tot stocul dintr-o dată la începutul lunii decembrie\n- Urmărește zilnic câte meniuri festive s-au vândut față de estimare și ajustează comanda următoare\n- Notează separat orice porție irosită sau greșit pregătită, ca să vezi la final de sezon cât a costat real risipa, nu doar ingredientele folosite",
      },
      {
        heading: "Cum te ajută franchisetech",
        body: "Configurezi meniul de Crăciun ca rețetă separată în franchisetech, cu ingredientele și cantitățile per porție. De fiecare dată când înregistrezi o recepție de marfă cu preț nou pentru carne, somon sau alt ingredient de sezon, costul rețetei se recalculează automat — vezi imediat dacă marja a scăzut sub pragul acceptat, în loc să afli abia la sfârșitul lunii, din raportul de gestiune.",
      },
    ],
  },
  {
    slug: "costing-meniu-de-paste-horeca",
    title: "Cum faci costing pentru meniul de Paște fără să pierzi marjă",
    description:
      "Ghid practic pentru calcularea costului meniului de Paște în restaurante și cafenele din România: miel, drob, ouă, cozonac și cum stabilești prețul corect pe sezon.",
    publishedAt: "2026-07-13",
    locale: "ro",
    tags: ["sezonier","paste","retete"],
    image: "/marketing/industry-restaurant.png",
    relatedFeature: "/features/recipe-costing",
    sections: [
      {
        heading: "De ce meniul de Paște are aceleași riscuri ca cel de Crăciun — dar cu alte ingrediente",
        body: "În săptămâna dinaintea Paștelui, prețul la carne de miel poate urca semnificativ față de restul anului, din cauza cererii concentrate pe o perioadă scurtă (majoritatea comenzilor se fac în aceeași săptămână, la nivel național). Ouăle, brânza pentru pască și ingredientele pentru drob urmează un tipar similar, chiar dacă mai puțin accentuat.\n\nDacă ai stabilit prețul meniului de Paște cu o lună înainte, pe baza unor costuri estimate, riști exact aceeași problemă ca la Crăciun: marjă erodată chiar în perioada cu cel mai mare volum de comenzi festive.",
      },
      {
        heading: "Exemplu concret: meniu tradițional de Paște",
        body: "Meniu festiv (drob, miel la cuptor cu garnitură, pască):\n\n- Drob de miel (porție 150g): ouă, ficat, carne tocată, verdeață → **6.80 lei**\n- Miel la cuptor 300g + garnitură de cartofi noi: miel la preț de sezon ~55 lei/kg → 300g = 16.50 lei; garnitură 4.20 lei → **20.70 lei**\n- Pască (felie 120g): brânză, ouă, stafide → **6.50 lei**\n\n**Cost total ingrediente: 34 lei**\n\nLa un preț de vânzare de 89 lei:\n- Marjă brută: 89 − 34 = 55 lei\n- Procent marjă: 61.8%\n\nDacă prețul mielului urcă în ultima săptămână la 62 lei/kg (frecvent aproape de sărbătoare), costul crește cu circa 2.10 lei, iar marja scade la 59.4% — pe 150 de meniuri vândute în weekendul de Paște, diferența e de peste 300 de lei doar din acest fel.",
      },
      {
        heading: "Ingredientele cu cea mai mare volatilitate de preț la Paște",
        body: "- **Carnea de miel** — cea mai volatilă; cere ofertă actualizată de la furnizor cu 1-2 săptămâni înainte, nu te baza pe prețul din urmă cu o lună\n- **Ouăle** — creștere moderată dar constantă în săptămâna dinaintea sărbătorii\n- **Brânza pentru pască/cozonac** — mai stabilă, dar verifică totuși ultima factură\n- **Verdețuri de sezon (leurdă, ceapă verde)** — preț foarte variabil în funcție de recoltă și vreme\n\nRecalculează costul rețetelor festive cu prețurile cele mai recente disponibile, ideal cu 3-5 zile înainte de perioada de vârf a comenzilor, nu la începutul lunii.",
      },
      {
        heading: "Cum stabilești prețul de vânzare corect",
        body: "Aceeași logică se aplică și la Paște ca la orice meniu sezonier:\n\n1. Calculezi costul cu prețuri actualizate, incluzând o marjă de siguranță de 10-15% pentru volatilitatea așteptată a mielului\n2. Ținta de marjă brută pentru un meniu festiv cu porții generoase: 60-70%\n3. Rotunjești la un preț psihologic rotund\n4. Dacă oferi meniul ca pachet pentru livrare acasă (mulți clienți comandă meniul de Paște la pachet), adaugă costul ambalajelor speciale (cutii mai mari, pungi izoterme) în calculul de cost — se uită frecvent și erodează marja fără să apară explicit nicăieri",
      },
      {
        heading: "Gestionarea comenzilor și a risipei de sezon",
        body: "Meniul de Paște se vinde de obicei concentrat pe 2-3 zile (Vinerea Mare, sâmbătă, prima zi de Paște), spre deosebire de Crăciun unde perioada e puțin mai întinsă. Această concentrare crește riscul de risipă dacă estimarea e greșită:\n\n- Colectează comenzi în avans (telefonic sau online) pentru meniurile de pachet, ca să estimezi cantitatea reală de miel necesară\n- Comandă mielul cât mai aproape de data de servire — e ingredientul cel mai scump și cel mai perisabil din meniu\n- Notează separat orice porție neservită sau greșită, ca reper pentru estimarea de anul viitor",
      },
      {
        heading: "Cum te ajută franchisetech",
        body: "La fel ca la meniul de Crăciun, configurezi meniul de Paște ca rețetă separată în franchisetech. Când înregistrezi recepția de miel, ouă sau brânză cu prețul de sezon actualizat, costul rețetei și marja se recalculează automat — poți verifica în orice moment, chiar și cu o zi înainte de sărbătoare, dacă prețul de vânzare stabilit cu o lună în urmă mai acoperă marja țintă.",
      },
    ],
  },
  {
    slug: "black-friday-horeca-strategie",
    title: "Black Friday în HoReCa — merită reduceri și cum le calculezi ca să nu pierzi bani",
    description:
      "Ghid despre reducerile de Black Friday în cafenele și restaurante din România: ce tip de discount are sens, cum calculezi pragul de rentabilitate și greșeli de evitat.",
    publishedAt: "2026-07-13",
    locale: "ro",
    tags: ["black-friday","marja","reduceri"],
    image: "/marketing/margins-report.png",
    relatedFeature: "/features/recipe-costing",
    sections: [
      {
        heading: "Black Friday în HoReCa e diferit de Black Friday în retail",
        body: "În retail, Black Friday funcționează pentru că un produs cumpărat cu 6 luni înainte, la un preț de achiziție fix, poate fi vândut cu discount fără ca marja pe unitate să dispară complet — mai ales dacă stocul altfel ar rămâne nevândut. În HoReCa, situația e diferită: nu ai stoc «vechi» de preparate — fiecare porție servită consumă ingrediente proaspete, cumpărate recent, la prețul curent.\n\nAsta înseamnă că un discount de 50% la un produs cu marjă brută de 65% nu mai lasă practic nimic pentru costurile fixe — poate chiar sub costul ingredientelor, dacă discountul e prost calculat.",
      },
      {
        heading: "Ce tip de reduceri au sens efectiv",
        body: "Nu orice reducere e o greșeală — depinde de ce anume reduci și de ce obiectiv urmărești:\n\n- **Meniuri combo** (produs cu marjă mare + produs cu marjă mică grupate) — reducerea procentuală pe pachet lasă marja medie rezonabilă, chiar dacă discountul pare mare\n- **Reduceri pe ore moarte** (14:00-17:00 în zilele lucrătoare, de exemplu) — obiectivul nu e marja maximă pe fiecare vânzare, ci umplerea unor ore altfel goale, unde costul fix (personal, chirie) se plătește oricum\n- **Reduceri pe produse cu marjă foarte mare** (cafea, băuturi cu cost ingredient mic) — aici ai loc de discount fără să intri pe pierdere\n\n- **De evitat:** reduceri flat pe tot meniul, aplicate uniform indiferent de marja fiecărui produs",
      },
      {
        heading: "Cum calculezi pragul de rentabilitate al unui discount",
        body: "Formula simplă: discountul maxim pe care ți-l poți permite fără să pierzi bani pe o vânzare individuală e limitat de marja brută a produsului.\n\n**Exemplu:** un cappuccino cu preț de vânzare 15 lei și cost ingredient 2.20 lei (marjă brută 85.3%).\n\n- Discount de 30% → preț nou 10.50 lei → marjă brută rămasă 8.30 lei (79% marjă) — încă foarte profitabil\n- Discount de 50% → preț nou 7.50 lei → marjă brută rămasă 5.30 lei (70.7% marjă) — tot profitabil, pentru că baza de cost e mică\n\n**Comparativ, un burger** cu preț 38 lei și cost ingredient 10.50 lei (marjă brută 72.4%):\n\n- Discount de 30% → preț nou 26.60 lei → marjă brută rămasă 16.10 lei (60.5% marjă) — acceptabil\n- Discount de 50% → preț nou 19 lei → marjă brută rămasă 8.50 lei (44.7% marjă) — marjă mult redusă, iar dacă mai scazi și costul cu forța de muncă pentru preparare, poți ajunge pe pierdere reală",
      },
      {
        heading: "Greșeli frecvente de Black Friday în HoReCa",
        body: "- **Discount flat aplicat pe tot meniul**, fără să diferențiezi marja fiecărui produs — produsele cu marjă deja mică (mâncare gătită complex) devin neprofitabile\n- **Nicio limită de cantitate sau oră**, ceea ce poate concentra tot volumul zilei pe produsele cu discount, canibalizând vânzările normale la preț întreg\n- **Discount calculat «după ureche»**, fără să verifici costul real al ingredientelor la prețurile curente (mai ales dacă un furnizor a scumpit recent și nu ai actualizat costul rețetei)\n- **Fără obiectiv clar** — dacă nu știi dacă vrei clienți noi, volum în ore moarte sau lichidare de stoc perisabil, riști o campanie care doar reduce profitul fără beneficiu strategic",
      },
      {
        heading: "Cum decizi dacă merită să faci Black Friday deloc",
        body: "Nu orice cafenea sau restaurant trebuie să participe. Întrebările de pus înainte:\n\n1. Am produse cu marjă suficient de mare încât un discount real să nu erodeze profitul sub pragul acceptabil?\n2. Am capacitate (personal, spațiu) să gestionez un volum crescut fără să scadă calitatea sau timpul de servire?\n3. Obiectivul e clienți noi care revin ulterior la preț întreg, sau doar volum într-o singură zi fără continuitate?\n\nDacă răspunsul la oricare din primele două e nu, o campanie mai mică și mai țintită (discount doar pe 2-3 produse cu marjă mare, într-un interval orar limitat) e mai sigură decât o reducere generală pe tot meniul.",
      },
      {
        heading: "Cum te ajută franchisetech",
        body: "Înainte de a stabili orice discount, lista de rețete din franchisetech îți arată marja brută reală, per produs, calculată din costurile curente ale ingredientelor — nu dintr-o estimare veche. Poți identifica rapid care produse au marjă suficient de mare pentru un discount de Black Friday și care ar deveni neprofitabile, în loc să calculezi manual pentru fiecare produs din meniu.",
      },
    ],
  },
  {
    slug: "pregatire-control-anaf-neanuntat",
    title: "Cum te pregătești pentru un control ANAF neanunțat, în orice zi",
    description:
      "Ghid practic pentru cafenele și restaurante: ce verifică inspectorii ANAF la un control inopinat, ce documente trebuie să ai mereu la zi și cum eviți amenzile frecvente.",
    publishedAt: "2026-07-14",
    locale: "ro",
    tags: ["fiscal","control-anaf"],
    image: "/marketing/hero-casa-marcat.jpg",
    relatedFeature: "/features/accountant-reports",
    sections: [
      {
        heading: "Ce este controlul inopinat și ce vizează în HoReCa",
        body: "Controlul ANAF neanunțat (inopinat) poate avea loc în orice zi de operare, fără notificare prealabilă — legislația permite acest tip de verificare tocmai pentru a surprinde activitatea reală, nu una pregătită special pentru inspecție. În HoReCa, zonele cele mai frecvent verificate sunt: emiterea corectă a bonurilor fiscale, concordanța dintre numerarul din sertar și înregistrările sistemului, documentele de proveniență a mărfii (NIR, facturi) și corectitudinea aplicării cotelor de TVA.\n\nUn control inopinat nu înseamnă automat că ceva e în neregulă — dar pregătirea permanentă (nu «pregătirea de dinaintea controlului», pentru că nu știi când vine) face diferența între o verificare rapidă și una care escaladează.",
      },
      {
        heading: "Documentele obligatorii la fiecare punct de lucru",
        body: "Inspectorul poate cere, pe loc, oricare dintre următoarele:\n\n- **Rapoartele Z** pentru zilele recente (și, la cerere, pentru orice perioadă anterioară)\n- **Registrul de casă** — jurnalul cronologic al mișcărilor de numerar\n- **NIR-urile** — notele de intrare-recepție pentru marfa aflată în gestiune\n- **Facturile furnizorilor** aferente mărfii din stoc\n- **Certificatul casei de marcat fiscale** și dovada că aceasta e conectată corect la sistemul informatic al ANAF\n\nDacă oricare dintre aceste documente lipsește sau e incomplet pentru o perioadă recentă, asta devine punctul de plecare al unei verificări mai amănunțite, nu doar o notă minoră.",
      },
      {
        heading: "Ce verifică inspectorul la casa de marcat",
        body: "Verificarea standard la casa de marcat include:\n\n1. **Emiterea bonului fiscal** — fiecare vânzare trebuie să aibă bon emis, indiferent de metoda de plată\n2. **Concordanța sertar-sistem** — inspectorul poate cere numărarea numerarului din sertar în momentul controlului și compararea cu totalul așteptat conform sistemului la acel moment al zilei\n3. **Funcționarea corectă a casei de marcat** — conectare la sistemul fiscal, jurnal electronic accesibil\n4. **Prețurile afișate vs. prețurile din bon** — dacă meniul afișat la vedere diferă de prețul practicat efectiv, e semnalat ca neregulă\n\nDiscrepanța dintre numerarul fizic și cel așteptat de sistem, dacă apare exact în momentul controlului, e greu de explicat convingător pe loc — de aceea contează ca reconcilierea să fie o rutină zilnică, nu ceva făcut «când ai timp».",
      },
      {
        heading: "Greșeli frecvente care duc la amenzi",
        body: "- **Bonuri neemise pentru unele plăți** — mai ales la plățile în numerar din perioadele aglomerate, când personalul «uită» sub presiunea timpului\n- **Discrepanțe nedocumentate în registrul de casă** — diferențe de numerar fără nicio notă explicativă\n- **NIR lipsă sau întârziat** pentru marfă vizibil prezentă în gestiune\n- **Cote de TVA aplicate greșit** pe anumite categorii de produse, de multe ori din neatenție la configurarea inițială a produselor în sistem\n- **Angajați care nu știu unde sunt documentele** — chiar dacă documentele există, dacă personalul de la fața locului nu știe să le găsească rapid, controlul durează mai mult și creează o impresie de dezorganizare",
      },
      {
        heading: "Cum te asiguri că ești pregătit în orice zi — checklist",
        body: "- [ ] Raportul Z de ieri și de azi sunt generate și arhivate\n- [ ] Registrul de casă e la zi, fără diferențe nedocumentate\n- [ ] Toate NIR-urile pentru marfa din ultima săptămână sunt emise, nu în stadiul de ciornă\n- [ ] Casa de marcat funcționează și e conectată corect la sistemul fiscal\n- [ ] Personalul de tură știe unde sunt documentele și cum arată un bon corect emis\n- [ ] Cotele de TVA per produs sunt verificate și corecte în sistem\n\nDacă poți bifa toate aceste puncte în orice moment al zilei, nu doar la sfârșitul lunii, un control inopinat devine o formalitate de 20-30 de minute, nu o zi de stres.",
      },
      {
        heading: "Cum ajută franchisetech să ai totul la zi",
        body: "franchisetech arhivează automat fiecare raport Z, fiecare NIR emis și registrul de casă aferent, căutabile instant pe dată din aplicație — nu trebuie să cauți printre dosare fizice sau fișiere Excel când un inspector cere documentele. Cotele de TVA se configurează o singură dată per produs și rămân consistente în toate rapoartele generate ulterior, reducând riscul de eroare la aplicarea cotei greșite.",
      },
    ],
  },
  {
    slug: "cum-previi-frauda-la-casierie",
    title: "Cum previi frauda la casierie — semnale de alarmă și controale simple",
    description:
      "Practici de control intern pentru cafenele și restaurante din România: reconciliere zilnică, separarea responsabilităților, jurnal de tranzacții și semnale de alarmă de urmărit.",
    publishedAt: "2026-07-14",
    locale: "ro",
    tags: ["pos","frauda","control"],
    image: "/marketing/reports-zreport.png",
    relatedFeature: "/features/z-report",
    sections: [
      {
        heading: "De ce casieria e punctul cel mai expus",
        body: "Casieria e locul din afacere unde numerarul fizic, sistemul de vânzări și personalul se întâlnesc zilnic, adesea fără supraveghere directă a proprietarului. Nu e vorba despre neîncrederea în angajați — e vorba despre faptul că orice sistem fără controale de verificare independentă e vulnerabil la erori și, ocazional, la abuzuri, indiferent cât de bună e echipa.\n\nPrevenirea nu înseamnă suspiciune constantă — înseamnă proceduri clare care protejează deopotrivă afacerea și angajații corecți, pentru că elimină ambiguitatea în cazul unei discrepanțe.",
      },
      {
        heading: "Semnale de alarmă de urmărit",
        body: "- **Discrepanțe repetate la același sertar sau aceeași tură**, chiar dacă fiecare, izolat, e mică\n- **Un tipar de anulări sau corecții de bon concentrat pe un anumit angajat sau interval orar**, fără explicație operațională clară\n- **Un angajat care evită constant să lucreze când e verificat sau supravegheat cineva**, sau care insistă să lucreze mereu singur, fără schimb\n- **Diferențe frecvente între ce arată raportul de vânzări și stocul de ingrediente consumat efectiv**, mai ales la produse ușor de servit «pe lângă» sistem\n\nNiciunul dintre aceste semnale, izolat, nu e o dovadă — dar un tipar repetat merită verificat sistematic, nu ignorat pentru că «probabil e o greșeală».",
      },
      {
        heading: "Separarea responsabilităților — controlul cel mai eficient",
        body: "Principiul de bază al controlului intern: persoana care încasează banii nu ar trebui să fie și singura persoană care verifică dacă suma e corectă, fără nicio a doua confirmare.\n\nÎn practică, pentru o afacere mică:\n\n- **Numărarea sertarului la închidere** se face de o altă persoană decât cea care a operat casa toată ziua, când e posibil (chiar și proprietarul, dacă echipa e mică)\n- **Aprobarea reducerilor sau anulărilor de bonuri** peste o anumită valoare necesită confirmarea unui manager sau a proprietarului, nu doar a casierului\n- **Accesul la funcțiile sensibile** (anulare bon, discount manual, deschidere sertar fără vânzare) se acordă doar rolurilor care au nevoie reală de el, nu tuturor angajaților în mod implicit",
      },
      {
        heading: "Audit trail — jurnalul care arată cine a făcut ce",
        body: "Un sistem POS bun păstrează un jurnal complet al fiecărei operațiuni: cine a înregistrat vânzarea, cine a aplicat o reducere, cine a anulat un bon și la ce oră. Acest jurnal nu previne singur frauda, dar face verificarea posibilă — fără el, orice discrepanță rămâne fără explicație, imposibil de urmărit până la sursă.\n\nCe contează practic:\n\n- Fiecare angajat are cont propriu de acces, nu un cont comun folosit de toată tura\n- Reducerile și anulările sunt înregistrate cu motiv, nu doar cu suma\n- Jurnalul e accesibil retroactiv, nu doar în ziua curentă",
      },
      {
        heading: "Verificări periodice de rutină",
        body: "Pe lângă reconcilierea zilnică a sertarului (care ar trebui să fie deja standard), câteva verificări suplimentare la interval regulat:\n\n- **Numărare surpriză a sertarului în mijlocul unei ture**, ocazional, nu doar la închidere\n- **Compararea consumului de ingrediente raportat de sistem cu stocul fizic rămas**, lunar, pentru produsele cu volum mare\n- **Verificarea tiparului de reduceri și anulări pe angajat**, lunar, pentru a identifica devieri față de restul echipei\n- **Rotația responsabilităților** acolo unde e posibil, astfel încât aceeași persoană să nu gestioneze exclusiv, permanent, atât încasarea cât și reconcilierea",
      },
      {
        heading: "Cum te ajută franchisetech",
        body: "Fiecare operațiune din POS-ul franchisetech — vânzare, reducere, anulare — rămâne înregistrată cu utilizatorul care a efectuat-o și ora exactă, iar permisiunile pe roluri limitează cine poate aplica discount-uri sau anula bonuri fără confirmare suplimentară. Raportul Z zilnic, combinat cu acest istoric de tranzacții, transformă reconcilierea dintr-o bănuială într-o verificare bazată pe date concrete — știi exact unde să te uiți dacă apare o discrepanță, în loc să suspectezi la întâmplare.",
      },
    ],
  },
];
