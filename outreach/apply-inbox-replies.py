#!/usr/bin/env python3
"""Apply Zoho inbox reply classifications to CSVs and send-log.

Usage:
  python3 outreach/apply-inbox-replies.py              # merge inbox-replies.json
  python3 outreach/apply-inbox-replies.py --dry-run

Reply rows (inbox-replies.json) should include:
  from, company, type (customer|partner), classification (opt_out|bounce|interested|auto_reply|other)
"""
from __future__ import annotations

import argparse
import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPLIES = ROOT / "inbox-replies.json"
LOG = ROOT / "send-log.json"

# Same org, different mailbox — map reply-from → CSV email
EMAIL_ALIASES = {
    "vlad.simanovszky@vlarox.ro": "office@vlarox.ro",
}

SKIP_FROM = {
    "mailer-daemon@mail.zoho.eu",
    "mailer-daemon@s2.best-hosting.ro",
    "mailer-daemon@zeus.hostideea.ro",
    "noreply@zohoaccounts.eu",
    "info@franchisetech.ro",
}


def norm(email: str) -> str:
    return email.strip().lower()


def load_csv(path: Path) -> tuple[list[str], list[dict]]:
    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fields = list(reader.fieldnames or [])
        return fields, list(reader)


def save_csv(path: Path, fields: list[str], rows: list[dict]) -> None:
    if not fields:
        raise ValueError(f"refusing to write {path.name}: missing CSV headers")
    if not rows:
        raise ValueError(f"refusing to write {path.name}: no data rows")
    for extra in ("error", "reply_at", "reply_note"):
        if extra not in fields and any(r.get(extra) for r in rows):
            fields.append(extra)
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)


def find_row(rows: list[dict], reply: dict) -> dict | None:
    company = (reply.get("company") or "").strip().lower()
    from_email = norm(reply.get("from") or "")
    alias = EMAIL_ALIASES.get(from_email, from_email)
    for row in rows:
        if norm(row.get("email", "")) in {from_email, alias}:
            return row
        if company and row.get("company", "").strip().lower() == company:
            return row
    return None


def apply_reply(row: dict, reply: dict) -> None:
    cls = reply.get("classification")
    note = (reply.get("snippet") or "")[:120]
    if cls == "opt_out":
        row["status"] = "opted_out"
        row["error"] = f"opt-out: {note}"
    elif cls == "bounce":
        row["status"] = "failed_bounce"
        row["error"] = f"bounce: {note}"
    elif cls == "interested":
        row["status"] = "replied_interested"
        row["reply_note"] = note
    elif cls == "auto_reply":
        row["reply_note"] = f"auto: {note}"
    if reply.get("received_at"):
        row["reply_at"] = reply["received_at"]


def update_log(log: list[dict], email: str, reply: dict) -> None:
    email = norm(email)
    cls = reply.get("classification")
    status_map = {
        "opt_out": "opted_out",
        "bounce": "failed_bounce",
        "interested": "replied_interested",
    }
    new_status = status_map.get(cls)
    if not new_status:
        return
    for entry in log:
        if norm(entry.get("to", "")) == email:
            entry["status"] = new_status
            entry["reply_message_id"] = reply.get("message_id")
            if reply.get("snippet"):
                entry["error"] = (reply.get("snippet") or "")[:200]
            break
    else:
        log.append(
            {
                "company": reply.get("company", ""),
                "type": reply.get("type", "customer"),
                "to": email,
                "status": new_status,
                "step": 1,
                "campaign": "v2-franchisetech",
                "reply_message_id": reply.get("message_id"),
            }
        )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if not REPLIES.exists():
        print("No inbox-replies.json — nothing to apply")
        return

    replies = json.loads(REPLIES.read_text(encoding="utf-8"))
    log = json.loads(LOG.read_text(encoding="utf-8")) if LOG.exists() else []

    stats = {"opt_out": 0, "bounce": 0, "interested": 0, "other": 0, "miss": 0}

    for csv_name in ("ro-customers-100.csv", "ro-partners-20.csv"):
        path = ROOT / csv_name
        fields, rows = load_csv(path)
        changed = 0
        for reply in replies:
            from_raw = reply.get("from") or ""
            if norm(from_raw) in SKIP_FROM and reply.get("classification") != "bounce":
                continue
            row = find_row(rows, reply)
            if not row:
                if reply.get("company"):
                    stats["miss"] += 1
                continue
            before = row.get("status")
            apply_reply(row, reply)
            if row.get("status") != before:
                changed += 1
                cls = reply.get("classification", "other")
                stats[cls if cls in stats else "other"] += 1
                email = norm(row.get("email", ""))
                update_log(log, email, reply)
        if not args.dry_run:
            save_csv(path, fields, rows)
        print(f"{csv_name}: updated {changed} rows")

    if not args.dry_run:
        LOG.write_text(json.dumps(log, ensure_ascii=False, indent=2), encoding="utf-8")

    print(
        "Applied:",
        f"opt_out={stats['opt_out']}",
        f"bounce={stats['bounce']}",
        f"interested={stats['interested']}",
        f"miss={stats['miss']}",
    )


if __name__ == "__main__":
    main()
