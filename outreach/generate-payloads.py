#!/usr/bin/env python3
"""Generate Zoho send payloads from outreach CSVs."""
import argparse
import csv
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ACCOUNT_ID = "5857436000000002002"
FROM = "info@franchisetech.ro"
SIGNATURE = "Franchise Tech\ninfo@franchisetech.ro"
OPT_OUT = 'Răspundeți „stop” dacă nu doriți alte mesaje.'
CUSTOMER_CAMPAIGN = "ro-customer-q2-r2"
PARTNER_CAMPAIGN = "ro-partner-q2-r2"
WEEK1_BATCH = 20

SEGMENT_VALUE = {
    "cafenea": (
        "Casă la counter, TVA pe produs și raport Z — fără taxă per angajat, "
        "trial asistat 15 zile fără card pentru deschiderea casei."
    ),
    "restaurant mic": (
        "POS + display bucătărie, stoc și rețete cu marjă — închiderea zilei "
        "și raportul Z în același workspace, personal nelimitat."
    ),
    "takeaway/patiserie": (
        "Vitrină, stoc pe ingrediente și rețete — fără Excel după program "
        "ca să știți marja înainte să schimbați meniul."
    ),
    "multi_location": (
        "Vânzări și casă pe fiecare locație, rapoarte centralizate și NIR — "
        "cu ghid FiscalNet când extindeți rețeaua."
    ),
}

# Compare page follow-up angle by segment (C2 — new angle, not "just checking in")
COMPARE_BY_SEGMENT = {
    "cafenea": "smartbill",
    "restaurant mic": "smartbill",
    "takeaway/patiserie": "saga",
    "multi_location": "expressoft",
}


def slugify(s: str) -> str:
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")[:48]


def greeting(name: str) -> str:
    return f" {name}" if name and name != "Echipă" else ""


def signup_link(row: dict) -> str:
    slug = slugify(row["company"])
    plan = row.get("recommended_plan") or "pro"
    return (
        f"https://franchisetech.ro/signup?plan={plan}&lang=ro"
        f"&utm_source=zoho&utm_campaign={CUSTOMER_CAMPAIGN}&utm_content={slug}"
    )


def compare_link(row: dict, compare_slug: str | None = None) -> str:
    slug = slugify(row["company"])
    segment = row.get("segment") or "restaurant mic"
    comp = compare_slug or COMPARE_BY_SEGMENT.get(segment, "smartbill")
    return (
        f"https://franchisetech.ro/compare/{comp}?lang=ro"
        f"&utm_source=zoho&utm_campaign={CUSTOMER_CAMPAIGN}&utm_content={slug}-compare-{comp}"
    )


def partner_email(row: dict, step: int = 1) -> dict:
    slug = slugify(row["company"])
    link = (
        f"https://franchisetech.ro/partners?lang=ro"
        f"&utm_source=zoho&utm_campaign={PARTNER_CAMPAIGN}&utm_content={slug}"
    )
    compare = "https://franchisetech.ro/compare/smartbill?lang=ro"
    fiscal = "https://franchisetech.ro/help/romania-fiscalnet?lang=ro"
    g = greeting(row.get("contact_name", ""))
    subjects = ["workspace HORECA", "stoc + NIR", "20% recurent", "ultim mesaj"]
    bodies = [
        f"""Bună ziua{g},

{row['hook_line']}

franchisetech e workspace în browser pentru cafenele și restaurante — nu doar plăți: casă, stoc, NIR (14-3-1A) și rapoarte pentru contabil. Căutăm parteneri HORECA în România: ~20% recurent din abonament și ~100–150€ din setup-ul asistat (199€) când onboardați un client.

Merită 10 minute să vedeți dacă se potrivește clienților voștri?

{link}

— {SIGNATURE}

{OPT_OUT}""",
        f"""Bună ziua{g},

Revin scurt: clienții HORECA pierd timp când casa, stocul și NIR-ul stau în sisteme separate. franchisetech le ține într-un singur workspace — util pentru contabili și reselleri care deja vând case fiscale.

Comparație onestă vs SmartBill (facturare vs operațiuni zilnice): {compare}

Aveți 1–2 clienți care ar beneficia acum?

{link}

— {SIGNATURE}""",
        f"""Bună ziua{g},

Model simplu: recomandați franchisetech → clientul primește trial asistat 15 zile → la activare primiți comision recurent (~20%) + partajare din setup (199€).

Ghid FiscalNet pentru clienții care întreabă: {fiscal}

{link}

— {SIGNATURE}""",
        f"""Bună ziua{g},

Ultimul mesaj — dacă parteneriatul workspace POS+stoc+NIR nu e pe agenda voastră acum, e în regulă.

Dacă revine tema: {link}

— {SIGNATURE}""",
    ]
    return {
        "type": "partner",
        "company": row["company"],
        "step": step,
        "path_variables": {"accountId": ACCOUNT_ID},
        "body": {
            "fromAddress": FROM,
            "toAddress": row["email"],
            "subject": subjects[step - 1],
            "content": bodies[step - 1],
            "mailFormat": "plaintext",
        },
    }


