#!/usr/bin/env python3
"""Build today's RO outreach send batch (retries first, then follow-ups).

Respects plan limits: max 10 customer + 4 partner emails per run.

Usage:
  python3 outreach/daily-send.py              # write outreach/daily-batch.json
  python3 outreach/daily-send.py --dry-run    # print plan only

After sending via Zoho Mail, merge results into send-log.json and run:
  python3 outreach/update-csv-status.py
"""
from __future__ import annotations

import argparse
import csv
import json
from datetime import date, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent
STATE = ROOT / "sequence-state.json"
PARTNER_LIMIT = 4
CUSTOMER_LIMIT = 10

# Days after step-1 anchor before next follow-up (plan cadence)
FOLLOWUP_DAYS = {2: 3, 3: 7, 4: 14}


def load_json(path: Path, default):
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return default


def save_state(state: dict) -> None:
    STATE.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")


def parse_status(status: str) -> tuple[int, str | None]:
    """Return (last_completed_step, kind) where kind is retry|sent|pending."""
    if status == "failed_rate_limit":
        return (0, "retry")
    if status.startswith("sent_step"):
        try:
            return (int(status.replace("sent_step", "")), "sent")
        except ValueError:
            pass
    return (0, "pending")


def days_since(iso: str) -> int:
    if not iso:
        return 999
    try:
        d = datetime.fromisoformat(iso).date()
    except ValueError:
        return 999
    return (date.today() - d).days


def load_payloads(step: int) -> list[dict]:
    path = ROOT / f"send-payloads-step{step}.json"
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


def index_payloads(payloads: list[dict]) -> dict[str, dict]:
    return {p["body"]["toAddress"].strip().lower(): p for p in payloads}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    state = load_json(STATE, {"anchors": {}})
    anchors: dict[str, str] = state.setdefault("anchors", {})

    partners = list(csv.DictReader((ROOT / "ro-partners-20.csv").open(encoding="utf-8")))
    customers = list(csv.DictReader((ROOT / "ro-customers-100.csv").open(encoding="utf-8")))

    batch: list[dict] = []
    partner_n = customer_n = 0
    plan_lines: list[str] = []

    step1 = index_payloads(load_payloads(1))

    # 0) Fresh step-1 sends (status pending)
    for row in partners:
        if partner_n >= PARTNER_LIMIT:
            break
        if row.get("status") != "pending":
            continue
        email = row["email"].strip().lower()
        p = step1.get(email)
        if not p:
            continue
        batch.append({**p, "reason": "step1_partner"})
        partner_n += 1
        plan_lines.append(f"STEP1 partner {row['company']} <{email}>")

    for row in customers:
        if customer_n >= CUSTOMER_LIMIT:
            break
        if row.get("status") != "pending":
            continue
        email = row["email"].strip().lower()
        p = step1.get(email)
        if not p:
            continue
        batch.append({**p, "reason": "step1_customer"})
        customer_n += 1
        plan_lines.append(f"STEP1 customer {row['company']} <{email}>")

    # 1) Retries (step 1 only, failed_rate_limit)
    for row in customers:
        if customer_n >= CUSTOMER_LIMIT:
            break
        email = row["email"].strip().lower()
        if row.get("status") != "failed_rate_limit":
            continue
        p = step1.get(email)
        if not p:
            continue
        batch.append({**p, "reason": "retry_step1"})
        customer_n += 1
        plan_lines.append(f"RETRY customer {row['company']} <{email}>")

    # 2) Follow-ups for partners (steps 2–4)
    for step in (2, 3, 4):
        if partner_n >= PARTNER_LIMIT:
            break
        payloads = index_payloads(load_payloads(step))
        for row in partners:
            if partner_n >= PARTNER_LIMIT:
                break
            email = row["email"].strip().lower()
            last, kind = parse_status(row.get("status", ""))
            if kind != "sent" or last != step - 1:
                continue
            anchor = anchors.get(email)
            if anchor is None:
                anchor = date.today().isoformat()
                anchors[email] = anchor
            if days_since(anchor) < FOLLOWUP_DAYS[step]:
                continue
            p = payloads.get(email)
            if not p:
                continue
            batch.append({**p, "reason": f"followup_step{step}"})
            partner_n += 1
            plan_lines.append(f"PARTNER step{step} {row['company']} <{email}>")

    # 3) Follow-ups for customers (steps 2–3)
    for step in (2, 3):
        if customer_n >= CUSTOMER_LIMIT:
            break
        payloads = index_payloads(load_payloads(step))
        for row in customers:
            if customer_n >= CUSTOMER_LIMIT:
                break
            email = row["email"].strip().lower()
            if row.get("status") == "failed_rate_limit":
                continue
            last, kind = parse_status(row.get("status", ""))
            if kind != "sent" or last != step - 1:
                continue
            anchor = anchors.get(email)
            if anchor is None:
                anchor = date.today().isoformat()
                anchors[email] = anchor
            if days_since(anchor) < FOLLOWUP_DAYS[step]:
                continue
            p = payloads.get(email)
            if not p:
                continue
            batch.append({**p, "reason": f"followup_step{step}"})
            customer_n += 1
            plan_lines.append(f"CUSTOMER step{step} {row['company']} <{email}>")

    summary = {
        "date": date.today().isoformat(),
        "partner_count": partner_n,
        "customer_count": customer_n,
        "total": len(batch),
        "items": plan_lines,
    }

    if args.dry_run:
        print(json.dumps(summary, ensure_ascii=False, indent=2))
        return

    save_state(state)
    out = ROOT / "daily-batch.json"
    out.write_text(json.dumps({"summary": summary, "payloads": batch}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(batch)} payloads ({partner_n} partner, {customer_n} customer) to {out}")


if __name__ == "__main__":
    main()
