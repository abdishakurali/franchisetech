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

/**
 * Pruned 2026-09-05 from 115 posts to the 50 that had any traffic in the
 * prior 90 days (PostHog, filterTestAccounts=true). Do not add new posts
 * without a distribution plan (who finds it, how) — volume without
 * distribution is how this list grew to 115 with ~90 at zero visitors.
 *
 * 2026-09-19: added 8 posts, deliberately adjacent to the two highest-traffic
 * posts (bon-fiscal-obligatoriu-cand-si-cum, cum-anulezi-un-bon-fiscal-emis-gresit —
 * both fiscal-receipt procedural-panic queries), not generic topics. Every legal
 * claim was checked against primary sources (OUG 28/1999, Legea 296/2023 via an
 * official ANAF comparison PDF) before publishing.
 *
 * 2026-09-21: added 5 more posts, same bar (every legal claim verified against a
 * primary source — OUG 28/1999, Legea 296/2023, Legea 241/2005, Legea 317/2024,
 * Legea 141/2025 for the current 21%/11%/0% VAT rates). Also fixed the distribution
 * gap flagged above: both proven high-traffic posts, plus three of the 2026-09-19
 * posts, now carry a genuine contextual internal link (via the renderer's new
 * [text](url) markdown-link support in app/blog/[slug]/page.tsx) into this batch and
 * back — not just the generic "Mai multe articole" footer. Also fixed a stale 5%
 * VAT-rate line in cote-tva-diferite-acelasi-bon-cum-se-calculeaza's worked example
 * (5% hasn't been a valid standalone rate since the Aug 2025 change; replaced with
 * the real 0% case). Before adding further posts, actually check PostHog traffic on
 * this batch first — don't repeat the volume-without-verification pattern.
 */
