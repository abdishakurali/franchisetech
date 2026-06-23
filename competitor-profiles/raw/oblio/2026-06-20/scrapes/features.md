# Oblio Features Scrape

**Sources:**
- https://www.oblio.eu (homepage)
- https://www.oblio.eu/facturare
- https://www.oblio.eu/stocuri

**Scraped:** 2026-06-20
**Access:** Public, no login

---

## Product positioning

**Tagline:** Programul de facturare si gestiune stocuri iubit de antreprenori
**Core claim:** Integrat GRATUIT cu e-Factura + e-Transport
**Target users:** Firme, PFA-uri, antreprenori (150.000+ claimed)
**Delivery:** Cloud SaaS — no local install

---

## Facturare module (`/facturare`)

### Speed & onboarding
- Creezi cont in 30 de secunde
- Emiti prima factura in 60 de secunde
- Sugestii pentru completare automata pe masura ce tastezi

### Document types
- Facturi, avize, proforme, abonamente (facturi recurente), chitante, plati si incasari

### Invoicing features
- Personalizare factura in zeci de moduri
- Calcule complexe in monede diferite (30+ currencies, auto exchange rate)
- Facturare pe baza de abonamente
- Trimitere facturi prin email din aplicatie
- e-Factura format support
- Plata cu Cardul (optional)
- Alerte clienti neplatitori
- Discount-uri, incasari partiale sau totale — calcule instant

### Reports (facturare)
- Raport Facturi, Proforme, Avize, Abonamente, Incasari
- Registru casa, Jurnal banca
- Fisa client, Fisa furnizor
- Rapoarte avansate: Vanzari pe Produs, Profit pe Produs, Vanzari pe Agent
- Gasire clienti potentiali prin analiza comportamentului de consum

### Data import
From legacy invoicing tools (SmartBill, FGO, EasyBill, etc.):
- Nomenclator Clienti, Furnizori, Produse
- Stoc Initial (daca Oblio Stocuri activat)
- Facturi

### Bank & payment imports
- Extrase bancare — 18 banci din Romania
- Borderouri incasare — 19 curieri
- Incasari: Netopia Payments, EuPlatesc, Emag, Cel si altii

### Accounting export
- Saga, WinMentor, Ciel — export automat facturi intrare/iesire, incasari, plati

### Compliance & updates
- Actualizari automate gratuite pentru schimbari legislative
- Backup pe servere multiple

---

## Stocuri module (`/stocuri`)

### Setup
- Activezi modulul Stocuri, creezi gestiune, importi stoc initial
- Categorii conform planului de conturi
- Export perfect catre Saga, WinMentor, Ciel

### Gestiuni
- Gestiuni cantitativ valorice (recomandat), global valorice, terti
- Adaugi gestiuni si puncte de lucru — Gratuit, nelimitat
- Produse descarcate FIFO
- Termen de valabilitate la produse — **In curand**

### NIR (receptie marfa)
- NIR inteligent — emite NIR doar pe produsele care trebuie
- Clasificare produse conform planului de conturi
- Repartizare cost transport si taxe in costul de achizitie
- **Oblio Wallet:** transfer automat date de pe factura furnizor daca e integrat e-Factura sau Oblio

### Casa de marcat (POS light)
- Integrare Datecs, Tremol, Daisy in ~30 secunde
- Interfata prietenoasa pentru POS
- Bon fiscal in cateva secunde
- Incasare: Numerar, Card, Tichete de masa
- Raport vanzari pe fiecare casa de marcat
- Scanner coduri de bare
- Imprimanta mobila pentru facturi pe teren
- **Gratuit** cu abonamentul

### Productie
- Configurezi produs pe baza retetar
- Bon de Productie
- Statusuri productie: Nefinalizat, In curs de executie, Finalizat
- Transfer produse intre gestiuni (ex. Materie Prima → Marfa)
- Bon de consum — emis automat la bon de productie
- **Gratuit**

### Inventar
- Inventar pe lista sau produs
- Inventar mobil — telefon, update real-time pe server

### Rapoarte stocuri
- Registru de casa
- Raport Stocuri
- Jurnal de banca (Bilet la Ordin, CEC, extrase bancare)
- Raport fara descarcare (documente emise fara stoc)
- Raport Tichete (borderou rambursare, tichete pe stat de plata)
- Rapoarte avansate: vanzari/profit pe produs, vanzari pe agent, clienti potentiali

---

## e-Factura / e-Transport / SAF-T (homepage)

- Interconectare SPV in 5 secunde
- Trimitere e-Facturi: manual, automat, una cate una sau bulk
- Cod UIT + nota e-Transport
- Export SAF-T fara erori
- **Gratuit** — "GRATUIT PE VIATA" badge on homepage

---

## Integrations

| Category | Partners / methods |
|----------|-------------------|
| Accounting | Saga, WinMentor, Ciel |
| e-Commerce | WooCommerce, PrestaShop, OpenCart, Shopify, Emag (ro/bg/hu) |
| Fiscal hardware | Datecs, Tremol, Daisy (+ multe altele) |
| API | REST API — Gratuit |
| Network | Oblio Wallet — facturi furnizor→client automat din 2017 |
| Reviews | Bizoo.ro — colectare si promovare pareri clienti |

---

## Security (marketing claims)

- MFA: intrebare securitate, SMS, email, parola
- Auditat de specialisti securitate (companii mari Europa)
- Certificari organisme internationale
- Nivel securitate bancar, encriptare avansata, cloud backup

---

## Stats (marketing)

| Metric | Value |
|--------|-------|
| Users | 150.000+ firme si PFA-uri |
| Invoices/year | 40.000.000+ |
| Uptime | 99.99% |
| Satisfaction | 97% clienti fericiti |

---

## Feature gaps / "coming soon" noted on site

- Termen de valabilitate la produse — **In curand** (`/stocuri`)
