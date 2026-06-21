# franchisetech — Șabloane cold email RO (v2)

**Sender:** `info@franchisetech.ro` (Franchise Tech)
**Positioning:** workspace pentru afaceri cu mâncare — nu doar plăți.

Merge fields: `{{company}}`, `{{contact_name}}`, `{{hook_line}}`, `{{personalization_line}}`, `{{pain_signal}}`, `{{plan}}`, `{{slug}}`

Links (campanie relansare v2):
- Partners: `https://franchisetech.ro/partners?lang=ro&utm_source=zoho&utm_campaign=ro-partner-q2-r2&utm_content={{slug}}`
- Customers: `https://franchisetech.ro/signup?plan={{plan}}&lang=ro&utm_source=zoho&utm_campaign=ro-customer-q2-r2&utm_content={{slug}}`

Opt-out (required): `Răspundeți „stop” dacă nu doriți alte mesaje.`

---

## Partner sequence (4 emails)

### P1 — Day 0 | Subject: `workspace HORECA`

```
Bună ziua{{contact_greeting}},

{{hook_line}}

franchisetech e workspace în browser pentru cafenele și restaurante — nu doar plăți: casă, stoc, NIR (14-3-1A) și rapoarte pentru contabil. Căutăm parteneri HORECA în România: ~20% recurent din abonament și ~100–150€ din setup-ul asistat (199€) când onboardați un client.

Merită 10 minute să vedeți dacă se potrivește clienților voștri?

{{partner_link}}

— Franchise Tech
info@franchisetech.ro

Răspundeți „stop” dacă nu doriți alte mesaje.
```

### P2 — Day 3 | Subject: `stoc + NIR`

```
Bună ziua{{contact_greeting}},

Revin scurt: clienții HORECA pierd timp când casa, stocul și NIR-ul stau în sisteme separate. franchisetech le ține într-un singur workspace — util pentru contabili și reselleri care deja vând case fiscale.

Aveți 1–2 clienți care ar beneficia acum?

{{partner_link}}

— Franchise Tech
info@franchisetech.ro
```

### P3 — Day 7 | Subject: `20% recurent`

```
Bună ziua{{contact_greeting}},

Model simplu: recomandați franchisetech → clientul primește trial asistat 15 zile → la activare primiți comision recurent (~20%) + partajare din setup (199€).

{{partner_link}}

— Franchise Tech
info@franchisetech.ro
```

### P4 — Day 14 | Subject: `ultim mesaj`

```
Bună ziua{{contact_greeting}},

Ultimul mesaj — dacă parteneriatul workspace POS+stoc+NIR nu e pe agenda voastră acum, e în regulă.

Dacă revine tema: {{partner_link}}

— Franchise Tech
info@franchisetech.ro
```

---

## Customer sequence (3 emails)

Segment value lines (after personalization):
- **cafenea:** Casă la counter, TVA pe produs și raport Z — trial 15 zile, fără taxă per angajat.
- **restaurant mic:** POS + bucătărie, stoc și rețete cu marjă — personal nelimitat.
- **takeaway/patiserie:** Stoc pe ingrediente și rețete — fără Excel după program.
- **multi_location:** Vânzări pe locație, rapoarte centralizate și NIR — ghid FiscalNet când extindeți.

### C1 — Day 0 | Subject: `casa după program`

```
Bună ziua{{contact_greeting}},

{{personalization_line}}

{{segment_value_line}}

franchisetech leagă vânzarea, închiderea casei, stocul și rapoartele într-un singur loc — ca să știți la finalul zilei ce s-a întâmplat, nu luna viitoare de la contabil.

V-ar fi util să vedeți cum arată pentru {{company}}?

{{customer_link}}

— Franchise Tech
info@franchisetech.ro

Răspundeți „stop” dacă nu doriți alte mesaje.
```

### C2 — Day 4 | Subject: `trial 15 zile`

**New angle:** link compare page (not “just checking in”). Segment → compare slug:

| Segment | Compare page |
|---------|----------------|
| cafenea | `/compare/smartbill` |
| restaurant mic | `/compare/smartbill` |
| takeaway/patiserie | `/compare/saga` |
| multi_location | `/compare/expressoft` |

```
Bună ziua{{contact_greeting}},

Revin la {{company}} — nu doar ca reminder: am publicat o comparație onestă franchisetech vs {{compare_name}} pentru operatori din România (trial paralel 15 zile, fără migrare big-bang).

{{compare_link}}

Onboarding-ul include produse demo, deschidere casă și ghidare la prima vânzare — nu un cont gol. Plan recomandat: {{plan}} (de la 39€/lună, fără taxă per angajat).

{{customer_link}}

— Franchise Tech
info@franchisetech.ro
```

### C3 — Day 10 | Subject: `ultim mesaj`

```
Bună ziua{{contact_greeting}},

Nu vă mai scriu după acest mesaj. Dacă vreți să testați workspace-ul POS + stoc fără angajament: trial 15 zile asistat.

{{customer_link}}

— Franchise Tech
info@franchisetech.ro
```

---

## Objection one-pager (internal)

| Obiecție | Răspuns |
|----------|---------|
| Am SmartBill/Saga | Trial 15 zile paralel — POS + stoc + rețete în același flux zilnic |
| FiscalNet e complicat | Ghid pas cu pas; contabilul verifică; Multi-location |
| E scump | €79/lună Pro vs timp reconciliere + inventar separat; personal nelimitat |
| Nu am timp | Setup asistat €199, prima vânzare ghidată |

---

## v1 mistake (archived)

Campania inițială a plecat de pe `info@garaad.org` (cont greșit). Log arhivat: `send-log-v1-garaad.json`. Relansare v2 cu `info@franchisetech.ro` și UTM `*-q2-r2`.
