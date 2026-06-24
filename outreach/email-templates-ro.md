# franchisetech — Șabloane cold email RO (v2)

**Sender:** `info@franchisetech.ro` (Franchise Tech)
**Positioning:** workspace pentru afaceri cu mâncare — nu doar plăți.

Merge fields: `{{company}}`, `{{contact_name}}`, `{{hook_line}}`, `{{personalization_line}}`, `{{pain_signal}}`, `{{plan}}`, `{{slug}}`

Links (campanie relansare v2):
- Partners (waitlist — program în pilot): `https://franchisetech.ro/partners?lang=ro&utm_source=zoho&utm_campaign=ro-partner-2026-h2&utm_content={{slug}}`
- Customers: `https://franchisetech.ro/signup?plan={{plan}}&lang=ro&utm_source=zoho&utm_campaign=ro-customer-q2-r2&utm_content={{slug}}`

Opt-out (required): `Răspundeți „stop” dacă nu doriți alte mesaje.`

---

## Partner sequence (4 emails)

### P1 — Day 0 | Subject: `workspace HORECA`

```
Bună ziua{{contact_greeting}},

{{hook_line}}

Clienții tăi plătesc extra doar ca să vadă raportul Z? Ebriza Pro e 49€/locație — Insights +19€/lună. franchisetech Starter: 49€ cu raport Z inclus.

Comparație: https://franchisetech.ro/compare/ebriza?lang=ro

Parteneriat: ~20% recurent din abonament și ~100–150€ din setup-ul asistat (199€). Program în pilot — listă de așteptare:

{{partner_link}}

— Franchise Tech
info@franchisetech.ro

Răspundeți „stop” dacă nu doriți alte mesaje.
```

### P2 — Day 3 | Subject: `stoc + NIR`

```
Bună ziua{{contact_greeting}},

Revin scurt: clienții HORECA plătesc extra doar ca să vadă raportul Z? Ebriza Pro e 49€/locație — Insights (rapoarte) +19€/lună. franchisetech Starter: 49€ cu raport Z inclus.

Comparație onestă: https://franchisetech.ro/compare/ebriza?lang=ro

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

### C1 — Day 0 | Subject: `sertarul după program`

**Wedge:** till truth — expected cash vs counted at close tonight.

```
Bună ziua{{contact_greeting}},

{{personalization_line}}

La închidere: numerar așteptat vs numărat în sertar — seara, nu luna viitoare de la contabil. franchisetech leagă vânzarea, casa și raportul Z într-un singur loc.

V-ar fi util să vedeți cum arată pentru {{company}}?

{{customer_link}}

— Franchise Tech
info@franchisetech.ro

Răspundeți „stop” dacă nu doriți alte mesaje.
```

### C2 — Day 4 | Subject: `trial 15 zile`

**Wedge:** cost shock — Ebriza €49 + €19 Insights vs franchisetech €49 with Z included.

| Segment | Compare page |
|---------|----------------|
| cafenea | `/compare/ebriza` |
| restaurant mic | `/compare/ebriza` |
| takeaway/patiserie | `/compare/saga` |
| multi_location | `/compare/expressoft` |

```
Bună ziua{{contact_greeting}},

Revin la {{company}} — nu doar ca reminder: Ebriza Pro e 49€/locație, dar Insights (rapoarte) costă +19€/lună. franchisetech Starter: 49€ cu raport Z inclus — trial paralel 15 zile, aceeași echipă.

{{compare_link}}

Onboarding: produse demo, deschidere casă, ghidare la prima vânzare. Plan recomandat: {{plan}} (de la 49€/lună, fără taxă per angajat).

{{customer_link}}

— Franchise Tech
info@franchisetech.ro
```

### C3 — Day 10 | Subject: `ultim mesaj`

**Wedge:** parallel trial breakup.

```
Bună ziua{{contact_greeting}},

Nu vă mai scriu după acest mesaj. Trial paralel 15 zile — aceeași echipă, aceeași închidere de zi — fără angajament.

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
| E scump | €49/lună Starter vs Ebriza Pro €49 + Insights €19; personal nelimitat |
| Nu am timp | Setup asistat €199, prima vânzare ghidată |

---

## v1 mistake (archived)

Campania inițială a plecat de pe `info@garaad.org` (cont greșit). Log arhivat: `send-log-v1-garaad.json`. Relansare v2 cu `info@franchisetech.ro` și UTM `*-q2-r2`.
