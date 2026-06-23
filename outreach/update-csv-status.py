#!/usr/bin/env python3
"""Sync ro-partners-20.csv and ro-customers-100.csv status from send-log.json."""
import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
LOG = json.loads((ROOT / "send-log.json").read_text(encoding="utf-8"))
BY_EMAIL = {e["to"].strip().lower(): e for e in LOG}


def update(path: Path, email_col: str = "email") -> None:
    rows: list[dict] = []
    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = list(reader.fieldnames or [])
        for row in reader:
            email = row[email_col].strip().lower()
            if email in BY_EMAIL:
                entry = BY_EMAIL[email]
                if entry["status"] == "success":
                    row["status"] = "sent_step1"
                elif entry["status"] == "failed_bounce":
                    row["status"] = "failed_bounce"
                    if "error" in entry:
                        row["error"] = entry["error"][:200]
                elif entry["status"] == "opted_out":
                    row["status"] = "opted_out"
                    if "error" in entry:
                        row["error"] = entry["error"][:200]
                elif entry["status"] == "replied_interested":
                    row["status"] = "replied_interested"
                else:
                    row["status"] = "failed_rate_limit"
                    if "error" in entry:
                        row["error"] = entry["error"][:200]
            rows.append(row)
    if "error" not in fieldnames and any(r.get("error") for r in rows):
        fieldnames.append("error")
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)
    sent = sum(1 for r in rows if r.get("status") == "sent_step1")
    failed = sum(1 for r in rows if r.get("status") == "failed_rate_limit")
    print(f"{path.name}: sent_step1={sent} failed={failed} total={len(rows)}")


if __name__ == "__main__":
    update(ROOT / "ro-partners-20.csv")
    update(ROOT / "ro-customers-100.csv")
