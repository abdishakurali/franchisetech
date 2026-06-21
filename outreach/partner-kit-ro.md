# Kit parteneri franchisetech — România (v2)

**Economics (produs):** ~20% recurent din abonament + ~100–150€ din setup asistat (199€) per client activat.

**Campanie UTM:** `ro-partner-q2-r2` · **Sender outreach:** `info@franchisetech.ro`

---

## 5 arhetipuri — linkuri named UTM

Înlocuiți `{nume_firma}` cu slug firmă partener (ex. `contabilitate-popescu`).

| Arhetip | utm_source | Link program parteneri |
|---------|------------|-------------------------|
| Contabil HORECA | `partner_contabil_horeca` | `https://franchisetech.ro/partners?lang=ro&utm_source=partner_contabil_horeca&utm_campaign=ro-partner-q2-r2&utm_content={nume_firma}` |
| Integrator FiscalNet | `partner_fiscalnet_integrator` | `...&utm_source=partner_fiscalnet_integrator&...` |
| Consultant deschidere | `partner_consultant_deschidere` | `...&utm_source=partner_consultant_deschidere&...` |
| Reseller POS local | `partner_reseller_pos` | `...&utm_source=partner_reseller_pos&...` |
| Operator champion (2+ locații) | `partner_operator_champion` | `...&utm_source=partner_operator_champion&...` |

**Link trial client** (co-pilot):

```
https://franchisetech.ro/signup?plan=pro&lang=ro&utm_source=partner_contabil_horeca&utm_campaign=ro-partner-q2-r2&utm_medium=partner&utm_content={nume_firma}-client-{client_slug}
```

Schimbați `utm_source` după arhetip. `client_slug` = nume restaurant (ex. `cafe-unirii`).

---

## Leave-behind (trimite după call 20 min)

1. **Comparație SmartBill:** https://franchisetech.ro/compare/smartbill?lang=ro
2. **Ghid FiscalNet:** https://franchisetech.ro/help/romania-fiscalnet?lang=ro
3. **Obiecții frecvente:** https://franchisetech.ro/resources/objections-pos-romania?lang=ro
4. **Program parteneri:** link-ul named UTM de mai sus

Mesaj scurt:

> franchisetech = workspace zilnic (POS, casă, stoc, rețete, raport Z). Nu înlocuiește neapărat SmartBill/Saga pentru facturare — trial 15 zile în paralel. Comision ~20% recurent + partajare setup 199€.

---

## Playbook activare (per partener)

1. **Call 20 min** — durerea clientului: NIR, casă vs sertar, marje Excel.
2. **Leave-behind** — linkuri de mai sus + UTM named.
3. **Co-pilot un client** — voi face setup produs; partenerul aduce încrederea.
4. **Prima închidere reușită** — cere intro la 2 clienți similari.

---

## Check-in săptămânal (miercuri, plan)

- 5 parteneri în pipeline: status (call / leave-behind / co-pilot / activ)
- Forward un lead outbound către partenerul potrivit
- Note în spreadsheet: `acquisition_source` = `partner_*`

---

## Email parteneri (Zoho)

CSV: `ro-partners-20.csv` · Șabloane: `email-templates-ro.md` · Payloads:

```bash
python3 generate-payloads.py 1 --write partner-step1.json
```

Campanie: `ro-partner-q2-r2`

---

## Ce NU promitem

- Nu garantăm conformitate fiscală universală — contabilul verifică.
- Nu inventăm logo-uri clienți sau cifre uptime.
- Nu migrare big-bang — trial paralel 15 zile.
