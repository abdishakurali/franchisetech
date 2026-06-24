# Zoho outreach setup — franchisetech RO campaign (v2)

## Account (ZohoMail_getMailAccounts — corrected 2026-06-20)

| Field | Value |
|-------|--------|
| accountId | `5857436000000002002` |
| fromAddress | `info@franchisetech.ro` |
| displayName | Franchise Tech |
| timezone | Europe/Bucharest |

**Previous mistake:** v1 sends used wrong account `6147765000000002002` / `info@garaad.org`. Archived in `send-log-v1-garaad.json`. Do not use.

## Campaign v2

| Item | Value |
|------|--------|
| Customer UTM | `ro-customer-q2-r2` |
| Partner UTM | `ro-partner-q2-r2` |
| Positioning | Workspace HORECA (not payments-first POS) |
| Signature | Franchise Tech / info@franchisetech.ro |

## Lists

| List | File | Count |
|------|------|-------|
| RO-Partners-2026 | [ro-partners-20.csv](./ro-partners-20.csv) | 20 |
| RO-Customers-2026 | [ro-customers-100.csv](./ro-customers-100.csv) | 100 |

## Daily send workflow

```bash
python3 outreach/daily-send.py              # → daily-batch.json (4 partner + 10 customer max)
# Send each payload via ZohoMail_sendEmail (25–30s gaps)
python3 outreach/merge-send-results.py outreach/send-results-batchN.json
```

Regenerate all step payloads after copy changes:
```bash
for s in 1 2 3 4; do python3 outreach/generate-payloads.py $s > outreach/send-payloads-step${s}.json; done
```

## Bounces and deliverability

**La Conac (`contact@laconac-traditie.ro`):** marked `failed_bounce` — forwards to `gabi_histo@yahoo.com` via best-hosting.ro; forwarder breaks DMARC/DKIM. Zoho sent authenticated; failure is on the recipient forward path. Retry only with a direct inbox.

**Risky patterns:** domain forwards to Yahoo/Hotmail; direct `@yahoo.com` / `@outlook.com` on cold list (e.g. `pizzavolare@yahoo.com` pending).

**DNS (2026-06-21):** SPF `include:zohomail.eu ~all`; DMARC `p=none`. Add Resend to SPF if sending via Resend too.

**Do not C2-follow-up bounced rows** until a verified direct contact is found.

## Cadence

| Audience | Step | Day | Subject | Daily limit |
|----------|------|-----|---------|-------------|
| Partners | P1 | 0 | workspace HORECA | 4 |
| Partners | P2 | 3 | stoc + NIR | 4 |
| Partners | P3 | 7 | 20% recurent | 4 |
| Partners | P4 | 14 | ultim mesaj | 4 |
| Customers | C1 | 0 | sertarul după program | 10 |
| Customers | C2 | 4 | trial 15 zile | 10 |
| Customers | C3 | 10 | ultim mesaj | 10 |

## UTM tracking

Signup persists `utm_*` via [lib/marketing/acquisition.ts](../lib/marketing/acquisition.ts). Filter v2 signups with `utm_campaign=ro-customer-q2-r2` or `ro-partner-q2-r2`.