def customer_email(row: dict, step: int = 1) -> dict:
    segment = row.get("segment") or "restaurant mic"
    value_line = SEGMENT_VALUE.get(segment, SEGMENT_VALUE["restaurant mic"])
    link = signup_link(row)
    comp_link = compare_link(row)
    comp_slug = COMPARE_BY_SEGMENT.get(segment, "smartbill")
    g = greeting(row.get("contact_name", ""))
    plan = row.get("recommended_plan") or "pro"
    subjects = ["casa după program", "trial 15 zile", "ultim mesaj"]
    bodies = [
        f"""Bună ziua{g},

{row['personalization_line']}

{value_line}

franchisetech leagă vânzarea, închiderea casei, stocul și rapoartele într-un singur loc — ca să știți la finalul zilei ce s-a întâmplat, nu luna viitoare de la contabil.

V-ar fi util să vedeți cum arată pentru {row['company']}?

{link}

— {SIGNATURE}

{OPT_OUT}""",
        f"""Bună ziua{g},

Revin la {row['company']} — nu doar ca reminder: am publicat o comparație onestă franchisetech vs {comp_slug.title()} pentru operatori din România (trial paralel 15 zile, fără migrare big-bang).

{comp_link}

Onboarding-ul include produse demo, deschidere casă și ghidare la prima vânzare — nu un cont gol. Plan recomandat: {plan} (de la 39€/lună, fără taxă per angajat).

{link}

— {SIGNATURE}""",
        f"""Bună ziua{g},

Nu vă mai scriu după acest mesaj. Dacă vreți să testați workspace-ul POS + stoc fără angajament: trial 15 zile asistat.

{link}

— {SIGNATURE}""",
    ]
    return {
        "type": "customer",
        "company": row["company"],
        "step": step,
        "segment": segment,
        "compare_url": comp_link,
        "path_variables": {"accountId": ACCOUNT_ID},
        "body": {
            "fromAddress": FROM,
            "toAddress": row["email"],
            "subject": subjects[step - 1],
            "content": bodies[step - 1],
            "mailFormat": "plaintext",
        },
    }


def load_csv(path: Path) -> list[dict]:
    with path.open(newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def pending_customers(customers: list[dict], limit: int | None = None) -> list[dict]:
    rows = [r for r in customers if (r.get("status") or "").strip() == "pending"]
    return rows[:limit] if limit else rows


def main():
    parser = argparse.ArgumentParser(description="Generate Zoho outreach payloads")
    parser.add_argument("step", nargs="?", type=int, default=1, help="Sequence step (1-4 partners, 1-3 customers)")
    parser.add_argument("--week1", action="store_true", help=f"First {WEEK1_BATCH} pending customers only (step 1)")
    parser.add_argument("--customers-only", action="store_true", help="Skip partner payloads")
    parser.add_argument("--write", metavar="FILE", help="Write JSON to file instead of stdout")
    args = parser.parse_args()

    step = args.step
    partners = load_csv(ROOT / "ro-partners-20.csv")
    customers = load_csv(ROOT / "ro-customers-100.csv")

    payloads: list[dict] = []
    if not args.customers_only:
        payloads.extend(partner_email(r, step) for r in partners)

    if step <= 3:
        if args.week1:
            batch = pending_customers(customers, WEEK1_BATCH)
            payloads.extend(customer_email(r, step=1) for r in batch)
        else:
            payloads.extend(customer_email(r, step) for r in customers)

    output = json.dumps(payloads, ensure_ascii=False, indent=2)
    if args.write:
        out_path = ROOT / args.write if not Path(args.write).is_absolute() else Path(args.write)
        out_path.write_text(output, encoding="utf-8")
        print(f"Wrote {len(payloads)} payloads to {out_path}", file=sys.stderr)
    else:
        print(output)


if __name__ == "__main__":
    main()
