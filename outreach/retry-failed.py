#!/usr/bin/env python3
"""Build retry payloads for step-1 sends that hit Zoho rate limits.

Usage:
  python3 outreach/retry-failed.py              # all failed (19)
  python3 outreach/retry-failed.py --batch 10   # first 10 only (daily limit)
  python3 outreach/retry-failed.py --dry-run    # print summary only

After Zoho cooldown (~24h), send via Zoho MCP ZohoMail_sendEmail with 30s+ gaps.
Merge results into send-log.json and re-run outreach/update-csv-status.py
"""
from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
STEP1 = ROOT / "send-payloads-step1.json"
CUSTOMERS = ROOT / "ro-customers-100.csv"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--batch", type=int, default=0, help="Max emails this run (0 = all failed)")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    failed_emails: set[str] = set()
    with CUSTOMERS.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            if row.get("status") == "failed_rate_limit":
                failed_emails.add(row["email"].strip().lower())

    payloads = json.loads(STEP1.read_text(encoding="utf-8"))
    retry = [p for p in payloads if p["body"]["toAddress"].lower() in failed_emails]

    if args.batch > 0:
        retry = retry[: args.batch]

    if args.dry_run:
        print(f"Failed in CSV: {len(failed_emails)}")
        print(f"Retry batch: {len(retry)}")
        for p in retry:
            print(f"  - {p['company']}: {p['body']['toAddress']}")
        return

    out = ROOT / "retry-payloads.json"
    out.write_text(json.dumps(retry, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(retry)} payloads to {out}")


if __name__ == "__main__":
    main()