export const blogPosts: BlogPost[] = [
  {
    slug: "ce-este-raportul-z-si-cum-il-faci",
    title: "Ce este Raportul Z și cum îl faceți corect",
    description:
      "Raportul Z este documentul de închidere a casei la sfârşitul zilei. Vă arată câți bani ați încasat, cum s-a plătit și ce diferență există față de ce ar trebui să fie în sertar.",
    publishedAt: "2026-06-23",
    locale: "ro",
    tags: ["raport-z", "pos", "inchidere-zi"],
    image: "/marketing/reports-zreport.png",
    relatedFeature: "/features/z-report",
    sections: [
      {
        heading: "Ce este Raportul Z?",
        body: "Raportul Z (sau raportul de închidere a casei) este documentul generat la sfârşitul fiecărei zile de lucru. Arată totalul vânzărilor, defalcarea pe metode de plată (numerar, card, online) și TVA-ul colectat. Numele vine de la litera Z care, în terminologia fiscală clasică, marca sfârşitul unui ciclu de raportare pe casele de marcat electronice.\n\nPentru o cafenea sau un restaurant, raportul Z este echivalentul unui bilanț zilnic: știți exact câți bani ar trebui să fie în sertar, câți au intrat pe card și dacă cifrele se potrivesc cu ce a vândut personalul în cursul zilei.",
      },
      {
        heading: "Ce trebuie să conțină un Raport Z corect?",
        body: "Un raport Z complet include:\n\n- **Total tranzacții** — numărul de vânzări din ziua respectivă\n- **Vânzări nete** — valoarea totală fără reduceri sau anulări\n- **Defalcare pe metode de plată** — numerar, card, online separat\n- **TVA colectat** — defalcat pe cote (21%, 11%, 0%)\n- **Vânzări brute** — totalul inclusiv TVA\n- **Numerar așteptat vs. numărat** — diferența față de fondul de deschidere plus încasări cash\n\nÎn franchisetech, aceste câmpuri sunt calculate automat din sesiunea POS. Nu introduceți nimic manual — sistemul agregă fiecare tranzacție înregistrată în ziua respectivă.",
      },
      {
        heading: "Cum îl faceți în franchisetech",
        body: "La finalul zilei, mergeți la **Rapoarte → Raport Z zilnic**. Alegeți data și apăsați Încarcă. Raportul se generează instant din datele sesiunii POS.\n\nDe acolo puteți:\n- **Tipări** raportul pentru dosar\n- **Descărca Registrul de casă** — documentul legal cu toate mișcările de numerar din ziua respectivă\n- Verificați diferența numerar (câți bani ar trebui să fie vs. câți sunt)\n\nDacă numerarul așteptat nu se potrivește cu ce numărați în sertar, raportul vă arată exact de unde vine diferența.",
      },
      {
        heading: "Cât de des trebuie generat?",
        body: "Zilnic, la finalul fiecărei ture sau la închiderea locației. Bune practici:\n\n- Generați raportul Z înainte de a scoate numerarul din sertar\n- Numărați banii fizic și comparați cu totalul așteptat din raport\n- Dacă există diferențe, notați motivul (rest dat incorect, corecție, etc.)\n- Arhivați o copie tipărită sau PDF pentru contabil\n\nContabilii și inspectorii fiscali pot solicita rapoartele Z pentru orice perioadă. franchisetech le păstrează pe server și le puteți descărca oricând.",
      },
      {
        heading: "Diferența față de Registrul de casă",
        body: "Raportul Z și Registrul de casă sunt documente diferite, deși legate:\n\n**Raportul Z** — sumarul zilei: vânzări totale, defalcare plăți, TVA.\n\n**Registrul de casă** — jurnalul cronologic al tuturor mișcărilor de numerar: fond de deschidere, fiecare încasare, restul dat, ieșiri de numerar (plata furnizori din casă etc.), sold final.\n\nÎn franchisetech, Registrul de casă se descarcă direct de pe pagina Raportului Z, butoanele apar alături — nu trebuie să căutați în altă parte.",
      },
    ],
  },
  {
    slug: "cum-faci-nir-in-romania-fara-excel",
    title: "Cum faceți NIR-ul în România fără Excel",
    description:
      "NIR (Nota de Intrare-Recepție) este documentul standard la primirea mărfii de la furnizori — obligatoriu prin lege în anumite situații, recomandat practic în restul cazurilor. Iată exact când este obligatoriu, ce trebuie să conțină și cum îl generați din programul de gestiune.",
    publishedAt: "2026-06-23",
    locale: "ro",
    tags: ["nir", "achizitii", "furnizori", "contabilitate"],
    image: "/marketing/pos-hero.png",
    sections: [
      {
        heading: "Ce este NIR-ul?",
        body: "NIR (Nota de Intrare-Recepție) este documentul care atestă că o marfă a fost primită la locul de depozitare sau de consum. Este documentul de recepție care justifică intrarea mărfii în gestiune și servește ca bază pentru înregistrarea achizițiilor în contabilitate — deși, legal, nu este singurul document acceptat pentru asta (vedeți secțiunea următoare despre când e strict obligatoriu).\n\nÎn practică, dacă nu țineți NIR pentru marfa recepționată, gestiunea dumneavoastră de stoc depinde exclusiv de facturi și avize răzlețe, greu de corelat ulterior cu ce s-a vândut sau consumat. Orice ieșire ulterioară (prin vânzare sau consum) devine mult mai greu de justificat documentar față de un inspector, chiar dacă legea nu cere NIR pentru chiar fiecare recepție.",
      },
      {
        heading: "Când este obligatoriu?",
        body: "Strict conform normelor contabile românești (OMFP 2634/2015), formularul de NIR (cod 14-3-1A) este document de recepție obligatoriu doar în anumite situații specifice: marfa cumpărată de la persoane fizice, marfa primită fără documente de însoțire, marfa care prezintă diferențe cantitative sau calitative la recepție, marfa primită spre prelucrare/custodie/păstrare, marfa care intră în gestiuni evidențiate la preț de vânzare, sau marfa dintr-o factură/aviz care se împarte pe mai multe gestiuni. În restul cazurilor, recepția și înregistrarea în contabilitate se pot face direct pe baza facturii sau avizului de însoțire, fără NIR separat.\n\nÎn practică, în HoReCa aceste cazuri \"obligatorii\" apar frecvent — marfă de la un producător local fără factură la livrare, o cantitate primită diferă de cea din aviz, un ambalaj lipsă la recepție. Dar chiar și acolo unde legea strictă nu cere NIR, majoritatea afacerilor cu stoc de gestionat (rețete, materii prime perisabile) fac NIR pentru fiecare recepție oricum — nu pentru că legea obligă în fiecare caz, ci pentru că altfel gestiunea de stoc nu mai poate fi verificată corect intern și la un eventual control. Verificați cu contabilul dumneavoastră dacă situația dumneavoastră specifică se încadrează la NIR obligatoriu sau dacă factura/avizul e suficient, mai ales dacă doriți să simplificați fluxul administrativ.\n\nCazuri frecvente în HoReCa unde NIR-ul e util, indiferent de strict-obligatoriu:\n- Livrare cafea de la torrefactore\n- Aprovizionare lapte, zahăr, materiale de curățenie\n- Primire alimente de la distribuitor\n- Achiziție ambalaje sau consumabile",
      },
      {
        heading: "Ce date trebuie să conțină?",
        body: "Un NIR complet include:\n\n- Numărul documentului (generat secvențial)\n- Data recepției\n- Furnizorul (nume, CIF)\n- Referința facturii sau avizului de expediție\n- Lista produselor: denumire, unitate de măsură, cantitate, preț unitar, valoare totală\n- TVA aferentă\n- Semnătura responsabilului de gestiune\n\nDin punct de vedere practic, cel mai important este că prețul din NIR să coincidă cu cel din factură și că produsele listate să fie cele efectiv primite — verificare cantitativă și calitativă la recepție.",
      },
      {
        heading: "Cum îl faceți în franchisetech",
        body: "În franchisetech, NIR-ul se creează din **Stoc → Cumpărături / NIR → NIR nou**.\n\n1. Selectați furnizorul (sau adăugați unul nou)\n2. Introduceți referința facturii\n3. Adăugați produsele primite cu cantitate și preț unitar\n4. Apăsați **Emite NIR** — stocul se actualizează automat\n\nCâtă vreme aveți NIR în stadiul de Ciornă, stocul NU se modifică. Abia după emitere, produsele intră în gestiune și apar în rapoartele de stoc.\n\nDupă emitere, NIR-ul apare în istoricul cumpărăturilor și poate fi exportat pentru contabil (CSV sau inclus în exportul Saga XML).",
      },
      {
        heading: "NIR vs. factură — care e diferența?",
        body: "Factura vine de la furnizor și atestă obligația de plată. NIR-ul vine de la dumneavoastră și atestă că ați primit marfa.\n\nPot să nu coincidă: puteți primi marfa fără factură (aviz de expediție) sau puteți primi factura înainte de marfă. În ambele cazuri, NIR-ul se face la data fizică a recepției.\n\nÎn practică, contabilii cer ambele documente pereche: factură + NIR aferent, pentru fiecare intrare în gestiune.",
      },
    ],
  },
  {
    slug: "cum-calculezi-costul-unei-retete-cafenea",
    title: "Cum calculați costul unei rețete pentru cafenea",
    description:
      "Costul rețetei vă arată cât cheltuiți efectiv pentru a prepara un produs. Fără el, nu știți dacă vindeți în pierdere sau în profit. Iată cum se calculează și ce marjă este considerată sănătoasă.",
    publishedAt: "2026-06-23",
    locale: "ro",
    tags: ["retete", "cost-reteta", "marja", "menu-engineering"],
    image: "/marketing/recipe-costing-hero.png",
    sections: [
      {
        heading: "De ce contează costul rețetei?",
        body: "Mulți proprietari de cafenele setează prețul pe baza a ceea ce cer competitorii sau pe instinct. Problema: nu știți dacă faceți profit sau pierdeți bani la fiecare produs vândut.\n\nCostul rețetei vă arată exact câți lei cheltuiți pe ingrediente pentru un cappuccino, un smoothie sau un croissant. Diferența dintre prețul de vânzare și costul ingredientelor este marja brută — și aceasta este cifra pe care o urmăriți.",
      },
      {
        heading: "Formula de calcul",
        body: "Costul rețetei = Σ (cantitate ingredient × preț unitar ingredient)\n\nMarja brută = Preț vânzare − Cost rețetă\n\nProcentaj marjă = (Marjă brută / Preț vânzare) × 100\n\nExemplu pentru un cappuccino:\n- Espresso (7g cafea): 7g × 80 lei/kg = 0.56 lei\n- Lapte (150ml): 150ml × 6 lei/l = 0.90 lei\n- Pahar + capac: 0.35 lei\n- **Cost total: 1.81 lei**\n\nDacă vindeți cappuccinoul cu 12 lei:\n- Marjă brută: 12 − 1.81 = 10.19 lei\n- Procentaj marjă: 84.9%",
      },
      {
        heading: "Ce procent de marjă este normal în HoReCa?",
        body: "În industria cafelei și a băuturilor, o marjă brută de 65–80% pe ingrediente este considerată normală. Aceasta NU înseamnă profit net — din marjă mai scădeți chiria, salariile, utilitățile, amortizarea echipamentelor.\n\nOrientativ:\n- **Cafea (espresso, cappuccino):** 75–85% marjă pe ingrediente ✓\n- **Smoothie-uri, sucuri fresh:** 60–75% ✓\n- **Mâncare gătită (sendvișuri, salate):** 55–70% ✓\n- **Sub 50% marjă pe ingrediente** — revizuiți prețul sau rețeta\n\nAtentie: marja pe ingrediente nu include forța de muncă. Un cocktail care durează 5 minute să fie preparat are un cost real mai mare decât un espresso care durează 30 de secunde.",
      },
      {
        heading: "Cum introduceți rețetele în franchisetech",
        body: "Din meniul **Rețete**, apăsați **Creează rețetă**:\n\n1. Selectați produsul (din lista de produse POS)\n2. Adăugați ingredientele cu cantitățile per porție\n3. Salvați rețeta\n\nSistemul calculează automat costul per porție pe baza prețurilor din stoc (introduse la NIR sau la inventariere). Dacă prețul unui ingredient se schimbă la o aprovizionare ulterioară, costul rețetei se recalculează automat.\n\nLista de rețete afișează pentru fiecare produs: preț vânzare, cost/porție, marjă și câte porții puteți produce cu stocul actual.",
      },
      {
        heading: "Ce faceți cu produsele cu marjă negativă?",
        body: "Dacă un produs apare cu marjă negativă (roșu în aplicație), costul ingredientelor depășește prețul de vânzare. Soluții:\n\n1. **Verificați prețul ingredientelor** — poate s-a introdus un preț greșit la ultimul NIR\n2. **Revizuiți cantitățile din rețetă** — poate porțiile sunt prea mari\n3. **Creșteți prețul de vânzare** — dacă piața permite\n4. **Înlocuiți ingredientul** — alternative mai ieftine cu calitate similară\n\nUn produs cu marjă negativă vândut în volum mare poate nega profitul întregii zile. Identificați-l devreme din lista de rețete.",
      },
    ],
  },
  {
    slug: "bon-de-consum-restaurant-ce-este",
    title: "Bon de consum pentru restaurant — ce este și cum îl generați",
    description:
      "Bonul de consum documentează materiile prime consumate din gestiune pentru producție. Este obligatoriu când aveți rețete și stoc gestionat. Iată ce trebuie să conțină și cum îl generați automat.",
    publishedAt: "2026-06-23",
    locale: "ro",
    tags: ["bon-de-consum", "contabilitate", "stoc", "retete"],
    image: "/marketing/reports-zreport.png",
    sections: [
      {
        heading: "Ce este bonul de consum?",
        body: "Bonul de consum (sau nota de consum) este documentul contabil care justifică ieșirea materiilor prime din gestiune prin consum în procesul de producție. Spre deosebire de o vânzare (care generează bon fiscal), consumul de ingrediente pentru prepararea unui produs nu generează bon fiscal — el se documentează prin bonul de consum.\n\nExemplu: vindeți un cappuccino. Clientul primește bonul fiscal. Dar cafeaua, laptele și paharul ieșite din stoc sunt documentate printr-un bon de consum, nu printr-un bon fiscal.",
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
        body: "franchisetech generează automat bonul de consum din datele de vânzări și rețete.\n\nLogica:\n1. La fiecare vânzare dintr-un produs cu rețetă, sistemul înregistrează consumul de ingrediente\n2. La finalul perioadei, mergeți la **Rapoarte → Bon de consum**\n3. Selectați intervalul de date\n4. Descărcați documentul — conține toate materiile prime consumate, cantitățile și valorile\n\nNu introduceți nimic manual. Dacă aveți rețetele configurate corect și ați înregistrat vânzările prin POS, bonul de consum se generează singur.",
      },
      {
        heading: "Legătura cu Balanța cantitativ-valorică",
        body: "Bonul de consum alimentează Balanța cantitativ-valorică: ieșirile din consum apar ca ieșiri în balanță, alături de ieșirile din vânzări directe.\n\nContabilul dumneavoastră are nevoie de ambele documente pentru a verifica că stocul final calculat corespunde cu inventarul fizic. Dacă bonul de consum lipsește sau este incomplet, apar discrepanțe în balanță care trebuie explicate.\n\nDin franchisetech, ambele rapoarte se descarcă din aceeași secțiune Rapoarte — nu trebuie să căutați în aplicații separate.",
      },
    ],
  },
  {
    slug: "export-saga-din-program-gestiune-restaurant",
    title: "Cum exportați datele în Saga din programul de gestiune",
    description:
      "Exportul Saga XML permite transferul automat al datelor de vânzări și NIR din franchisetech în software-ul de contabilitate Saga. Eliminați introducerea manuală și erorile de transcriere.",
    publishedAt: "2026-06-23",
    locale: "ro",
    tags: ["saga", "export-contabil", "contabilitate", "nir"],
    image: "/marketing/reports-zreport.png",
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
        heading: "Cum faceți exportul pas cu pas",
        body: "1. Du-vă la **Rapoarte → Export audit & Saga**\n2. Selectați perioada (de obicei lunar, în concordanță cu declarațiile fiscale)\n3. Alegeți tipul de export: NIR, Vânzări sau Combinat\n4. Apăsați **Exportați XML**\n5. Salvați fișierul și trimiteți-l contabilului dumneavoastră\n\nContabilul importă fișierul direct în Saga: **Fișier → Import → Documente externe**. Datele apar automat în jurnalele de cumpărări și vânzări.",
      },
      {
        heading: "Condiții pentru un export corect",
        body: "Exportul Saga este fiabil doar dacă datele din franchisetech sunt corecte:\n\n- **NIR complet:** Toate achizițiile trebuie introduse cu furnizori și prețuri corecte\n- **Produse cu TVA configurat:** Cota TVA per produs trebuie setată corect în Setări → Produse\n- **Vânzări înregistrate prin POS:** Exportul preia datele din sesiunile POS, nu din estimări\n- **Periode fără lipsuri:** Dacă aveți zile fără raport Z generat, exportul va reflecta acele lipsuri\n\nVerificați înainte de export că toate NIR-urile perioadei au statusul \"NIR emis\" (nu Ciornă) și că rapoartele Z sunt complete pentru fiecare zi lucrătoare.",
      },
      {
        heading: "Ce câștigă contabilul dumneavoastră?",
        body: "Un contabil care primește export Saga din franchisetech vs. extrase manuale sau Excel:\n\n- **Eliminarea transcrierilor** — nu mai copiază date dintr-un sistem în altul\n- **Reducerea erorilor** — valorile, TVA-ul și furnizorii sunt preluate automat\n- **Timp mai puțin** — un import de o lună de date durează minute, nu ore\n- **Auditabilitate** — fiecare document importat are referință la sursa din franchisetech\n\nPentru afacerile care lucrează cu contabili externi, exportul Saga devine argumentul prin care explicați de ce programul de gestiune plătit se justifică financiar.",
      },
    ],
  },
  {
    slug: "diferenta-dintre-ebriza-si-franchisetech-pret-real",
    title: "Ebriza vs Franchisetech — prețul real pe care îl plătiți în fiecare lună",
    description:
      "Ebriza afișează €49/lună. Ce plătiți de fapt: POS + stoc + KDS + Saga = €107+/lună. Comparație completă Ebriza vs Franchisetech pentru cafenele și restaurante din România.",
    publishedAt: "2026-06-23",
    locale: "ro",
    tags: ["comparatie", "preturi", "ebriza"],
    relatedFeature: "/compare/ebriza",
    sections: [
      {
        heading: "Ce afișează Ebriza și ce plătiți de fapt",
        body: "Ebriza are două planuri afișate: Pro la €49/lună și Premium la €99/lună. Problema nu este prețul de bază — este ce nu este inclus în el.\n\nUn restaurant sau cafenea care are nevoie de POS, gestiune stoc, ecran bucătărie (KDS) și export Saga pentru contabil ajunge la un cost real de €107–157/lună pe Ebriza, nu €49.\n\nIată defalcarea:\n\n- **Ebriza Pro** (POS + rapoarte de bază): €49/lună\n- **Stoc + NIR + rețete**: incluse doar din planul Premium, adică +€50/lună față de Pro\n- **Ecran bucătărie (KDS)**: modul separat, +€19/lună\n- **Export Saga pentru contabil**: modul separat, +€39/lună\n\n**Total pentru o cafenea care vrea POS + stoc + KDS + Saga:**\n- Pe Ebriza Pro + add-on-uri: **€107/lună**\n- Pe Ebriza Premium + add-on-uri: **€157/lună**",
      },
      {
        heading: "Ce include Franchisetech Pro la €79/lună",
        body: "Franchisetech Pro costă €79/lună. Ce este inclus fără niciun supliment:\n\n- **POS complet** cu mod offline (funcționează fără internet, sincronizare automată la reconectare)\n- **Gestiune stoc + NIR** (notă de intrare-recepție, actualizare automată la recepție marfă)\n- **Calculator rețete** cu cost per porție și marjă brută per produs\n- **Raport Z zilnic**, raport TVA, raport gestiune\n- **Bon de consum**, Balanță cantitativ-valorică\n- **Export Saga XML** pentru contabil\n- **Personal nelimitat** — nicio taxă per casier, ospătar sau manager\n\nNu există module separate de plătit pentru funcționalitățile de bază ale unei cafenele mici din România.",
      },
      {
        heading: "Comparație directă — cost lunar real pentru o cafenea medie",
        body: "Scenariul concret: o cafenea cu 2 casieri, gestiune stoc lunară, export lunar Saga pentru contabil, ecran în bar pentru preparare.\n\n**Ebriza Pro cu add-on-urile necesare:**\n- Ebriza Pro: €49\n- KDS (ecran bucătărie): +€19\n- Export Saga: +€39\n- **Total: €107/lună**\n\n**Franchisetech Pro:**\n- €79/lună — totul inclus\n\n**Diferența: €28/lună = €336/an.** Pe doi ani: €672 în plus pentru aceleași funcționalități.\n\n**Ebriza Premium cu add-on-urile necesare:**\n- Ebriza Premium: €99\n- KDS: +€19\n- Export Saga: +€39\n- **Total: €157/lună**\n\nVersus Franchisetech Pro €79: diferența este €78/lună = **€936/an**.",
      },
      {
        heading: "Ce oferă Ebriza în plus față de Franchisetech",
        body: "Comparația corectă înseamnă să recunoaștem și ce oferă Ebriza în plus.\n\nEbriza are mai multă experiență pe piața din România și o bază de clienți mai mare. Dacă aveți nevoie de:\n\n- **Integrare cu platforme de delivery** (Glovo, Bolt Food) direct din POS\n- **Gestiune mese cu ospătari pe tabletă** (comandă la masă, split bill)\n- **Loializare clienți** (carduri de fidelitate, puncte)\n\n...atunci Ebriza sau alte soluții pot fi mai potrivite.\n\nFranchisetech nu are încă gestiunea meselor pentru ospătari, integrare directă cu platformele de delivery sau un modul de loializare.\n\nDacă aceste funcționalități sunt esențiale pentru dumneavoastră acum, analizează toate opțiunile disponibile. Dacă operați o cafenea sau un restaurant unde POS-ul, stocul, rețetele și rapoartele pentru contabil sunt prioritatea — prețul Franchisetech include totul fără calcule suplimentare.",
      },
      {
        heading: "Cum testați înainte să decideți",
        body: "Verificați condițiile de testare ale fiecărei platforme. La franchisetech, trialul de 15 zile începe de la crearea contului, fără card; configurarea ghidată în aplicație este inclusă.\n\nTestul corect pe orice platformă POS:\n\n1. Configurați produsele reale (nu demo) cu prețurile dumneavoastră\n2. Faceți câteva vânzări numerar + card\n3. Închideți ziua (raport Z) și comparați numerarul din sertar cu ce arată sistemul\n4. Înregistrați o recepție de marfă (NIR) de la un furnizor real\n5. Exportați datele pentru contabil și trimiteți-i fișierul\n\nDacă fluxul dumneavoastră zilnic funcționează fără probleme în trial — sistemul e potrivit. Dacă dați de blocaje sau aveți nevoie de suport pentru pași de bază, ia asta ca semnal.",
      },
    ],
  },
  {
    slug: "cum-alegi-un-soft-pos-pentru-cafenea-mica",
    title: "Cum alegeți un soft POS pentru o cafenea mică — fără să plătiți în plus pentru ce nu folosiți",
    description:
      "Ghid practic pentru alegerea unui sistem POS pentru cafenele mici și mijlocii din România: ce funcționalități contează, ce puteți amâna și cât costă real în 2026.",
    publishedAt: "2026-06-23",
    locale: "ro",
    tags: ["pos", "comparatie", "cafenea"],
    relatedFeature: "/features/pos",
    sections: [
      {
        heading: "Ce are nevoie o cafenea mică de la un POS",
        body: "Ghidurile de tip «cum alegi un sistem POS» sunt scrise de obicei pentru restaurante mari cu ospătari, mese numerotate și integrare cu platforme de delivery. Dacă aveți o cafenea mică sau un bar cu 2–5 produse principale, nevoile dumneavoastră sunt diferite.\n\nCe contează cu adevărat pentru o cafenea mică:\n\n- **Viteza la casă** — deschideți aplicația, apăsați produs, încasați. Fără pași inutili\n- **Funcționare offline** — dacă internetul cade, vânzările nu se opresc\n- **Raportul Z zilnic** — știți la final de zi câți bani ar trebui să fie în sertar\n- **Gestiunea stocului de bază** — câtă cafea, lapte și sirop mai aveți\n- **Prețul lunar predictibil** — fără surprize la factură din add-on-uri\n\nCe puteți amâna sau ignora complet la o cafenea mică: gestiune mese cu ospătari, integrare delivery, loializare, kiosk self-service.",
      },
      {
        heading: "Trei întrebări înainte să alegeți",
        body: "**1. Funcționează offline?**\nInternetul cade. Furnizorii de conexiune au probleme. Un sistem POS care se blochează când nu are internet vă lasă fără vânzări. Întrebați explicit: ce se întâmplă dacă internetul cade 30 de minute? Se salvează vânzările local? Se sincronizează automat la reconectare?\n\n**2. Cât costă lunar total — cu tot ce-mi trebuie?**\nAfișajul de pe site este deseori prețul de bază. Verificați dacă stocul, exportul pentru contabil și ecranul de preparare sunt incluse sau sunt module separate. Un preț de €49 care devine €107 cu add-on-urile necesare înseamnă €49 marketing, nu €49 produs.\n\n**3. Pot să îl configurez singur în 1–2 ore?**\nDacă aveți nevoie de o echipă de implementare pentru a introduce produsele și a deschide prima casă, acesta e un semnal că sistemul e construit pentru restaurante mari, nu pentru dumneavoastră.",
      },
      {
        heading: "Ce module sunt esențiale vs ce puteți adăuga mai târziu",
        body: "**Esențiale de la prima zi:**\n\n- POS cu listare produse și încasare numerar/card\n- Raport Z (închidere zi, reconciliere numerar)\n- NIR — notă de intrare-recepție pentru marfa primită de la furnizori\n- Export date pentru contabil (Saga XML sau CSV)\n\n**Puteți adăuga după ce vă intrați în ritm:**\n\n- Calculator rețete cu cost per porție (util după 2–4 săptămâni de funcționare)\n- Alerte de stoc minim\n- Ecran bucătărie (KDS) — dacă aveți preparare separată\n\n**Puteți ignora complet (pentru cafenele mici):**\n\n- Gestiune mese cu ospătari\n- Loializare clienți cu carduri\n- Integrare platforme de delivery",
      },
      {
        heading: "Prețuri reale în 2026 pentru cafenele mici",
        body: "Prețurile afișate public pentru soluțiile uzuale din România:\n\n- **Noxta**: plan gratuit cu funcționalități limitate; planul complet ~€25–30/lună\n- **Franchisetech Core**: €49/lună — POS, raport Z, rapoarte vânzări, personal nelimitat\n- **Franchisetech Operations**: €79/lună — adăugați stoc, rețete și export Saga\n- **Franchisetech Scale**: €109/lună — tot ce include Operations + suport prioritar\n- **Ebriza Pro**: €49/lună bază, dar stocul, KDS și Saga sunt add-on-uri separate care duc totalul la €107+/lună\n- **RezoSoft**: ~600 lei taxă instalare + 75 lei/lună; soluție locală, nu cloud\n\nPentru o cafenea mică care vrea stoc + export Saga inclus fără calcule, planul Operations la €79/lună este cel mai predictibil din punct de vedere al costului total lunar.",
      },
      {
        heading: "Cum testați corect în trial",
        body: "Orice sistem POS vă va părea bun dacă îl testați cu produse demo și scenarii simple. Testul real:\n\n1. Adăugați produsele dumneavoastră reale cu prețurile și cotele TVA corecte\n2. Faceți 10 vânzări — mix numerar și card\n3. Înregistrați o recepție de marfă (NIR) de la furnizorul dumneavoastră de cafea\n4. Închideți ziua și numărați sertarul — comparați cu ce arată raportul Z\n5. Exportați datele și trimiteți-le contabilului dumneavoastră să confirme că poate importa în Saga\n\nDacă toți cei 5 pași funcționează fără să sunați la suport — ați găsit sistemul potrivit.\n\nfranchisetech oferă trial 15 zile de la crearea contului, fără card și configurare ghidată în aplicație.",
      },
    ],
  },
  {
    slug: "inchidere-zi-cafenea-cum-faci-corect",
    title: "Închiderea zilei la cafenea — ce trebuie să faceți înainte să plecați acasă",
    description:
      "Ghid complet pentru închiderea corectă a zilei la cafenea sau restaurant: raport Z, numărarea sertarului, reconciliere numerar/card și arhivare. Ce se întâmplă dacă săriți pași.",
    publishedAt: "2026-06-23",
    locale: "ro",
    tags: ["operatiuni", "inchidere-zi", "raport-z"],
    relatedFeature: "/features/z-report",
    sections: [
      {
        heading: "De ce contează închiderea zilei",
        body: "Majoritatea problemelor contabile dintr-o cafenea sau restaurant nu apar la control fiscal — apar zi de zi, când sertarul nu se potrivește cu ce arată sistemul și nimeni nu știe de ce.\n\nDacă la finalul zilei aveți 50 de lei mai puțin decât ar trebui sau 30 de lei în plus, și nu înregistrați diferența și nu o investigați, la finalul lunii aveți o sumă pe care contabilul nu o poate explica.\n\nÎnchiderea corectă a zilei durează 5–10 minute. Săritul ei creează probleme care durează ore să fie rezolvate ulterior.",
      },
      {
        heading: "Pașii în ordine — de la ultima vânzare la ușa închisă",
        body: "**1. Ultima vânzare înregistrată în sistem**\nNu închideți casa dacă mai aveți clienți de servit. Toate vânzările din ziua respectivă trebuie să fie în sistem înainte de a genera raportul Z.\n\n**2. Generați Raportul Z**\nDin aplicația POS, secțiunea Rapoarte → Raport Z zilnic. Selectați data de azi. Sistemul calculează totalul vânzărilor, defalcarea pe numerar și card, TVA-ul colectat.\n\n**3. Numărați sertarul**\nNumărați fizic tot numerarul din sertar. Scădeți fondul de deschidere (suma cu care ați început ziua). Ce rămâne este numerarul din vânzări.\n\n**4. Comparați cu raportul Z**\nRaportul Z vă arată cât numerar ar trebui să fie în vânzări. Dacă numărul din sertar ≠ numărul din sistem — investigați înainte de a arhiva.\n\n**5. Notați diferența (dacă există)**\nRest dat greșit, corecție de preț, vânzare anulată — orice explicație trebuie notată. Fără notă, diferența rămâne inexplicabilă la control.\n\n**6. Arhivați raportul Z**\nSalvați sau tipăriți raportul Z. Unii contabili cer copia fizică, alții acceptă PDF. Franchisetech păstrează toate rapoartele Z pe server — le puteți descărca oricând.",
      },
      {
        heading: "Ce se întâmplă dacă săriți peste raportul Z",
        body: "Raportul Z nu este opțional dacă operați o casă de marcat fiscală. ANAF poate solicita la control rapoartele Z pentru orice perioadă.\n\nDacă raportul Z lipsește pentru o zi:\n\n- Nu puteți demonstra că vânzările din ziua respectivă au fost înregistrate fiscal\n- Contabilul nu poate justifica veniturile din ziua respectivă\n- La control fiscal, zilele fără raport Z sunt tratate ca zile fără înregistrare fiscală — amendă\n\nDin punct de vedere practic: fără raport Z, numerarul din sertar nu are o origine documentată. Asta e o problemă mai mare decât diferența de 20 de lei pe care voiai să o lăsați pentru mâine.",
      },
      {
        heading: "Cum se face în Franchisetech",
        body: "La finalul zilei, secțiunea **Rapoarte → Raport Z zilnic**:\n\n1. Selectați data\n2. Apăsați Încarcă — raportul se generează instant din datele sesiunii POS\n3. Verificați: total vânzări, numerar așteptat, card total, TVA\n4. Dați click pe **Descarcă Registru de casă** — documentul legal cu toate mișcările de numerar\n5. Opțional: tipăriți sau trimiteți PDF contabilului\n\nFranchisetech arhivează automat fiecare raport Z. Dacă contabilul sau inspectorul solicită raportul Z din 14 octombrie — îl găsiți în 30 de secunde.",
      },
      {
        heading: "Lista de verificare la final de zi",
        body: "Printați sau salvați această listă și puneți-o la casa de marcat:\n\n- [ ] Toate vânzările din ziua de azi sunt înregistrate în sistem\n- [ ] Raportul Z a fost generat pentru data de azi\n- [ ] Sertarul a fost numărat și comparat cu totalul din raportul Z\n- [ ] Diferența (dacă există) a fost notată cu explicație\n- [ ] Registrul de casă a fost descărcat sau tipărit\n- [ ] Numerarul de depus a fost pus la loc sigur\n- [ ] Fondul de deschidere pentru mâine a rămas în sertar\n\nDacă toate cele 7 puncte sunt bifate — puteți pleca acasă liniștit.",
      },
    ],
  },
  {
    slug: "cum-calculezi-marja-bruta-produs-restaurant",
    title: "Cum calculați marja brută pentru un produs din meniu — cu exemple reale",
    description:
      "Formula completă pentru calculul marjei brute în HoReCa, cu exemple reale: flat white, espresso, burger. Ce procent de marjă este normal și cum calculați automat pentru tot meniul.",
    publishedAt: "2026-06-23",
    locale: "ro",
    tags: ["marja", "retete", "cost-reteta"],
    sections: [
      {
        heading: "Ce este marja brută și de ce e diferită de profit",
        body: "Marja brută măsoară cât din prețul de vânzare rămâne după ce scădeți costul ingredientelor. Nu include chiria, salariile sau utilitățile — doar materiile prime.\n\n**Formula:**\n- Marjă brută = Preț vânzare − Cost ingrediente\n- Procent marjă = (Marjă brută / Preț vânzare) × 100\n\nDe ce e importantă dacă nu e profitul net? Pentru că marja brută pe ingrediente este singurul număr pe care îl puteți controla direct la nivel de produs. Chiria e fixă. Salariile sunt relativ fixe. Dar costul ingredientelor per porție poate fi optimizat produs cu produs.\n\nUn produs cu marjă brută de 30% e un produs care contribuie puțin la acoperirea costurilor fixe. Un produs cu marjă brută de 80% contribuie mult. Dacă nu știți care e care — vindeți fără să știți ce vă aduce bani.",
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
        heading: "De ce marja brută 85% pe cafea nu înseamnă că sunteți profitabil",
        body: "Asta e greșeala clasică: proprietarul vede 85% marjă pe cafea și crede că afacerea merge bine. Dar marja brută acoperă doar ingredientele.\n\nCe mai trebuie acoperit din acei 12.76 RON per flat white:\n\n- **Chirie**: dacă plătiți 3.000 EUR/lună și vindeți 1.500 cafele pe lună → 2 EUR (≈10 RON) per cafea\n- **Salarii**: dacă aveți 2 baristi cu salariu net 3.500 RON fiecare și vindeți 1.500 cafele → ≈4.67 RON per cafea\n- **Utilități, consumabile, echipamente**: 1–2 RON per cafea\n\nTotal costuri fixe per cafea: ≈15–17 RON. Marja brută per cafea: 12.76 RON.\n\n**La acest volum și la aceste costuri fixe, fiecare flat white vândut la 15 RON generează pierdere.**\n\nSoluții: creșteți prețul, creșteți volumul, reduceți costurile fixe — sau combinați toate trei. Dar fără marja brută calculată corect, nu știți nici de unde să începeți.",
      },
      {
        heading: "Cum calculați automat pentru toate produsele din meniu",
        body: "Calculul manual este util pentru înțelegere, dar devine imposibil de menținut când meniul are 30–50 de produse și prețurile ingredientelor se schimbă lunar.\n\nÎn Franchisetech, calculul marjei brute este automat:\n\n1. **Configurați rețetele** — pentru fiecare produs POS, adăugați ingredientele și cantitățile per porție\n2. **Prețurile vin din NIR** — de fiecare dată când înregistrați o recepție de marfă cu prețul nou, costul rețetelor se actualizează automat\n3. **Lista de rețete afișează per produs**: preț vânzare, cost porție, marjă brută în RON, procent marjă\n4. **Produsele cu marjă negativă** (costul depășește prețul de vânzare) apar marcate — nu le puteți scăpa din vedere\n\nCând furnizorul de lapte vă mărește prețul cu 10%, nu mai calculați manual pentru fiecare produs care conține lapte. Actualizați prețul în NIR și toate rețetele se recalculează automat.",
      },
    ],
  },
  {
    slug: "amenzi-control-fiscal-horeca-cele-mai-frecvente",
    title: "Cele mai frecvente amenzi la control fiscal în HoReCa și cum le evitați",
    description:
      "Cele mai frecvente abateri găsite la controalele fiscale în cafenele și restaurante — bon neemis, stoc neconciliat, sertar neexplicat — și cum le preveniți înainte să ajungă amendă.",
    publishedAt: "2026-06-05",
    locale: "ro",
    tags: ["fiscal","control-anaf","amenzi"],
    image: "/marketing/hero-casa-marcat.jpg",
    sections: [
      {
        heading: "Neemiterea bonului fiscal",
        body: "Cea mai frecventă abatere găsită la control în HoReCa. Apare de obicei la vânzări rapide, cash, «pe repede» — un cappuccino la plecare, o comandă dată «pe gratis» unui prieten, un produs oferit fără să treacă prin casă. Fiecare astfel de tranzacție neînregistrată este, din perspectiva inspectorului, o vânzare fără bon fiscal.\n\nProblema nu e doar amenda pentru bonul lipsă — e că, dacă inspectorul găsește un tipar (mai multe astfel de cazuri), poate extinde verificarea pe o perioadă mai lungă, presupunând că fenomenul se repetă.",
      },
      {
        heading: "Afișajul de prețuri diferit de ce se încasează la casă",
        body: "Meniul afișat clienților trebuie să corespundă exact cu prețurile din sistemul de casă. Dacă ați scumpit un produs și ați actualizat POS-ul dar nu și meniul tipărit (sau invers), inspectorul poate constata neconcordanța chiar dacă TVA-ul e calculat corect.\n\nAsta e o greșeală ușor de evitat administrativ, dar frecventă la afacerile care schimbă prețurile des fără un proces clar: cine actualizează meniul, cine actualizează POS-ul, și în ce ordine.",
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
        heading: "Cum evitați majoritatea acestor amenzi",
        body: "Toate cele patru abateri de mai sus au o rădăcină comună: date incomplete sau inconsistente între ce se întâmplă fizic în locație și ce apare în sistem. Un flux simplu reduce riscul semnificativ:\n\n- Fiecare vânzare trece prin POS, fără excepții «doar de data asta»\n- Fiecare marfă primită are NIR emis în aceeași zi\n- Raportul Z se generează zilnic și diferențele de numerar se notați imediat\n- Prețurile se actualizează simultan în meniu și în POS\n\nÎn franchisetech, rapoartele Z, NIR-urile și exporturile pentru contabil se păstrează automat pe server — dacă un inspector cere documentele unei perioade, le găsiți în câteva secunde, nu le reconstitui din memorie.",
      },
    ],
  },
  {
    slug: "bon-fiscal-obligatoriu-cand-si-cum",
    title: "Când sunteți obligat să emiteți bon fiscal și ce se întâmplă dacă nu o faceți",
    description:
      "Bonul fiscal rămâne obligatoriu la orice încasare cash de la o persoană fizică, iar din 2024 regula s-a schimbat pentru plata cu cardul. Iată exact când se aplică regula și ce riscați dacă săriți peste ea.",
    publishedAt: "2026-06-05",
    locale: "ro",
    tags: ["fiscal","bon-fiscal","conformitate"],
    image: "/marketing/pos-hero.png",
    relatedFeature: "/features/qr-code-receipts",
    sections: [
      {
        heading: "Regula de bază: orice încasare de la o persoană fizică",
        body: "Dacă încasați bani de la o persoană fizică pentru un produs sau serviciu, tranzacția trebuie să treacă prin AMEF (aparatul de marcat electronic fiscal) și să fie fiscalizată — indiferent de sumă. Un espresso de 8 lei intră sub aceeași regulă ca o notă de plată de 300 de lei pentru o masă de familie.\n\nImportant: din 26 decembrie 2024, Legea nr. 317/2024 a modificat OUG 28/1999 exact pe partea de tipărire/înmânare a bonului la plata cu cardul — vedeți secțiunea următoare. Regula veche («orice metodă de plată, fără excepție, generează bon tipărit și oferit») nu mai e completă, deci actualizează orice procedură internă scrisă înainte de 2025.",
      },
      {
        heading: "Ce s-a schimbat: bonul tipărit nu mai e obligatoriu la plata cu cardul",
        body: "Legea nr. 317/2024 a introdus o excepție: pentru încasările cu cardul de debit sau credit, comerciantul nu mai este obligat să tipărească și să înmâneze bonul fiscal clientului — decât dacă acesta îl cere explicit. Extrasul de cont bancar funcționează ca dovadă a plății pentru drepturile consumatorului, potrivit OG 21/1992.\n\nAtenție la ce NU s-a schimbat: tranzacția tot trebuie înregistrată și fiscalizată prin AMEF în momentul plății — legea a scutit doar pasul de tipărire/înmânare a hârtiei, nu obligația de a trece vânzarea prin casa de marcat. Pentru plata cash, obligația de a emite și oferi bonul rămâne neschimbată. Verificați întotdeauna cu contabilul dumneavoastră dacă procedura internă din local reflectă corect distincția asta, pentru că e ușor să confundați «nu mai trebuie tipărit» cu «nu mai trebuie înregistrat».",
      },
      {
        heading: "Bonul trebuie oferit, nu doar emis la cerere (plata cash)",
        body: "Pentru plata în numerar, obligația comerciantului este în continuare să emită bonul și să îl pună la dispoziția clientului în momentul plății — nu să aștepte ca acesta să îl ceară. Clientul poate alege să nu îl ia (mulți lasă bonul pe masă la plecare), dar dumneavoastră tot trebuie să îl fi emis și oferit.\n\nDin perspectiva unui control, diferența contează: un bon emis și refuzat de client este conform. O vânzare cash fără bon emis deloc nu este.",
      },
      {
        heading: "Cazuri unde apar confuzii — delivery și comenzi telefonice",
        body: "La livrare (delivery) sau la o comandă telefonică plătită în momentul livrării, tranzacția trebuie fiscalizată la momentul încasării, indiferent unde are loc fizic — regula de fond nu s-a schimbat. Ce diferă e doar dacă bonul tipărit trebuie și înmânat curierului/clientului: la plata cash, da, obligatoriu; la plata cu cardul (POS mobil la livrare), tipărirea rămâne opțională, dar tranzacția tot trebuie fiscalizată în același moment.\n\nÎn practică, multe afaceri mici greșesc aici — încasează la livrare, notați comanda într-un caiet sau într-un grup de WhatsApp, și fiscalizează vânzarea (dacă o fac) abia a doua zi, agregat. Asta nu respectă momentul legal de fiscalizare și creează exact tipul de neconcordanță pe care un inspector îl caută.",
      },
      {
        heading: "Ce riscați dacă nu emiteți bonul fiscal",
        body: "Neemiterea bonului fiscal este o abatere contravențională, sancționată cu amendă — cuantumul depinde de încadrarea faptei și de eventuala recidivă, așa că verificați valoarea actualizată cu contabilul dumneavoastră sau pe portalul ANAF.\n\nLa recidivă sau la constatarea unui tipar (mai multe vânzări fără bon, nu un incident izolat), riscul crește dincolo de amendă — poate ajunge la suspendarea temporară a activității punctului de lucru. Dacă tocmai ați descoperit că o vânzare a scăpat neînregistrată, [aflați exact ce faceți în continuare](/blog/ati-uitat-sa-emiteti-bonul-fiscal-ce-faceti-acum) — diferența dintre un incident izolat corectat cinstit și un tipar contează enorm pentru cât de gravă rămâne situația.",
      },
      {
        heading: "Cum vă asigurați că nu ratați niciun bon",
        body: "Cea mai sigură metodă de a nu rata bonuri fiscale este să eliminați pasul manual din proces. În franchisetech, fiecare vânzare finalizată în POS trimite automat comanda către AMEF, care emite bonul fiscal la momentul plății — nu există un pas separat de «nu uita să bagi vânzarea în casă».\n\nAsta contează mai ales la ore de vârf, când personalul lucrează rapid și riscul de a sări un pas manual crește. Dacă bonul se emite automat odată cu finalizarea plății în POS, nu mai depinde de memoria casierului.",
      },
    ],
  },
  {
    slug: "factura-vs-bon-fiscal-diferenta",
    title: "Factură vs. bon fiscal — care e diferența și când aveți nevoie de fiecare",
    description:
      "Bonul fiscal și factura nu sunt interschimbabile. Iată ce document aveți nevoie pentru clienți persoane fizice, ce cereți pentru clienți companii și cum le gestionați corect în POS.",
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
        body: "Factura conține datele complete ale cumpărătorului: denumire, CUI sau CNP, adresă. Este documentul de care are nevoie o companie pentru a înregistra cheltuiala în contabilitate și, unde e cazul, pentru a deduce TVA-ul aferent.\n\nExemplu tipic în HoReCa: o firmă care organizează un eveniment sau o masă de afaceri la restaurantul dumneavoastră și are nevoie de factură pentru a justifica cheltuiala, nu doar de bonul fiscal.",
      },
      {
        heading: "Cum cereți sau emiteți o factură pe baza unui bon fiscal",
        body: "Dacă un client comunică CUI-ul firmei în momentul plății, casierul poate introduce acel CUI la casa de marcat, iar bonul fiscal este emis cu CUI-ul cumpărătorului înscris pe el. Acel bon, cu CUI-ul inclus, poate sta apoi la baza emiterii facturii.\n\nDacă CUI-ul nu a fost comunicat la momentul plății, procedura de a obține ulterior o factură pe baza unui bon fiscal simplu (fără CUI) este mai greoaie și depinde de politica internă și de termenele aplicabile — cel mai simplu e să cereți clientului CUI-ul înainte de a finaliza plata, nu după.",
      },
      {
        heading: "De ce contează diferența pentru contabilitate",
        body: "Bonurile fiscale alimentează Raportul Z — venitul agregat al zilei, defalcat pe metode de plată și cote de TVA. Facturile sunt documente individuale, fiecare cu propriul cumpărător identificat, folosite pentru relații B2B.\n\nContabilul dumneavoastră are nevoie de ambele fluxuri, dar separat: veniturile din bonuri fiscale (retail, consum obișnuit) și veniturile din facturi (clienți companie) nu se amestecă în aceeași evidență, chiar dacă banii ajung în același sertar sau cont.",
      },
      {
        heading: "Cum gestionați ambele în franchisetech",
        body: "POS-ul emite bon fiscal automat la fiecare vânzare finalizată. Când un client cere factură și comunică CUI-ul înainte de plată, îl introduceți în POS — bonul fiscal iese cu CUI-ul înscris, iar vânzarea rămâne marcată distinct în sistem.\n\nLa exportul pentru contabil, vânzările cu CUI asociat sunt separate de vânzările simple cu bon fiscal, ca să nu fie nevoie de triaj manual la finalul lunii.",
      },
    ],
  },
  {
    slug: "cum-te-pregatesti-pentru-control-anaf",
    title: "Cum vă pregătiți pentru un control ANAF la cafenea sau restaurant",
    description:
      "Ghid practic pentru pregătirea unui control fiscal la cafenea sau restaurant: ce documente vă se cer primele, ce verificați inspectorii la fața locului și cum evitați greșelile frecvente.",
    publishedAt: "2026-06-07",
    locale: "ro",
    tags: ["fiscal","control-anaf"],
    image: "/marketing/hero-casa-marcat.jpg",
    sections: [
      {
        heading: "Ce declanșează de obicei un control",
        body: "Controalele pot porni dintr-o sesizare, dintr-o verificare tematică pe zonă sau sector de activitate, sau din discrepanțe observate în declarațiile depuse. Multe controale la HoReCa sunt inopinate — vin fără preaviz, exact în timpul programului, când aveți clienți la mese.\n\nAsta înseamnă că «mă pregătesc când aflu că vine controlul» nu funcționează. Pregătirea trebuie să fie o stare permanentă a evidenței dumneavoastră, nu un sprint de o săptămână.",
      },
      {
        heading: "Documentele pe care inspectorul le cere primele",
        body: "La un control tipic la o cafenea sau un restaurant, primele documente cerute sunt de obicei:\n\n- Rapoartele Z pentru perioada verificată\n- Registrul de casă\n- NIR-urile pentru marfa primită recent\n- Facturile de la furnizori\n- Certificatul de garanție și fișa aparatului de marcat fiscal\n- Meniul afișat, cu prețurile curente\n\nDacă toate acestea sunt organizate și accesibile rapid, controlul decurge mult mai repede și cu mai puține întrebări suplimentare.",
      },
      {
        heading: "Ce verificați efectiv la fața locului",
        body: "Pe lângă documente, inspectorii verificați practic funcționarea zilnică: pot cere emiterea unui bon fiscal pe loc pentru a confirma că aparatul funcționează și transmite corect, pot compara prețurile de pe meniu cu ce apare la casă, și pot verifica dacă stocul fizic din bucătărie sau bar corespunde cu ce arată gestiunea.\n\nDe multe ori, verificarea de fond nu e complicată — e o comparație simplă între ce spuneți că se întâmplă (documente) și ce se întâmplă efectiv (observație directă).",
      },
      {
        heading: "Greșeli frecvente găsite la afaceri mici",
        body: "La cafenele și restaurante mici, cele mai frecvente probleme găsite la control sunt operaționale, nu de rea-credință:\n\n- Sertarul nu a fost niciodată conciliat sistematic cu raportul Z\n- NIR-urile se fac cu întârziere, uneori săptămânal în loc de zilnic\n- Meniul tipărit nu a fost actualizat după ultima schimbare de preț\n- Bonuri de consum lipsă pentru rețetele preparate\n\nNiciuna dintre acestea nu e o fraudă intenționată, dar toate generează constatări la control — pentru că inspectorul nu poate distinge «greșeală de organizare» de «neglijență intenționată» doar din ce vede pe hârtie.",
      },
      {
        heading: "Lista de verificare înainte de control",
        body: "- Rapoartele Z sunt generate zilnic, fără goluri, și arhivate\n- Registrul de casă e la zi și diferențele de numerar sunt notate\n- Toate NIR-urile pentru marfa primită sunt emise, nu în ciornă\n- Meniul afișat corespunde exact cu prețurile din POS\n- Facturile de la furnizori sunt organizate și accesibile\n- Personalul știe unde sunt documentele și cum se generează un raport la cerere\n\nDacă puteți bifa toate punctele de mai sus în orice moment, nu doar înainte de un control anunțat, sunteți pregătit.",
      },
    ],
  },
  {
    slug: "tva-livrare-delivery-vs-consum-local",
    title: "TVA la livrare (delivery) vs. consum local — ce cotă aplicați",
    description:
      "Contrar unei confuzii frecvente, canalul de vânzare (masă vs. delivery) nu schimbă, de regulă, cota de TVA la aceeași mâncare. Ce chiar schimbă cota e categoria de produs — alcool, băuturi îndulcite, alimente cu zahăr mult.",
    publishedAt: "2026-06-07",
    locale: "ro",
    tags: ["tva","fiscal","delivery"],
    image: "/marketing/reports-sales.png",
    relatedFeature: "/features/z-report",
    sections: [
      {
        heading: "Ce spune legea, de fapt: canalul contează mai puțin decât se crede",
        body: "O confuzie frecventă în HoReCa este ideea că aceeași mâncare are automat cotă de TVA diferită după canal — consum la masă vs. livrare/delivery. Conform Codului Fiscal (art. 291), atât serviciile de restaurant și catering, cât și livrarea de alimente (ca livrare de bunuri) beneficiază, în prezent, de cota redusă de 11% — cu aceleași categorii de excepții în ambele cazuri: băuturile alcoolice, băuturile nealcoolice îndulcite încadrate la codul NC 2202 (sucuri, băuturi energizante) și alimentele cu conținut mare de zahăr adăugat.\n\nAsta înseamnă că, pentru majoritatea produselor obișnuite dintr-o cafenea sau restaurant, nu canalul de vânzare (masă vs. delivery) decide cota de TVA, ci categoria produsului. O pizza vândută la masă și aceeași pizza livrată la domiciliu ar trebui, de regulă, să aibă aceeași cotă — pentru că amândouă sunt, în esență, «alimente», fie ca serviciu de restaurant, fie ca livrare de bunuri. Notă importantă: cotele de TVA și încadrările s-au modificat prin Legea nr. 141/2025 (cu efect din 1 august 2025) — verificați mereu cu contabilul dumneavoastră dacă a mai intervenit vreo modificare de atunci.",
      },
      {
        heading: "Ce chiar schimbă cota — categoria de produs, nu canalul",
        body: "Diferența reală de tratament fiscal apare la nivel de produs, nu de canal de vânzare:\n\n- **Băuturi alcoolice** — cotă standard, indiferent dacă se consumă la masă sau se livrează\n- **Băuturi nealcoolice cu zahăr, încadrate la codul NC 2202** (sucuri carbogazoase, băuturi energizante) — cotă standard, indiferent de canal\n- **Alimente cu conținut mare de zahăr adăugat** (peste pragul stabilit legal) — cotă standard, indiferent de canal\n- **Restul alimentelor și băuturilor nealcoolice fără zahăr peste prag** — cotă redusă, atât la masă cât și la livrare\n\nDacă vindeți un produs care se încadrează la excepții (de exemplu o băutură răcoritoare la cutie sau un desert foarte îndulcit), acel produs are cotă standard indiferent dacă îl vinde ospătarul la masă sau îl duce curierul la ușă — nu pentru că e livrat, ci pentru că e categoria lui de produs.",
      },
      {
        heading: "Băuturile alcoolice — regim separat, dar constant pe canal",
        body: "Băuturile alcoolice sunt taxate la cota standard de TVA, indiferent de canalul de vânzare — la masă sau la livrare. Nu beneficiază de cota redusă aplicabilă restului alimentelor și serviciilor de restaurant.\n\nDacă vindeți bere, vin sau alte băuturi alcoolice atât la consum local cât și pentru livrare, verificați explicit cu contabilul dumneavoastră că aceste produse au cota standard configurată corect în sistem, separat de restul meniului.",
      },
      {
        heading: "Ce trebuie să verificați cu contabilul dumneavoastră",
        body: "Nu configurați cotele de TVA per produs «din auzite» sau prin analogie cu ce face un alt local. Cereți contabilului o confirmare explicită, pe categorii de produs (nu pe canal de vânzare), pentru:\n\n- Mâncare gătită și băuturi nealcoolice fără zahăr peste prag\n- Băuturi nealcoolice îndulcite, încadrate la codul NC 2202\n- Alimente cu conținut mare de zahăr adăugat\n- Băuturi alcoolice\n- Produse de patiserie sau cofetărie ambalate, vândute la pachet\n\nAceste încadrări se pot modifica prin acte normative — o verificare făcută acum un an nu mai e neapărat validă azi.",
      },
      {
        heading: "Cum configurați corect produsele în franchisetech",
        body: "POS-ul franchisetech permite setarea cotei de TVA la nivel de produs. Dacă un produs se încadrează la categoriile cu cotă standard (alcool, băuturi îndulcite NC 2202, alimente cu zahăr mult), configurați acea cotă o singură dată pe produs — ea rămâne aceeași indiferent de canalul prin care se vinde produsul (masă, delivery, take-away), pentru că nu canalul decide cota, ci produsul.\n\nRaportul Z arată apoi TVA-ul colectat defalcat pe fiecare cotă, ceea ce vă dă (și contabilului dumneavoastră) vizibilitate directă dacă ceva pare configurat greșit, înainte să devină o problemă la control.",
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
        body: "Dacă prețul afișat pentru un produs include deja TVA (cum e normal la vânzarea către consumatori finali), TVA-ul aferent acelei linii se extrage din preț cu formula:\n\nTVA = Preț cu TVA × Cotă / (100 + Cotă)\n\nBaza impozabilă a liniei este diferența: Preț cu TVA − TVA.\n\nBonul fiscal totalizează separat baza și TVA-ul pentru fiecare cotă întâlnită pe bon (21%, 11%, 0%), apoi le adună pentru totalul general de plată. Casa de marcat face acest calcul automat pe fiecare linie, în funcție de cota configurată pentru produsul respectiv.",
      },
      {
        heading: "Exemplu concret cu trei cote diferite",
        body: "Un bon cu trei produse, fiecare la o cotă diferită de TVA:\n\n- Produs A, cotă standard 21%: preț 20,00 lei → bază 16,53 lei, TVA 3,47 lei\n- Produs B, cotă redusă 11%: preț 15,00 lei → bază 13,51 lei, TVA 1,49 lei\n- Produs C, cotă 0% (scutit): preț 10,00 lei → bază 10,00 lei, TVA 0,00 lei\n\n**Total bon: 45,00 lei** — din care bază impozabilă totală 40,04 lei și TVA total colectat 4,96 lei.\n\nFiecare cotă rămâne vizibilă separat pe bon, nu doar suma finală.",
      },
      {
        heading: "Ce trebuie să apară pe bonul fiscal tipărit",
        body: "Un bon corect nu arată doar totalul general de plată. Trebuie să afișeze defalcarea pe fiecare cotă de TVA prezentă pe bon: totalul pe cota standard, totalul pe fiecare cotă redusă folosită, și totalul pentru produsele scutite (cota 0%), dacă e cazul.\n\nAceastă defalcare e ceea ce alimentează, la finalul zilei, secțiunea de TVA din Raportul Z — și, ulterior, declarațiile fiscale lunare sau trimestriale.",
      },
      {
        heading: "Riscul cotei greșite setate per produs",
        body: "Dacă un produs are cota de TVA setată greșit în sistem — de exemplu o băutură alcoolică configurată din greșeală cu cota redusă în loc de cea standard — toate bonurile emise cu acel produs sunt greșite retroactiv, de la data configurării eronate.\n\nCorectarea nu e doar o modificare de setare: implică de obicei regularizare cu ANAF pentru perioada afectată, ceea ce contabilul dumneavoastră trebuie să gestioneze separat. Cu cât eroarea e descoperită mai târziu, cu atât perioada de regularizat e mai mare.",
      },
      {
        heading: "Cum preveniți erorile în franchisetech",
        body: "La adăugarea unui produs nou în POS, cota de TVA se setează explicit, produs cu produs — nu există o cotă implicită aplicată automat fără verificare. Raportul Z arată defalcarea colectării de TVA pe fiecare cotă, ceea ce face vizibilă rapid orice cifră care pare neobișnuită.\n\nDacă un produs ajunge să fie vândut fără o cotă de TVA configurată corect, discrepanța apare în rapoarte înainte să se acumuleze pe perioade lungi — mai ușor de corectat o săptămână greșită decât un trimestru întreg.",
      },
    ],
  },
  {
    slug: "conectare-casa-marcat-anaf-erori-frecvente",
    title: "Conectarea casei de marcat la ANAF — erori frecvente și cum le rezolvați",
    description:
      "Casele de marcat electronice fiscale transmit bonurile către ANAF în timp real. Iată cele mai frecvente erori de conectare, ce le cauzează și cum le rezolvați fără să opriți vânzarea.",
    publishedAt: "2026-06-09",
    locale: "ro",
    tags: ["fiscal","casa-de-marcat"],
    image: "/marketing/hero-casa-marcat.jpg",
    relatedFeature: "/features/qr-code-receipts",
    sections: [
      {
        heading: "Cum funcționează conectarea la ANAF",
        body: "Orice casă de marcat electronică fiscală (AMEF) folosită în România este obligată să transmită automat, prin conexiune la internet, datele fiecărui bon fiscal emis către serverele ANAF. Conexiunea se face de obicei printr-un SIM de date montat direct în aparat sau printr-o rețea locală (Wi-Fi/cablu) conectată la un router cu internet.\n\nDacă legătura se întrerupe pentru câteva minute sau ore, aparatul nu se oprește din funcționat. Bonurile continuă să fie emise fiscal, iar datele se stochează local în memoria jurnalului electronic până când conexiunea revine — moment în care se retransmit automat, fără intervenția dumneavoastră.",
      },
      {
        heading: "Cele mai frecvente erori de conectare",
        body: "În activitatea zilnică a unei cafenele sau a unui restaurant, aceleași câteva cauze explică majoritatea problemelor de conectare:\n\n- **Semnal SIM slab sau date epuizate** — mai ales în zone cu semnal instabil sau când abonamentul de date al SIM-ului fiscal a expirat\n- **Router sau rețea locală picată** — dacă aparatul e conectat prin Wi-Fi și routerul restaurantului cade, casa de marcat pierde legătura odată cu restul rețelei\n- **Certificat digital expirat** — certificatul folosit de aparat pentru autentificare la server are o perioadă de valabilitate și trebuie reînnoit\n- **Memoria jurnalului electronic aproape plină** — aparatele vechi sau neîntreținute pot ajunge la limita de stocare, ceea ce blochează transmiterea\n- **Firmware neactualizat** — ANAF actualizează periodic specificațiile de transmisie, iar un aparat cu firmware vechi poate refuza conexiunea",
      },
      {
        heading: "Ce faceți când apare eroarea de conectare",
        body: "Primul pas este să identificați dacă problema e de la aparat sau de la rețea:\n\n1. Verificați dacă restul rețelei (POS-ul, routerul, telefonul cu date mobile) are internet\n2. Dacă restul rețelei funcționează dar aparatul fiscal nu, verificați semnalul SIM-ului din aparat (dacă are SIM propriu)\n3. Reporniți aparatul fiscal — multe erori temporare de conectare se rezolvă printr-un restart simplu\n4. Dacă eroarea persistă, contactează distribuitorul autorizat al casei de marcat — el are acces la diagnosticare tehnică pe care dumneavoastră nu o aveți\n\n**Important:** vânzarea nu se oprește cât timp aparatul funcționează local. Nu refuza clienți sau nu opriți activitatea doar pentru că vedeți un mesaj de eroare de conectare pe ecranul casei de marcat — verificați întâi dacă bonurile chiar nu se mai emit.",
      },
      {
        heading: "Ce nu trebuie să faceți niciodată",
        body: "- Nu opriți sau nu deconecta manual aparatul fiscal sperând să \"resetați\" problema, fără indicație de la distribuitorul autorizat\n- Nu ștergeți sau nu încercați să resetați jurnalul electronic pe cont propriu — este un document cu regim special\n- Nu ignora eroarea zile la rând sperând că \"se rezolvă singură\" — un aparat care nu a mai transmis date de câteva zile e un semnal de verificat imediat, nu de amânat. Neconectarea la sistemul ANAF are [o amendă separată de cea pentru lipsa bonului fiscal](/blog/amenda-neconectare-casa-marcat-anaf), aplicabilă chiar dacă aparatul emite bonuri corect\n- Nu schimba SIM-ul sau routerul fără să notați ce ați schimbat — dacă distribuitorul trebuie să intervină, are nevoie de acest istoric",
      },
      {
        heading: "Bonul cu cod QR și rolul lui",
        body: "Fiecare bon fiscal emis de o casă de marcat conectată la ANAF conține un cod QR care permite verificarea autenticității bonului — clientul sau un inspector poate scana codul și confirma că bonul respectiv a fost efectiv transmis și înregistrat fiscal.\n\nÎn franchisetech, bonurile generate din vânzările POS se leagă direct de aparatul fiscal certificat conectat la stația de casă — aplicația nu emite bonuri fiscale în locul aparatului, ci trimite comanda de emitere către acesta și înregistrează rezultatul. Dacă aparatul fiscal raportează o eroare de conectare la ANAF, franchisetech afișează clar starea, nu ascunde eroarea și nu marchează vânzarea drept \"finalizată fiscal\" până nu primește confirmare reală de la aparat.",
      },
    ],
  },
  {
    slug: "cum-anulezi-un-bon-fiscal-emis-gresit",
    title: "Cum anulați corect un bon fiscal emis greșit (storno)",
    description:
      "Ați emis un bon fiscal cu produsul greșit sau suma greșită? Iată procedura corectă de stornare, ce se întâmplă dacă observați greșeala după închiderea zilei și greșeli frecvente de evitat.",
    publishedAt: "2026-06-09",
    locale: "ro",
    tags: ["pos","storno","fiscal"],
    image: "/marketing/pos-hero.png",
    relatedFeature: "/features/pos",
    sections: [
      {
        heading: "Ce este stornarea unui bon fiscal",
        body: "Odată emis, un bon fiscal nu poate fi șters sau editat — casele de marcat fiscale nu permit asta prin design, tocmai pentru a preveni manipularea vânzărilor. Singura cale legală de a corecta o greșeală este **stornarea**: emiterea unui bon de stornare care anulează valoarea bonului greșit, urmat, dacă e cazul, de emiterea bonului corect. Cadrul legal pentru procedură este dat de normele metodologice de aplicare a OUG 28/1999 (aprobate prin HG 479/2003).\n\nStornarea funcționează cât timp bonul greșit face parte din ziua fiscală curentă, adică înainte de generarea raportului Z de închidere a zilei respective. Pe lângă bonul de stornare emis de aparat, procedura corectă cere și un document scris — un proces-verbal de stornare, cu numărul și ora bonului greșit, motivul anulării și semnătura casierului plus a persoanei responsabile (manager/administrator) — păstrat alături de bonul stornat pentru justificare la un eventual control.\n\nProcedura de mai jos e generală, valabilă pentru orice tip de greșeală — produs, cantitate, sumă. Dacă greșeala e specific o cotă de TVA greșită, mai ales dacă a fost deja încasată de la un client care a plecat, situația are o nuanță suplimentară: [cum corectați un bon cu cotă de TVA greșită după emitere](/blog/bon-fiscal-cota-tva-gresita-cum-corectati-dupa-emitere).",
      },
      {
        heading: "Pașii pentru anularea unui bon fiscal emis greșit",
        body: "1. Identificați bonul greșit — de obicei prin numărul bonului sau ora emiterii\n2. Deschideți funcția de stornare din aplicația POS sau direct din casa de marcat\n3. Selectați bonul (sau produsele) de anulat — sistemul cere de obicei un motiv (produs greșit, cantitate greșită, preț greșit, client renunță)\n4. Confirmați stornarea — se emite un bon de stornare care compensează exact valoarea bonului greșit\n5. Completați (sau lăsați sistemul să genereze) procesul-verbal de stornare, semnat de casier și de persoana responsabilă, pentru justificare ulterioară\n6. Dacă vânzarea corectă trebuie totuși înregistrată, emiteți un bon nou cu datele corecte\n\nÎn majoritatea sistemelor, stornarea unui bon deja plătit necesită și returnarea efectivă a banilor către client (numerar înapoi în sertar sau reversare pe card), nu doar o corecție în aplicație.",
      },
      {
        heading: "Ce faceți dacă observați greșeala după închiderea zilei",
        body: "Dacă raportul Z al zilei respective a fost deja generat, bonul greșit nu mai poate fi stornat prin procedura obișnuită de casă — ziua fiscală s-a închis și jurnalul electronic al acelei zile este definitiv.\n\nÎn acest caz, corecția se face prin proceduri contabile separate (notă contabilă, discuție directă cu contabilul despre modul de tratare), nu prin sistemul POS. Din acest motiv, verificarea bonurilor emise **în aceeași zi**, înainte de închidere, este mult mai simplă decât corecția ulterioară — un motiv concret pentru care merită să aruncați o privire pe lista vânzărilor zilei înainte de a genera raportul Z.",
      },
      {
        heading: "Greșeli frecvente la stornare",
        body: "- **Stornați produsul greșit** — mai ales când bonul are mai multe articole și anulați altă linie decât cea intenționată\n- **Nu notați motivul stornării** — fără motiv, la control sau la verificarea internă nu puteți explica de ce apare o anulare\n- **Amestecați stornarea cu discountul** — o reducere de preț nu este o stornare; dacă doriți doar să reduceți prețul unui produs, folosiți discount, nu anulare de bon\n- **Nu returnați efectiv banii** — stornați bonul în sistem dar uitați să dați banii înapoi clientului sau să reversați tranzacția pe card, ceea ce creează diferență la numărarea sertarului",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "Stornarea unui bon în franchisetech se face direct din istoricul vânzărilor POS: căutați bonul, apăsați **Stornează**, alegeți motivul dintr-o listă predefinită și confirmați. Operațiunea cere autentificare — un casier obișnuit nu poate storna liber bonuri fără autorizare, exact ca să existe control asupra cine poate face această operațiune.\n\nFiecare stornare apare distinct în raportul Z al zilei, cu referință clară la bonul original și la motivul introdus — nu dispare din istoric, ci rămâne vizibilă ca linie de stornare, pentru trasabilitate completă.",
      },
    ],
  },
  {
    slug: "storno-in-horeca-ce-este-cand-se-foloseste",
    title: "Storno în HoReCa — ce este, când se folosește și ce documente generează",
    description:
      "Stornoul e mecanismul prin care corectați o vânzare deja înregistrată fiscal, fără să ștergeți nimic. Iată cazurile tipice din cafenele și restaurante și ce documente rezultă.",
    publishedAt: "2026-06-10",
    locale: "ro",
    tags: ["pos","storno"],
    image: "/marketing/pos-hero.png",
    relatedFeature: "/features/pos",
    sections: [
      {
        heading: "Ce este stornoul, concret",
        body: "Stornoul este operațiunea prin care anulați efectul unei vânzări deja înregistrate fiscal, fără să modificați sau să ștergeți bonul original. În loc de ștergere, sistemul emite un document nou — bonul de stornare — care are exact valoarea opusă bonului greșit, aducând totalul înregistrat la zero pentru acea vânzare.\n\nEste diferit de o simplă corecție în aplicație. Odată ce un bon fiscal a fost emis, el rămâne definitiv în jurnalul electronic al casei de marcat — stornoul este singura cale legală de a-i anula efectul.",
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
        body: "În majoritatea afacerilor HoReCa bine organizate, dreptul de a storna un bon nu este liber pentru orice casier — este limitat la manager, admin sau supervizor de tură. Motivul e simplu: fără această limitare, stornoul poate deveni o portiță prin care un angajat anulează vânzări reale pentru a scoate numerar din sertar fără urmă.\n\nAsta nu înseamnă neîncredere automată în personal — înseamnă control intern de bază, aceeași logică pentru care banca vă cere PIN și nu doar cardul.",
      },
      {
        heading: "Cum ține evidența un sistem POS corect construit",
        body: "În franchisetech, fiecare storno este legat de un cont de utilizator autentificat, are oră, dată, motiv și referință la bonul original — nimic nu se pierde din istoric. Raportul Z al zilei arată separat totalul vânzărilor și totalul stornărilor, iar diferența dintre numerarul așteptat și cel numărat efectiv în sertar poate fi explicată direct din aceste înregistrări, nu din presupuneri.\n\nDacă un manager observă un număr neobișnuit de stornări într-o tură anume, are de unde porni verificarea — cine a făcut stornările, la ce oră și cu ce motiv.",
      },
    ],
  },
  {
    slug: "cum-inregistrezi-bacsisul-corect-in-pos",
    title: "Cum înregistrați bacșișul corect în POS, fără să-l amestecați cu vânzarea",
    description:
      "Bacșișul nu este parte din vânzarea de produse și nu ar trebui să umfle vânzările nete sau TVA-ul. Iată cum îl înregistrați corect, cash și pe card, și ce spune legea în România.",
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
        heading: "Cum înregistrați corect bacșișul, cash și pe card",
        body: "**Bacșiș cash:** de obicei rămâne direct la angajat sau se pune într-un borcan comun de bacșiș, separat fizic de sertarul de numerar al vânzărilor. Nu se adăugați la totalul de numerar din raportul Z ca venit din vânzări.\n\n**Bacșiș pe card:** trebuie să apară ca linie separată la momentul plății — fie ca opțiune distinctă pe terminalul de plată, fie ca un câmp separat în aplicația POS, nu adăugat manual la prețul produselor din bon. Suma respectivă trebuie să fie identificabilă separat în extrasul de decontare al procesatorului de plăți, nu îngropată în totalul general al zilei.",
      },
      {
        heading: "Greșeli frecvente la înregistrarea bacșișului",
        body: "- **Amestecarea bacșișului cash cu fondul de casă** — banii de bacșiș ajung în același sertar cu numerarul de vânzări, fără separare, ceea ce strică numărătoarea la închiderea zilei\n- **Neînregistrarea bacșișului cash deloc** — dacă nu există nicio evidență, nu puteți verifica ulterior cât s-a încasat sau cum s-a distribuit între angajați\n- **Adăugarea bacșișului la prețul produsului pe bonul fiscal** — umflă vânzările nete și TVA-ul calculat, o eroare care se propagă în toate rapoartele ulterioare\n- **Distribuție neclară între staff** — fără o regulă scrisă (împărțire egală, pe tură, pe vânzări individuale), bacșișul devine sursă de conflict între angajați",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "În franchisetech, bacșișul se înregistrează printr-un câmp separat la finalizarea vânzării, distinct de valoarea produselor din bon. Suma de bacșiș nu intră în calculul vânzărilor nete și nu afectează TVA-ul colectat — apare ca linie proprie în raportul Z zilnic, alături de, dar separat de, totalul vânzărilor.\n\nAsta vă dă, la finalul zilei, două cifre clare: cât ați vândut efectiv în produse și cât s-a încasat separat ca bacșiș — utile atât pentru reconciliere, cât și pentru distribuirea corectă către personal.",
      },
    ],
  },
  {
    slug: "reconciliere-card-vs-numerar-la-final-de-zi",
    title: "Reconcilierea card vs. numerar la finalul zilei — pas cu pas",
    description:
      "Ce arată raportul Z despre plățile cu cardul nu este întotdeauna exact ce decontează banca. Iată cum reconciliați corect cele două surse și de unde vin cel mai des discrepanțele.",
    publishedAt: "2026-06-12",
    locale: "ro",
    tags: ["pos","reconciliere","raport-z"],
    image: "/marketing/reports-zreport.png",
    relatedFeature: "/features/z-report",
    sections: [
      {
        heading: "De ce reconcilierea card vs. numerar contează",
        body: "Raportul Z vă arată ce a înregistrat sistemul POS ca vânzări cu cardul într-o zi. Extrasul de decontare de la procesatorul de plăți (sau extrasul bancar) vă arată ce a intrat efectiv în cont. Cele două cifre ar trebui să coincidă — dar în practică, diferite motive pot face să nu se potrivească exact.\n\nDacă nu verificați periodic această corespondență, puteți descoperiți luni mai târziu că lipsesc bani din decontări dintr-o cauză tehnică nesesizată la timp — mult mai greu de investigat retroactiv decât dacă ați fi prins diferența în ziua respectivă.",
      },
      {
        heading: "Pașii de reconciliere, pas cu pas",
        body: "1. Generați raportul Z al zilei și notați totalul vânzărilor cu cardul conform sistemului POS\n2. Extrageți extrasul de decontare al terminalului de plată (sau al procesatorului) pentru aceeași zi\n3. Comparați totalul din raportul Z cu totalul decontat\n4. Dacă cifrele coincid — bifați și arhivați\n5. Dacă nu coincid, identificați diferența specifică: o tranzacție lipsă, un comision neașteptat, o decontare întârziată\n6. Notați explicația găsită, chiar dacă diferența e minoră — un istoric de explicații vă ajută dacă discrepanțele devin un tipar",
      },
      {
        heading: "Motive frecvente pentru discrepanțe",
        body: "- **Comisioane reținute de procesator** — suma decontată e mai mică decât vânzarea brută cu procentul comisionului, ceea ce e normal și nu e o \"eroare\", dar trebuie contabilizat separat, nu confundat cu o lipsă\n- **Decontare întârziată (T+1 sau T+2)** — vânzările de vineri seara pot apărea în extras abia luni, ceea ce face reconcilierea \"zi cu zi\" să pară greșită dacă nu țineți cont de decalaj\n- **Tranzacție eșuată dar înregistrată greșit ca reușită** — rar, dar posibil dacă terminalul are o problemă de conexiune chiar în momentul confirmării\n- **Bacșiș pe card amestecat cu vânzarea** — dacă bacșișul nu e separat corect, suma decontată totală poate părea mai mare decât vânzările din raportul Z, fără să fie o eroare reală",
      },
      {
        heading: "Cum documentați și corectați o discrepanță",
        body: "Odată identificată sursa diferenței, o notați explicit — nu doar \"nu se potrivește, o las așa\". Pentru comisioane, notați procentul reținut ca să puteți verifica dacă rămâne constant. Pentru decontări întârziate, notați decalajul (T+1, T+2) ca referință pentru reconcilierile viitoare. Pentru orice tranzacție care pare complet lipsă din decontare, contactați procesatorul de plăți direct — nu presupuneți că \"se rezolvă singur\".\n\nO discrepanță nedocumentată azi devine o discuție greu de reconstituit peste trei luni, când nimeni nu-și mai amintește exact ce s-a întâmplat în ziua respectivă.",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "Raportul Z din franchisetech separă clar totalul vânzărilor pe metode de plată — numerar, card, online — exact defalcarea de care aveți nevoie pentru a compara cu extrasul de decontare al procesatorului dumneavoastră de plăți. Fiecare raport Z rămâne arhivat și poate fi descărcat oricând, astfel încât reconcilierea nu trebuie făcută obligatoriu în aceeași zi — puteți compara și retroactiv, cu aceleași cifre exacte pe care sistemul le-a înregistrat atunci.\n\nfranchisetech nu se conectează automat la extrasul bancar sau la procesatorul de plăți — reconcilierea finală, cifră cu cifră, rămâne un pas manual, dar porniți de la o defalcare corectă și completă din partea POS-ului, nu de la un total generic.",
      },
    ],
  },
  {
    slug: "inventar-fizic-vs-scriptic-diferente",
    title: "Inventar fizic vs. scriptic — de unde apar diferențele și cum le corectați",
    description:
      "Stocul scriptic e ce arată sistemul pe hârtie, stocul fizic e ce numărați pe raft. Diferențele dintre ele nu sunt un mister — au surse concrete. Cum le identificați și le corectați.",
    publishedAt: "2026-06-14",
    locale: "ro",
    tags: ["stoc","inventar"],
    image: "/marketing/stock-report.png",
    sections: [
      {
        heading: "Ce înseamnă stoc scriptic și stoc fizic",
        body: "Stocul scriptic este cantitatea pe care sistemul o calculează matematic: ce ați primit prin NIR, minus ce ați consumat prin vânzări și rețete, minus scăzămintele înregistrate. Este o cifră teoretică, bazată pe documente.\n\nStocul fizic este ce numărați efectiv pe raft, în frigider sau în depozit, la un moment dat. În teorie, cele două ar trebui să coincidă. În practică, aproape niciodată nu coincid perfect — întrebarea este cât de mare e diferența și de unde vine.",
      },
      {
        heading: "De unde apar, de fapt, diferențele",
        body: "Diferențele dintre stocul fizic și cel scriptic au surse concrete, nu apar din senin:\n\n- **Scăzăminte nereportate** — un produs stricat sau expirat aruncat fără a fi înregistrat ca pierdere\n- **Porții din rețete setate greșit** — rețeta zice 18g cafea, dar barista pune constant 22g\n- **Erori la recepția NIR** — cantitatea introdusă în sistem nu corespunde cu ce a fost livrat efectiv\n- **Consum intern nedocumentat** — o cafea oferită gratuit unui client sau furnizor, fără bon și fără notă de consum\n- **Erori de casă sau furt** — mai rar, dar posibil, mai ales la produse cu valoare mare pe unitate\n\nFiecare din aceste cauze lasă o urmă diferită în tipul de discrepanță — de aceea contează să investigați produs cu produs, nu doar valoarea totală.",
      },
      {
        heading: "Cum faceți un inventar fizic corect",
        body: "Un inventar fizic fiabil urmează câțiva pași simpli, dar respectați riguros:\n\n1. Faceți numărătoarea după închiderea zilei sau într-un moment cu vânzări oprite temporar, ca stocul să nu se miște în timpul numărării\n2. Numărați fizic fiecare produs, pe unitatea de măsură corectă (kg, litri, bucăți)\n3. Comparați cantitatea numărată cu stocul scriptic afișat de sistem, produs cu produs\n4. Notați diferența exactă — nu doar valoarea totală, ci și la ce produs apare\n\nUn inventar făcut în grabă, doar cu o estimare vizuală \"cam atât mai e\", nu vă dă cifre pe care vă puteți baza.",
      },
      {
        heading: "Cum interpretați diferența",
        body: "O diferență mică și relativ constantă lună de lună (de obicei sub câteva procente din valoarea stocului) este normală — vine din scăzăminte naturale ale produselor perisabile și din mici erori de porționare.\n\nO diferență mare, concentrată la un singur produs sau apărută brusc într-o singură lună, nu este \"normalitate statistică\" — este un semnal specific de investigat: o rețetă greșit configurată, o recepție introdusă eronat sau o problemă de proces care merită găsită, nu ignorată pentru că \"așa se întâmplă\".",
      },
      {
        heading: "Cât de des faceți inventar",
        body: "Pentru produsele perisabile cu valoare mare (cafea, carne, lactate), o verificare săptămânală ține diferențele mici și ușor de urmărit la sursă. Pentru un inventar complet, pe toate produsele din gestiune, o dată pe lună este ritmul obișnuit în HoReCa.\n\nUn inventar complet făcut o dată pe an, ca formalitate contabilă, nu ajută operațional — diferențele acumulate timp de 12 luni devin imposibil de atribuit unei cauze precise.",
      },
      {
        heading: "Cum ajută franchisetech",
        body: "Stocul scriptic se calculează automat din NIR, rețete și vânzări înregistrate prin POS, fără introducere manuală separată. Asta înseamnă că diferența constatată la inventarul fizic arată exact ce nu a fost documentat corect în cursul lunii — un scăzământ uitat, o rețetă cu porții greșite — nu o eroare de calcul a sistemului.\n\nBalanța de stoc vă arată intrările și ieșirile pe fiecare produs, deci investigarea unei diferențe mari pornește direct de la datele deja existente, nu de la zero.",
      },
    ],
  },
  {
    slug: "stoc-materii-prime-vs-produse-finite-diferenta",
    title: "Stoc de materii prime vs. produse finite — ce diferență contează",
    description:
      "Diferența dintre materii prime și produse finite în gestiunea stocului — de ce separarea lor corectă vă dă costuri reale și rapoarte fiabile la cafenea sau restaurant.",
    publishedAt: "2026-06-17",
    locale: "ro",
    tags: ["stoc","materii-prime"],
    image: "/marketing/stock-report.png",
    sections: [
      {
        heading: "Ce înseamnă, în practică, fiecare tip de stoc",
        body: "Materiile prime sunt ingredientele așa cum le cumpărați de la furnizor: făină în saci de 25 kg, unt la cutie, cafea boabe la sac de 1 kg, lapte la bax de 12 litri. Le țineți în stoc pe unități de măsură — kg, litri, bucăți — și prețul lor vine direct din factură sau NIR.\n\nProdusele finite sunt ce rezultă după preparare și ajung la client: un croissant copt, un cappuccino, o felie de tort. Nu le cumpărați — le produceți din materii prime, conform unei rețete, iar stocul lor se măsoară de obicei în bucăți sau porții.\n\nÎntre ele mai există o categorie pe care multe afaceri o ignoră: semifabricatele. Aluatul de foietaj pregătit dimineața pentru toată ziua, sosul de casă făcut în avans, siropul de cafea preparat săptămânal — sunt produse din materii prime, dar nu sunt încă produsul final vândut clientului.",
      },
      {
        heading: "De ce contează să le separați în gestiune",
        body: "Dacă urmăriți stocul doar la nivel de produse finite (câte croissante ați copt azi), nu vedeți niciodată câtă făină, unt sau ciocolată consumați real — și nu puteți verifica dacă rețeta este respectată sau dacă cineva pune mai mult unt decât ar trebui.\n\nDacă urmăriți stocul doar la nivel de materii prime (câtă făină mai aveți în depozit), nu știți care produse din meniu sunt profitabile și care vă costă bani la fiecare vânzare.\n\nAveți nevoie de ambele niveluri, legate printr-o rețetă: materia primă intră în gestiune prin NIR, rețeta descrie cât consumă fiecare produs finit, iar vânzarea scade automat materia primă din stoc pe baza rețetei — nu produsul finit tratat ca o linie separată și necorelată.",
      },
      {
        heading: "Exemplu concret — un croissant cu ciocolată",
        body: "Rețeta unui croissant cu ciocolată la o patiserie mică:\n\n- Făină 45g → 45g × 4,2 lei/kg = 0,19 lei\n- Unt 30g → 30g × 32 lei/kg = 0,96 lei\n- Ciocolată 15g → 15g × 38 lei/kg = 0,57 lei\n- Drojdie, zahăr, ou pentru uns: 0,25 lei\n- Ambalaj (pungă hârtie): 0,15 lei\n\n**Cost total materii prime: 2,12 lei**\n\nÎn stoc aveți două lucruri diferite: cantitatea de făină, unt și ciocolată rămasă în depozit (materie primă, în kg) și numărul de croissante coapte disponibile la vitrină (produs finit, în bucăți). Dacă vindeți croissantul cu 9 lei, marja brută este 6,88 lei — dar cifra există doar dacă ați calculat costul din materia primă, nu doar ați numărat bucățile vândute.",
      },
      {
        heading: "Greșeli frecvente când cele două se amestecă",
        body: "- **Introducerea produsului finit direct în stoc, fără rețetă** — adăugați 20 de croissante în stoc dimineața, dar nu există nicio legătură cu câtă făină sau unt s-a consumat real\n- **Unități de măsură inconsistente** — făina apare uneori în kg, alteori în «pachete», ceea ce strică orice calcul automat\n- **Semifabricatele netratate ca stoc separat** — aluatul pregătit cu o zi înainte dispare din evidență între momentul preparării și momentul coacerii\n- **Inventariere doar la produsul finit** — numărați croissantele rămase, dar nu verificați niciodată dacă stocul de făină din sistem corespunde cu ce aveți fizic în depozit",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "În franchisetech, materiile prime intră în gestiune prin NIR — cu unitate de măsură, preț și furnizor. Rețetele leagă fiecare produs finit de cantitățile exacte de materie primă consumate la o porție.\n\nCând vindeți un croissant prin POS, sistemul scade automat 45g de făină, 30g de unt și 15g de ciocolată din stocul de materii prime — nu doar «un croissant» dintr-o listă separată. Rapoartele de stoc arată ambele niveluri: câtă materie primă mai aveți în depozit și câte porții din fiecare produs mai puteți produce cu stocul actual.",
      },
    ],
  },
  {
    slug: "transfer-stoc-intre-locatii-cum-il-documentezi",
    title: "Transfer de stoc între locații — cum îl documentați corect",
    description:
      "Cum documentați corect un transfer de stoc între două locații: ce trebuie să conțină bonul de transfer și de ce un mesaj pe WhatsApp nu este suficient pentru contabilitate.",
    publishedAt: "2026-06-17",
    locale: "ro",
    tags: ["stoc","transfer","multi-locatie"],
    image: "/marketing/industry-restaurant.png",
    sections: [
      {
        heading: "Când apare nevoia de transfer între locații",
        body: "O cafenea cu două locații are frecvent acest scenariu: locația din centru rămâne fără sirop de vanilie sâmbătă la prânz, în timp ce locația din cartier mai are patru sticle nedeschise. În loc să așteptați o comandă nouă de la furnizor, care poate dura una-două zile, mutați stocul dintr-o locație în alta.\n\nAcelași lucru se întâmplă cu marfa perisabilă — lapte, frișcă, brânză proaspătă — când o locație a comandat prea mult și cealaltă riscă să rămână fără. Transferul între locații este normal și util. Problema apare când nu este documentat corect.",
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
        body: "Pentru afacerile cu mai multe locații, franchisetech are un modul dedicat de transfer intern de stoc. Alegeți locația sursă și locația destinație, selectați produsul și cantitatea, iar sistemul generează automat bonul de transfer cu valoarea calculată din costul de achiziție curent.\n\nStocul ambelor locații se actualizează instant — locația sursă scade, locația destinație crește, fără să introduceți nimic manual de două ori. Istoricul transferurilor rămâne vizibil per locație, util atât pentru inventariere, cât și pentru contabil la închiderea lunii.",
      },
    ],
  },
  {
    slug: "stoc-negativ-cauze-si-solutii",
    title: "Stoc negativ în sistem — de unde apare și cum îl reparați",
    description:
      "De unde apare stocul negativ în sistemul de gestiune, care sunt cauzele frecvente și pașii concreți prin care îl corectați înainte de inventariere sau control fiscal.",
    publishedAt: "2026-06-17",
    locale: "ro",
    tags: ["stoc","stoc-negativ"],
    image: "/marketing/stock-report.png",
    sections: [
      {
        heading: "Ce înseamnă stoc negativ și de ce e un semnal de alarmă",
        body: "Stocul negativ apare când sistemul arată o cantitate sub zero pentru un produs — de exemplu -1,3 kg de brânză, deși fizic nu puteți avea mai puțin de zero brânză în frigider. Nu este o eroare de afișare: înseamnă că, undeva în lanțul rețetă → vânzare → NIR, s-a scăzut mai multă marfă decât a intrat efectiv în gestiune.\n\nUn stoc negativ nu se repară singur. Dacă îl ignorați, fiecare vânzare ulterioară a produsului respectiv adâncește diferența, iar la inventarierea fizică veți găsi o discrepanță pe care nu o mai puteți reconstitui exact — nu mai știți din ce zi vine eroarea.",
      },
      {
        heading: "Cele mai frecvente cauze",
        body: "- **Rețetă cu cantități greșite** — reteta din sistem cere 120ml lapte, dar barista toarnă real 160ml la fiecare băutură\n- **Produs vândut fără rețetă configurată** — un produs nou apare în POS înainte ca rețeta lui să fie completă, deci sistemul nu scade nimic din materia primă la vânzare, iar stocul afișat rămâne fals de mare până se corectează\n- **NIR introdus cu întârziere** — marfa a ajuns fizic luni, dar NIR-ul e emis abia joi; între timp, vânzările au scăzut deja din stocul vechi, care ajunge negativ înainte ca noua cantitate să fie înregistrată\n- **Stoc inițial introdus greșit** — la configurare, cantitatea de start a fost estimată, nu numărată fizic\n- **Pierdere sau consum nedocumentat** — produs stricat, aruncat sau folosit greșit, fără o notă de ajustare de stoc",
      },
      {
        heading: "Exemplu concret cum se acumulează diferența",
        body: "O cafenea are în rețeta de cappuccino 150ml lapte per porție. Real, baristul toarnă în medie 180ml — o diferență de 20% la fiecare băutură.\n\nDacă vindeți 60 de cappuccino pe zi:\n\n- Consum conform rețetei: 60 × 150ml = 9 litri/zi\n- Consum real: 60 × 180ml = 10,8 litri/zi\n- Diferență: 1,8 litri/zi nejustificați în sistem\n\nÎn 10 zile, stocul de lapte din sistem arată cu 18 litri mai mult decât aveți fizic — suficient ca, la o comandă de aprovizionare calculată pe baza sistemului, să rămâi fără lapte mai devreme decât vă așteptați, sau ca stocul să treacă în negativ dacă porniți de la o cantitate deja mică.",
      },
      {
        heading: "Cum îl reparați",
        body: "1. **Faceți o inventariere fizică** a produsului afectat — numărați sau cântăriți exact ce aveți\n2. **Corectați stocul din sistem** la valoarea reală, cu o notă de ajustare care explică diferența (nu doar o suprascriere silențioasă)\n3. **Verificați rețeta** — cantitățile din rețetă corespund cu ce se prepară real? Dacă nu, actualizați rețeta\n4. **Verificați NIR-urile din perioada respectivă** — există recepții de marfă introduse cu întârziere sau omise complet?\n5. **Documentați cauza** pentru contabil — o ajustare de stoc fără explicație ridică aceleași întrebări ca un transfer nedocumentat",
      },
      {
        heading: "Cum preveniți stocul negativ pe viitor",
        body: "În franchisetech, rapoartele de stoc semnalează vizual produsele cu cantitate negativă, ca să nu treacă neobservate până la inventarierea generală. Recalibrarea unei rețete (dacă porția reală diferă de cea configurată) se face o singură dată, iar toate vânzările ulterioare scad cantitatea corectă.\n\nDisciplina care contează cel mai mult: NIR-ul se introduce în ziua recepției, nu «mai târziu, când am timp». Un stoc negativ este aproape întotdeauna semnul unei rețete nerealiste sau al unui NIR întârziat — rareori al unui furt, deși merită verificat și acest scenariu dacă diferențele sunt mari și repetate.",
      },
    ],
  },
  {
    slug: "receptie-marfa-fara-factura-ce-faci",
    title: "Recepția mărfii fără factură — ce faceți și cum regularizați ulterior",
    description:
      "Ce faceți când marfa ajunge fără factură: cum înregistrați recepția pe bază de aviz de expediție și cum regularizați documentul când factura sosește de la furnizor.",
    publishedAt: "2026-06-19",
    locale: "ro",
    tags: ["stoc","nir","furnizori"],
    image: "/marketing/stock-report.png",
    sections: [
      {
        heading: "Situația: marfa a ajuns, factura nu",
        body: "Furnizorul de legume proaspete livrează marfa dimineața, la ora la care aveți nevoie de ea pentru meniul zilei, dar factura ajunge pe email abia a doua zi sau la finalul săptămânii, când se centralizează facturile pe o perioadă. Este o practică obișnuită la mulți furnizori mici și mijlocii din HoReCa.\n\nProblema nu este întârzierea facturii în sine — este ce faceți în intervalul dintre recepția fizică și primirea documentului. Marfa nu poate sta «în afara sistemului» până apare factura, pentru că între timp o și consumați sau o vindeți.",
      },
      {
        heading: "Ce faceți în ziua recepției",
        body: "Recepția se documentează la data fizică a primirii mărfii, indiferent dacă factura a sosit sau nu. Aveți două variante uzuale:\n\n- **Dacă furnizorul lasă aviz de expediție** — faceți NIR pe baza avizului, cu prețurile agreate în comandă sau din ultima factură similară\n- **Dacă nu există niciun document la livrare** — verificați cu furnizorul cantitatea și prețul comandat (telefonic, email sau comandă scrisă în avans) și faceți NIR cu prețul estimat, marcat clar ca provizoriu\n\nÎn ambele cazuri, marfa intră în gestiune la data recepției, nu la data facturii — asta este regula de bază pentru orice document de recepție în contabilitatea românească.",
      },
      {
        heading: "Cum regularizați când factura sosește",
        body: "Când factura ajunge, o comparați linie cu linie cu NIR-ul deja emis:\n\n1. **Cantitățile coincid?** Dacă nu, verificați dacă a fost o livrare parțială sau o eroare de numărare la recepție\n2. **Prețurile coincid?** Dacă furnizorul a facturat un preț diferit de cel estimat, ajustați valoarea NIR-ului la prețul real din factură\n3. **Referința facturii se atașează la NIR** — pentru trasabilitate completă între documentul de recepție și documentul fiscal\n\nDacă diferența de preț este semnificativă, costul rețetelor care folosesc materia primă respectivă se recalculează automat cu prețul corect — o diferență ignorată la o singură recepție poate distorsiona marja calculată pentru zile întregi.",
      },
      {
        heading: "Ce nu aveți voie să faceți",
        body: "Nu aveți voie să folosiți sau să vindeți marfa fără nicio urmă documentară în gestiune, doar pentru că «vine factura mai târziu». Fără NIR, marfa nu există oficial în stoc — orice ieșire ulterioară prin vânzare sau consum rămâne nejustificată.\n\nLa un control neanunțat, marfa aflată fizic în bucătărie sau depozit dar absentă din sistemul de gestiune ridică exact tipul de întrebare la care nu doriți să răspundeți pe loc: de unde vine, cine a adus-o, de ce nu apare nicăieri înregistrată.",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "În franchisetech, puteți emite un NIR pe baza avizului de expediție sau a comenzii, cu prețuri estimate, și îl marcați pentru regularizare ulterioară. Când factura sosește, deschideți NIR-ul existent, atașați referința facturii și ajustați prețurile dacă e cazul — nu creați un document nou, corectați pe cel deja emis.\n\nStocul rămâne corect din prima zi, iar costul rețetelor se actualizează automat dacă prețul final diferă de estimarea inițială. Contabilul primește, la final, un NIR complet cu referință clară la factura aferentă.",
      },
    ],
  },
  {
    slug: "cum-stabilesti-pretul-unui-produs-nou-in-meniu",
    title: "Cum stabiliți prețul unui produs nou înainte să-l pui în meniu",
    description:
      "Pașii corecți pentru a stabili prețul unui produs nou de meniu: cost rețetă, marjă țintă și praguri psihologice de preț, cu exemplu complet de calcul în lei.",
    publishedAt: "2026-06-19",
    locale: "ro",
    tags: ["retete","pret","marja"],
    image: "/marketing/recipe-costing-hero.png",
    sections: [
      {
        heading: "Greșeala de a copia prețul de la vecini",
        body: "Cea mai frecventă metodă de stabilire a prețului unui produs nou este să vă uitați ce cere cafeneaua de vizavi și să pui un preț similar, poate cu un leu mai mic «ca să fii competitiv». Problema: nu știți dacă vecinul are aceleași costuri de ingrediente, chirie sau volum de vânzări ca dumneavoastră.\n\nUn preț copiat fără să-vă cunoașteți propriul cost de rețetă poate fi profitabil pentru vecin și în pierdere pentru dumneavoastră — mai ales dacă porțiile, furnizorii sau costurile fixe diferă. Prețul corect pornește de la costul dumneavoastră real, nu de la ce afișează altcineva pe tablă.",
      },
      {
        heading: "Pasul 1 — calculați costul complet al rețetei",
        body: "Costul rețetei include toate ingredientele din porție, la prețul lor real de achiziție, plus ambalajul dacă produsul se vinde și la pachet. Nu rotunji în minus «ca să iasă un număr frumos» — folosiți prețul exact din ultimul NIR.\n\nFormula: Cost rețetă = Σ (cantitate ingredient × preț unitar) + cost ambalaj (dacă aplicabil).\n\nO greșeală frecventă la produsele noi: se calculează costul doar pe ingredientul principal (de exemplu carnea la un sandviș) și se ignoră sosurile, garniturile sau ambalajul — toate acestea, adunate, pot reprezenta 15-25% din costul total al porției.",
      },
      {
        heading: "Pasul 2 — aplicați marja țintă",
        body: "Odată ce aveți costul rețetei, calculați prețul de vânzare pornind de la marja pe care doriți să o obțineți, nu invers.\n\nFormula: Preț de vânzare = Cost rețetă ÷ (1 − Marja țintă)\n\nExemplu pentru o marjă țintă de 70%: dacă un produs costă 6 lei în ingrediente, prețul minim pentru marja dorită este 6 ÷ (1 − 0,70) = 6 ÷ 0,30 = **20 lei**.\n\nMarja țintă variază pe categorie de produs — băuturile la pahar susțin de obicei marje de 75-85%, în timp ce preparatele cu carne sau pește ajung realist la 60-70%, pentru că ingredientul principal e mult mai scump.",
      },
      {
        heading: "Pasul 3 — verificați pragurile psihologice de preț",
        body: "Prețul calculat matematic nu este întotdeauna prețul afișat pe meniu. Câteva ajustări practice:\n\n- **Rotunjire la praguri familiare** — 20,50 lei se transformă adesea în 21 lei sau 19,90 lei, în funcție de poziționarea locației\n- **Consistență cu restul meniului** — un produs nou la 23 lei lângă produse similare la 17-19 lei poate părea nejustificat de scump clientului, chiar dacă marja e corectă\n- **Verificați din nou marja după rotunjire** — dacă ați rotunjit în jos «ca să sune bine», recalculează procentul de marjă rezultat, ca să știți exact cu ce lucrați",
      },
      {
        heading: "Exemplu complet — lansarea unei limonade de zmeură",
        body: "Rețetă limonadă de zmeură (400ml, pahar la pachet):\n\n- Zmeură congelată 40g → 40g × 22 lei/kg = 0,88 lei\n- Lămâie proaspătă 30ml suc → 0,45 lei\n- Sirop de zahăr 30ml → 0,20 lei\n- Apă minerală/plată 300ml → 0,35 lei\n- Pahar + capac + pai: 0,55 lei\n\n**Cost total: 2,43 lei**\n\nCu marja țintă de 78% (obișnuită pentru băuturi non-cafea): Preț = 2,43 ÷ (1 − 0,78) = 2,43 ÷ 0,22 = **11,05 lei**, rotunjit la **11 lei**.\n\nLa 11 lei: marjă brută = 11 − 2,43 = 8,57 lei, adică 77,9% — foarte aproape de ținta propusă, deci rotunjirea nu a afectat semnificativ profitabilitatea produsului.",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "Când adăugați o rețetă nouă în franchisetech, sistemul calculează automat costul din ingredientele configurate și vă arată marja rezultată în timp real, pe măsură ce testați diferite prețuri de vânzare — nu mai calculați manual de fiecare dată când doriți să verificați o variantă de preț.\n\nÎnainte să publicați produsul nou pe POS, puteți vedea exact cum se compară marja lui cu restul meniului, ca să vă asigurați că prețul ales se aliniază cu strategia generală de profitabilitate, nu doar cu instinctul de moment.",
      },
    ],
  },
  {
    slug: "cum-completezi-registrul-de-casa-corect",
    title: "Cum completați corect Registrul de casă, pas cu pas",
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
        body: "Registrul de casă este documentul contabil care înregistrează, cronologic, fiecare mișcare de numerar din gestiunea dumneavoastră: sold de la ziua anterioară, fiecare încasare, fiecare plată în numerar, sold rămas la final. Nu este raportul Z — raportul Z e sumarul vânzărilor zilei, registrul de casă e jurnalul complet al banilor fizici care intră și ies din sertar sau din casierie.\n\nDiferența contează practic: puteți avea un raport Z corect (vânzările sunt înregistrate fiscal) și totuși un registru de casă incomplet, dacă ați scos bani din sertar pentru o plată către furnizor și nu ați notat-o. La control, cele două documente trebuie să se potrivească.",
      },
      {
        heading: "Structura pe coloane — ce completați în fiecare rând",
        body: "Un registru de casă corect are aceleași coloane indiferent dacă îl țineți pe hârtie sau electronic:\n\n- **Data** — ziua operațiunii\n- **Document** — tipul și numărul actului (bon fiscal, dispoziție de plată, chitanță)\n- **Explicație** — ce reprezintă mișcarea (încasări vânzări zi, plată furnizor, depunere bancă)\n- **Încasări** — suma care intră în casă\n- **Plăți** — suma care iese din casă\n- **Sold** — soldul rămas după fiecare operațiune\n\nPrima linie a fiecărei zile este soldul reportat din ziua anterioară (fondul de casă rămas). Ultima linie este soldul final, care trebuie să corespundă cu numerarul numărat fizic în sertar.",
      },
      {
        heading: "Exemplu complet, o zi de cafenea",
        body: "Iată cum arată o zi normală într-o cafenea mică:\n\n- **Sold reportat**: 300 lei (fondul de casă de la închiderea zilei anterioare)\n- **Încasări vânzări numerar** (agregat din raportul Z): 842 lei → sold 1.142 lei\n- **Plată furnizor lapte** (numerar, din sertar): −180 lei → sold 962 lei\n- **Depunere la bancă**: −682 lei → sold 280 lei\n- **Sold final**: 280 lei\n\nObservă că soldul final (280 lei) nu este identic cu fondul de casă inițial (300 lei) — diferența de 20 de lei ar trebui să apară undeva explicată (rest dat în plus, o eroare de numărare) sau, dacă fondul dumneavoastră standard e 300 lei, completați din nou până la 300 pentru ziua următoare și notați mișcarea. Pentru pașii exacți de documentat o astfel de diferență, cu surplus sau lipsă, vedeți [diferența de casă la final de zi](/blog/diferenta-de-casa-la-final-de-zi-surplus-sau-lipsa).",
      },
      {
        heading: "Corecțiile se fac prin stornare, nu prin ștersătură",
        body: "Registrul de casă nu se corectează prin ștersături sau prin acoperire cu marker. Dacă ați introdus o sumă greșită, adăugați o linie nouă de stornare (aceeași sumă, cu semn opus) și apoi linia corectă, cu explicație clară — «corecție rând anterior, sumă greșit introdusă».\n\nUn registru cu ștersături sau pagini rupte ridică semne de întrebare la orice control, indiferent dacă suma finală e corectă. Practic: dacă țineți registrul electronic (așa cum se generează automat din sesiunile POS), problema dispare — sistemul nu permite modificarea retroactivă a unei linii deja închise, doar adăugarea unei corecții noi.",
      },
      {
        heading: "Greșeli frecvente la completare",
        body: "- **Nu notați plățile mici din sertar** — furnizorul de pâine vine dimineața, plătiți 50 lei cash, uitați să treceți în registru; la final de lună, banii «lipsă» nu au explicație\n- **Amestecați fondul de casă cu încasările zilei** — dacă nu separați clar soldul reportat de vânzările zilei, nu puteți verifica dacă vânzările înregistrate corespund cu banii fizici\n- **Completați registrul o dată pe săptămână, din memorie** — orice mișcare necompletată la momentul respectiv se pierde sau se aproximează; registrul trebuie completat zilnic\n- **Nu păstrați bonul sau documentul justificativ pentru fiecare plată din numerar** — o plată de 180 lei către furnizor fără chitanță sau bon nu poate fi verificată ulterior",
      },
      {
        heading: "Cum se generează automat în franchisetech",
        body: "Registrul de casă se descarcă direct din pagina Raportului Z, fără completare manuală. Sistemul preia automat fondul de deschidere al sesiunii, toate încasările din vânzări (numerar) și, dacă înregistrați manual o ieșire de numerar (plată furnizor din sertar, depunere bancă), mișcarea respectivă apare ca linie separată, cu oră și utilizator.\n\nNu puteți edita retroactiv o linie dintr-o zi închisă. Dacă găsiți o eroare, adăugați o corecție nouă, datată la momentul descoperirii — exact logica de stornare cerută contabil, dar fără riscul unei ștersături sau al unei pagini pierdute.",
      },
    ],
  },
  {
    slug: "raport-x-vs-raport-z-diferenta",
    title: "Raport X vs. Raport Z — care e diferența și când folosiți fiecare",
    description:
      "Raportul X citește totalurile curente fără să închidă ziua fiscal, raportul Z le închide definitiv. Iată diferența practică și când folosiți fiecare, cu exemple concrete.",
    publishedAt: "2026-06-25",
    locale: "ro",
    tags: ["raport-z","raport-x"],
    image: "/marketing/reports-zreport.png",
    relatedFeature: "/features/z-report",
    sections: [
      {
        heading: "Raportul X — o citire, nu o închidere",
        body: "Raportul X (numit uneori și raport intermediar sau raport de citire) vă arată totalurile curente ale sesiunii — vânzări de până acum, defalcare numerar/card, TVA colectat — fără să reseteze sau să închidă nimic. Puteți genera un raport X de câte ori doriți în timpul zilei, la orice oră, fără nicio consecință fiscală.\n\nUtilitatea lui e strict operațională: verificați starea casei la prânz, înainte de o predare de tură, sau înainte de o depunere parțială de numerar la bancă, fără să afectați contorul zilei.",
      },
      {
        heading: "Raportul Z — închiderea, o singură dată pe zi",
        body: "Raportul Z face ce numele sugerează: închide definitiv ziua fiscală curentă și reface contoarele pentru ziua următoare. Odată generat, vânzările zilei respective sunt considerate raportate fiscal — nu mai puteți adăuga tranzacții din ziua anterioară după ce ați făcut Z.\n\nÎn majoritatea sistemelor, raportul Z pentru o zi calendaristică nu se poate genera de două ori — dacă ați emis deja Z pentru azi, a doua generare fie e blocată, fie pornește ziua următoare de la zero. De asta raportul Z se face o singură dată, la finalul efectiv al programului.",
      },
      {
        heading: "Când folosiți X și când folosiți Z",
        body: "- **Raport X** — verificare de casă la schimb de tură, fără să închideți ziua altui casier; control rapid al numerarului înainte de o depunere parțială; verificare a TVA-ului colectat până la ora respectivă, pentru o estimare\n- **Raport Z** — o singură dată, la finalul zilei de lucru, după ultima vânzare, înainte de a scoate numerarul din sertar pentru numărătoarea finală\n\nO greșeală frecventă: unii casieri generează Z de câte ori vor să vadă cum stă ziua, crezând că funcționează ca un X. Dacă sistemul permite un singur Z pe zi, asta poate încheia ziua fiscal prematur, la ora 14:00, în timp ce locația rămâne deschisă până la 22:00 — vânzările de după ora aceea rămân fără raport de închidere corect.",
      },
      {
        heading: "Ce conțin, comparativ",
        body: "Ambele rapoarte afișează, de regulă, aceleași categorii de informație — vânzări totale, defalcare pe metodă de plată, TVA pe cote — dar cu un rol diferit:\n\n- **X** — informativ, repetabil, nu modifică nimic în evidența fiscală\n- **Z** — definitiv, o dată pe zi, resetează contoarele și marchează oficial închiderea zilei\n\nDin acest motiv, raportul Z este cel arhivat și cerut la control fiscal ca dovadă a închiderii zilei — raportul X nu are această valoare, e doar un instrument de lucru.",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "În franchisetech, generarea raportului X sau Z necesită drepturi de administrator sau manager — nu orice casier poate închide ziua fiscal, exact pentru a preveni o închidere accidentală sau prematură. Raportul X îl puteți genera oricând, din contul de administrator, pentru o verificare rapidă a stării casei, fără efect asupra sesiunii active.\n\nRaportul Z rămâne acțiunea finală, conștientă, făcută o singură dată — după ce v-ați asigurat că toate vânzările zilei sunt deja înregistrate.",
      },
    ],
  },
  {
    slug: "inchidere-multi-casierie-mai-multe-case-o-zi",
    title: "Închiderea zilei când aveți mai multe case de marcat active",
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
        body: "Un restaurant cu bar și zonă de mese, sau o cafenea cu două puncte de vânzare, ajunge frecvent la aceeași greșeală: la final de zi, cineva adună toți banii într-un singur teanc și îl compară cu un singur total. Problema — dacă apare o diferență, nu mai știți din care casă vine, pentru că sertarele au fost amestecate înainte de a fi numărate separat.\n\nFiecare casă de marcat (fizică sau sesiune POS separată) trebuie numărată și închisă independent, înainte de orice consolidare.",
      },
      {
        heading: "Fiecare sesiune, propriul fond și propria închidere",
        body: "Regula de bază pentru multi-casierie: fiecare casă are propriul fond de deschidere, propriile vânzări și propriul raport Z. Nu contează dacă la final banii ajung în același seif — procesul de verificare trebuie să treacă prin fiecare casă separat:\n\n- Casa 1 (bar): fond deschidere + vânzări casa 1 = numerar așteptat casa 1\n- Casa 2 (mese): fond deschidere + vânzări casa 2 = numerar așteptat casa 2\n\nNumărați sertarul 1, comparați cu așteptat casa 1. Numărați sertarul 2, comparați cu așteptat casa 2. Abia după ce ambele sunt verificate separat, puteți consolida suma totală pentru depunere la bancă.",
      },
      {
        heading: "Cine e responsabil de fiecare casă",
        body: "Multi-casierie fără responsabilitate clară pe fiecare casă înseamnă că, la o diferență, nimeni nu poate fi tras la răspundere pentru că toată lumea a atins toate sertarele. Practicile care funcționează:\n\n- Fiecare casier deschide sesiunea pe login-ul propriu, nu pe un cont comun\n- Un casier nu operează pe casa altui casier fără o predare de tură documentată (numărare și confirmare în sistem)\n- La schimb de tură pe aceeași casă fizică, sesiunea veche se închide și se deschide una nouă — nu se continuă sesiunea altcuiva\n\nAsta transformă o diferență de casă dintr-un mister general într-o problemă atribuibilă unei persoane și unui interval orar clar.",
      },
      {
        heading: "Consolidarea la final — după, nu în loc de, verificarea individuală",
        body: "După ce fiecare casă e închisă și verificată individual, faceți consolidarea: totalul vânzărilor zilei pe toată locația, defalcat pe metodă de plată, agregat din toate sesiunile. Acesta e numărul relevant pentru raportarea către contabil și pentru urmărirea performanței zilei.\n\nDar consolidarea nu înlocuiește verificarea per casă — dacă săriți direct la totalul general și el se potrivește per total, puteți avea o casă cu 100 lei lipsă și alta cu 100 lei în plus care se anulează reciproc în total, lăsând o problemă reală neobservată.",
      },
      {
        heading: "Cum arată în franchisetech",
        body: "franchisetech tratează fiecare sesiune de casă (fiecare casier, fiecare punct de vânzare) ca o unitate separată, cu fond de deschidere propriu, raport Z propriu și diferență numerar proprie. Nu se poate deschide o a doua sesiune activă pe aceeași casă fizică fără închiderea celei anterioare — elimină scenariul în care doi casieri operează neintenționat pe același sertar.\n\nDin **Rapoarte → Raport Z zilnic**, vedeți rapoartele individuale pe casă și un total consolidat pentru toată ziua, fără să calculați manual suma sesiunilor.",
      },
    ],
  },
  {
    slug: "cand-si-cum-depui-numerarul-la-banca",
    title: "Când și cum depuneți numerarul din vânzări la bancă",
    description:
      "Depunerea numerarului nu e doar drum la bancă — presupune calcul corect al sumei, documentare în registrul de casă și un ritm care nu lasă bani să se adune nejustificat.",
    publishedAt: "2026-06-26",
    locale: "ro",
    tags: ["numerar","banca"],
    image: "/marketing/reports-zreport.png",
    relatedFeature: "/features/z-report",
    sections: [
      {
        heading: "Cât de des depuneți, în funcție de volum",
        body: "Nu există o regulă fixă, dar ritmul depinde direct de volumul zilnic de numerar:\n\n- **Volum mic** (sub 500 lei cash/zi) — depunere de 2-3 ori pe săptămână e rezonabilă, dacă aveți un seif sigur peste noapte\n- **Volum mediu-mare** (peste 1.500 lei cash/zi) — depunere zilnică, ideal în aceeași zi sau a doua zi dimineață\n- **Weekend-uri aglomerate** — dacă banca e închisă sâmbătă-duminică, folosiți automatul de depunere non-stop, dacă banca dumneavoastră oferă acest serviciu, sau păstrați în seif până luni\n\nCe nu funcționează: depunerea făcută «atunci când ai timp», fără un ritm stabilit. Ajungeți să purtați sume mari, la intervale neregulate, ceea ce e exact profilul de risc pe care doriți să-l evitați.",
      },
      {
        heading: "Pașii unei depuneri corecte",
        body: "1. **Calculați suma de depus** din raportul Z — numerar încasat minus fondul de rezervă păstrat\n2. **Numărați fizic suma** înainte să plecați de la locație, separat de restul sertarului\n3. **Completați foaia de vărsământ** (sau folosiți automatul de depunere, care generează bon automat)\n4. **Notați ieșirea în registrul de casă** — data, suma, explicația «depunere bancă»\n5. **Păstrați bonul de depunere** — justificativ pentru contabil și pentru orice verificare ulterioară a mișcării de numerar\n\nBonul de la bancă și linia din registrul de casă trebuie să corespundă exact ca sumă și dată. Dacă depuneți 682 lei dar în registru ați notat 700 lei ca să rotunjiți, ați creat o discrepanță pe care contabilul o va găsi la reconciliere.",
      },
      {
        heading: "Riscuri de siguranță de care nu vorbește nimeni",
        body: "Depunerea de numerar e momentul cu cel mai mare risc fizic din tot ciclul zilei — mai ales dacă rutina e previzibilă (aceeași oră, aceeași persoană, același traseu). Câteva ajustări simple reduc riscul real:\n\n- Variați ora și traseul, dacă e posibil\n- Nu anunțați public, în discuții cu clienți sau pe rețele sociale, când se face depunerea\n- Pentru sume mari și recurente, luați în calcul un serviciu de transport de valori în loc să purtați personal banii\n- Evitați să depuneți singur, seara târziu, într-o zonă slab iluminată — chiar dacă suma pare mică",
      },
      {
        heading: "Legătura cu registrul de casă și cu reconcilierea bancară",
        body: "Fiecare depunere trebuie să apară ca linie de ieșire în registrul de casă, cu suma și data exacte. Ulterior, contabilul verifică lunar dacă sumele depuse conform registrului de casă apar identic în extrasul de cont bancar — asta e reconcilierea bancă-casă. Orice diferență între ce ați notat că ați depus și ce arată banca efectiv are nevoie de explicație imediată, nu descoperită peste trei luni la un audit.\n\nDin acest motiv, disciplina la momentul depunerii (sumă corectă, notată corect, bon păstrat) economisește ore de muncă contabilă mai târziu.",
      },
      {
        heading: "Cum urmăriți depunerile în franchisetech",
        body: "Când înregistrați o ieșire de numerar pentru depunere bancă direct din sesiunea de casă, franchisetech o leagă automat de raportul Z al zilei respective — apare ca mișcare documentată în registrul de casă descărcabil, cu oră și utilizator care a făcut înregistrarea. Nu mai depinde de cineva să-și amintească să scrie manual într-un caiet.",
      },
    ],
  },
  {
    slug: "pontaj-personal-horeca-metode",
    title: "Pontajul personalului în HoReCa — metode simple care chiar funcționează",
    description:
      "Cum țineți evidența corectă a orelor lucrate de personal într-o cafenea sau restaurant cu ture variabile — metode reale, de la caietul de pontaj la aplicații dedicate.",
    publishedAt: "2026-06-27",
    locale: "ro",
    tags: ["personal","pontaj"],
    image: "/marketing/dashboard-hero.png",
    sections: [
      {
        heading: "De ce pontajul clasic nu ține pasul cu HoReCa",
        body: "Într-un birou, opt angajați lucrează opt ore, cinci zile pe săptămână, în același interval. Într-o cafenea sau restaurant, aveți cinci casieri cu programe diferite, doi cu normă parțială, unul care vine doar weekend și un ospătar care schimbă tura cu un coleg fără să anunțe pe nimeni în scris.\n\nUn caiet de pontaj sau un tabel Excel actualizat «din memorie» la finalul săptămânii nu prinde realitatea: ore suplimentare nescrise, ture schimbate ad-hoc, pauze care nu se respectă. Rezultatul apare abia la calculul salariilor, când orele din statul de plată nu se potrivesc cu cine chiar a fost la muncă.",
      },
      {
        heading: "Trei metode, cu avantaje și limite reale",
        body: "**Caietul de pontaj manual.** Cel mai ieftin și cel mai fragil. Depinde de disciplina fiecărui angajat să scrie ora de intrare și ieșire corect, în timp real, nu retroactiv. Într-o tură aglomerată, primul lucru uitat e pontajul.\n\n**Excel sau Google Sheets.** Un pas peste caiet — puteți calcula automat orele și costul per angajat cu formule. Problema rămâne aceeași: cineva trebuie să introducă manual ora reală, iar corecțiile ulterioare («am uitat să pontez») sunt greu de verificat.\n\n**Aplicație de pontaj dedicată sau pontaj integrat în programul de gestiune.** Angajatul se loghează cu propriul cont la începutul turei — ora se înregistrează automat, fără să depindă de memorie. Corecțiile rămân vizibile în istoric, nu se suprascriu tăcut.\n\nNu există o metodă universal corectă — depinde de câți angajați aveți și cât de variabile sunt turele. O cafenea cu 2 angajați fixi poate funcționa bine cu Excel. Un restaurant cu 12 angajați pe 3 ture are nevoie de ceva automatizat.",
      },
      {
        heading: "Ce trebuie să conțină o evidență corectă a orelor",
        body: "Indiferent de metodă, o evidență a timpului de lucru trebuie să arate clar, pentru fiecare angajat și fiecare zi:\n\n- Ora exactă de intrare și ieșire\n- Pauzele luate, mai ales dacă sunt neplătite\n- Orele suplimentare, separate de programul normal\n- Tura de noapte sau de weekend, dacă se plătește diferit\n- Zilele de concediu, medicale sau învoiri, cu tip clar\n\nAceastă evidență stă la baza statului de plată și, dacă vine un control de muncă, e primul document cerut. O evidență incompletă sau completată retroactiv «pe ghicite» e mai riscantă decât lipsa completă — arată neconcordanțe pe care nu le puteți explica ulterior.",
      },
      {
        heading: "Greșelile care apar cel mai des",
        body: "**Pontaj completat la sfârșitul săptămânii, din memorie.** Nimeni nu-și amintește exact dacă a plecat la 22:00 sau 22:30 vineri. Diferența pare mică, dar înmulțită la 4-5 angajați și 4 săptămâni, denaturează costul real cu personalul.\n\n**Ore suplimentare «înțelese», dar nescrise.** Un angajat rămâne o oră peste program să ajute la o comandă mare. Dacă nu se notați, ora dispare — angajatul simte că nu i se recunoaște efortul, iar dumneavoastră pierdeți vizibilitatea reală asupra costului cu personalul din ziua respectivă.\n\n**Schimburi de tură nedocumentate.** Doi angajați se înțeleg între ei să facă schimb, dar nimeni nu actualizează programul oficial. Dacă apare o problemă în acea tură, nu știți cu certitudine cine a fost efectiv de serviciu.",
      },
      {
        heading: "Cum legi pontajul de costul real al fiecărei ture",
        body: "Pontajul nu e doar un exercițiu de conformitate — este datele din care afli cât vă costă efectiv fiecare oră de deschidere. Dacă știți câte ore a lucrat fiecare angajat într-o săptămână și la ce tarif, puteți calcula costul cu personalul per zi și îl puteți compara cu vânzările din aceeași zi.\n\nO tură de vineri seară cu 3 angajați care aduce 1.200 lei vânzări are o structură de cost complet diferită față de o tură de marți dimineață cu aceiași 3 angajați și 400 lei vânzări. Fără pontaj corect, cifra asta rămâne invizibilă — vedeți doar costul lunar total cu salariile, fără să știți care ture sunt eficiente și care nu.",
      },
      {
        heading: "Checklist rapid pentru un pontaj care ține",
        body: "- Fiecare angajat pontează la intrare și ieșire, nu retroactiv\n- Orele suplimentare se notați separat, în ziua în care apar\n- Schimburile de tură se actualizează în programul oficial, nu doar verbal\n- Pauzele neplătite sunt marcate distinct de timpul lucrat\n- Evidența lunară se verificați înainte de calculul salariilor, nu după\n- Păstrați evidența minimum câțiva ani, pentru orice control ulterior\n\nUn pontaj corect nu previne toate problemele de personal, dar elimină cea mai frecventă sursă de conflict: «nu-mi recunoașteți orele lucrate».",
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
        body: "- Diferențe frecvente de sertar la turele lui, mai mari decât la colegii cu experiență similară\n- Întrebați repetat aceleași lucruri de bază, după prima săptămână\n- Evitați anumite acțiuni din sistem, anulări, reduceri, pentru că nu e sigur cum se fac corect\n- Colegii se plâng că trebuie constant să-l ajute, chiar și după 2-3 săptămâni\n\nDacă vedeți aceste semne, problema nu e neapărat angajatul — de multe ori e training-ul comprimat într-o singură zi haotică, în loc de un proces gradual de o săptămână.",
      },
      {
        heading: "Un POS simplu scurtează acest training",
        body: "Cea mai mare parte a timpului de training la casă nu se duce pe a învăța produsele — se duce pe a învăța sistemul: unde e fiecare buton, cum se face o anulare, cum se schimbă metoda de plată la jumătatea unei vânzări. Cu cât interfața POS e mai încărcată cu meniuri și pași ascunși, cu atât training-ul durează mai mult și diferențele de sertar din prima lună sunt mai mari.\n\nÎn franchisetech, ecranul de vânzare e construit să arate produsele direct, fără meniuri ascunse pentru acțiunile de bază — o vânzare, o anulare sau o schimbare de metodă de plată se fac din aceleași câteva atingeri, indiferent cine e la casă. Pentru un casier nou, asta înseamnă mai puțin de memorat și mai puține motive să greșească din nesiguranță, nu din neatenție.",
      },
    ],
  },
  {
    slug: "targeturi-vanzari-per-angajat-cum-le-stabilesti",
    title: "Cum stabiliți targeturi de vânzări realiste per angajat",
    description:
      "Cum stabiliți targeturi de vânzări realiste pentru barista, ospătari sau casieri, bazate pe date reale din tură, nu pe cifre alese la întâmplare, și ce faceți când nu sunt atinse.",
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
        heading: "Cum calculați un target pe baza datelor reale",
        body: "Formula de bază:\n\n**Target tură = Media vânzărilor din ultimele 8-12 ture similare × factor de ajustare**\n\nFactorul de ajustare ține cont de context: eveniment local, sezon, promoție activă, zi de sărbătoare. Fără eveniment special, factorul e 1.0 — nu inventați o creștere artificială.\n\nExemplu concret pentru o cafenea:\n\n- Media vânzărilor din ultimele 10 ture de sâmbătă dimineața: 1.850 lei\n- Fără evenimente speciale în weekendul curent: factor 1.0\n- Target tură: 1.850 lei\n\nDacă în weekendul respectiv e un târg în zonă și vă așteptați la trafic suplimentar, ajustați cu un factor rezonabil (1.15–1.2), nu dublați cifra pe baza optimismului.\n\nRecalculați targeturile lunar. O cafenea care crește constant cu 5-10% pe lună și păstrează targeturile de acum trei luni motivează greșit — targetul devine prea ușor de atins și nu mai reflectă potențialul real.",
      },
      {
        heading: "Target de vânzări vs. target de atașament — nu sunt același lucru",
        body: "Un target de vânzări brute (lei încasați pe tură) spune cât s-a vândut, dar nu spune nimic despre calitatea vânzării. Un barista poate atinge targetul doar din trafic mare, fără să fi contribuit cu nimic la valoarea medie a comenzii.\n\nTargetul de atașament măsoară altceva: câte comenzi includ un produs suplimentar (desert lângă cafea, sirop, mărire de porție). Exemplu:\n\n- Valoare medie comandă fără atașamente: 14 lei\n- Valoare medie comandă cu un produs atașat: 19–22 lei\n- Target atașament realist: 25-30% din comenzi cu produs suplimentar\n\nCombinarea celor două targeturi (vânzări totale + rată de atașament) dă o imagine mai corectă a contribuției individuale decât cifra brută singură.",
      },
      {
        heading: "Ce faceți când targetul nu e atins",
        body: "Un target ratat nu înseamnă automat o problemă de performanță. Înainte să trageți concluzii, verificați:\n\n- A fost o zi cu trafic real mai mic decât media (vreme proastă, stradă în lucrări, eveniment concurent)?\n- A lucrat angajatul singur într-o tură normal acoperită de doi oameni?\n- A existat o problemă tehnică (POS căzut, stoc epuizat la produsul principal)?\n\nDacă targetul e ratat constant, în condiții normale, comparativ cu colegii din ture similare, atunci discuția cu angajatul are sens, dar cu date concrete în față, nu cu impresii.\n\nTargetul e un instrument de vizibilitate, nu un motiv de penalizare automată. Folosit ca amenințare, demotivează. Folosit ca reper, ajută echipa să vadă unde stă față de potențialul turei.",
      },
      {
        heading: "Cum urmăriți targeturile în franchisetech",
        body: "Din **Rapoarte → Vânzări per angajat**, vedeți pentru fiecare cont de utilizator (casier, barista, ospătar): valoarea totală a vânzărilor din tură, numărul de tranzacții, valoarea medie a comenzii și rata de atașament pe categorii de produse.\n\nPentru că fiecare vânzare e legată de sesiunea de casă și de utilizatorul logat, nu mai adunați manual bonuri și nu mai cereți fiecărui angajat să-și noteze cifrele. Comparați direct tura de azi cu media ultimelor 10 ture similare, fără calcul separat în Excel.\n\nDatele istorice necesare pentru targeturi realiste există deja în sistem din prima săptămână de utilizare — nu trebuie să așteptați luni de date pentru primul target relevant.",
      },
    ],
  },
  {
    slug: "program-legal-de-lucru-horeca-romania",
    title: "Programul legal de lucru în HoReCa România — ce trebuie să respectați",
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
        body: "Munca desfășurată în intervalul orar considerat de noapte (de regulă 22:00–06:00) trebuie compensată conform legii — fie prin reducerea programului, fie printr-un spor salarial stabilit prin contractul colectiv aplicabil sau prin contractul individual de muncă. Procentul exact de spor variază în funcție de sectorul de activitate și de ce prevede contractul aplicabil — verificați-l cu un specialist în legislația muncii sau cu contabilul care vă administrează salarizarea, nu presupuneți un procent standard.\n\nPentru orice zi de lucru mai lungă de 6 ore, angajatul are dreptul la o pauză de masă, a cărei durată minimă este stabilită prin contractul colectiv de muncă sau prin regulamentul intern. În HoReCa, pauza trebuie programată real — nu doar trecută pe hârtie — ceea ce înseamnă acoperire suplimentară de personal în orele de vârf, altfel angajatul rămâne fără pauză efectivă.",
      },
      {
        heading: "Evidența orelor de lucru — de ce contează",
        body: "Angajatorul are obligația de a ține evidența orelor lucrate de fiecare angajat, indiferent de tipul de contract (normă întreagă, timp parțial). La un control de muncă, lipsa evidenței sau evidența care nu corespunde cu programul real afișat este una dintre cele mai frecvente cauze de sancțiune în HoReCa.\n\nProbleme tipice descoperite la control:\n\n- Program afișat diferit de orele efectiv lucrate (angajatul vine mai devreme pentru pregătire, dar ora nu e înregistrată)\n- Ture suplimentare acoperite informal, fără actualizarea evidenței\n- Personal care lucrează fără contract sau cu contract de timp parțial, dar cu program de normă întreagă în realitate\n\nEvidența trebuie să reflecte exact orele lucrate, inclusiv timpul de pregătire înainte de deschidere și de închidere efectivă a casei după ultimul client.",
      },
      {
        heading: "Checklist practic de conformitate",
        body: "- [ ] Fiecare angajat are program de lucru documentat, corespunzător cu orele efectiv lucrate\n- [ ] Repausul zilnic minim este respectat între ture consecutive\n- [ ] Repausul săptămânal este acordat, chiar dacă nu cade mereu în weekend\n- [ ] Munca de noapte este compensată conform contractului aplicabil\n- [ ] Pauza de masă este programată real, cu acoperire de personal\n- [ ] Evidența orelor lucrate este actualizată, nu doar «pe hârtie»\n- [ ] Programările de tură sunt rotative, nu concentrate constant pe aceiași 2-3 oameni\n\nAceastă listă nu înlocuiește sfatul unui specialist în legislația muncii — pentru situații specifice (contracte de timp parțial, muncă sezonieră, program inegal), verificați detaliile cu un consultant HR sau cu contabilul care administrează salarizarea afacerii dumneavoastră.",
      },
    ],
  },
  {
    slug: "cum-evaluezi-performanta-unui-barista-ospatar",
    title: "Cum evaluați performanța unui barista sau ospătar, dincolo de vânzări",
    description:
      "De ce cifra de vânzări nu e suficientă pentru a evalua un barista sau ospătar și ce alți indicatori operaționali contează, urmăriți din datele POS fără muncă manuală.",
    publishedAt: "2026-07-01",
    locale: "ro",
    tags: ["personal","performanta"],
    image: "/marketing/industry-cafe.png",
    sections: [
      {
        heading: "De ce cifra brută de vânzări minte uneori",
        body: "Un barista care lucrează sâmbătă dimineața, cu coadă la ușă, va avea mereu o cifră de vânzări mai mare decât unul care lucrează marți după-amiază, indiferent cât de bine își face treaba fiecare. Dacă evaluarea se bazează exclusiv pe totalul vândut, ajungeți să comparați efectiv traficul turelor, nu performanța oamenilor.\n\nCifra de vânzări rămâne un indicator util, dar trebuie combinată cu alții care spun ceva despre calitatea muncii, nu doar despre volumul de clienți întâmplător primiți.",
      },
      {
        heading: "Indicatori operaționali măsurabili din POS",
        body: "- Rata de anulări/corecții — câte tranzacții au fost anulate sau corectate după inițiere. O rată mare poate indica greșeli frecvente la comandă sau la operarea casei\n- Timpul mediu per tranzacție — cât durează, în medie, de la deschiderea comenzii până la finalizarea plății, util mai ales la casele cu coadă vizibilă\n- Diferența de sertar la finalul turei — un angajat cu diferențe recurente (chiar mici) merită o discuție, unul cu sertar exact de fiecare dată e un semnal pozitiv clar\n- Rata de atașament — procentul de comenzi cu produs suplimentar sugerat și acceptat de client\n\nAcești patru indicatori se extrag direct din datele POS, fără să depindeți de impresii sau de memoria cuiva despre cum a fost tura respectivă.",
      },
      {
        heading: "Indicatori calitativi — mai greu de măsurat, la fel de importanți",
        body: "- Feedback direct de la clienți — reclamații sau aprecieri primite verbal sau prin recenzii online menționând un angajat anume\n- Consistența pregătirii produselor — dacă un produs are gust diferit în funcție de cine îl prepară, e un semnal de instruire, nu neapărat de atitudine\n- Colaborarea cu echipa — cine ajută la ture aglomerate fără să i se ceară, cine lasă treaba pe jumătate la predarea turei\n\nAcești indicatori nu apar în niciun raport automat. Necesită observație directă și, ideal, o notă scurtă săptămânală din partea managerului de tură — altfel se pierd în memorie și evaluarea devine subiectivă la fiecare discuție.",
      },
      {
        heading: "Cum combinați toate astea fără un tabel Excel complicat",
        body: "Nu aveți nevoie de un sistem de scoring elaborat. O evaluare simplă, lunară, cu patru-cinci linii per angajat este suficientă pentru o afacere mică:\n\n- Cifra de vânzări comparată cu media turelor similare (nu cifra brută izolată)\n- Rata de anulări/corecții din luna respectivă\n- Diferența medie de sertar la predarea turei\n- O notă calitativă scurtă (colaborare, feedback clienți, consistență)\n\nDiscuția cu angajatul pornește de la aceste puncte concrete, nu de la impresia generală «mi se pare că merge bine sau rău». Angajatul înțelege exact ce se măsoară și poate contesta sau explica o cifră care nu reflectă realitatea, de exemplu o diferență de sertar cauzată de o eroare din tura anterioară, nu de el.",
      },
      {
        heading: "Ce rapoarte din franchisetech vă ajută",
        body: "Din **Rapoarte → Vânzări per angajat**, vedeți cifra de vânzări per cont, defalcată pe ture și zile, comparabilă cu media unor ture similare. Din istoricul sesiunilor de casă, vedeți diferența de sertar per sesiune, deci per angajat și tură, nu doar pe total zi.\n\nRata de anulări/corecții e vizibilă din istoricul tranzacțiilor per utilizator — fiecare anulare e asociată cu contul care a operat-o. Combinate, aceste rapoarte vă dau baza obiectivă pentru evaluare, fără să notați manual nimic pe parcursul lunii — datele există deja din operarea zilnică a POS-ului.",
      },
    ],
  },
  {
    slug: "export-csv-vs-xml-pentru-contabil",
    title: "Export CSV vs. XML pentru contabil — care e mai potrivit și când",
    description:
      "Diferența practică dintre exportul CSV și XML pentru contabil: când alegeți unul sau altul, ce riscați dacă alegeți greșit și cum decideți împreună cu contabilul dumneavoastră.",
    publishedAt: "2026-07-02",
    locale: "ro",
    tags: ["contabilitate","export"],
    image: "/marketing/dashboard-hero.png",
    sections: [
      {
        heading: "Diferența simplă dintre CSV și XML",
        body: "CSV (comma-separated values) este un fișier tabelar simplu — rânduri și coloane separate prin virgulă sau punct-virgulă, care se deschide direct în Excel sau Google Sheets. Îl poate citi și modifica orice om, fără soft specializat.\n\nXML este un format structurat ierarhic, gândit să fie citit direct de un program, nu de un om. Un soft de contabilitate cu funcție de import poate «înțelege» automat un fișier XML și poate popula jurnalele contabile fără intervenție manuală, dacă structura fișierului corespunde exact cu ce așteaptă programul respectiv.\n\nDiferența practică: CSV e pentru verificare vizuală și lucru manual, XML e pentru import automatizat direct într-un soft.",
      },
      {
        heading: "Când alegeți CSV",
        body: "CSV e alegerea potrivită când:\n\n- Contabilul dumneavoastră lucrează în principal în Excel sau într-un soft care nu are o funcție dedicată de import automatizat\n- Doriți să verificați dumneavoastră însuți datele înainte de a le trimite mai departe — un CSV se deschide și se citește direct, un XML brut e greu de citit vizual\n- Aveți nevoie de o combinație rapidă de date pentru altceva decât contabilitate (analiză proprie, comparație lună pe lună)\n\nDezavantajul CSV: contabilul (sau dumneavoastră) trebuie să introducă manual datele în softul de contabilitate, sau să le proceseze printr-un import parțial automatizat, ceea ce lasă loc de erori de transcriere, mai ales la volume mari de tranzacții.",
      },
      {
        heading: "Când alegeți XML",
        body: "XML e alegerea potrivită când contabilul folosește un soft de contabilitate cu funcție de import automat pentru documente externe — de exemplu Saga, unul dintre cele mai răspândite softuri de acest tip în România, dar principiul e valabil pentru orice soft cu import XML dedicat.\n\nAvantajul principal: eliminați pasul de transcriere manuală. Datele — NIR-uri, vânzări defalcate pe TVA — ajung direct în jurnalele contabile, fără ca cineva să retasteze cifre dintr-un fișier în altul. Pentru volume mari de tranzacții lunare, diferența de timp și de risc de eroare devine semnificativă.\n\nDezavantajul: dacă structura XML generată nu corespunde exact cu ce așteaptă softul de import, importul eșuează sau introduce date greșite fără avertisment vizibil — de aceea primul export XML către un contabil nou trebuie verificat cu atenție, nu presupus corect din prima.",
      },
      {
        heading: "Riscuri specifice fiecărui format",
        body: "Riscuri CSV:\n\n- Separatorul zecimal sau de coloane (virgulă vs. punct-virgulă) diferă între regiuni și poate produce un fișier ilizibil dacă softul destinație așteaptă alt format\n- Diacriticele românești (ă, â, î, ș, ț) se pot afișa greșit dacă encodarea fișierului nu e cea corectă\n- O coloană lipsă sau redenumită între exporturi succesive poate strica un proces de import deja configurat de contabil\n\nRiscuri XML:\n\n- Structura trebuie să corespundă exact versiunii de import așteptate de softul contabil — o versiune de soft mai veche sau mai nouă poate avea cerințe ușor diferite\n- Erorile de import XML sunt uneori tăcute — datele intră parțial sau greșit, fără mesaj clar de eroare, iar discrepanța se descoperă abia la o verificare ulterioară\n\nNiciun format nu e mai sigur în sine — siguranța vine din verificarea primului export, indiferent de format.",
      },
      {
        heading: "Cum alegeți practic",
        body: "Întrebați-vă direct contabilul: «Ce format accepți pentru import — ai un soft cu import automat sau lucrezi manual în Excel?» Răspunsul lui decide formatul, nu preferința dumneavoastră.\n\nDacă nu sunteți sigur sau contabilul nu a mai primit date dintr-un program de gestiune până acum, CSV e punctul de plecare mai sigur — poate fi verificat vizual de amândoi înainte să treceți la un flux XML automatizat. Odată ce fluxul e stabil și verificat, XML economisește timp lună de lună, mai ales dacă volumul de tranzacții e mare.\n\nfranchisetech oferă ambele formate de export din aceeași secțiune de rapoarte — alegeți o dată formatul potrivit împreună cu contabilul, apoi exportul lunar devine un singur click, indiferent care variantă ați ales.",
      },
    ],
  },
  {
    slug: "documente-obligatorii-horeca-lista-completa",
    title: "Documentele obligatorii într-o cafenea sau restaurant — lista completă 2026",
    description:
      "Ce documente obligatorii trebuie să aveți la o cafenea sau restaurant în 2026: autorizații, avize sanitare, rapoarte fiscale zilnice și registre de gestiune stoc.",
    publishedAt: "2026-07-03",
    locale: "ro",
    tags: ["contabilitate","conformitate"],
    image: "/marketing/dashboard-hero.png",
    sections: [
      {
        heading: "De ce nu puteți improviza lista asta",
        body: "Un control neanunțat de la ANAF, DSP sau ISU nu așteaptă să găsiți documentele prin sertare. Inspectorul cere ce cere, în ziua respectivă, iar «le trimit mâine» nu este un răspuns acceptat.\n\nProblema tipică într-o cafenea sau restaurant tânăr: autorizațiile s-au obținut o dată, la deschidere, și de atunci nimeni nu le-a mai văzut. Între timp au apărut angajați noi fără fișă de instructaj, NIR-uri neînregistrate sau rapoarte Z lipsă pentru câteva zile din luna trecută.\n\nLista de mai jos separă documentele pe categorii — ce aveți nevoie o singură dată la deschidere, ce se reînnoiește periodic și ce se generează zilnic din activitatea curentă.",
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
        body: "- **NIR (Nota de Intrare-Recepție)** — strict obligatoriu prin lege doar în situații specifice (marfă de la persoane fizice, marfă fără documente de însoțire, diferențe constatate la recepție), dar folosit ca standard de recepție pentru orice livrare de marfă în majoritatea afacerilor HoReCa cu gestiune de stoc\n- **Bonul de consum**, care justifică ieșirea materiilor prime din gestiune prin preparare\n- **Balanța cantitativ-valorică**, care compară intrările, ieșirile și stocul rămas\n- **Inventarierea anuală**, obligatorie pentru orice gestiune de stoc, plus inventarieri la schimbarea persoanei responsabile de gestiune\n\nFără NIR (sau cel puțin fără facturi și avize păstrate și corelate sistematic) pentru fiecare recepție de marfă, stocul din sistem nu mai corespunde cu stocul fizic — iar la inventarul anual apar diferențe pe care nimeni nu le mai poate explica la distanță de luni.",
      },
      {
        heading: "Documentele de personal",
        body: "- **Contractele individuale de muncă**, înregistrate în Revisal înainte ca angajatul să înceapă efectiv activitatea\n- **Fișele de instructaj SSM (securitate și sănătate în muncă) și PSI**, semnate la angajare și reînnoite periodic\n- **Fișele de aptitudine medicală** pentru personalul care manipulează alimente\n- **Regulamentul intern și pontajul**\n\nÎntr-o cafenea sau restaurant cu fluctuație mare de personal — situație frecventă în HoReCa — aceste documente se pierd cel mai ușor. Un barista angajat pentru trei săptămâni de vară fără fișă de instructaj înseamnă o problemă la control, indiferent cât de bine stă restul actelor.",
      },
      {
        heading: "Ce acoperă franchisetech și ce rămâne pe umerii dumneavoastră",
        body: "Franchisetech nu emite autorizații și nu ține evidența avizelor DSP sau ISU — acestea rămân documente fizice, obținute de la instituțiile competente și păstrate separat.\n\nCe acoperă direct: raportul Z zilnic, registrul de casă, NIR-urile la fiecare recepție de marfă, bonul de consum generat automat din vânzările cu rețetă și exportul acestor date pentru contabil. Documentele care demonstrează activitatea comercială și de gestiune curentă sunt generate și arhivate automat, cu istoric complet, oricând le puteți descărca pentru un control.\n\nPractic: ține avizele și autorizațiile într-un dosar (fizic sau scanat) lângă casă, iar pentru tot ce e fiscal și de gestiune zilnică, lasă sistemul să genereze documentele — nu le reconstitui manual la final de lună.",
      },
    ],
  },
  {
    slug: "cheltuieli-deductibile-horeca-ce-poti-trece",
    title: "Cheltuieli deductibile în HoReCa — ce puteți trece și ce nu",
    description:
      "Ce cheltuieli sunt deductibile fiscal într-o cafenea sau restaurant din România: categorii clar deductibile, cheltuieli cu limite legale și documentele necesare pentru fiecare.",
    publishedAt: "2026-07-03",
    locale: "ro",
    tags: ["contabilitate","cheltuieli"],
    image: "/marketing/reports-sales.png",
    sections: [
      {
        heading: "De ce contează distincția, nu doar la control",
        body: "O cheltuială trecută greșit ca deductibilă nu doar riscă o problemă la control — umflă artificial imaginea de profitabilitate pe care o vedeți dumneavoastră ca proprietar. Dacă în calculul dumneavoastră de marjă apar cheltuieli care de fapt nu se scad din baza impozabilă, impozitul pe profit calculat de contabil va fi diferit de ce ați estimat dumneavoastră, iar surpriza vine trimestrial.\n\nRegula generală: o cheltuială este deductibilă dacă este efectuată în scopul obținerii de venituri impozabile și este justificată cu document. Fără document, indiferent cât de evident e scopul ei de afacere, cheltuiala devine nedeductibilă.",
      },
      {
        heading: "Cheltuieli clar deductibile în activitatea zilnică",
        body: "- **Materie primă și marfă** — cafea, lapte, alimente, băuturi, ambalaje — cu condiția să existe NIR sau factură de achiziție\n- **Chiria spațiului** și utilitățile (curent, apă, gaz, internet)\n- **Salariile și contribuțiile aferente** personalului angajat\n- **Consumabile de curățenie și igienă**, obligatorii pentru funcționarea unei unități alimentare\n- **Mentenanța echipamentelor** — service la espressor, frigidere, cuptor\n- **Comisioanele de la procesatorul de plăți cu cardul**\n- **Chiria sau leasingul echipamentelor** (casă de marcat, POS, mobilier)\n\nToate acestea sunt deductibile integral atât timp cât sunt justificate documentar (factură, NIR, chitanță fiscală) și sunt legate de activitatea curentă.",
      },
      {
        heading: "Cheltuieli deductibile cu limite sau condiții",
        body: "Câteva categorii frecvente în HoReCa sunt deductibile doar parțial sau condiționat — verificați plafoanele exacte cu contabilul, pentru că se pot modifica de la un an fiscal la altul:\n\n- **Cheltuielile de protocol** (mese cu parteneri, degustări pentru furnizori) — deductibile doar în limita unui plafon legal, calculat ca procent din profitul contabil ajustat\n- **Cheltuielile cu autovehiculele** folosite mixt (aprovizionare + uz personal) — deductibilitate parțială dacă vehiculul nu este utilizat exclusiv pentru activitatea firmei\n- **Uniformele de lucru** — deductibile dacă sunt prevăzute în regulamentul intern ca obligatorii pentru personal\n- **Abonamentele telefonice mixte** — deductibile proporțional cu utilizarea în scop de afacere, dacă nu există un telefon dedicat exclusiv firmei\n\nAceste plafoane sunt stabilite prin legislație fiscală și pot varia — nu le calcula singur, cere-i contabilului formula exactă aplicabilă anului curent.",
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
        heading: "Cum vă ajută franchisetech să aveți justificarea la îndemână",
        body: "Franchisetech nu decide ce este deductibil — asta rămâne decizia contabilului, pe baza legislației fiscale în vigoare. Ce poate face sistemul: să păstreze NIR-urile și bonurile de consum organizate, cu furnizor, dată și valoare, astfel încât fiecare leu de marfă intrată în gestiune să aibă documentul care îl justifică.\n\nCând contabilul întreabă «de unde vine factura asta de la furnizorul de cafea», răspunsul e în NIR-ul din sistem, nu într-un teanc de facturi căutate retroactiv.",
      },
    ],
  },
  {
    slug: "ce-rapoarte-cere-contabilul-de-la-tine-lunar",
    title: "Ce rapoarte vă cere contabilul în fiecare lună și de unde le luați rapid",
    description:
      "Lista completă a rapoartelor cerute lunar de contabil de la o cafenea sau restaurant — raport Z, NIR-uri, bon de consum, extras bancar — și cum le obțineți rapid, fără căutări.",
    publishedAt: "2026-07-04",
    locale: "ro",
    tags: ["contabilitate","rapoarte"],
    image: "/marketing/dashboard-hero.png",
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
        heading: "De ce întârziați dumneavoastră livrarea acestor documente, de obicei",
        body: "Cele mai frecvente motive pentru care proprietarii de cafenele și restaurante întârzie pachetul lunar:\n\n- Rapoartele Z sunt tipărite și puse într-un dosar fizic care se rătăcește sau se pierde parțial\n- NIR-urile sunt introduse cu întârziere, uneori la sfârșitul lunii, «din memorie»\n- Facturile de la furnizori mici ajung pe WhatsApp sau email și se pierd printre alte mesaje\n- Nimeni din echipă nu este responsabil clar cu strângerea documentelor — fiecare presupune că altcineva se ocupă\n\nSoluția nu este muncă suplimentară la final de lună, ci ca fiecare document să fie introdus în sistem în momentul în care se produce — NIR-ul la recepția mărfii, raportul Z la închiderea zilei — nu reconstituit ulterior.",
      },
      {
        heading: "Cum arată un pachet lunar complet",
        body: "Un pachet lunar pe care contabilul îl poate procesa fără întrebări suplimentare conține:\n\n- Rapoartele Z ale tuturor zilelor lucrătoare, fără lipsuri\n- NIR-urile emise (nu în stadiul de ciornă) pentru toate recepțiile lunii\n- Bonul de consum generat pentru perioadă\n- Extrasul bancar descărcat din internet banking\n- Facturile de cheltuieli fixe, scanate sau în format electronic\n\nDacă toate cinci sunt complete și corespund calendaristic cu luna în cauză, contabilul poate închide luna fără să aștepte clarificări de la dumneavoastră.",
      },
      {
        heading: "Cum le generați rapid din franchisetech",
        body: "Din secțiunea **Rapoarte → Export audit & Saga**, selectați perioada lunară și exportați NIR-urile și vânzările direct în format compatibil cu programele de contabilitate uzuale. Rapoartele Z individuale rămân disponibile oricând în **Rapoarte → Raport Z zilnic**, cu istoric complet.\n\nÎn loc să adunați documentele manual din dosare, emailuri și WhatsApp, trimiteți contabilului un singur export lunar plus accesul la rapoartele arhivate — pachetul e gata în minute, nu în zile.",
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
        heading: "Etapa legală și administrativă — înainte să semnați contractul de spațiu",
        body: "- Înființarea firmei (SRL, cel mai frecvent pentru o cafenea cu angajați) cu codul CAEN corespunzător activității de baruri/cafenele\n- Verificarea destinației spațiului — nu orice spațiu comercial are avizul necesar pentru activitate de alimentație publică, verificați asta înainte de a semna contractul de închiriere\n- Obținerea autorizației de funcționare de la primărie\n- Avizul sanitar de la direcția de sănătate publică\n- Contract cu firmă de dezinsecție-deratizare\n\nAceastă etapă durează de obicei mai mult decât estimează proprietarii la prima deschidere — plănuiți câteva săptămâni, nu câteva zile, între semnarea spațiului și prima zi de funcționare legală.",
      },
      {
        heading: "Amenajare și echipamente esențiale",
        body: "- **Espressor profesional** — dimensionat pentru volumul estimat, nu pentru cel dorit; un espressor subdimensionat cedează în weekend-uri aglomerate\n- **Râșniță de cafea** dedicată, calibrată pentru tipul de boabe ales\n- **Vitrină frigorifică** pentru patiserie și produse perisabile\n- **Frigider/congelator de rezervă** pentru stoc de lapte, siropuri, materie primă\n- **Mobilier și zonă de servire** dimensionate pentru fluxul de clienți estimat, nu doar pentru aspect\n- **Casă de marcat fiscală** conectată la ANAF — obligatorie de la prima vânzare\n\nO greșeală frecventă la deschidere: se investește disproporționat în amenajare (design, mobilier) și insuficient în echipamentul de bază care determină viteza de servire — un espressor bun compensează mult mai mult decât un decor scump.",
      },
      {
        heading: "Furnizori și meniul de lansare",
        body: "Pentru o cafenea nouă, meniul de lansare nu trebuie să fie extins — trebuie să fie fiabil. Un meniu de 8–12 produse bine executate constant depășește un meniu de 30 de produse cu calitate inconsistentă.\n\n- Alegeți furnizorul de cafea pe baza unui test de câteva săptămâni, nu doar a unei degustări unice\n- Stabiliți un furnizor de lapte cu livrare frecventă (lactatele nu se stochează în cantitate mare la o cafenea mică)\n- Pentru patiserie: decide de la început dacă produceți intern sau cumpărați de la un furnizor — combinația e posibilă, dar clarificați-o dinainte pentru calculul costurilor\n\nÎnainte de deschidere, calculați costul fiecărei rețete din meniul de lansare — cappuccino, flat white, ceai, câte un produs de patiserie — ca să știți din prima zi ce marjă aveți, nu să afli după o lună de vânzări.",
      },
      {
        heading: "Sistemul de casă și configurarea gestiunii",
        body: "1. **Instalați casa de marcat fiscală** și o conectați la ANAF, conform cerințelor legale\n2. **Configurați produsele în sistemul POS** — denumire, preț, cotă TVA corectă per produs\n3. **Introduceți rețetele** pentru produsele cu ingrediente (cafea, lapte, siropuri) ca să aveți calculul de cost automat de la prima vânzare\n4. **Setați stocul inițial** pe baza primei recepții de marfă (NIR)\n5. **Configurați utilizatorii** — cine are acces la casă, cine poate face anulări sau reduceri\n\nAcest pas se face înainte de deschidere, nu în prima săptămână de funcționare — o cafenea care deschide fără produsele configurate corect în POS pierde timp la fiecare vânzare din primele zile, exact când clienții testează afacerea pentru prima dată.",
      },
      {
        heading: "Personal și instruire înainte de prima zi",
        body: "- Angajarea baristilor cu contract de muncă înregistrat în Revisal înainte de prima zi lucrată\n- Instruirea pe casa de marcat și sistemul POS — minimum o sesiune de exersare cu vânzări simulate\n- Fișele de instructaj SSM și PSI, semnate la angajare\n- Un ghid scris (chiar simplu, o pagină) cu procedura de deschidere și închidere a zilei — cine numără sertarul, cine generează raportul Z\n\nO cafenea nouă are, de regulă, personal nou și proceduri neconsolidate în același timp. Documentarea procedurilor de bază de la început reduce dependența de memoria unei singure persoane.",
      },
      {
        heading: "Ziua de deschidere și primele două săptămâni",
        body: "Multe cafenele fac o deschidere «soft» — câteva zile de funcționare fără promovare, pentru ca personalul și sistemul să se roteze fără presiunea unui val mare de clienți din prima zi.\n\nÎn primele două săptămâni:\n\n- Generați raportul Z în fiecare zi, fără excepție — obișnuiți-vă cu procesul cât timp volumul e încă gestionabil\n- Verificați zilnic dacă stocul scade conform așteptărilor sau apar diferențe neexplicate\n- Ajustați meniul pe baza vânzărilor reale — produsele care nu se vând deloc în primele două săptămâni rareori decolează mai târziu fără o schimbare\n\nFranchisetech oferă configurare ghidată în aplicație pentru produse, rețete și prima sesiune de casă, plus 15 zile de trial — util exact pentru etapa asta, când doriți sistemul funcțional înainte de ziua de deschidere, nu în timpul ei.",
      },
    ],
  },
  {
    slug: "provocari-gestiune-food-truck-romania",
    title: "Provocările gestiunii unui food truck în România și cum le rezolvați",
    description:
      "Cele mai frecvente provocări operaționale ale unui food truck din România — mobilitate, conexiune la internet, stoc limitat, vreme — și cum le gestionați fără să pierdeți vânzări.",
    publishedAt: "2026-07-05",
    locale: "ro",
    tags: ["food-truck","gestiune"],
    image: "/marketing/industry-food-truck.png",
    relatedFeature: "/features/pos",
    sections: [
      {
        heading: "Mobilitatea schimbă regulile față de o locație fixă",
        body: "Un food truck nu funcționează în același loc în fiecare zi — se mută între evenimente, piețe, zone de birouri sau festivaluri, uneori de mai multe ori pe săptămână. Asta schimbă practic tot ce se aplică unei cafenele sau unui restaurant cu locație fixă.\n\nFiecare locație nouă poate avea reguli diferite: unele primării cer autorizație separată pentru comerț ambulant sau ocuparea domeniului public, unele evenimente au taxă de participare inclusă în contract, altele cer dovada avizului sanitar valabil pentru vehicul. Verificați cerințele specifice ale fiecărei locații înainte de a vă muta acolo — nu presupuneți că autorizația de la locul anterior acoperă automat locul următor.",
      },
      {
        heading: "Conexiunea la internet nu este garantată nicăieri",
        body: "Un festival în aer liber, o parcare industrială sau o piață stradală nu au întotdeauna semnal stabil. Dacă sistemul de casă depinde complet de conexiune permanentă la internet ca să înregistreze o vânzare, o oră de semnal slab înseamnă o oră de vânzări pierdute sau notate manual, cu risc de eroare la reconciliere ulterioară.\n\nUn sistem POS pentru food truck trebuie să funcționeze offline — să înregistreze vânzarea local, pe dispozitiv, și să sincronizeze automat datele când conexiunea revine. Verificați explicit acest lucru înainte de a alege un sistem — pentru un food truck contează mai mult decât pentru orice altă locație HoReCa.",
      },
      {
        heading: "Stocul limitat, într-un spațiu de câțiva metri pătrați",
        body: "Un food truck nu are depozit de rezervă — ce nu încape în vehicul, nu există pentru ziua respectivă. Asta înseamnă că aprovizionarea trebuie calculată cât mai aproape de vânzarea estimată, fără marjă mare de eroare în ambele direcții.\n\n- Prea puțin stoc → rămâi fără un produs de bază la jumătatea unui eveniment aglomerat\n- Prea mult stoc → transportați materie primă perisabilă înapoi și înainte, cu risc de pierdere\n\nȚinerea unui istoric de vânzări per locație și per tip de eveniment (festival de weekend vs. zonă de birouri în timpul săptămânii) ajută la calibrarea comenzilor viitoare mult mai bine decât o estimare generală.",
      },
      {
        heading: "Vremea și evenimentele schimbă vânzările de la o zi la alta, radical",
        body: "O ploaie neașteptată poate reduce la jumătate vânzările unui food truck într-o piață stradală, în timp ce un festival bine promovat poate tripla volumul obișnuit față de o zi normală. Diferența e mult mai mare decât la o locație fixă, unde clienții vin oricum, indiferent de vreme.\n\nAceastă variație face imposibilă o aprovizionare «standard» pentru fiecare zi. Merită să urmăriți separat vânzările din fiecare tip de context (festival, piață stradală, eveniment corporate) ca să aveți o bază reală de estimare, nu o singură medie generală care ascunde diferențele mari dintre tipurile de zile.",
      },
      {
        heading: "Personal redus, presiune mare pe viteză",
        body: "Majoritatea food truck-urilor operează cu 1–2 persoane, uneori 3 la evenimente mari. Fără personal de rezervă la fața locului, orice blocaj — o casă de marcat care se blochează, un sistem POS lent — se traduce direct în coadă vizibilă și clienți care renunță.\n\nViteza la casă contează disproporționat de mult pentru un food truck comparativ cu o locație fixă: clienții de la un festival nu așteaptă 5 minute pentru o comandă simplă, indiferent cât de bună e mâncarea. Un flux de comandă cu cât mai puțini pași — selectați produsul, încasați, următorul client — face diferența reală la orele de vârf.",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "POS-ul franchisetech funcționează offline — vânzările se înregistrează local pe dispozitiv chiar și fără conexiune la internet, iar datele se sincronizează automat de îndată ce semnalul revine. Pentru un food truck care se mută constant între locații cu conexiune inconsistentă, asta înseamnă că nu pierdeți nicio vânzare din cauza semnalului slab dintr-o parcare sau un festival în aer liber.\n\nRaportul Z rămâne disponibil pentru fiecare zi/locație, iar stocul se actualizează la fiecare NIR — util pentru un food truck unde fiecare kilogram de marfă transportată trebuie contabilizat corect, indiferent unde a fost vândut.",
      },
    ],
  },
  {
    slug: "stoc-perisabil-patiserie-cum-il-gestionezi",
    title: "Stocul perisabil la o patiserie — cum îl gestionați fără risipă",
    description:
      "Cum gestionați stocul perisabil la o patiserie din România: planificare producție, rotație FIFO, reduceri de final de zi — ca să reduceți risipa fără să pierdeți vânzări.",
    publishedAt: "2026-07-05",
    locale: "ro",
    tags: ["patiserie","stoc","risipa"],
    image: "/marketing/stock-report.png",
    sections: [
      {
        heading: "Risipa la patiserie e diferită de risipa la restaurant",
        body: "Un restaurant poate ajusta producția aproape în timp real — un preparat se gătește la comandă. O patiserie produce dimineața (sau cu o zi înainte pentru anumite produse) o cantitate fixă, iar ce nu se vinde până seara rămâne stoc care își pierde valoarea rapid — de la produs proaspăt la produs de reducere, la aruncat, în câteva zile sau chiar câteva ore la unele sortimente.\n\nDouă erori opuse costă bani în feluri diferite: prea puțină producție înseamnă clienți care pleacă fără ce au vrut să cumpere (vânzare pierdută, vizibilă imediat), prea multă producție înseamnă marfă aruncată la final de zi (cost invizibil, care se adună lunar fără să fie observat imediat).",
      },
      {
        heading: "Cum calculați producția zilnică pe baza istoricului, nu pe intuiție",
        body: "Cea mai comună greșeală la o patiserie tânără: producția se stabilește după «cât cred eu că se vinde», ajustată subiectiv de la o zi la alta. Rezultatul: zile cu stoc epuizat până la prânz și zile cu jumătate din vitrină rămasă seara.\n\nO abordare mai fiabilă:\n\n- Urmăriți vânzările per produs, per zi a săptămânii, timp de câteva săptămâni consecutive\n- Identifică tiparele — vineri și sâmbătă vând de obicei mai mult decât luni și marți, produsele cu ciocolată se vând diferit de cele cu fructe\n- Calculați producția zilei pe baza mediei zilei respective din săptămânile anterioare, nu pe baza mediei generale a lunii\n- Ajustați treptat, nu radical — o schimbare de 10–15% la un moment dat, nu dublarea producției dintr-o singură decizie",
      },
      {
        heading: "Rotația stocului de materii prime — FIFO și perisabilitate diferențiată",
        body: "Materiile prime dintr-o patiserie au termene de valabilitate foarte diferite: frișca și ouăle se strică în câteva zile, făina și zahărul rezistă luni, iar untul e undeva la mijloc. Gestionarea lor la fel, cu aceeași regulă de rotație, duce fie la risipă la produsele rapid perisabile, fie la comenzi inutil de frecvente la cele stabile.\n\n- **FIFO strict** (primul intrat, primul ieșit) pentru materii prime perisabile — lactate, ouă, fructe proaspete\n- **Comenzi programate cu buffer mai mic** pentru materii prime cu durată scurtă, ca să nu stea în stoc mai mult decât e necesar\n- **Verificare vizuală zilnică** a zonelor de depozitare rece, nu doar bazată pe data teoretică de expirare — unele produse se degradează vizibil înainte de data înscrisă pe ambalaj, mai ales după deschidere\n\nO recepție de marfă (NIR) corect datată face diferența între a ști exact ce a intrat când și a ghici, la o săptămână distanță, care lot de frișcă e mai vechi.",
      },
      {
        heading: "Reduceri de final de zi — recuperați cost, nu profit",
        body: "Produsele de patiserie rămase la final de zi valorează mai mult vândute la reducere decât aruncate integral. O reducere de 30–40% aplicată cu 1–2 ore înainte de închidere recuperează cel puțin costul ingredientelor, chiar dacă marja e redusă aproape de zero pe acele produse specifice.\n\nCâteva reguli practice:\n\n- Stabiliți o oră fixă de la care se aplică reducerea, ca să fie predictibilă pentru echipă (și eventual pentru clienții obișnuiți care știu să vină atunci)\n- Separați vizual produsele la reducere de cele proaspete, pentru transparență față de client\n- Urmăriți separat vânzările la preț întreg față de cele la reducere — dacă procentul vândut la reducere crește constant lună de lună, problema e la producție, nu la vânzare",
      },
      {
        heading: "Cum urmăriți risipa ca și cost real, nu doar ca senzație",
        body: "Fără o evidență clară, risipa la o patiserie rămâne o senzație vagă («simt că aruncăm prea mult») fără o cifră concretă atașată. Documentarea produselor casate — printr-un bon de casare sau o notă similară — transformă risipa dintr-o presupunere într-un cost lunar măsurabil.\n\nDacă produsele casate reprezintă, de exemplu, 8% din producția lunară în valoare, asta e o cifră pe care o puteți urmări lună de lună și reduce treptat prin ajustarea producției — fără evidență, nu aveți cum să știți dacă lucrurile se îmbunătățesc sau se înrăutățesc.",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "Rapoartele de vânzări per produs, per zi a săptămânii, din franchisetech ajută exact la calibrarea producției descrisă mai sus — vedeți tiparele reale de vânzare, nu presupuneri. NIR-urile la fiecare recepție de materii prime păstrează data intrării, util pentru rotația FIFO a lactatelor și fructelor proaspete.\n\nCând configurați rețetele produselor de patiserie cu costul ingredientelor per porție, puteți calcula rapid cât recuperați dintr-un produs vândut la reducere de final de zi — și dacă acoperă măcar costul materiei prime.",
      },
    ],
  },
  {
    slug: "franciza-vs-locatie-proprie-ce-alegi",
    title: "Franciză vs. locație proprie — ce alegeți când deschideți o afacere HoReCa",
    description:
      "Diferența reală dintre a deschide sub o franciză și a porni o locație proprie în HoReCa: costuri, control asupra meniului și furnizorilor, și întrebări care vă ajută să decideți.",
    publishedAt: "2026-07-06",
    locale: "ro",
    tags: ["franciza","strategie"],
    image: "/marketing/industry-restaurant.png",
    relatedFeature: "/features/setup-onboarding",
    sections: [
      {
        heading: "Ce cumpărați de fapt cu o franciză",
        body: "O franciză HoReCa vă oferă un pachet: brand recunoscut, rețete și proceduri standardizate, suport în deschidere, uneori acces preferențial la furnizori și, teoretic, un flux de clienți mai previzibil datorită recunoașterii brandului.\n\nCe primiți în schimb costă, de regulă, în două forme: o taxă de intrare (plătită o singură dată, la semnarea contractului) și o redevență lunară (calculată de obicei ca procent din vânzări, nu ca sumă fixă). Structura exactă diferă foarte mult de la un brand la altul — verificați termenii specifici direct cu francizorul, nu presupuneți o formulă standard valabilă pentru toate francizele.",
      },
      {
        heading: "Ce câștigați cu o locație proprie",
        body: "O locație proprie înseamnă control total: meniu, prețuri, furnizori, program, identitate vizuală — toate deciziile rămân ale dumneavoastră, fără aprobare de la un francizor și fără redevență lunară care scade din profit indiferent de cât de bine merge afacerea.\n\nCosturile din spate sunt de obicei mai puțin evidente inițial: dezvoltați singur brandul de la zero, testați meniul fără rețete deja validate pe piață, negociați singur cu fiecare furnizor și construiți procedurile operaționale (deschidere, închidere, instruire personal) fără un manual gata făcut de la francizor.\n\nRiscul e mai mare la început — nu aveți un brand cunoscut care aduce clienți automat — dar plafonul de profit pe termen lung nu este limitat de o redevență fixă.",
      },
      {
        heading: "Ce control pierdeți într-o franciză",
        body: "- **Meniul** — de regulă nu puteți adăuga sau elimina produse liber, meniul e stabilit central de francizor\n- **Prețurile** — multe francize impun un interval de preț sau prețuri fixe pe categorii\n- **Furnizorii** — unele contracte de franciză obligă la achiziția anumitor materii prime exclusiv de la furnizori aprobați de francizor, uneori la preț mai mare decât ați găsi independent\n- **Marketingul local** — campaniile și identitatea vizuală sunt de obicei standardizate, cu spațiu limitat pentru inițiativă locală\n\nAceste limitări nu sunt neapărat negative — standardizarea e parte din motivul pentru care francizele funcționează previzibil — dar contează să știți dinainte exact cât de rigide sunt clauzele, mai ales cele legate de furnizori impuși, pentru că acestea afectează direct marja dumneavoastră pe fiecare produs.",
      },
      {
        heading: "Riscurile specifice locației proprii",
        body: "- **Validarea meniului cade integral pe dumneavoastră** — fiecare produs nou testat costă timp și materie primă, fără garanția că se vinde\n- **Recunoașterea brandului pornește de la zero** — primele luni depind mai mult de locație și recomandări decât de brand\n- **Toate procedurile operaționale trebuie create de la zero** — deschidere, închidere, instruire personal, gestiune stoc — nimic nu vine pre-scris\n- **Negocierea cu furnizorii se face singur**, fără puterea de cumpărare a unui lanț de francize\n\nAceste riscuri nu dispar niciodată complet, dar se reduc pe măsură ce afacerea capătă istoric propriu — după 1–2 ani de funcționare, o locație proprie bine gestionată are avantajul flexibilității complete, exact ce lipsește într-o franciză.",
      },
      {
        heading: "Întrebări care vă ajută să decideți",
        body: "- Aveți deja o rețetă/concept validat de piață, sau aveți nevoie de sistemul și rețetele deja testate ale unei francize?\n- Puteți suporta financiar taxa de intrare plus câteva luni de redevență înainte ca afacerea să genereze profit constant?\n- Cât de important e pentru dumneavoastră controlul total asupra meniului și furnizorilor, față de siguranța unui brand cunoscut?\n- Aveți experiență operațională HoReCa proprie, sau vă bazați pe suportul și procedurile gata făcute ale unui francizor?\n- Ce se întâmplă contractual dacă doriți să ieși din franciză peste câțiva ani — există clauze de neconcurență care v-ar limita?\n\nNu există răspuns universal corect — depinde de cât capital aveți, cât de mult doriți să controlați și cât de mult riscați să testați singur un concept netestat local.",
      },
      {
        heading: "Indiferent ce alegeți, aveți nevoie de propriile dumneavoastră numere",
        body: "Fie că operați sub franciză, fie pe cont propriu, dashboard-ul francizorului (dacă există unul) nu vă arată neapărat imaginea completă a cash-ului și marjelor dumneavoastră locale — multe rapoarte de la francizor sunt agregate la nivel de rețea, nu detaliate pe locația dumneavoastră specifică.\n\nRaportul Z zilnic, calculul de marjă per produs și reconcilierea de numerar rămân responsabilitatea dumneavoastră directă, indiferent de cine e proprietarul brandului de deasupra ușii. Franchisetech funcționează la fel sub ambele modele — configurați produsele (respectând, dacă e cazul, meniul impus de francizor), urmăriți vânzările și marjele reale ale locației dumneavoastră, fără să depindeți exclusiv de raportarea centralizată a francizorului.",
      },
    ],
  },
  {
    slug: "dark-kitchen-delivery-only-gestiune",
    title: "Dark kitchen (delivery-only) — cum arată gestiunea fără sală de servire",
    description:
      "Ce înseamnă operațional și financiar un dark kitchen fără sală de servire: structura costurilor, comisioane delivery și cum calculați marja reală per comandă.",
    publishedAt: "2026-07-07",
    locale: "ro",
    tags: ["dark-kitchen","delivery"],
    image: "/marketing/pos-hero.png",
    relatedFeature: "/features/pos",
    sections: [
      {
        heading: "Ce este un dark kitchen și cum diferă de un restaurant clasic",
        body: "Un dark kitchen (bucătărie delivery-only) este o bucătărie fără spațiu de servire pentru clienți — nu aveți sală, nu aveți chelneri, nu aveți vitrină stradală. Comenzile vin exclusiv prin platforme de livrare sau telefonic, iar produsul ajunge la client prin curier, nu la masă.\n\nModelul e atractiv pentru costul de pornire mai mic — puteți funcționa dintr-un spațiu mai ieftin, într-o zonă fără trafic pietonal, fără să investiți în decor de sală. Dar structura costurilor se schimbă fundamental față de un restaurant clasic, și mulți proprietari calculează prețurile ca și cum ar avea sală, ceea ce le distruge marja fără să-și dea seama.",
      },
      {
        heading: "Structura costurilor — ce dispare și ce apare în loc",
        body: "Ce dispare față de un restaurant clasic:\n\n- Costul sălii — chelneri, mese, decor, vitrină stradală într-o zonă scumpă de trafic\n- Chiria pentru un spațiu vizibil, cu vad pietonal\n\nCe apare în loc:\n\n- Comisionul platformelor de livrare, de obicei undeva între 25% și 35% din valoarea comenzii, în funcție de platformă și de contract\n- Costul ambalajelor de transport (cutii termorezistente, pungi, sigilii de siguranță), care la un restaurant cu sală era un cost marginal\n- Riscul de a nu controla ultimii 15-20 de minute ai experienței — temperatura produsului la livrare, întârzierea curierului — factori care afectează recenziile, dar nu depind direct de bucătărie",
      },
      {
        heading: "Cum calculați marja reală după comisionul de livrare",
        body: "Exemplu: o comandă de shaorma cu cartofi la 32 lei pe platforma de livrare.\n\n- Cost ingrediente: 9,50 lei\n- Comision platformă (30% din 32 lei): 9,60 lei\n- Cost ambalaj de transport: 1,80 lei\n\n**Marjă reală: 32 − 9,50 − 9,60 − 1,80 = 11,10 lei (34,7%)**\n\nDacă vă uitați doar la marja brută pe ingrediente — (32 − 9,50) / 32 = 70,3% — pare o afacere excelentă. Dar după ce scădeți comisionul platformei, marja reală scade la mai puțin de jumătate din procentul aparent. Multe dark kitchen-uri stabilesc prețurile după marja brută pe ingrediente și descoperă abia la finalul lunii că nu au făcut profit.",
      },
      {
        heading: "Erori frecvente și gestiunea operațională specifică",
        body: "Cea mai frecventă greșeală: calculați prețul ca la un restaurant cu sală și uitați complet de comision în calculul de marjă. A doua: aplicați același preț pe toate platformele, deși fiecare are un comision diferit negociat separat — un produs poate fi profitabil pe o platformă și în pierdere pe alta, la același preț afișat. A treia: nu creșteți prețul pe meniul de livrare cu 10-15% față de prețul practicat la vânzarea directă (dacă aveți și fereastră de ridicare), ca să compensați comisionul.\n\nOperațional, un dark kitchen are nevoie de timpi de preparare vizibili pe ecranul de bucătărie pentru a respecta target-ul de timp al platformei (comenzile întârziate scad scorul contului pe platformă), de o gestiune de stoc mai atentă — fără vânzarea directă la vitrină ca rezervă vizuală — și de rețete standardizate strict, pentru că orice produs care nu arată ca în poza de pe platformă generează recenzii proaste fără să existe un chelner care să calmeze situația la masă.",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "Calculatorul de rețete din franchisetech calculează costul real per porție din prețurile efective de aprovizionare (introduse la NIR), iar dumneavoastră puteți adăuga separat costul ambalajului de transport ca ingredient în rețetă — nu doar costul alimentar. Asta vă arată marja reală per produs, nu doar marja brută pe ingrediente, chiar dacă franchisetech nu calculează automat comisionul fiecărei platforme de livrare (acela rămâne un procent pe care îl introduceți dumneavoastră, pentru că diferă de la contract la contract).\n\nEcranul de bucătărie (KDS) și rapoartele de vânzări vă arată timpii de preparare și volumul pe oră, util pentru un dark kitchen unde viteza afectează direct scorul pe platformele de livrare.",
      },
    ],
  },
  {
    slug: "facturare-catering-evenimente-horeca",
    title: "Facturarea pentru catering și evenimente — ce trebuie să știți",
    description:
      "Ce documente și reguli de facturare se aplică la catering și evenimente în HoReCa: avans, contract, TVA și cum evitați problemele la control fiscal.",
    publishedAt: "2026-07-07",
    locale: "ro",
    tags: ["catering","facturare"],
    image: "/marketing/reports-sales.png",
    sections: [
      {
        heading: "Ce e diferit la catering față de o vânzare normală la casă",
        body: "O vânzare normală la casă e simplă: clientul cumpără, plătește, primește bon fiscal, tranzacția se închide în câteva secunde. Catering-ul funcționează pe alt ciclu — comanda vine cu zile sau săptămâni înainte, adesea de la o firmă sau un organizator de eveniment, poate implica un avans, un contract sau o comandă scrisă cu specificații, iar facturarea finală se face separat de momentul preparării.\n\nDacă tratați catering-ul ca pe o vânzare obișnuită de la POS — fără documente scrise, fără factură pe firmă — riscați să nu puteți justifica veniturile respective la control și, mai practic, să vă certați cu clientul pe ce s-a comandat de fapt dacă nu aveți nimic scris.",
      },
      {
        heading: "Documentele necesare și TVA",
        body: "Pentru un eveniment de catering, documentele tipice sunt:\n\n- Contract sau comandă scrisă, cu meniul stabilit, numărul de persoane, data și locația evenimentului\n- Factură de avans, dacă solicitați o parte din plată înainte de eveniment\n- Aviz de însoțire a mărfii, dacă transportați produse finite către locația evenimentului (nu preparați pe loc)\n- Factura finală, emisă la livrare sau la finalul prestației\n- Bon fiscal doar în cazul în care plata se face direct la fața locului, de o persoană fizică, fără factură pe firmă\n\nLa TVA, nu presupuneți o cotă fără să verificați — regimul de TVA pentru servicii de catering poate diferi de cel aplicat la vânzarea directă a produsului în locație, iar dacă evenimentul include și băuturi alcoolice, regimul poate fi diferit și pentru acea parte a comenzii. Discutați fiecare tip de eveniment cu contabilul dumneavoastră înainte să stabiliți prețul final, nu după ce ați emis deja factura.",
      },
      {
        heading: "Cum calculați prețul unui eveniment de catering",
        body: "Exemplu: un eveniment pentru 50 de persoane, meniu cu 3 feluri.\n\n- Cost materii prime: 28 lei/persoană → 1.400 lei total\n- Personal suplimentar (2 persoane × 4 ore × 40 lei/oră = 320 lei) → 6,40 lei/persoană\n- Transport și ambalaje: 4 lei/persoană → 200 lei total\n\n**Cost total per persoană: 38,40 lei | Cost total comandă: 1.920 lei**\n\nDacă prețul practicat este 85 lei/persoană (4.250 lei total):\n\n**Marjă: 85 − 38,40 = 46,60 lei/persoană (54,8%) | Marjă totală: 2.330 lei**\n\nCea mai frecventă greșeală la calculul prețului de catering: se ia costul materiilor prime și se aplică aceeași marjă ca la vânzarea zilnică, fără să se adauge costul de personal suplimentar și de transport, care la catering sunt reale și pot reprezenta 25-30% din costul total al comenzii.",
      },
      {
        heading: "Greșeli frecvente la facturarea evenimentelor",
        body: "- Uită să emită factură de avans separat de factura finală, ceea ce complică reconcilierea plăților pentru contabil\n- Nu documentează schimbările de ultim moment (numărul de persoane crescut cu o zi înainte) printr-un act adițional sau o comandă actualizată\n- Calculați prețul per persoană fără să includă costul de personal suplimentar și transport, ceea ce erodează marja reală fără să observe\n- Nu păstrează dovada de livrare (aviz semnat de client) pentru eventuale contestații ulterioare privind cantitatea sau calitatea livrată",
      },
      {
        heading: "Cum vă ajută franchisetech",
        body: "Vânzările de catering pot fi înregistrate și urmărite alături de vânzările zilnice din locație, în același set de rapoarte — nu aveți nevoie de un tabel Excel separat pentru evenimente. Exportul pentru contabil (Saga XML sau CSV) include aceste date agregat, astfel încât contabilul are toate veniturile într-un singur loc, indiferent dacă vin din vânzări zilnice sau din comenzi de catering facturate separat.",
      },
    ],
  },
  {
    slug: "cum-calculezi-pragul-de-rentabilitate-breakeven",
    title: "Cum calculați pragul de rentabilitate (breakeven) pentru afacerea dumneavoastră",
    description:
      "Formula completă pentru calculul pragului de rentabilitate în HoReCa, cu exemplu real: costuri fixe, marjă medie pe bon și câte vânzări trebuie să faceți zilnic ca să nu pierdeți bani.",
    publishedAt: "2026-07-08",
    locale: "ro",
    tags: ["breakeven","marja","financiar"],
    image: "/marketing/margins-report.png",
    sections: [
      {
        heading: "Ce este pragul de rentabilitate și de ce trebuie să-l știți",
        body: "Pragul de rentabilitate (breakeven) este punctul în care veniturile totale acoperă exact costurile totale — fixe și variabile. Sub acest punct, pierdeți bani. Deasupra lui, faceți profit.\n\nMajoritatea proprietarilor de HoReCa află dacă au făcut profit abia la finalul lunii, când adună tot. Problema e că, până atunci, o lună proastă e deja consumată — nu mai puteți interveni la timp. Dacă știți pragul de rentabilitate zilnic (câte bonuri trebuie să faceți, sau câți lei trebuie să vindeți), puteți observa în ziua 10 a lunii că sunteți sub ritm și reacționați imediat, nu în ziua 31.",
      },
      {
        heading: "Formula de calcul",
        body: "Marja procentuală medie = (Preț mediu bon − Cost variabil mediu per bon) / Preț mediu bon\n\nPragul de rentabilitate (în lei) = Costuri fixe lunare / Marja procentuală medie\n\nPragul de rentabilitate (în număr de bonuri) = Costuri fixe lunare / Marja medie per bon (în lei)\n\nAveți nevoie de trei cifre ca să faceți acest calcul: costurile fixe lunare totale, prețul mediu al unui bon și costul variabil mediu per bon (materii prime, ambalaje, comision de card).",
      },
      {
        heading: "Exemplu complet: un bistro cu bon mediu de 45 lei",
        body: "Costuri fixe lunare: chirie 6.000 lei + salarii fixe pentru 2 angajați cu normă întreagă 9.000 lei + utilități 1.800 lei + abonamente (gestiune, contabilitate, internet) 900 lei + alte costuri fixe (asigurări, mentenanță) 800 lei = **18.500 lei/lună**\n\nBon mediu: 45 lei. Cost variabil mediu per bon: 16,50 lei food cost + 0,68 lei comision procesator card ≈ **17,18 lei**\n\nMarjă per bon: 45 − 17,18 = **27,82 lei (61,8%)**\n\n**Pragul de rentabilitate lunar: 18.500 / 0,618 ≈ 29.935 lei vânzări** — sau, echivalent, 18.500 / 27,82 ≈ **665 bonuri pe lună, adică aproximativ 22 de bonuri pe zi** (pentru o lună de 30 de zile).\n\nDacă bistro-ul face sub 22 de bonuri pe zi la acest bon mediu, pierde bani în luna respectivă, indiferent de câte ore stă deschis sau cât de bine arată sala.",
      },
      {
        heading: "Ce faceți dacă sunteți sub prag — și de ce nu e un calcul static",
        body: "Dacă vânzările sunt sub prag, aveți patru pârghii, de obicei combinate:\n\n- Creșteți bonul mediu (upsell, meniuri combo, recomandări la casă)\n- Reduceți costurile fixe negociabile (renegociere chirie, anulare abonamente nefolosite)\n- Reduceți costul variabil per bon (renegociere furnizori, control mai strict al porțiilor)\n- Creșteți numărul de bonuri (marketing local, program extins în orele de vârf, dacă acestea sunt cu adevărat profitabile)\n\nPragul de rentabilitate nu e o cifră calculată o singură dată la deschidere și uitată. Se schimbă de fiecare dată când chiria crește, angajați personal nou sau un furnizor își scumpește produsele — de aceea are sens să-l recalculați lunar, nu doar în anul de deschidere.",
      },
      {
        heading: "Cum vă ajută franchisetech",
        body: "franchisetech nu introduce pentru dumneavoastră cifra finală a pragului de rentabilitate — costurile fixe (chirie, salarii, abonamente) nu trec prin POS și trebuie introduse de dumneavoastră. Dar vă dă gratuit jumătatea grea a calculului: marja medie reală per bon, calculată din costul rețetelor și din vânzările efective înregistrate, nu dintr-o estimare. Aveți deja acest număr actualizat lunar, în loc să-l reconstitui manual dintr-un Excel la finalul fiecărei luni.",
      },
    ],
  },
  {
    slug: "costuri-fixe-vs-variabile-horeca",
    title: "Costuri fixe vs. variabile în HoReCa — de ce contează să le separați",
    description:
      "Diferența dintre costurile fixe și variabile într-un restaurant sau cafenea, cu exemple reale în lei și de ce separarea lor stă la baza oricărei decizii de preț.",
    publishedAt: "2026-07-09",
    locale: "ro",
    tags: ["costuri","financiar"],
    image: "/marketing/margins-report.png",
    sections: [
      {
        heading: "Ce sunt costurile fixe și ce sunt costurile variabile",
        body: "Costurile fixe rămân aproximativ constante indiferent de câte vânzări faceți într-o lună — chiria nu scade dacă vindeți mai puțin, salariul unui angajat cu normă întreagă nu se ajustează automat cu numărul de clienți. Costurile variabile cresc și scad direct proporțional cu volumul de vânzări — cu cât vindeți mai mult, cu atât cheltuiți mai mult pe materii prime și ambalaje.\n\nSepararea corectă a celor două categorii nu e un exercițiu contabil abstract — stă la baza pragului de rentabilitate, a deciziilor de preț și a răspunsului la întrebarea dacă merită să extindeți programul sau să angajați încă o persoană.",
      },
      {
        heading: "Exemple de costuri fixe într-o cafenea sau restaurant tipic",
        body: "- Chiria spațiului\n- Salariile fixe (contracte cu normă întreagă, indiferent de volumul de vânzări din luna respectivă)\n- Abonamentele (soft de gestiune, contabilitate, internet, chirie terminal de card dacă e taxă fixă)\n- Asigurările\n- Amortizarea sau rata de leasing pentru echipamente",
      },
      {
        heading: "Exemple de costuri variabile",
        body: "- Materiile prime — cost direct proporțional cu ce vindeți\n- Ambalajele de unică folosință\n- Comisionul procesatorului de card, de obicei 1-2,5% din valoarea fiecărei tranzacții cu cardul\n- Comisioanele platformelor de livrare, dacă vindeți și prin acest canal\n- Orele suplimentare de personal chemat special pentru un weekend aglomerat",
      },
      {
        heading: "Costurile mixte și de ce contează separarea",
        body: "Nu toate costurile intră curat într-o singură categorie. Utilitățile, de exemplu, au o componentă fixă (abonamentul, taxa de racordare) și una variabilă (consumul electric crește cu orele de funcționare a echipamentelor și cu clima). În loc să pui tot costul de utilități la fix, estimează o împărțire rezonabilă — chiar aproximativă — între cele două componente.\n\nFără separarea corectă, nu puteți calcula un prag de rentabilitate real, nu puteți decide dacă extinderea programului se justifică (orele suplimentare adăugați cost variabil, dar costul fix rămâne neschimbat), și riscați să comparați greșit profitabilitatea a două produse. Exemplu: produsul A are marjă de 70% dar se vinde puțin (20 buc/zi la 20 lei, cost variabil 6 lei) — contribuție zilnică la costurile fixe: 280 lei. Produsul B are marjă de doar 55% dar se vinde mult mai mult (80 buc/zi la 15 lei, cost variabil 6,75 lei) — contribuție zilnică: 660 lei. Produsul B, cu procent de marjă mai mic, contribuie de peste două ori mai mult la acoperirea costurilor fixe, pentru că volumul compensează procentul.",
      },
      {
        heading: "Cum vedeți această separare în franchisetech",
        body: "Costul variabil per produs (materii prime, calculat din prețurile reale de la ultima aprovizionare) vine automat din calculatorul de rețete, actualizat de fiecare dată când introduceți un NIR cu preț nou. Costurile fixe (chirie, salarii, abonamente) rămân în afara sistemului, pentru că nu trec prin vânzări sau stoc — dar cu jumătate din calcul deja făcut corect și automat, separarea fixe/variabile devine un exercițiu de câteva minute, nu o reconstituire manuală de la zero în fiecare lună.",
      },
    ],
  },
  {
    slug: "kpi-uri-de-urmarit-saptamanal-horeca",
    title: "KPI-urile pe care ar trebui să le urmăriți săptămânal în HoReCa",
    description:
      "Lista KPI-urilor esențiale de urmărit săptămânal într-un restaurant sau cafenea: bon mediu, food cost %, marjă brută, diferență de numerar și cum le citiți corect.",
    publishedAt: "2026-07-10",
    locale: "ro",
    tags: ["kpi","rapoarte"],
    image: "/marketing/reports-sales.png",
    relatedFeature: "/features/z-report",
    sections: [
      {
        heading: "De ce săptămânal, nu doar lunar",
        body: "Analiza lunară e prea lentă ca să prindă probleme la timp — două săptămâni proaste se pierd ușor într-o lună bună per total, iar cifra finală tot arată acceptabil. Analiza săptămânală e suficient de deasă cât să observați o tendință (food cost care crește constant, bon mediu care scade) înainte să se transforme într-o pierdere reală acumulată, dar nu atât de deasă încât o zi de marți mai slabă să vă facă să reacționați excesiv la zgomot statistic normal.",
      },
      {
        heading: "KPI 1-3: vânzări, bon mediu și număr de tranzacții",
        body: "- **Vânzări totale săptămânale** — compară cu săptămâna anterioară și cu aceeași săptămână din luna trecută, nu doar cu ziua de ieri\n- **Bon mediu** — vânzări totale împărțite la numărul de tranzacții, arată dacă fiecare client cumpără mai mult sau mai puțin per vizită\n- **Numărul de tranzacții** — arată dacă vin mai mulți clienți sau dacă aceiași clienți cheltuiesc diferit\n\nSepararea acestor doi factori contează pentru că soluțiile sunt diferite: dacă bonul mediu scade, lucrați la upsell și meniu; dacă numărul de tranzacții scade, lucrați la trafic și marketing local.",
      },
      {
        heading: "KPI 4-7: food cost, marjă brută, numerar și cost de personal",
        body: "- **Food cost %** — cost materii prime / vânzări × 100. Ținta sănătoasă variază pe categorie: 15-25% pentru cafea și băuturi, 28-35% pentru mâncare gătită\n- **Marja brută medie** pe categorii de produse — dacă scade săptămânal, ceva s-a schimbat (preț furnizor, porții, risipă) și merită investigat imediat, nu la închiderea lunii\n- **Diferența de numerar la închidere**, cumulată din rapoartele Z ale săptămânii — o diferență izolată de câțiva lei e normală, dar o tendință constantă în minus, mai ales în aceeași zi sau tură, e un semnal de investigat\n- **Costul de personal ca procent din vânzări** — dacă orele lucrate cresc dar vânzările nu țin pasul, procentul crește și marjele se erodează, chiar dacă food cost-ul rămâne stabil",
      },
      {
        heading: "Cum arată un tablou săptămânal simplu",
        body: "Exemplu de comparație săptămână-pe-săptămână pentru o cafenea:\n\n- Vânzări: 34.200 lei (față de 31.800 lei săptămâna trecută, +7,5%)\n- Bon mediu: 42 lei (față de 39 lei)\n- Număr tranzacții: 814 (față de 815 — aproape identic)\n- Food cost: 31,2% (țintă 30%, ușor peste, dar în limite acceptabile)\n- Diferență numerar cumulată: −18 lei pe toată săptămâna (nesemnificativ)\n\nInterpretare: creșterea de vânzări vine aproape în întregime din bonul mediu mai mare, nu din mai mulți clienți — numărul de tranzacții e practic neschimbat. Asta sugerează că un combo nou sau o ajustare de preț a funcționat, nu o campanie de atragere de clienți noi, și vă spune unde să investigați mai departe dacă doriți să înțelegeți cauza exactă.",
      },
      {
        heading: "Cum le vedeți automat în franchisetech",
        body: "Fiecare din acești indicatori există deja în rapoartele zilnice Z și în datele de cost al rețetelor — nu aveți nevoie de un fișier separat reconstituit manual în fiecare săptămână. Recomandarea practică: deschideți secțiunea de Rapoarte în aceeași zi în fiecare săptămână (luni dimineața, de exemplu), nu doar atunci când ceva pare să meargă prost. Tendințele se văd cel mai bine când le urmăriți constant, nu doar când apare o problemă vizibilă.",
      },
    ],
  },
  {
    slug: "greseli-frecvente-la-raportul-z",
    title: "Greșeli frecvente la raportul Z și cum le evitați",
    description:
      "Cele mai frecvente greșeli făcute la generarea și verificarea raportului Z zilnic în cafenele și restaurante — și cum le preveniți ca să nu aveți probleme la control.",
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
        body: "**Sertarul nu se numărați fizic, doar se «estimează».** Angajatul verifică din ochi că «pare cam atât» și bifează raportul ca fiind conform, fără numărare bănuț cu bănuț.\n\n**Fondul de deschidere nu se scade corect.** Dacă ziua a început cu 200 de lei fond de casă, iar la calculul numerarului din vânzări cineva uită să scadă acei 200 de lei, diferența raportată e sistematic greșită cu exact suma fondului.\n\n**Restul dat greșit nu se documentează.** Un rest calculat greșit la o tranzacție (5 lei în plus sau în minus) e o diferență minoră izolat, dar dacă se întâmplă des și nu se notați niciodată, la final de lună nimeni nu mai poate reconstitui de unde vine discrepanța cumulată.",
      },
      {
        heading: "Greșeli legate de momentul generării",
        body: "**Raportul se generează înainte de ultima vânzare a zilei.** Un client de la ora închiderii plătește, dar raportul Z a fost deja generat cu 10 minute înainte — vânzarea rămâne în afara raportului zilei respective sau apare confuz în ziua următoare.\n\n**Lipsesc rapoarte pentru zile întregi.** Zile aglomerate, zile de sărbătoare sau pur și simplu uitare — dacă o zi nu are raport Z generat, nu există niciun document care să demonstreze ce s-a vândut fiscal în acea zi. La control, o zi fără raport Z e tratată ca zi fără înregistrare fiscală.",
      },
      {
        heading: "Greșeli legate de diferențe neinvestigate",
        body: "Cea mai costisitoare greșeală nu e o diferență izolată — e obiceiul de a o ignora. Un sertar cu 30 de lei în minus, dacă nu e investigat și notat, se repetă. Peste o lună, 30 de lei aproape zilnic înseamnă 600-900 de lei fără explicație, sumă pe care contabilul nu o poate justifica și pe care, la un control amănunțit, un inspector o poate interpreta ca venit neînregistrat.\n\nDiferența trebuie tratată ca semnal, nu ca rutină: verificați dacă a fost o eroare de rest, o anulare nedocumentată sau o vânzare neîncasată corect — și notați concluzia, chiar dacă e «eroare de rest, corectat».",
      },
      {
        heading: "Checklist de prevenire",
        body: "- Generați raportul Z abia după ultima vânzare confirmată a zilei\n- Numărați sertarul fizic, bănuț cu bănuț, nu estimativ\n- Scădeți fondul de deschidere înainte de a compara cu totalul din raport\n- Notați orice diferență, oricât de mică, cu motivul identificat\n- Generați raportul în fiecare zi de operare, fără excepție\n- Arhivați raportul (fizic sau digital) imediat, nu «mai târziu»",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "Raportul Z din franchisetech se generează din datele reale ale sesiunii POS — nu puteți genera un raport pentru vânzări care nu au fost încă înregistrate, iar totalul de numerar așteptat scade automat fondul de deschidere. Fiecare raport rămâne arhivat pe server, căutabil pe dată, astfel încât o zi din urmă cu trei luni e la fel de accesibilă ca ziua de azi dacă un contabil sau un inspector o solicită.",
      },
    ],
  },
  {
    slug: "pregatire-control-anaf-neanuntat",
    title: "Cum vă pregătiți pentru un control ANAF neanunțat, în orice zi",
    description:
      "Ghid practic pentru cafenele și restaurante: ce verificați inspectorii ANAF la un control inopinat, ce documente trebuie să aveți mereu la zi și cum evitați amenzile frecvente.",
    publishedAt: "2026-07-14",
    locale: "ro",
    tags: ["fiscal","control-anaf"],
    image: "/marketing/hero-casa-marcat.jpg",
    sections: [
      {
        heading: "Ce este controlul inopinat și ce vizează în HoReCa",
        body: "Controlul ANAF neanunțat (inopinat) poate avea loc în orice zi de operare, fără notificare prealabilă — legislația permite acest tip de verificare tocmai pentru a surprinde activitatea reală, nu una pregătită special pentru inspecție. În HoReCa, zonele cele mai frecvent verificate sunt: emiterea corectă a bonurilor fiscale, concordanța dintre numerarul din sertar și înregistrările sistemului, documentele de proveniență a mărfii (NIR, facturi) și corectitudinea aplicării cotelor de TVA.\n\nUn control inopinat nu înseamnă automat că ceva e în neregulă — dar pregătirea permanentă (nu «pregătirea de dinaintea controlului», pentru că nu știți când vine) face diferența între o verificare rapidă și una care escaladează.",
      },
      {
        heading: "Documentele obligatorii la fiecare punct de lucru",
        body: "Inspectorul poate cere, pe loc, oricare dintre următoarele:\n\n- **Rapoartele Z** pentru zilele recente (și, la cerere, pentru orice perioadă anterioară)\n- **Registrul de casă** — jurnalul cronologic al mișcărilor de numerar\n- **NIR-urile** — notele de intrare-recepție pentru marfa aflată în gestiune\n- **Facturile furnizorilor** aferente mărfii din stoc\n- **Certificatul casei de marcat fiscale** și dovada că aceasta e conectată corect la sistemul informatic al ANAF\n\nDacă oricare dintre aceste documente lipsește sau e incomplet pentru o perioadă recentă, asta devine punctul de plecare al unei verificări mai amănunțite, nu doar o notă minoră.",
      },
      {
        heading: "Ce verificați inspectorul la casa de marcat",
        body: "Verificarea standard la casa de marcat include:\n\n1. **Emiterea bonului fiscal** — fiecare vânzare trebuie să aibă bon emis, indiferent de metoda de plată\n2. **Concordanța sertar-sistem** — inspectorul poate cere numărarea numerarului din sertar în momentul controlului și compararea cu totalul așteptat conform sistemului la acel moment al zilei\n3. **Funcționarea corectă a casei de marcat** — conectare la sistemul fiscal, jurnal electronic accesibil\n4. **Prețurile afișate vs. prețurile din bon** — dacă meniul afișat la vedere diferă de prețul practicat efectiv, e semnalat ca neregulă\n\nDiscrepanța dintre numerarul fizic și cel așteptat de sistem, dacă apare exact în momentul controlului, e greu de explicat convingător pe loc — de aceea contează ca reconcilierea să fie o rutină zilnică, nu ceva făcut «când ai timp».",
      },
      {
        heading: "Greșeli frecvente care duc la amenzi",
        body: "- **Bonuri neemise pentru unele plăți** — mai ales la plățile în numerar din perioadele aglomerate, când personalul «uită» sub presiunea timpului\n- **Discrepanțe nedocumentate în registrul de casă** — diferențe de numerar fără nicio notă explicativă\n- **NIR lipsă sau întârziat** pentru marfă vizibil prezentă în gestiune\n- **Cote de TVA aplicate greșit** pe anumite categorii de produse, de multe ori din neatenție la configurarea inițială a produselor în sistem\n- **Angajați care nu știu unde sunt documentele** — chiar dacă documentele există, dacă personalul de la fața locului nu știe să le găsească rapid, controlul durează mai mult și creează o impresie de dezorganizare",
      },
      {
        heading: "Cum vă asigurați că sunteți pregătit în orice zi — checklist",
        body: "- [ ] Raportul Z de ieri și de azi sunt generate și arhivate\n- [ ] Registrul de casă e la zi, fără diferențe nedocumentate\n- [ ] Toate NIR-urile pentru marfa din ultima săptămână sunt emise, nu în stadiul de ciornă\n- [ ] Casa de marcat funcționează și e conectată corect la sistemul fiscal\n- [ ] Personalul de tură știe unde sunt documentele și cum arată un bon corect emis\n- [ ] Cotele de TVA per produs sunt verificate și corecte în sistem\n\nDacă puteți bifa toate aceste puncte în orice moment al zilei, nu doar la sfârșitul lunii, un control inopinat devine o formalitate de 20-30 de minute, nu o zi de stres.",
      },
      {
        heading: "Cum ajută franchisetech să aveți totul la zi",
        body: "franchisetech arhivează automat fiecare raport Z, fiecare NIR emis și registrul de casă aferent, căutabile instant pe dată din aplicație — nu trebuie să căutați printre dosare fizice sau fișiere Excel când un inspector cere documentele. Cotele de TVA se configurează o singură dată per produs și rămân consistente în toate rapoartele generate ulterior, reducând riscul de eroare la aplicarea cotei greșite.",
      },
    ],
  },
  {
    slug: "amenda-neeliberare-bon-fiscal-cat-este-si-cum-o-eviti",
    title: "Amenda pentru neeliberarea bonului fiscal — cât este și cum o evitați",
    description:
      "Neemiterea bonului fiscal este contravenția cel mai des constatată la control în HoReCa. Iată exact ce spune legea, cum se calculează amenda pe tranșe și ce se întâmplă la o abatere repetată.",
    publishedAt: "2026-09-19",
    locale: "ro",
    tags: ["fiscal", "amenzi", "bon-fiscal"],
    image: "/marketing/pos-hero.png",
    relatedFeature: "/features/qr-code-receipts",
    sections: [
      {
        heading: "Ce înseamnă, legal, «neemiterea bonului fiscal»",
        body: "Fapta este definită explicit în OUG nr. 28/1999 (republicată), art. 10 pct. 3 lit. c): constituie contravenție \"neemiterea bonului fiscal pentru toate bunurile livrate sau serviciile prestate, emiterea de bonuri cu o valoare inferioară preţului de vânzare a bunului sau tarifului de prestare a serviciului ori nerespectarea prevederilor art. 1 alin. (8)\" — ultima parte se referă la nerespectarea regulilor de înregistrare în registrul special atunci când aparatul fiscal e defect.\n\nLegea numește suma implicată \"sumă nejustificată\": contravaloarea bunurilor sau serviciilor pentru care nu s-a emis bon, diferența până la prețul real dacă bonul a fost emis cu o valoare mai mică, sau contravaloarea operațiunilor înregistrate greșit în perioada de defectare a aparatului. Practic, orice vânzare care nu ajunge corect în evidența fiscală a zilei intră sub această definiție — indiferent dacă a fost uitare, grabă la oră de vârf sau o înțelegere \"pe repede\" cu un client.",
      },
      {
        heading: "Cât este amenda, concret — pe tranșe, nu o sumă fixă",
        body: "De la 1 ianuarie 2024 (modificare adusă de Legea nr. 296/2023), amenda pentru această contravenție (art. 11 alin. (1) lit. e) din OUG 28/1999) nu mai e o sumă unică — depinde de mărimea sumei nejustificate și de ponderea ei în vânzările totale ale zilei, înregistrate de aparat și/sau în registrul special:\n\n- Sumă nejustificată **până la 300 lei** și **sub 3%** din vânzările zilei — amendă **2.000 lei**\n- Sumă până la 300 lei, dar **peste 3%** din vânzările zilei — amendă **5.000 lei**\n- Sumă între **300 și 1.000 lei**, sub 3% din vânzări — amendă **6.000 lei**\n- Sumă între 300 și 1.000 lei, peste 3% din vânzări — amendă **12.000 lei**\n- Sumă **peste 1.000 lei**, sub 3% din vânzări — amendă **15.000 lei**\n- Sumă peste 1.000 lei și peste 3% din vânzări — amendă **30.000 lei**\n\nÎn toate cazurile, pe lângă amendă se aplică și **confiscarea sumei nejustificate**. Important: până la 31 decembrie 2023, prima treaptă (suma cea mai mică) putea fi sancționată doar cu avertisment. De la 1 ianuarie 2024, avertismentul a fost eliminat — chiar și cea mai mică abatere constatată pornește de la 2.000 lei amendă fermă.",
      },
      {
        heading: "Recidiva costă mult mai mult",
        body: "Dacă în 12 luni de la ultima sancționare operatorul economic mai comite cel puțin două abateri din aceeași categorie (una dintre tranșele de mai sus), amenda aplicată devine **triplul** amenzii care s-ar fi aplicat normal, iar pe lângă confiscarea sumei nejustificate se dispune și **suspendarea activității la punctul de lucru respectiv, pentru 15 zile**. Dacă e o singură recidivă în 12 luni (nu două), amenda se **dublează**, fără suspendare.\n\nSuspendarea poate înceta mai devreme: dacă operatorul economic achită amenda plus o sumă egală cu de cinci ori amenda aplicată și de cinci ori suma nejustificată confiscată, suspendarea încetează de drept în 24 de ore de la prezentarea dovezii de plată către organul constatator. Pe durata suspendării, unitatea este sigilată de echipa de control, iar la loc vizibil se afișează un anunț despre această situație.",
      },
      {
        heading: "Fapte conexe care se pedepsesc separat",
        body: "Legea sancționează distinct și alte situații legate de bon, ca să nu le confundați cu cea de mai sus:\n\n- **Neînmânarea bonului deja emis** către client, sau nefacturarea la cerere (art. 10 lit. g) — amendă **1.000–2.000 lei**, aplicată direct persoanei fizice care operează aparatul (casierul), nu firmei. Este exact situația în care bonul a fost emis corect, dar nu a fost pus fizic la dispoziția clientului.\n- **Documente justificative lipsă** pentru sume introduse sau scoase din casă în afara vânzărilor obișnuite (art. 10 lit. d) — intră sub aceeași grilă de tranșe de mai sus, dacă generează o sumă nejustificată.\n\nDiferența contează la un control: prima e o problemă de proces intern (casierul nu a înmânat bonul), a doua ține de fondul vânzării (bonul nici nu a fost emis).",
      },
      {
        heading: "Cum evitați această amendă, în practică",
        body: "Rădăcina majorității abaterilor de acest tip nu e frauda intenționată, ci un pas manual sărit la oră de vârf. Câteva măsuri simple reduc semnificativ riscul:\n\n- Fiecare încasare trece prin aparatul fiscal, fără excepții \"doar de data asta\" pentru un produs mic sau un client cunoscut\n- Personalul nou este instruit explicit că bonul se emite **la momentul plății**, nu \"quando am timp\"\n- Există o procedură clară pentru momentele în care aparatul are o problemă (verificați articolul dedicat defecțiunilor aparatului fiscal), ca personalul să nu improvizeze\n\nÎn franchisetech, fiecare vânzare finalizată în POS trimite automat comanda de emitere către aparatul fiscal, în același pas cu confirmarea plății — nu există un buton separat \"emite bonul\" pe care casierul să îl poată uita. Dacă transmiterea către aparat eșuează, starea apare clar în aplicație, nu e ascunsă.",
      },
    ],
  },
  {
    slug: "fiscalnet-offline-ce-faceti-cand-vreti-sa-emiteti-bonul",
    title: "Ce faceți dacă FiscalNet e offline când vreți să emiteți bonul",
    description:
      "FiscalNet este integrarea care trimite comanda de emitere către casa de marcat sau imprimanta fiscală — nu aparatul fiscal în sine. Iată ce înseamnă, practic și legal, când pare «offline» chiar în mijlocul unei vânzări.",
    publishedAt: "2026-09-20",
    locale: "ro",
    tags: ["fiscal", "fiscalnet", "pos"],
    image: "/marketing/dashboard-hero.png",
    relatedFeature: "/features/pos",
    sections: [
      {
        heading: "Ce este, de fapt, FiscalNet",
        body: "FiscalNet este stratul de comunicare (driverul/integrarea) care leagă aplicația de vânzare de pe calculator sau tabletă de casa de marcat sau imprimanta fiscală certificată conectată fizic la stația de lucru — prin USB, rețea locală sau Bluetooth, în funcție de model. Rolul lui este să traducă o vânzare finalizată în POS într-o comandă pe care aparatul fiscal o poate executa și să transmită înapoi rezultatul (bon emis, eroare, în așteptare).\n\nAsta e diferit de conexiunea aparatului fiscal la serverele ANAF (SIM de date sau rețea, cu retransmitere automată când revine semnalul) — aceea e tratată separat, într-un alt articol. Aici vorbim despre legătura dintre calculatorul de la casă și aparatul din fața casierului, care e o problemă locală, de cablu sau rețea, nu de conexiune la internet a aparatului însuși.",
      },
      {
        heading: "De ce contează tipul aparatului dumneavoastră",
        body: "O **casă de marcat** clasică are propriă tastatură și ecran și poate, în multe cazuri, funcționa și bate manual o vânzare direct de la aparat, chiar dacă legătura cu POS-ul e picată. O **imprimantă fiscală** (fără tastatură proprie) nu poate — depinde integral de comenzi primite de la un calculator conectat, prin exact acest tip de integrare. Dacă FiscalNet e offline și aveți o imprimantă fiscală, aparatul pur și simplu nu are cum să primească vreo comandă de emitere, indiferent cât timp așteptați.\n\nMerită să știți, dinainte, care tip de aparat aveți instalat în local — informația e utilă în secunda în care apare o eroare, nu e ceva de căutat atunci, cu un client la casă.",
      },
      {
        heading: "Primii pași când vedeți eroarea de conexiune",
        body: "1. Verificați dacă e o problemă generală de rețea — internetul, POS-ul, alte aparate din local funcționează?\n2. Verificați fizic cablul de conectare (USB sau rețea) dintre calculator și aparatul fiscal — un cablu slăbit e cea mai frecventă cauză\n3. Dacă aveți mai multe case, verificați dacă problema e doar la stația respectivă sau la toate\n4. Reporniți aplicația de vânzare — nu aparatul fiscal însuși, decât dacă distribuitorul autorizat vă indică asta\n\nDacă după acești pași aparatul tot nu răspunde, tratați situația ca pe o defecțiune a aparatului fiscal, nu doar ca pe o eroare software trecătoare.",
      },
      {
        heading: "Dacă aparatul chiar nu răspunde — regimul de defectare",
        body: "Din punct de vedere legal, dacă aparatul fiscal nu poate emite bonuri — indiferent dacă motivul e o defecțiune internă sau imposibilitatea de a primi comenzi — se aplică art. 1 alin. (8) din OUG 28/1999: până la repunerea în funcțiune, înregistrați toate operațiunile într-un **registru special** și emiteți **chitanțe**, nu bonuri fiscale improvizate. Trebuie să anunțați imediat distribuitorul autorizat sau unitatea de service, în modul stabilit la achiziția aparatului, ca să puteți dovedi notificarea la un eventual control.\n\nProcedura completă — ce trebuie să conțină registrul special, cât timp se păstrează și ce se întâmplă când aparatul repornește — este detaliată în articolul dedicat defecțiunilor aparatului fiscal.",
      },
      {
        heading: "Ce nu faceți",
        body: "- Nu refuzați clienți sau nu opriți vânzarea doar pentru că vedeți un mesaj de eroare — verificați întâi dacă e o problemă reală de emitere, nu doar o întârziere de câteva secunde\n- Nu improvizați un \"bon\" scris de mână care să semene cu unul fiscal — folosiți chitanță, conform procedurii legale\n- Nu lăsați vânzările neconsemnate sperând să \"recuperați\" din memorie mai târziu — notați-le pe loc, în ordine\n- Nu încercați reparații pe cont propriu la aparatul fiscal — doar tehnicieni autorizați au voie să intervină",
      },
      {
        heading: "Cum gestionează franchisetech acest moment",
        body: "În franchisetech, starea transmiterii către aparatul fiscal este afișată clar la fiecare vânzare — trimis, în așteptare sau eșuat — nu e ascunsă sub un mesaj generic. Vânzarea în sine se salvează local imediat ce plata este confirmată, independent de rezultatul transmiterii către FiscalNet, ca să nu pierdeți evidența comenzii doar pentru că integrarea are o problemă temporară.\n\nCe aplicația nu face: nu marchează o vânzare drept \"finalizată fiscal\" până nu primește o confirmare reală de la aparat. Dacă transmiterea eșuează, vedeți asta imediat, nu abia la sfârșitul zilei când încercați să închideți casa.",
      },
    ],
  },
  {
    slug: "imprimanta-fiscala-nu-tipareste-bonul-ce-faceti",
    title: "Ce faceți dacă imprimanta fiscală nu tipărește bonul, în mijlocul vânzării",
    description:
      "Aparatul fiscal s-a blocat exact când aveați un client la casă? Legea are o procedură exactă pentru această situație — registrul special și chitanțele — nu improvizație.",
    publishedAt: "2026-09-21",
    locale: "ro",
    tags: ["fiscal", "casa-de-marcat", "defectiune"],
    image: "/marketing/pos-hero.png",
    relatedFeature: "/features/pos",
    sections: [
      {
        heading: "Ce spune legea despre defectarea aparatului fiscal",
        body: "Situația e prevăzută explicit în OUG nr. 28/1999 (republicată), art. 1 alin. (8): \"În cazul defectării aparatelor de marcat electronice fiscale, până la repunerea în funcţiune a acestora, operatorii economici utilizatori sunt obligaţi să înregistreze într-un registru special, întocmit în acest sens, toate operaţiunile efectuate şi să emită chitanţe, în condiţiile legii, pentru respectivele operaţiuni şi facturi, la cererea clientului.\"\n\nAsta include orice situație în care aparatul nu tipărește — hârtie terminată, cap de imprimare blocat, eroare mecanică sau electronică. Excepția de la obligația registrului special se aplică doar taxiurilor și aparatelor integrate în echipamente nesupravegheate (automate) — nicio excepție relevantă pentru o cafenea sau un restaurant.",
      },
      {
        heading: "Primul pas: anunțați imediat distribuitorul autorizat sau unitatea de service",
        body: "Art. 1 alin. (8¹) din OUG 28/1999 vă obligă să notificați **imediat** distribuitorul autorizat sau unitatea de service acreditată, în modul stabilit prin contract la momentul achiziționării aparatului — de exemplu telefon urmat de email, sau un formular online, în funcție de furnizor. Legea e explicită: \"Notificarea efectuată în alt mod decât cel stabilit de părţile contractante nu este valabilă\" — deci verificați dinainte, nu în momentul crizei, care e metoda agreată cu furnizorul dumneavoastră.\n\nPăstrați dovada notificării (email trimis, confirmare telefonică notată cu oră și persoană) — la un control, dumneavoastră trebuie să demonstrați că ați anunțat, nu distribuitorul.",
      },
      {
        heading: "Cât timp durează reparația: registrul special",
        body: "Până la repunerea în funcțiune, toate operațiunile se înregistrează într-un registru special, ținut fizic la punctul de lucru:\n\n- Fiecare vânzare se notează **cronologic**, fără ștersături și fără spații libere lăsate necompletate\n- Pentru fiecare operațiune se emite o **chitanță** (nu bon fiscal) către client\n- Dacă clientul cere factură, i-o eliberați conform legii\n\nRegistrul special și raportul fiscal de închidere zilnică sunt documentele pe care organele fiscale le au în vedere la verificarea veniturilor care stau la baza impozitelor datorate — nu sunt o formalitate secundară. Registrul special se arhivează și se păstrează **10 ani**, aceeași perioadă ca memoria fiscală a aparatului.",
      },
      {
        heading: "Ce nu înlocuiește chitanța — și de ce nu vă opriți din vânzare",
        body: "Chitanța emisă manual în această perioadă nu este un document fiscal echivalent bonului — este documentul-punte prevăzut de lege exact pentru acest interval. Nu o confundați cu o factură și nu încercați să \"recreați\" ulterior bonuri fiscale retroactiv pentru vânzările din perioada de defectare — asta nu este posibil și nici legal.\n\nDefecțiunea aparatului nu este un motiv să opriți vânzarea sau să refuzați clienți \"până se repară aparatul\". Vânzarea tot trebuie să aibă loc și să fie înregistrată — doar că prin registrul special și chitanță, nu prin bon fiscal, cât timp aparatul e indisponibil.",
      },
      {
        heading: "Când aparatul revine în funcțiune",
        body: "La repunerea în funcțiune, tehnicianul de service care intervine trebuie să noteze în registrul special sau în cartea de intervenții data și ora la care aparatul și-a reluat funcționarea, sub semnătură și cu numele în clar. Acest pas nu este opțional — face parte din documentația care demonstrează, la un eventual control, perioada exactă de indisponibilitate și că ați respectat procedura pe toată durata ei.\n\nPăstrați cartea de intervenții și registrul special împreună, accesibile rapid — sunt exact documentele cerute primele la un control, alături de rapoartele Z.",
      },
      {
        heading: "Cum reduceți riscul unei defecțiuni la oră de vârf",
        body: "Câteva măsuri simple reduc frecvența și impactul defecțiunilor:\n\n- Păstrați întotdeauna o rolă de hârtie de rezervă lângă aparat, de tipul recomandat în manualul de utilizare\n- Nu permiteți intervenții tehnice decât persoanelor autorizate — legea interzice explicit accesul altor persoane la componentele aparatului\n- Păstrați la îndemână cartea de intervenții și datele de contact ale distribuitorului autorizat, nu doar \"undeva în birou\"\n\nfranchisetech trimite comanda de emitere către aparatul fiscal conectat, dar nu înlocuiește procedura legală de mai sus — dacă aparatul fizic e defect, registrul special și chitanțele rămân responsabilitatea dumneavoastră la punctul de lucru, indiferent de software-ul folosit pentru vânzare.",
      },
    ],
  },
  {
    slug: "bon-fiscal-suma-gresita-clientul-a-plecat-ce-faceti",
    title: "Bon fiscal emis cu suma greșită, dar clientul a plecat — ce faceți",
    description:
      "Ați observat abia după ce a plecat clientul că bonul avea suma greșită. Stornoul rămâne procedura corectă, dar fără clientul de față, grija reală este alta: cum documentați diferența de bani.",
    publishedAt: "2026-09-22",
    locale: "ro",
    tags: ["pos", "storno", "fiscal"],
    image: "/marketing/pos-hero.png",
    relatedFeature: "/features/pos",
    sections: [
      {
        heading: "De ce situația asta e diferită de o corecție obișnuită",
        body: "Dacă observați o greșeală de sumă pe bon **cât clientul e încă la casă**, corectarea e directă: stornați, discutați cu clientul, îi dați rest sau îi cereți diferența, emiteți bonul corect. Situația de aici e alta — clientul a plecat deja, iar dumneavoastră (sau un coleg) observați abia acum că suma de pe bon nu corespunde cu ce ar fi trebuit facturat.\n\nProcedura fiscală de bază rămâne aceeași — stornarea bonului greșit, în cadrul aceleiași zile fiscale — dar fără clientul de față, nu mai puteți rezolva pe loc diferența de bani. Aici e de fapt miezul problemei: nu documentul, ci banii.",
      },
      {
        heading: "Stornoul nu cere prezența fizică a clientului",
        body: "Procedura de stornare a unui bon fiscal este reglementată prin normele metodologice de aplicare a OUG 28/1999 (aprobate prin HG 479/2003), art. 36. Documentele necesare pentru dosarul de anulare sunt, în esență, interne:\n\n- O **notă explicativă** (proces-verbal) din partea persoanei care a emis bonul greșit, cu motivul, numărul și ora bonului\n- **Aprobarea scrisă** a directorului financiar-contabil, contabilului-șef sau a persoanei responsabile cu gestiunea\n- Dacă eroarea a fost de preț, o notă cu diferența corectă\n- Înregistrarea contabilă a operațiunii de anulare\n\nNiciunul dintre aceste documente nu presupune, prin natura lui, semnătura sau prezența clientului — stornarea este, procedural, o operațiune internă. Pentru situații neobișnuite sau cu sume mari, confirmați totuși abordarea cu contabilul dumneavoastră înainte să închideți cazul.",
      },
      {
        heading: "Dacă suma încasată a fost mai mare",
        body: "Dacă bonul greșit a fost la o sumă mai mare decât cea corectă, aveți în sertar bani în plus față de vânzarea reală a zilei — nu îi tratați ca pe un \"surplus\" convenabil. Stornați bonul greșit, emiteți bonul corect cu suma reală și documentați clar, în procesul-verbal, ce s-a întâmplat cu diferența: dacă rămâne disponibilă pentru returnare în cazul în care clientul revine sau vă contactează, notați asta explicit.\n\nDacă aveți datele de contact ale clientului (de exemplu de la o comandă telefonică sau o rezervare), cea mai simplă abordare este să îl informați direct. Pentru sume mari sau situații care se repetă, cereți contabilului dumneavoastră tratamentul corect al banilor nerevendicați — nu este un aspect pe care să îl decideți singur, din instinct.",
      },
      {
        heading: "Dacă suma încasată a fost mai mică",
        body: "Dacă bonul greșit a fost la o sumă mai mică decât cea corectă, aveți o lipsă reală în încasările zilei față de ce s-ar fi cuvenit — și clientul a plecat fără să știe că mai datorează ceva. În practică, recuperarea diferenței de la client este rareori realistă sau merită efortul.\n\nCeea ce contează este să nu ascundeți diferența ca pe o \"neconcordanță de sertar\" nejustificată la închiderea zilei. Stornați bonul, emiteți intern bonul corect (chiar dacă suma suplimentară nu mai poate fi încasată efectiv) și notați explicit motivul în registrul de casă. O lipsă documentată și explicată e o problemă operațională minoră; o lipsă nedocumentată, recurentă, e exact tiparul pe care un control fiscal îl caută.",
      },
      {
        heading: "Termenul care contează: înainte de raportul Z",
        body: "Stornarea prin sistemul POS/aparatul fiscal este posibilă cât timp bonul greșit face parte din **ziua fiscală curentă** — adică înainte de generarea raportului Z de închidere a acelei zile. Nu contează dacă au trecut deja câteva ore de când clientul a plecat; atât timp cât raportul Z al zilei respective nu a fost generat, stornarea rămâne posibilă prin procedura obișnuită.\n\nDacă raportul Z a fost deja generat când observați greșeala, jurnalul electronic al zilei respective este definitiv — stornarea prin aparat nu mai este posibilă. Corecția se face atunci doar prin proceduri contabile separate, discutate direct cu contabilul dumneavoastră, nu prin POS.",
      },
      {
        heading: "Cum preveniți să ajungeți în situația asta",
        body: "Cea mai eficientă prevenție este confirmarea sumei cu clientul **înainte** de finalizarea plății, nu după — mai ales la plata cash, unde nu mai există un extras de cont care să arate automat suma reală. Un obicei simplu de instruit la personal: spuneți suma cu voce tare înainte de a încasa, nu doar de a o afișa pe ecran.\n\nÎn franchisetech, totalul comenzii rămâne vizibil pe ecranul de vânzare pe tot parcursul construirii comenzii, înainte de apăsarea butonului de finalizare — nu apare abia după ce plata a fost deja procesată. Asta nu elimină complet riscul de eroare umană, dar reduce fereastra în care o greșeală de sumă ajunge pe bon nesesizată.",
      },
    ],
  },
  {
    slug: "bon-fiscal-pierdut-sau-deteriorat-ce-faci",
    title: "Bon fiscal pierdut sau deteriorat — ce dovadă mai aveți",
    description:
      "Un client vine fără bon și cere retur, sau dumneavoastră ați pierdut bonul unui echipament cumpărat pentru local. Ce spune legea despre dovada achiziției și ce puteți accepta sau folosi în loc.",
    publishedAt: "2026-09-09",
    locale: "ro",
    tags: ["fiscal", "bon-fiscal", "garantie"],
    image: "/marketing/pos-hero.png",
    relatedFeature: "/features/pos",
    sections: [
      {
        heading: "La ce servește bonul fiscal după ce s-a plătit",
        body: "Bonul fiscal nu e important doar în momentul plății — rolul lui real începe după aceea, ca dovadă a **datei achiziției**. Conform Legii nr. 449/2003 privind vânzarea produselor și garanțiile asociate acestora (republicată), răspunderea vânzătorului pentru un produs neconform este angajată dacă defectul apare într-un termen de 2 ani de la livrare (art. 16) — iar acest termen curge de la data de pe bon sau factură, nu de la o dată estimată ulterior.\n\nPentru produsele de folosință îndelungată (echipamente de bucătărie, electronice, mobilier), comerciantul are și obligația să le însoțească de un certificat de garanție, conform art. 20 alin. (3) din OG nr. 21/1992 privind protecția consumatorilor. Certificatul arată ce acoperă garanția; bonul sau factura arată de când curge termenul. Fără niciunul dintre cele două, discuția despre garanție pornește mult mai greu.",
      },
      {
        heading: "Un client vine fără bon — sunteți obligați să-l refuzați?",
        body: "Nu automat. Legea nu condiționează dreptul la retur sau reclamație de prezentarea exclusivă a bonului fiscal — cere doar dovada că tranzacția a avut loc la dumneavoastră. Practica ANPC recunoaște ca dovezi alternative: extrasul de cont bancar (dacă plata a fost cu cardul), factura (dacă a fost cerută la momentul plății), o confirmare de plată prin SMS sau email, sau chiar eticheta produsului dacă indică vânzătorul.\n\nRefuzul automat al unei reclamații doar pe motiv că lipsește bonul fizic poate fi tratat ca o încălcare a drepturilor consumatorului. Asta nu înseamnă că trebuie să acceptați orice afirmație necontrolată — puteți și ar trebui să verificați intern dacă vânzarea a avut loc, cum arătăm în secțiunea următoare — dar «nu am bonul» nu e, singur, un motiv legal suficient pentru refuz.",
      },
      {
        heading: "Cum verificați o vânzare fără bonul fizic",
        body: "Bonul fizic e doar hârtia — vânzarea în sine rămâne înregistrată în jurnalul electronic al casei de marcat și, dacă folosiți un POS conectat, în istoricul digital al aplicației. Dacă un client vine fără bon dar știe aproximativ data, ora și ce a cumpărat, puteți căuta tranzacția în sistem înainte să decideți cum procedați.\n\nAsta contează mai ales la sume mai mari sau la produse cu garanție extinsă, unde confirmarea reală a tranzacției contează mai mult decât un bon fizic care oricum nu poate fi «reemis» de o casă de marcat fiscală — odată emis, un bon nu se poate genera a doua oară identic, doar stornat dacă e nevoie de corecție. Pentru verificare, jurnalul digital e mai de încredere decât memoria oricui. Situația e și mai strictă dacă [Raportul Z al zilei respective e deja închis](/blog/bon-fiscal-cerut-dupa-raportul-z-inchis-ce-faceti) — acolo nici stornarea nu mai e o opțiune tehnică.",
      },
      {
        heading: "Când dumneavoastră ați pierdut bonul unui echipament cumpărat",
        body: "Situația se întoarce și către dumneavoastră, ca afacere — de exemplu, ați cumpărat o mașină de cafea sau un echipament de bucătărie și, câteva luni mai târziu, aveți nevoie de garanție, dar bonul s-a decolorat sau s-a rătăcit. Dacă ați plătit cu cardul, extrasul de cont bancar arată data și furnizorul și poate susține solicitarea de garanție — de altfel, pentru plățile cu cardul, extrasul de cont ține deja, prin lege, locul bonului fiscal ca mijloc de probă a achiziției (Legea nr. 317/2024, care a modificat OUG nr. 28/1999).\n\nDacă furnizorul v-a emis și factură (frecvent la echipamente, pentru că firma cumpărătoare are nevoie de ea pentru contabilitate), aceea rămâne cea mai solidă dovadă — păstrați facturile de echipamente separat de bonurile de consumabile zilnice, tocmai pentru cazurile de garanție.",
      },
      {
        heading: "Ce nu e clar reglementat — verificați cazurile punctuale",
        body: "Nici Legea nr. 449/2003, nici OG nr. 21/1992 nu descriu explicit procedura exactă pentru un bon fiscal plătit cash și pierdut complet, fără nicio altă urmă (fără extras de card, fără factură, fără martori). Practic, în lipsa unei dovezi de orice fel, comerciantul are libertatea să decidă dacă acceptă reclamația — legea protejează consumatorul de refuzul arbitrar bazat *doar* pe lipsa bonului, nu garantează rezolvarea favorabilă indiferent de circumstanțe.\n\nPentru situații ambigue sau sume mari, cel mai sigur e să verificați direct cu ANPC (pentru dumneavoastră ca și comerciant) sau cu un consultant fiscal, în loc să vă bazați pe o interpretare generală — inclusiv a acestui articol.",
      },
      {
        heading: "Cum reduceți dependența de hârtie",
        body: "În franchisetech, fiecare vânzare finalizată în POS rămâne în istoricul digital al aplicației, căutabil după dată, oră și produs — nu doar pe bonul de hârtie pe care clientul îl poate pierde sau pe care termalul îl poate decolora în câteva luni. Dacă un client revine fără bon, puteți verifica rapid dacă și când a avut loc tranzacția, în loc să vă bazați doar pe memoria personalului sau pe cuvântul clientului.\n\nAsta nu înlocuiește bonul fiscal ca document legal — bonul rămas emis de casa de marcat fiscală certificată — dar vă dă un instrument intern rapid de verificare atunci când hârtia lipsește.",
      },
    ],
  },
  {
    slug: "ce-risti-daca-nu-ai-bon-fiscal-la-un-control-anaf",
    title: "Ce riscați dacă lipsește bonul fiscal la un control ANAF",
    description:
      "Nu «amenda generică» — mecanismul exact prin care un inspector transformă un bon lipsă într-o sancțiune, pragurile de amendă în vigoare din 2024 și ce se întâmplă dacă situația se repetă.",
    publishedAt: "2026-09-11",
    locale: "ro",
    tags: ["fiscal", "control-anaf", "amenzi"],
    image: "/marketing/reports-zreport.png",
    sections: [
      {
        heading: "Cum descoperă efectiv inspectorul un bon lipsă",
        body: "Un inspector nu «știe» din start că un bon lipsește — îl constată printr-o comparație. La momentul controlului sau la sfârșitul zilei, se compară valoarea bunurilor livrate sau a serviciilor prestate cu ce arată aparatul de marcat electronic fiscal (AMEF) și/sau registrul special. Diferența dintre ce s-a vândut efectiv și ce a fost înregistrat fiscal se numește, în text legal, **sumă nejustificată** — și e exact mecanismul prin care o vânzare fără bon devine o contravenție cu amendă atașată.\n\nAsta înseamnă că riscul nu vine doar din «a uitat casierul să bată un bon» — vine din orice neconcordanță pe care inspectorul o poate demonstra la momentul verificării, indiferent de motivul din spate.",
      },
      {
        heading: "Amenzile pe praguri, în vigoare din 1 ianuarie 2024",
        body: "Legea nr. 296/2023 (publicată în Monitorul Oficial nr. 977/27.10.2023) a modificat art. 11 din OUG nr. 28/1999 și a înlocuit vechiul sistem (care includea și un avertisment pentru sume mici) cu amenzi fixe pe praguri, calculate după mărimea sumei nejustificate:\n\n- **2.000 lei** — sumă nejustificată de până la 300 lei inclusiv, sub 3% din valoarea totală a bunurilor/serviciilor înregistrate\n- **5.000 lei** — până la 300 lei, dar peste 3% din total\n- **6.000 lei** — între 300 și 1.000 lei, sub 3% din total\n- **12.000 lei** — între 300 și 1.000 lei, peste 3% din total\n- **15.000 lei** — peste 1.000 lei, sub 3% din total\n- **30.000 lei** — peste 1.000 lei și peste 3% din total\n\nÎn toate cazurile, suma nejustificată se confiscă suplimentar față de amendă. Aceste cifre sunt cele confirmate în materialul explicativ oficial al ANAF (DGRFP Brașov) la modificarea din 2023 — verificați totuși cu contabilul dumneavoastră dacă nu a mai apărut o actualizare între timp, fiindcă amenzile fiscale se revizuiesc periodic.",
      },
      {
        heading: "Ce se întâmplă dacă situația se repetă",
        body: "Legea tratează diferit un incident izolat față de un tipar repetat. Dacă în 12 luni de la o sancționare pentru sumă nejustificată apare o nouă abatere din aceeași categorie, amenda se dublează față de suma inițial aplicabilă pentru acel prag. Dacă în 12 luni se constată **cel puțin două** astfel de abateri noi, amenda se triplează, iar pe lângă confiscarea sumei nejustificate se dispune și **suspendarea activității punctului de lucru pentru 15 zile**.\n\nSuspendarea poate înceta mai devreme decât cele 15 zile doar dacă operatorul economic achită amenda plus o sumă egală cu de cinci ori amenda aplicată și de cinci ori suma confiscată — caz în care sancțiunea complementară încetează la 24 de ore de la prezentarea dovezii de plată. În practică, costul real al recidivei nu e amenda de bază, ci multiplicatorul plus riscul de a sta închis fizic 15 zile la vârf de sezon.",
      },
      {
        heading: "De ce «a fost o singură dată» nu vă protejează la control",
        body: "Din perspectiva inspectorului, un bon lipsă constatat în ziua controlului nu vine cu context — nu poate distinge «a fost o excepție azi» de «se întâmplă des, dar azi ați fost prinși». Suma nejustificată se calculează din ce lipsește la momentul verificării, nu din istoricul intențiilor dumneavoastră. Un incident real izolat tot generează amendă conform pragurilor de mai sus — legea nu prevede o toleranță pentru prima abatere, cu excepția cazului deja acoperit de prag (sub 300 lei și sub 3%, care rămâne totuși sancționat, doar la nivelul minim de 2.000 lei, nu cu avertisment cum era înainte de 2024).\n\nSingurul lucru care contează practic e să nu se repete — pentru că acolo intervine multiplicarea amenzii și suspendarea.",
      },
      {
        heading: "Cum reduceți riscul ca un bon să lipsească fără să observați",
        body: "Cea mai frecventă cauză a unui bon lipsă nu e frauda, ci un pas manual sărit la oră de vârf — o vânzare cash încasată «repede», fără să treacă prin POS. Riscul scade dacă fiscalizarea nu mai depinde de un pas separat: în franchisetech, fiecare vânzare finalizată în POS trimite automat comanda către FiscalNet, care declanșează emiterea bonului la casa fiscală, **când integrarea e configurată** — nu există un moment în care casierul trebuie «să nu uite» să bată vânzarea separat.\n\nAsta nu elimină nevoia de verificare zilnică a sertarului și a rapoartelor — dar reduce exact tipul de discrepanță pe care se bazează mecanismul sumei nejustificate descris mai sus.",
      },
    ],
  },
  {
    slug: "bon-fiscal-vs-bon-nefiscal-diferenta-si-cand-gresiti",
    title: "Bon fiscal vs. bon nefiscal — diferența și când greșiți",
    description:
      "Nota de plată, comanda tipărită din softul de gestiune sau bonul de test al casei de marcat nu sunt bon fiscal. Iată diferența reală și cele trei greșeli frecvente prin care cafenelele și restaurantele le confundă.",
    publishedAt: "2026-09-14",
    locale: "ro",
    tags: ["fiscal", "bon-fiscal", "pos"],
    image: "/marketing/dashboard-hero.png",
    relatedFeature: "/features/pos",
    sections: [
      {
        heading: "Ce este, de fapt, un bon nefiscal",
        body: "Un bon nefiscal este orice document tipărit care arată ca o listă de produse și un total, dar care **nu a trecut prin jurnalul electronic fiscal** al AMEF — nu are valoare fiscală, nu e transmis către sistemul ANAF și nu poate sta la baza obligației de a fiscaliza vânzarea. În HoReCa, cele mai frecvente exemple legitime sunt: **nota de plată** (pre-bilul pe care ospătarul îl aduce la masă pentru confirmare, înainte de plata efectivă), un bon de test generat la pornirea casei de marcat, sau o comandă internă tipărită pentru bucătărie.\n\nUtilizarea unui bon nefiscal nu e, în sine, o problemă — devine una doar când e tratat sau prezentat ca și cum ar fi bonul fiscal final al unei vânzări încheiate.",
      },
      {
        heading: "Ce este bonul fiscal și de ce diferă legal",
        body: "Bonul fiscal este documentul emis de aparatul de marcat electronic fiscal (AMEF) la momentul încasării, conform OUG nr. 28/1999 privind obligația operatorilor economici de a utiliza aparate de marcat electronice fiscale. Spre deosebire de bonul nefiscal, el ajunge în jurnalul electronic al casei, colectează și raportează TVA-ul, și este documentul pe care legea îl cere la orice încasare de la o persoană fizică, indiferent de sumă.\n\nDin perspectiva unui control, diferența nu e stilistică — un bon nefiscal dat clientului în locul celui fiscal echivalează, practic, cu o vânzare nefiscalizată, chiar dacă pe hârtie arată aproape identic cu bonul real.",
      },
      {
        heading: "Greșeala #1: vă opriți la nota de plată",
        body: "Tiparul clasic în restaurante: ospătarul aduce nota de plată, clientul confirmă și plătește cash direct la masă sau la ieșire, iar la aglomerație pasul final — baterea efectivă a bonului fiscal la casă — se amână «pentru mai târziu» sau se omite complet, pentru că din perspectiva echipei «clientul deja a plătit, deci e rezolvat».\n\nDin perspectivă fiscală, nu e rezolvat — nota de plată nu are nicio valoare fiscală. Dacă acea vânzare nu ajunge separat, în aceeași zi, în jurnalul AMEF, ea devine exact tipul de neconcordanță descrisă în mecanismul sumei nejustificate la un eventual control.",
      },
      {
        heading: "Greșeala #2: bonul din softul de gestiune, dat ca fiscal",
        body: "Multe softuri de gestiune sau POS-uri mai vechi pot genera un bon printat local, cu logo și listă de produse, fără să fie conectate efectiv la AMEF. Dacă acel bon ajunge la client fără ca vânzarea să fi trecut și prin casa fiscală, clientul crede că are dovada fiscală a achiziției — dar documentul nu există în jurnalul ANAF.\n\nAsta creează un risc dublu: pentru afacere, la control, ca vânzare nefiscalizată; pentru client, dacă cere ulterior factură sau garanție pe baza acelui bon, care nu poate fi legat de o tranzacție fiscală reală.",
      },
      {
        heading: "Greșeala #3: folosirea bonului nefiscal în contabilitate",
        body: "Un bon nefiscal nu poate sta la baza înregistrărilor contabile ale afacerii care l-a emis și nu e recunoscut ca document justificativ pentru deducerea TVA de către cel care îl primește la o achiziție. Regulile exacte despre ce praguri și condiții se aplică bonurilor fiscale simple (fără CUI) în contabilitate diferă și se schimbă — verificați cu contabilul dumneavoastră ce documente acceptă exact pentru pontarea unei cheltuieli, în loc să presupuneți că orice bon tipărit e suficient.\n\nCa regulă generală simplă: dacă un document nu a trecut prin AMEF, tratați-l ca informativ, nu ca document fiscal — indiferent cât de oficial arată.",
      },
      {
        heading: "Cum evitați confuzia în flux",
        body: "Cel mai sigur proces are o singură regulă: nota de plată e mereu urmată, în aceeași interacțiune, de apăsarea finalizării plății în POS — pasul care declanșează efectiv emiterea bonului fiscal prin AMEF. Niciun document tipărit înainte de acel moment nu înlocuiește bonul fiscal, oricât de complet ar arăta.\n\nÎn franchisetech, fiecare vânzare finalizată în POS trimite automat comanda spre fiscalizare — nu există un pas manual separat de «acum bat bonul real», ceea ce reduce riscul ca personalul să confunde nota de plată cu finalizarea efectivă a vânzării.",
      },
    ],
  },
  {
    slug: "e-obligatoriu-qr-code-pe-bonul-fiscal",
    title: "E obligatoriu cod QR pe bonul fiscal? Ce se schimbă în 2026",
    description:
      "Bonul fiscal digital cu cod QR nu mai e doar o discuție teoretică — Ministerul Finanțelor a pus în dezbatere publică un proiect de HG cu termen 1 noiembrie 2026. Iată ce e deja lege, ce e încă proiect și ce nu se schimbă.",
    publishedAt: "2026-09-17",
    locale: "ro",
    tags: ["fiscal", "bon-fiscal", "casa-de-marcat"],
    image: "/marketing/pos-hero.png",
    relatedFeature: "/features/qr-code-receipts",
    sections: [
      {
        heading: "Da, premisa e reală — dar verificați stadiul exact",
        body: "Spre deosebire de multe subiecte fiscale «se zvonește că», codul QR pe bonul fiscal chiar este pe agenda oficială a Ministerului Finanțelor. La 1 aprilie 2026, MF a lansat în dezbatere publică un proiect de Hotărâre de Guvern care introduce bonul fiscal digital, cu cod QR, identificator unic și transmitere a datelor către ANAF într-un format standardizat.\n\nImportant: la momentul redactării acestui articol, e vorba despre un **proiect** aflat în dezbatere publică, nu despre o lege deja publicată în Monitorul Oficial. Verificați stadiul curent înainte să luați decizii de buget sau de implementare bazate pe acest termen — proiectele fiscale românești se modifică frecvent între dezbatere și forma finală.",
      },
      {
        heading: "Termenul: 1 noiembrie 2026",
        body: "Conform proiectului, operatorii economici au la dispoziție termenul de 1 noiembrie 2026 pentru a-și adapta sistemele și pentru a transmite noile date către ANAF. Nu e prima dată când apare acest gen de termen — obligația de a avea cod QR pe bon există în principiu din 2024, sancțiunile pentru lipsa lui au fost programate inițial pentru septembrie 2025, apoi suspendate printr-o ordonanță din decembrie 2025 chiar până la 1 noiembrie 2026, motivat oficial de faptul că aproximativ 900.000 de case de marcat din România aveau nevoie de actualizare software și certificare tehnică la ICI București.\n\nCu alte cuvinte, termenul a tot fost amânat — ceea ce e un motiv în plus să nu tratați 1 noiembrie 2026 ca fiind sigur imuabil, ci ca cea mai recentă variantă cunoscută.",
      },
      {
        heading: "Ce conține, concret, bonul digital cu QR",
        body: "Conform proiectului aflat în dezbatere, codul QR de pe bon ar urma să fie însoțit de data și ora exactă a emiterii, un identificator unic al bonului și, la cererea clientului, codul de identificare fiscală al comerciantului. Scopul declarat e ca un client sau un inspector să poată verifica instant validitatea bonului, iar ANAF să primească automat confirmarea tranzacției.\n\nProiectul discută și reducerea perioadei de arhivare a jurnalelor electronice de la 10 la 5 ani, dar acesta e un detaliu tehnic care poate suferi modificări până la forma finală — nu vă bazați operațional pe el încă.",
      },
      {
        heading: "Ce e deja lege, nu doar proiect: bonul la plata cu cardul",
        body: "Spre deosebire de codul QR, o schimbare conexă e deja în vigoare: Legea nr. 317/2024, care a modificat OUG nr. 28/1999, prevede că la plata cu cardul de debit sau credit, comerciantul **nu mai are obligația să tipărească și să înmâneze** bonul fiscal — doar la cererea explicită a clientului. Lipsa bonului tipărit nu afectează drepturile consumatorului: extrasul de cont bancar ține locul bonului ca mijloc de probă a achiziției.\n\nAtenție la ce nu s-a schimbat: tranzacția tot trebuie fiscalizată prin AMEF în momentul plății — legea a scutit doar pasul de tipărire pe hârtie, nu obligația de a trece vânzarea prin casa de marcat.",
      },
      {
        heading: "Ce înseamnă pentru dumneavoastră ca afacere",
        body: "Codul QR, când va deveni obligatoriu, va fi generat de **casa de marcat fiscală certificată**, nu de un soft de gestiune sau de un POS extern — exact cum se întâmplă și acum cu bonul fiscal standard. franchisetech nu generează codul QR de pe bon și nu promite asta: trimite datele vânzării către casa fiscală prin FiscalNet, **când integrarea este configurată**, iar emiterea efectivă a bonului — cu sau fără QR — rămâne responsabilitatea aparatului certificat.\n\nCe puteți face util acum, fără să reacționați exagerat la un proiect încă în dezbatere: întrebați furnizorul casei de marcat dacă are deja un plan de actualizare pentru termenul din proiect, ca să nu vă prindă pe ultima sută de metri dacă termenul rămâne 1 noiembrie 2026.",
      },
    ],
  },
  {
    slug: "diferenta-de-casa-la-final-de-zi-surplus-sau-lipsa",
    title: "Diferență de casă la final de zi — surplus sau lipsă, ce faceți și cum o documentați",
    description:
      "Sertarul nu se potrivește exact cu raportul Z? O diferență de casă nu e automat o problemă cu ANAF — dar modul în care o documentați poate deveni una. Ce spune legea, ce e doar practică internă și cum notați corect surplusul sau lipsa.",
    publishedAt: "2026-09-21",
    locale: "ro",
    tags: ["numerar", "registru-de-casa", "raport-z", "operatiuni"],
    image: "/marketing/pos-hero.png",
    relatedFeature: "/features/z-report",
    sections: [
      {
        heading: "O diferență de casă nu este, prin ea însăși, o contravenție",
        body: "OUG nr. 28/1999, legea de bază a caselor de marcat, nu sancționează faptul în sine că numerarul numărat în sertar nu coincide exact cu totalul de numerar așteptat din raportul Z. Nu există un articol care să spună „diferența de casă e contravenție\" — și n-ar trebui să inventați unul din frică, pentru că nu ajută la nimic dacă la control explicați ceva ce legea nu cere.\n\nCe sancționează efectiv OUG 28/1999, la art. 10, sunt alte fapte: neemiterea bonului fiscal pentru o vânzare (art. 10 pct. 3 lit. c), neînmânarea bonului deja emis către client (art. 10 lit. g) și, cel mai apropiat de subiectul de aici, lipsa documentelor justificative pentru sume introduse sau scoase din casă în afara vânzărilor obișnuite (art. 10 lit. d). Ultima cade sub aceeași grilă de amenzi pe tranșe ca neemiterea bonului — între 2.000 și 30.000 lei, în funcție de sumă și de cât reprezintă din vânzările zilei, plus confiscarea sumei nejustificate. Diferența practică: nu vă amendează nimeni pentru că sertarul are 30 de lei în minus. V-ar putea amenda dacă acei 30 de lei (sau orice sumă introdusă ori scoasă din casă) nu au niciun document care să explice de unde vin sau unde s-au dus.",
      },
      {
        heading: "Ce e cu adevărat obligatoriu: registrul de casă",
        body: "Ce este obligatoriu, conform Legii contabilității nr. 82/1991 și normelor date prin Ordinul MFP nr. 2634/2015, este completarea registrului de casă — documentul care înregistrează cronologic, zilnic, fiecare încasare și plată în numerar. Normele generale din anexa 1 a ordinului sunt explicite: documentele financiar-contabile nu admit ștersături, modificări sau spații libere între operațiuni; erorile se corectează prin tăierea cu o linie a cifrei greșite și înscrierea alături a cifrei corecte, cu semnătură și dată. Pentru documentele pe baza cărora se justifică numerarul — exact categoria din care face parte registrul de casă — regula e și mai strictă: documentul completat greșit se anulează integral și rămâne în carnet, nu se corectează prin suprascriere.\n\nAsta înseamnă, concret, că o diferență de casă găsită la închiderea zilei nu \"dispare\" dacă nu o notați nicăieri — ea trebuie să apară undeva, cu explicație, în evidența pe care o păstrați. Am detaliat structura exactă pe coloane și un exemplu complet, zi de zi, în [Cum completați corect Registrul de casă, pas cu pas](/blog/cum-completezi-registrul-de-casa-corect) — dacă nu sunteți sigur cum arată un rând corect completat, plecați de acolo.",
      },
      {
        heading: "Cum documentați corect o diferență, pas cu pas",
        body: "1. Numărați fizic tot numerarul din sertar, bănuț cu bănuț, nu \"cam atât\"\n2. Scădeți fondul de deschidere al zilei (suma cu care ați pornit tura)\n3. Comparați rezultatul cu numerarul așteptat conform raportului Z\n4. Dacă cele două cifre coincid — nu aveți nimic de documentat suplimentar\n5. Dacă nu coincid, identificați, dacă puteți, cauza probabilă (rest greșit, o anulare nedocumentată, o vânzare neîncasată)\n6. Notați suma exactă a diferenței, semnul ei (plus sau minus) și explicația găsită — sau \"cauză neidentificată\" dacă nu găsiți una — direct în registrul de casă sau într-o notă atașată lui, cu data și semnătura persoanei care a numărat\n\nUn pas des sărit: diferențele mici, sub 10-20 de lei, sunt tratate ca \"nu merită notate\". Practic nu contează mărimea — contează faptul că, peste trei luni, nimeni nu-și mai amintește dacă acea diferență repetată de 15 lei e o eroare de rest normală sau un tipar care merită investigat mai serios.",
      },
      {
        heading: "Surplus vs. lipsă — și ce nu aveți voie să faceți cu o lipsă",
        body: "Un surplus (mai mulți bani în sertar decât arată raportul Z) și o lipsă nu se tratează la fel. Un surplus e, cel mai adesea, o eroare de rest dat în minus către un client — deci prima reacție corectă e să verificați dacă nu cumva ați \"câștigat\" acei bani dintr-o greșeală, nu să-i tratați automat ca venit. Dacă, după verificare, cauza chiar nu poate fi identificată, contabilul dumneavoastră va ști cum să înregistreze surplusul; nu e o decizie pe care ar trebui s-o luați singur, la fața locului, fără să consultați pe cineva care vede toată luna, nu doar o zi.\n\nO lipsă repetată sau mare ridică o întrebare diferită: cine răspunde pentru ea? Aici atenție la o greșeală frecventă — angajatorul nu poate scădea pur și simplu suma din salariul casierului. Codul muncii, art. 254, permite recuperarea unui prejudiciu cauzat din vina salariatului doar prin acordul scris al acestuia (sumă care, prin acord, nu poate depăși echivalentul a 5 salarii minime brute pe economie) sau, dacă nu există acord, printr-o hotărâre judecătorească definitivă. O reținere unilaterală din statul de plată, fără niciuna dintre cele două, nu e o soluție legală, oricât de clar ar părea cazul.",
      },
      {
        heading: "Cele mai frecvente cauze ale diferenței de casă",
        body: "- **Rest calculat sau dat greșit** — cea mai frecventă cauză de departe; câțiva lei pe tranzacție, care se adună pe parcursul unei zile aglomerate\n- **Anulări (storno) sau reduceri aplicate după încasare, nedocumentate** — casierul anulează o linie din bon după ce clientul a plătit deja cash, dar nu notează de ce\n- **Vânzare neînregistrată în sistem** — plata s-a încasat, dar produsul nu a fost trecut prin POS, deci nu apare în totalul așteptat de raportul Z\n- **Scoateri de numerar din sertar nedocumentate** — o plată rapidă către un furnizor \"din cash-ul zilei\", fără chitanță sau dispoziție de plată notată pe loc\n- **Furt** — cea mai rară cauză statistic, dar singura pentru care lipsa se repetă constant la aceeași persoană sau tură, fără nicio altă explicație plauzibilă\n\nDacă o diferență similară apare la aceeași oră sau la aceeași persoană, în mod repetat, nu mai e \"o zi proastă\" — e un tipar care merită investigat specific, nu doar notat și trecut mai departe.",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "Raportul Z din franchisetech calculează automat numerarul așteptat — vânzări în numerar plus fondul de deschidere — deci comparația cu ce numărați fizic în sertar pornește de la o cifră corectă, nu de la o estimare. Dacă apare o diferență, o puteți nota direct ca mișcare în registrul de casă generat automat din sesiunea POS, cu oră și utilizator, fără să completați manual un formular separat.\n\nfranchisetech nu decide pentru dumneavoastră dacă o diferență e o eroare de rest sau ceva mai serios — asta rămâne o evaluare pe care o faceți dumneavoastră sau contabilul, cu contextul zilei respective. Ce oferă sistemul e o cifră de plecare exactă și un istoric complet, căutabil pe dată, ca să nu reconstituiți o diferență din memorie peste trei luni.",
      },
    ],
  },
  {
    slug: "ati-uitat-sa-emiteti-bonul-fiscal-ce-faceti-acum",
    title: "Ați uitat să emiteți bonul fiscal pentru o vânzare — ce faceți acum",
    description:
      "Descoperiți abia la închiderea zilei, sau a doua zi, că o vânzare n-a trecut deloc prin bon fiscal? Fapta e deja comisă legal — dar diferența dintre un incident izolat corectat cinstit și un tipar de venituri needeclarate contează enorm pentru cât de gravă rămâne situația.",
    publishedAt: "2026-09-21",
    locale: "ro",
    tags: ["fiscal", "bon-fiscal", "amenzi", "control-anaf"],
    image: "/marketing/pos-hero.png",
    relatedFeature: "/features/z-report",
    sections: [
      {
        heading: "Ce înseamnă, legal, o vânzare descoperită fără bon, după fapt",
        body: "Fapta e definită în OUG nr. 28/1999 (republicată), art. 10 pct. 3 lit. c): neemiterea bonului fiscal pentru bunurile livrate sau serviciile prestate este contravenție, indiferent de motivul din spate — grabă la oră de vârf, o eroare de operare sau, exact situația de aici, o vânzare care pur și simplu nu a mai ajuns prin aparatul fiscal. Legea nu face, la nivelul acestei fapte, nicio distincție între «am uitat» și «am ales să nu bat bonul»: contravenția se consumă juridic în momentul vânzării, nu în momentul în care o descoperiți dumneavoastră, la închiderea zilei sau abia a doua zi, la reconciliere.\n\nAsta e important de acceptat de la început, ca să nu vă bazați pe o presupunere greșită: descoperirea ulterioară, din proprie inițiativă, nu vă mută într-o categorie juridică separată sau mai blândă doar pentru că nu a fost un inspector cel care a găsit diferența. Ce diferă cu adevărat, în funcție de ce faceți din acel moment încolo, e cât de gravă rămâne situația — nu dacă fapta a existat. Pentru mecanismul exact al amenzii, pe tranșe, aveți deja un articol dedicat: [Amenda pentru neeliberarea bonului fiscal — cât este și cum o evitați](/blog/amenda-neeliberare-bon-fiscal-cat-este-si-cum-o-eviti). Articolul de față pornește de unde se oprește acela — nu cum preveniți fapta, ci ce faceți după ce ați constatat-o deja, pe cont propriu.",
      },
      {
        heading: "Nu există o cale de a «emite» retroactiv bonul — dar tot aveți ce face",
        body: "Prima reacție firească e să vă întrebați dacă puteți, pur și simplu, «bate acum bonul, cu data de azi», pentru vânzarea uitată. Nu puteți, iar dacă ați putea din punct de vedere tehnic, nu ar corecta nimic legal — ar crea doar o discrepanță nouă, o încasare care apare fiscal într-o zi în care nu a avut loc, fără să rezolve nimic în ziua în care vânzarea chiar s-a produs. Aparatele de marcat electronice fiscale înregistrează operațiunile cu data și ora reală a tranzacției; nu există un mecanism legal de emitere retroactivă a unui bon fiscal pentru o vânzare deja încheiată altfel.\n\nNu confundați situația cu procedura de la art. 1 alin. (8) din OUG 28/1999 — registrul special și chitanțele emise cât timp aparatul e efectiv defect. Acea procedură se aplică doar cât timp aparatul chiar nu funcționează, în timp real; nu se poate invoca retroactiv, pentru o zi în care aparatul a funcționat normal, dar operațiunea a fost pur și simplu omisă. La un control, jurnalul intern al aparatului și istoricul de service arată clar dacă a existat sau nu o defecțiune reală — nu încercați să «acoperiți» o vânzare uitată cu o defecțiune care nu s-a întâmplat.\n\nCe puteți controla, în schimb, e partea contabilă: venitul din vânzarea respectivă tot trebuie să ajungă în evidența contabilă și în declarația de TVA sau de impozit pe profit aferentă perioadei corecte, chiar dacă bonul fiscal, ca document, nu mai poate fi emis pentru acea tranzacție.",
      },
      {
        heading: "Diferența care contează cu adevărat: incident izolat vs. tipar de venituri needeclarate",
        body: "Aici e diferența care contează cu adevărat pentru cât de gravă rămâne situația dumneavoastră — și de multe ori nu e explicată clar. Neemiterea bonului, ca faptă izolată, e o contravenție conform OUG 28/1999: amendă pe tranșe (de la 2.000 lei până la 30.000 lei, în funcție de sumă și de ponderea ei din vânzările zilei — detaliile complete sunt în articolul despre amenda pentru neeliberarea bonului fiscal, linkuit mai sus), plus confiscarea sumei nejustificate. Se aplică per faptă constatată, indiferent de intenție.\n\nCu totul altceva e situația în care venitul nedeclarat nu rămâne un incident izolat, corectat intern, ci devine un tipar — vânzări care nu ajung nici prin bon, nici în contabilitate, nici în declarațiile fiscale, în mod repetat. Legea nr. 241/2005 pentru prevenirea și combaterea evaziunii fiscale sancționează, la art. 9 alin. (1) lit. b), ca infracțiune — nu ca simplă contravenție — «omisiunea, în tot sau în parte, a evidenţierii, în actele contabile ori în alte documente legale, a operaţiunilor comerciale efectuate sau a veniturilor realizate», atunci când fapta e comisă «în scopul sustragerii de la îndeplinirea obligaţiilor fiscale». Pedeapsa e închisoarea — conform ultimelor modificări legislative, între 3 și 10 ani, cu majorări dacă prejudiciul e mare — nu o amendă pe care o plătiți și treceți mai departe. Legea prevede și o cale de reducere sau înlăturare a pedepsei dacă prejudiciul e acoperit integral înainte de primul termen de judecată, dar acel mecanism e gândit pentru fapte deja calificate drept infracțiune, nu e un motiv să tratați ușor o vânzare uitată.\n\nDiferența practică, pentru dumneavoastră: o vânzare uitată, descoperită și corectată cinstit în contabilitate rămâne, dacă e găsită la un control, un risc de amendă contravențională. Venituri needeclarate constant, pe mai multe zile sau săptămâni, riscă să treacă granița spre evaziune fiscală — unde vorbim de altă lege, alt tip de răspundere și alte mize. Cifrele exacte ale pedepsei se modifică periodic; pentru o evaluare corectă a riscului într-un caz concret, aveți nevoie de un avocat sau de un consultant fiscal, nu de un articol de blog.",
      },
      {
        heading: "Ce NU faceți când descoperiți gaura asta",
        body: "- Nu emiteți un bon «de completare», cu data curentă, pentru o vânzare din trecut — nu corectează nimic legal, doar creează o neconcordanță nouă\n- Nu modificați sau ștergeți diferența din Registrul de casă ca să «iasă» cifrele — e document legal; orice corecție se face vizibil, cu explicație atașată, nu prin rescriere\n- Nu așteptați până la finalul lunii sau al anului, sperând că «se pierde în cifre» — cu cât trece mai mult timp între vânzare și descoperire, cu atât e mai greu de explicat, cu bună-credință, de ce ați aflat abia atunci\n- Nu ascundeți situația de contabilul dumneavoastră — el sau ea are nevoie de detaliile reale ca să reflecte corect venitul în declarații, nu doar diferența de casă\n- Nu tratați asta ca pe un incident «rezolvat» doar pentru că ați acoperit lipsa din sertar din bani proprii — lipsa fizică din casă și obligația fiscală pentru venitul nedeclarat sunt două lucruri separate",
      },
      {
        heading: "Ce faceți, concret, chiar acum",
        body: "1. Notați ce știți cât mai repede — data, ora aproximativă, suma, ce s-a vândut, cine a operat casa — cât timp încă vă amintiți detaliile, nu peste o săptămână\n2. Discutați cu contabilul dumneavoastră în aceeași săptămână, nu la următorul raport lunar — el sau ea decide cum se reflectă corect venitul în contabilitate și în declarația de TVA sau de impozit pe profit aferentă\n3. Verificați dacă e un caz izolat sau dacă găsiți diferențe similare în zilele anterioare — dacă da, tratați-l ca pe un semnal de proces, nu ca pe o excepție\n4. Dacă situația se repetă sau implică sume mari, cereți explicit contabilului sau unui consultant fiscal o evaluare de risc — nu e o discuție de amânat, oricât de neplăcută pare\n\nCu cât descoperiți mai devreme o astfel de diferență, cu atât rămâne mai ușor de explicat și de corectat — și cu atât scade riscul să devină un tipar, care e exact linia dintre o contravenție și o problemă mult mai serioasă. În franchisetech, diferența dintre numerarul așteptat și cel numărat apare direct în Raportul Z, în aceeași zi, nu abia la o reconciliere lunară — motivul pentru care majoritatea unor astfel de goluri ajung să fie descoperite la câteva ore de la vânzare, nu la câteva săptămâni.",
      },
    ],
  },
  {
    slug: "bon-fiscal-cota-tva-gresita-cum-corectati-dupa-emitere",
    title: "Bon fiscal emis cu cotă de TVA greșită — cum corectați după emitere",
    description:
      "Ați bătut 21% în loc de 11% (sau invers) și bonul s-a tipărit deja — poate clientul a și plecat. Iată ce puteți corecta prin stornare și ce rămâne, real, doar în mâna contabilului.",
    publishedAt: "2026-09-21",
    locale: "ro",
    tags: ["tva", "storno", "fiscal"],
    image: "/marketing/pos-hero.png",
    relatedFeature: "/features/pos",
    sections: [
      {
        heading: "Prin ce diferă o cotă de TVA greșită de o sumă sau un produs greșit",
        body: "Mecanismul legal de corectare a unui bon fiscal emis greșit este același indiferent ce anume ați greșit — produsul, cantitatea, suma sau cota de TVA: stornarea, cu bază în normele de aplicare a OUG 28/1999 (aprobate prin HG 479/2003). [Pașii concreți, documentele necesare și ce faceți dacă observați greșeala abia după închiderea zilei sunt explicate pe larg aici](/blog/cum-anulezi-un-bon-fiscal-emis-gresit) — nu le repetăm în articolul de față.\n\nCe e diferit la o cotă de TVA greșită — de exemplu un produs bătut la 21% când trebuia 11%, sau invers — e ce se întâmplă cu banii deja încasați. La o eroare de sumă, diferența e, practic, banii afacerii: fie ați luat în plus de la client, fie în minus. La o eroare de cotă TVA, o parte din suma încasată e declarată explicit pe bon drept TVA — bani colectați, formal, în numele statului, nu venit propriu. Asta schimbă exact ce puteți repara doar printr-o notă contabilă internă și ce nu, mai ales dacă între timp clientul a plecat.",
      },
      {
        heading: "Cotele curente de TVA — ca să știți precis ce ați greșit",
        body: "Cotele de TVA din România s-au schimbat prin Legea nr. 141/2025, cu normele de aplicare date prin HG 602/2025, ambele cu efect din 1 august 2025: cota standard a urcat de la 19% la **21%**, iar fostele cote reduse de 9% și 5% au fost unificate într-o singură cotă redusă de **11%**. Pentru un local HoReCa, cota de 11% acoperă serviciile de restaurant și catering, precum și alimentele în general — cu excepția băuturilor alcoolice, a băuturilor nealcoolice îndulcite încadrate la codul NC 2202 și a alimentelor cu conținut mare de zahăr adăugat, care rămân la cota standard de 21%. Cota 0% rămâne rezervată operațiunilor scutite prin lege — nu e o cotă pe care o alegeți pentru un client obișnuit la masă.\n\nÎn practică, o sursă frecventă chiar a erorii de cotă e obișnuința cu cifrele vechi: cineva care a lucrat cu sistemul dinainte de august 2025 poate încă \"gândi\" în 19% sau 9%, sau confundă cota redusă actuală cu fosta cotă suplimentară de 5%, care nu mai funcționează ca atare pentru alimentație. Dacă un produs din sistem are o cotă care nu e nici 21%, nici 11%, nici 0%, verificați configurarea înainte de orice altceva — poate să nu fie o greșeală de moment, ci o setare veche, nemodificată de la schimbarea legii.",
      },
      {
        heading: "Ați prins greșeala în aceeași zi, cu clientul încă la casă",
        body: "Dacă observați eroarea de cotă chiar în timpul vânzării, înainte ca bonul să fie tipărit, corectarea e directă. Conform art. 33 lit. B.c din normele de aplicare a OUG 28/1999 (HG 479/2003), o eroare poate fi corectată la momentul respectiv, fără dosar separat, cât timp bonul nu a fost încă emis și corecția nu duce valoarea totală în negativ.\n\nDacă bonul greșit a apucat deja să fie tipărit, dar clientul e tot la casă, se aplică aceeași procedură de stornare: stornați bonul, restituiți efectiv banii încasați de la client, apoi emiteți bonul corect cu cota de TVA corectă setată pe produs. Pentru că banii se întorc fizic la client, iar tranzacția corectă e una nouă și completă, nu rămâne nimic de reglat ulterior pe cota greșită — ea pur și simplu nu mai există în vânzările zilei.",
      },
      {
        heading: "Clientul a plecat deja, dar ziua fiscală nu s-a închis",
        body: "Aici lucrurile se complică față de o simplă eroare de sumă. Tehnic, stornarea prin aparatul fiscal rămâne posibilă cât timp raportul Z al zilei nu a fost generat — ziua fiscală e încă deschisă. Dar o stornare pentru eroare de cotă TVA presupune, în esență, să declarați că suma încasată de la un client pe care nu îl mai aveți în față conținea, de fapt, un alt TVA decât cel scris pe bon — și asta ridică o problemă pe care o eroare de sumă nu o are.\n\nPotrivit unui răspuns de specialitate din consultanța fiscal-contabilă, pe exact acest tip de speță, odată ce TVA-ul a fost efectiv încasat pe bon de la o persoană fizică, o simplă \"reglare contabilă\" care ar muta diferența de TVA la veniturile firmei ar însemna, practic, o îmbogățire fără justă cauză în detrimentul statului — pentru că acel TVA a fost colectat în numele statului, nu ca venit al afacerii (raționament bazat pe art. 330 din Codul Fiscal și art. 33 și 36 din normele de aplicare a OUG 28/1999). Cu alte cuvinte: stornarea bonului și reemiterea unuia cu cota corectă nu înseamnă automat că diferența de TVA poate trece, pur și simplu, la profitul firmei. Pentru un caz ca acesta, discutați explicit cu contabilul dumneavoastră înainte să considerați situația rezolvată — nu e o decizie de luat singur, doar din ecranul POS-ului.",
      },
      {
        heading: "Dacă observați abia după închiderea zilei",
        body: "Dacă raportul Z al zilei a fost deja generat, jurnalul electronic al acelei zile e definitiv — stornarea prin aparatul fiscal nu mai e o opțiune, la fel ca la orice altă corectare de bon după închidere. Pentru o eroare de cotă TVA, asta separă problema în două:\n\n1. **Pentru viitor** — corectați imediat cota de TVA configurată pe produsul respectiv, ca eroarea să nu se repete pe fiecare bon următor. Cu cât durează mai mult până corectați setarea, cu atât se adună mai multe bonuri greșite de tratat retroactiv.\n2. **Pentru trecut** — TVA-ul deja colectat la cota greșită, pe bonurile deja emise, nu se repară printr-o simplă notă în POS. Devine subiect de discuție directă cu contabilul dumneavoastră, care stabilește tratamentul corect — inclusiv dacă e nevoie de regularizare cu ANAF pentru perioada afectată.\n\nCu cât greșeala de cotă e descoperită mai târziu — după mai multe zile sau săptămâni, nu doar după o singură închidere — cu atât perioada de regularizat pentru contabil e mai mare. E un motiv concret să verificați periodic, nu doar la control, dacă produsele din meniu au cotele de TVA setate corect.",
      },
      {
        heading: "Cum reduceți riscul în franchisetech",
        body: "Cota de TVA se configurează o singură dată, la nivel de produs, în franchisetech — nu se alege manual de casier la fiecare vânzare și nu depinde de canalul prin care se vinde produsul (masă, livrare, take-away). Asta elimină cea mai frecventă sursă de eroare umană: alegerea greșită a cotei în mijlocul unei vânzări aglomerate.\n\nRaportul Z arată TVA-ul colectat defalcat pe fiecare cotă prezentă în vânzările zilei. Dacă un produs are cota setată greșit, discrepanța devine vizibilă rapid — de multe ori chiar în aceeași zi, ceea ce vă lasă varianta mai simplă de stornare prin aparat, descrisă mai sus, în loc de o corecție contabilă ulterioară. Dacă totuși o greșeală de cotă ajunge să fie descoperită după închiderea zilei, franchisetech păstrează istoricul complet al vânzărilor și al modificărilor de produs, ca să aveți exact datele de care contabilul are nevoie pentru regularizare.",
      },
    ],
  },
  {
    slug: "amenda-neconectare-casa-marcat-anaf",
    title: "Amenda pentru neconectarea casei de marcat la sistemul ANAF — cât este și cum o evitați",
    description:
      "Legea obligă orice casă de marcat fiscală să transmită date către ANAF în timp real — nu doar să existe. Amenda pentru neconectare e diferită de cea pentru lipsa bonului fiscal. Iată exact cât este, cu ce articol se aplică și ce înseamnă „conectat” din punct de vedere tehnic.",
    publishedAt: "2026-09-21",
    locale: "ro",
    tags: ["fiscal", "casa-de-marcat", "amenzi", "control-anaf"],
    image: "/marketing/pos-hero.png",
    relatedFeature: "/features/qr-code-receipts",
    sections: [
      {
        heading: "Obligația de conectare — și de ce e diferită de „aveți casă de marcat certificată”",
        body: "OUG 28/1999 (republicată) tratează, de fapt, două obligații diferite, cu sancțiuni diferite. Prima este simpla deținere a unei case de marcat electronice fiscale (AMEF) certificate — obligația generală de la art. 1 alin. (1). Nerespectarea acesteia se sancționează separat, prin art. 10 lit. cc), cu amenda de la art. 11 alin. (1) lit. f), plus confiscarea sumelor nejustificate și suspendarea activității punctului de lucru.\n\nA doua obligație, distinctă, e cea de care se ocupă acest articol: chiar dacă aveți un aparat certificat și funcțional, legea vă cere separat, prin art. 3¹ alin. (4) din OUG 28/1999, ca operatorii economici să \"asigure conectarea la distanță a aparatelor de marcat electronice fiscale, în vederea transmiterii de date fiscale către Agenția Națională de Administrare Fiscală\". Un aparat fiscal care emite bonuri corect, dar nu transmite datele către serverele ANAF, încalcă tot legea — doar un articol diferit, cu o amendă diferită de cea pentru lipsa aparatului sau pentru lipsa bonului.",
      },
      {
        heading: "Amenda pentru neconectare: cât este, exact, și cu ce articol",
        body: "Nerespectarea obligației de conectare este calificată drept contravenție separat, la art. 10 lit. ff) din OUG 28/1999: \"nerespectarea de către utilizatorii aparatelor de marcat electronice fiscale a dispozițiilor prevăzute la art. 3¹ alin. (4)\".\n\nAmenda corespunzătoare e stabilită la art. 11 alin. (1) — care, până la 31 decembrie 2023, o încadra la litera j), iar de la 1 ianuarie 2024, odată cu restructurarea grilei de amenzi prin Legea nr. 296/2023 (publicată în Monitorul Oficial nr. 977/27.10.2023), a mutat-o la litera l), fără să-i schimbe valoarea: **amendă de la 8.000 lei la 10.000 lei**. Suma nu s-a schimbat prin reforma fiscală din 2024 — doar litera de la care se citează articolul, pentru cine caută textul exact în lege sau găsește materiale mai vechi care încă citează litera j).",
      },
      {
        heading: "E o amendă per aparat, recurentă, sau per control? Ce spune legea, ce nu spune",
        body: "Textul legii nu prevede, pentru această faptă, o amendă zilnică sau cumulativă — este o sumă fixă în intervalul de mai sus, aplicată de agentul constatator pentru fapta constatată la momentul controlului. Spre deosebire de alte litere din același articol (de exemplu cele pentru sume nejustificate în casă, la art. 11 alin. (1) lit. e), care au reguli explicite de recidivă — amendă dublată sau triplată dacă fapta se repetă în 12 luni), legea nu prevede, pentru litera care acoperă neconectarea, o clauză separată de recidivă.\n\nCât despre distincția „niciodată conectat” vs. „offline temporar dintr-o pană de internet” — legea nu publică un număr exact de ore de toleranță. Ce rezultă clar din text: obligația de la art. 3¹ alin. (4) este să **asigurați** conectarea, nu ca aceasta să fie neîntreruptă în orice secundă. Ghidul oficial ANAF de conectare a AMEF cere operatorilor „asigurarea, cu caracter permanent, a condițiilor pentru menținerea conexiunii (de exemplu, neîntreruperea serviciilor de internet)” — un standard de diligență rezonabilă, nu de conexiune perfectă. Un aparat care a parcurs deja procedura de conectare și are o pană scurtă de semnal e într-o situație diferită, tehnic și juridic, de unul care nu a fost conectat niciodată. Pentru pașii practici când apare o eroare de conectare la casă — și ce faceți concret în fața unui client — vedeți [erorile frecvente de conectare la ANAF și cum le rezolvați](/blog/conectare-casa-marcat-anaf-erori-frecvente).",
      },
      {
        heading: "Ce înseamnă, tehnic, „conectat” — nu e doar despre SIM",
        body: "„Conectat” nu înseamnă doar că aparatul are un SIM cu date sau e băgat într-o rețea cu internet — deși ambele sunt condiții necesare. Conform procedurii oficiale ANAF, conectarea propriu-zisă se face de distribuitorul autorizat sau unitatea de service acreditată, în patru pași: instalarea certificatului digital ANAF în aparat, instalarea fișierului de profil care trece aparatul „online”, generarea unui raport Z de închidere zilnică prin care se verifică transmiterea reușită la sistemul informatic MF-ANAF, și atașarea acelui raport Z la cartea tehnică de intervenții a aparatului.\n\nÎn practică, un raport Z transmis cu succes este dovada tehnică a conexiunii — nu declarația dumneavoastră de intenție. Odată conectat, aparatul transmite automat datele către ANAF după fiecare raport Z de închidere zilnică, fără să mai fie nevoie de declarația lunară A4200 (care rămâne obligatorie doar pentru perioada dinaintea conectării sau pentru fișierele semnalate ca netransmise). Puteți verifica oricând, prin Spațiul Privat Virtual, dacă sistemul ANAF a semnalat fișiere netransmise de la aparatul dumneavoastră — cel mai simplu mod de a confirma că nu aveți o problemă de conectare fără să așteptați un control.",
      },
      {
        heading: "Când neconectarea devine mai mult decât o amendă administrativă",
        body: "Amenda de 8.000–10.000 lei de mai sus este sancțiunea contravențională — cea aplicată pentru simpla constatare a neconectării. Din 16 mai 2024, odată cu intrarea în vigoare a Legii nr. 126/2024, care a modificat Legea nr. 241/2005 pentru prevenirea și combaterea evaziunii fiscale, a apărut și o variantă penală a unei fapte înrudite.\n\nArt. 9 alin. (1) lit. i) din Legea 241/2005 (introdusă prin Legea 126/2024) califică drept infracțiune de evaziune fiscală \"utilizarea de aparate de marcat electronice fiscale care nu sunt conectate la sistemul informatic național de supraveghere și monitorizare a datelor fiscale, potrivit legii, sau alterarea aparatelor de marcat electronice fiscale pentru netransmiterea unor date fiscale sau transmiterea unor date fiscale nereale” — pedepsită cu închisoare de la 3 la 10 ani și interzicerea unor drepturi, sau cu amendă.\n\nCondiția care contează practic: art. 9 alin. (1) se aplică doar faptelor \"săvârșite în scopul sustragerii de la îndeplinirea obligațiilor fiscale\" — adică unde există intenția de a evita taxe, nu o simplă neglijență administrativă sau o problemă tehnică nerezolvată la timp. O casă de marcat neconectată din cauza unui SIM expirat sau a unui certificat neactualizat rămâne, în mod normal, în zona amenzii contravenționale de mai sus; varianta penală vizează aparatele alterate deliberat sau ținute offline cu bună știință pentru a ascunde vânzări.",
      },
      {
        heading: "Cum reduceți riscul, practic — și cum ajută franchisetech",
        body: "Câteva verificări simple reduc riscul unei amenzi pentru neconectare:\n\n- **Verificați statusul în SPV** — Spațiul Privat Virtual arată dacă ANAF a semnalat fișiere netransmise de la aparatul dumneavoastră\n- **Nu lăsați abonamentul de date al SIM-ului fiscal să expire** — e cea mai frecventă cauză practică de neconectare prelungită, nu o defecțiune a aparatului\n- **Păstrați raportul Z generat la conectare**, atașat la cartea tehnică — e dovada că procedura a fost dusă la capăt corect\n- **Aflați dinainte de la distribuitorul autorizat** care e canalul agreat de notificare în caz de problemă, ca să nu-l căutați în mijlocul unui control\n\nfranchisetech nu gestionează certificatul digital sau SIM-ul aparatului fiscal — acestea rămân, prin lege, în responsabilitatea distribuitorului autorizat și a operatorului economic. Ce arată aplicația, la fiecare vânzare, este starea reală a transmiterii către aparatul fiscal conectat — trimis, în așteptare sau eșuat — vizibil direct din POS, nu descoperit abia la o reconciliere de sfârșit de lună sau, mai rău, la un control.",
      },
    ],
  },
  {
    slug: "bon-fiscal-cerut-dupa-raportul-z-inchis-ce-faceti",
    title: "Un client cere bon fiscal după ce ați închis Raportul Z — ce faceți",
    description:
      "Raportul Z de ieri (sau de acum trei săptămâni) e deja generat, iar clientul vrea o dovadă a cumpărăturii. Ce poate și ce nu poate face, tehnic și legal, casa de marcat pentru o zi deja închisă — și ce alternative reale aveți.",
    publishedAt: "2026-09-21",
    locale: "ro",
    tags: ["fiscal", "bon-fiscal", "raport-z"],
    image: "/marketing/pos-hero.png",
    relatedFeature: "/features/pos",
    sections: [
      {
        heading: "De ce Raportul Z schimbă complet răspunsul",
        body: "Raportul Z nu e doar un rezumat al zilei — este momentul în care ziua fiscală respectivă devine definitivă. Așa cum arătăm și în ghidul de stornare corectă, odată generat raportul Z, ziua fiscală se închide și jurnalul electronic al acelei zile rămâne definitiv — nu mai există, prin procedura obișnuită de casă, nicio operațiune care să modifice, să anuleze sau să regenereze o vânzare din acea zi. Cadrul legal pentru ce se poate face cu un bon deja emis, cât timp ziua e încă deschisă, e dat de normele metodologice de aplicare a OUG nr. 28/1999 (aprobate prin HG nr. 479/2003, art. 36) — iar condiția de bază pentru orice corecție e ca operațiunea să aibă loc **înainte** de raportul Z.\n\nSituația dumneavoastră e mai strictă decât un bon pur și simplu pierdut de client. Acolo, bonul a existat și e doar hârtia care lipsește. Aici, dacă ziua e deja închisă, nici casa de marcat fizică nu mai poate „scoate” ceva nou pentru acea zi — indiferent cât de sinceră e cererea clientului.",
      },
      {
        heading: "Duplicat sau retipărire — ce spune practica, nu doar bunul-simț",
        body: "Legea nu obligă un comerciant să elibereze un „duplicat” de bon fiscal — nu există în OUG nr. 28/1999 sau în normele sale de aplicare o prevedere care să reglementeze explicit un duplicat identic al unui bon deja emis. Motivul e și tehnic, nu doar administrativ: fiecare bon se înregistrează o singură dată, progresiv, în memoria fiscală a aparatului, iar echipamentele actuale nici nu mai păstrează fizic o a doua copie pe hârtie, cum se întâmpla cu vechile role-indigo — tipăresc un singur exemplar.\n\nCe există, la unele case de marcat, e o funcție de **retipărire** — retrimiterea comenzii de printare către imprimantă. Dar ea are sens doar în condiții stricte:\n\n- Incidentul are loc **în aceeași sesiune**, de obicei chiar în timpul sau imediat după tranzacția blocată\n- Bonul **nu a apărut încă** în raportul Z al zilei respective — altfel, retipărirea îl înregistrează a doua oară, o eroare reală de raportare, nu o soluție\n- Ziua fiscală curentă **nu s-a închis încă** prin Raportul Z\n\nPentru o zi cu Raportul Z deja generat, posibil cu zile sau săptămâni în urmă, niciuna dintre aceste condiții nu mai e valabilă — ziua respectivă nu mai este „sesiunea curentă” a niciunei case, iar mecanismul de retipărire nu se aplică.",
      },
      {
        heading: "Ce puteți face concret: verificați tranzacția, chiar dacă nu o puteți retipări",
        body: "Bonul fizic nu poate fi recreat, dar vânzarea în sine a rămas înregistrată — în jurnalul electronic al casei de marcat și, dacă folosiți un POS conectat, în istoricul digital al aplicației. E același principiu descris în ghidul pentru [un bon fiscal pierdut sau deteriorat](/blog/bon-fiscal-pierdut-sau-deteriorat-ce-faci): jurnalul digital nu înlocuiește un document fiscal nou, dar vă spune rapid dacă, când și pentru cât s-a făcut vânzarea, înainte să decideți cum ajutați clientul.\n\nÎn franchisetech, fiecare vânzare finalizată rămâne căutabilă în istoricul POS după dată, oră și produs, indiferent cât de veche e — nu depinde de memoria personalului sau de hârtia pe care a pierdut-o clientul. Confirmarea internă contează mai ales când cererea vine cu detalii vagi („cred că am fost acum vreo două săptămâni”) — verificați înainte de a promite ceva ce, oricum, casa de marcat fizic nu mai poate emite pentru ziua respectivă.",
      },
      {
        heading: "Dacă a plătit cu cardul, extrasul de cont e deja o dovadă legală",
        body: "Pentru plățile cu cardul, aveți un răspuns concret care nu depinde deloc de starea Raportului Z. Legea nr. 317/2024, care a modificat OUG nr. 28/1999, prevede că extrasul de cont bancar funcționează ca dovadă a plății, alături de sau în locul bonului fiscal — indiferent dacă bonul a fost tipărit, pierdut sau nu mai poate fi reemis pentru că ziua e deja închisă fiscal. Clientul își poate verifica singur extrasul de cont pentru data și suma respectivă; dumneavoastră puteți confirma, din istoricul intern, că suma corespunde unei vânzări reale din local.\n\nPentru numerar, situația e mai grea, pentru că nu există un al treilea martor electronic independent de casa dumneavoastră. Acolo, verificarea internă din secțiunea anterioară rămâne singurul instrument practic — și, la fel ca la un bon pierdut fără nicio altă urmă, decizia de a accepta cererea clientului rămâne, în lipsa unei dovezi, la latitudinea dumneavoastră.",
      },
      {
        heading: "Dacă ce vrea de fapt e o factură, nu un bon fiscal",
        body: "Multe cereri de genul „îmi mai dați un bon” ascund, de fapt, o nevoie diferită: clientul are nevoie de un document pe care să-l deconteze la propria firmă sau la contabilul lui, nu literalmente de o hârtie identică cu cea pierdută. Dacă e cazul, răspunsul corect nu e să încercați o retipărire care oricum nu funcționează pentru o zi închisă, ci să discutați despre o factură — [factura și bonul fiscal](/blog/factura-vs-bon-fiscal-diferenta) sunt documente diferite, iar o factură se poate emite ulterior, separat, dacă clientul furnizează CUI-ul firmei.\n\nAtenție: procedura de a emite o factură pe baza unui bon fiscal simplu, fără CUI comunicat la momentul plății, este mai greoaie și depinde de termenele aplicabile — verificați cu contabilul dumneavoastră care e fereastra reală în cazul dumneavoastră, mai ales dacă ziua vânzării e deja la câteva săptămâni distanță.",
      },
      {
        heading: "Cum funcționează în franchisetech",
        body: "franchisetech nu poate — și nu are cum, tehnic — să recreeze un bon fiscal pentru o zi cu Raportul Z deja generat; niciun POS conectat la o casă de marcat certificată nu poate face asta, indiferent de furnizor. Ce oferă e istoricul complet al vânzărilor, căutabil instant pe dată, oră sau produs, ca să aveți răspunsul corect în câteva secunde, nu să promiteți ceva ce nu se poate livra.\n\nÎn plus, generarea Raportului Z necesită drepturi de administrator sau manager, nu e la îndemâna oricărui casier — exact pentru a reduce riscul unei închideri premature care ar transforma o cerere obișnuită de bon într-o discuție despre o zi deja închisă fiscal, cu ore bune înainte ca locația să se închidă efectiv.",
      },
    ],
  },
];
