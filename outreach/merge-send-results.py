#!/usr/bin/env python3
"""Merge daily-batch send results into send-log and update CSV status."""
from __future__ import annotations

import csv
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python3 merge-send-results.py results.json")
        sys.exit(1)

    results = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    log_path = ROOT / "send-log.json"
    log = json.loads(log_path.read_text(encoding="utf-8")) if log_path.exists() else []

    by_email: dict[str, dict] = {e["to"].strip().lower(): e for e in log}

    for r in results:
        email = r["to"].strip().lower()
        entry = {
            "company": r.get("company", ""),
            "type": r.get("type", ""),
            "to": r["to"],
            "status": r["status"],
            "step": r.get("step", 1),
            "campaign": "v2-franchisetech",
        }
        if r.get("error"):
            entry["error"] = r["error"]
        by_email[email] = entry

    merged = list(by_email.values())
    log_path.write_text(json.dumps(merged, ensure_ascii=False, indent=2), encoding="utf-8")

    # sync CSV
    for r in results:
        if r["status"] != "success":
            continue
        email = r["to"].strip().lower()
        step = r.get("step", 1)
        status = f"sent_step{step}"
        for csv_name in ("ro-partners-20.csv", "ro-customers-100.csv"):
            rows = []
            changed = False
            with (ROOT / csv_name).open(newline="", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                fields = list(reader.fieldnames or [])
                for row in reader:
                    if row["email"].strip().lower() == email:
                        row["status"] = status
                        changed = True
                    rows.append(row)
            if changed:
                with (ROOT / csv_name).open("w", newline="", encoding="utf-8") as f:
                    w = csv.DictWriter(f, fieldnames=fields)
                    w.writeheader()
                    w.writerows(rows)

    ok = sum(1 for r in results if r["status"] == "success")
    fail = len(results) - ok
    print(f"Merged {len(results)} results ({ok} ok, {fail} fail). Log has {len(merged)} entries.")


if __name__ == "__main__":
    main()
