# Week 1 outbound — 20 pending customers (v2)

**Sender:** `info@franchisetech.ro`
**Campaign:** `ro-customer-q2-r2`
**Batch size:** 20 (first `pending` rows in `ro-customers-100.csv`)

## Generate payloads

```bash
cd outreach
python3 generate-payloads.py 1 --week1 --customers-only --write week1-send-payloads.json
```

This produces 20 customer emails (step 1) with:

- Signup link: `utm_source=zoho&utm_campaign=ro-customer-q2-r2&utm_content={slug}`
- Compare link in **step 2** follow-up (generated separately): segment-mapped compare page

## Send via Zoho

Use existing flow in `zoho-setup.md` / `daily-send.py`:

```bash
python3 daily-send.py week1-send-payloads.json
```

After send, update CSV status:

```bash
python3 update-csv-status.py week1-send-payloads.json sent_step1
```

## Follow-up schedule (same 20)

| Day | Step | Command |
|-----|------|---------|
| 0 | C1 | `--week1 --customers-only --write week1-step1.json` |
| 4 | C2 | Regenerate step 2 for same companies (compare angle) |
| 10 | C3 | Breakup |

Step 2 for week-1 cohort:

```bash
python3 generate-payloads.py 2 --week1 --customers-only --write week1-step2.json
```

## Tracking

Log replies and signups in weekly spreadsheet (`docs/growth/WEEKLY-METRICS.md`).

Match signups via `utm_content` slug on organisation `acquisition_content`.
