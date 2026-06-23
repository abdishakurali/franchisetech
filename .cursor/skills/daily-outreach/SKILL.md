---
name: daily-outreach
description: Send today's planned outreach batch via Zoho. Use every morning. Reads planned emails from Supabase outreach_log where status=planned, sends each via ZohoMCP, updates status to sent or failed.
---

# Daily Outreach

Run after the n8n workflow **Outreach — Daily Planner** (step 1) or **Outreach — C2 Follow-up Planner** (step 2+).

## Process

1. Query Supabase MCP (`execute_sql` on project `ycqzxlahhfqwuteistvf`):

```sql
SELECT id, email, company, type, step
FROM outreach_log
WHERE status = 'planned' AND campaign = 'v2-franchisetech'
ORDER BY sent_at ASC
LIMIT 14;
```

For step 2-only batch, add `AND step = 2`.

2. If zero rows: tell the user to run the matching n8n planner first, then stop.

3. Enforce caps before sending:
   - Max **10** customer + **4** partner emails per run
   - If the query returns more, process only the first 10 customers and first 4 partners

4. For each row, load CSV merge fields (read repo files — do not paste PII into chat):
   - `type = customer` → match `email` in `outreach/ro-customers-100.csv` → `personalization_line`, `segment`, `recommended_plan`, `company`, `contact_name`
   - `type = partner` → match in `outreach/ro-partners-20.csv` → `hook_line`, `company`, `contact_name`

5. Build email from `outreach/generate-payloads.py` (v2, `info@franchisetech.ro`, account `5857436000000002002`):

| type | step | subject | body source |
|------|------|---------|-------------|
| customer | 1 | `casa după program` | C1 in `customer_email(..., step=1)` |
| customer | 2 | `trial 15 zile` | C2 in `customer_email(..., step=2)` |
| customer | 3 | `ultim mesaj` | C3 in `customer_email(..., step=3)` |
| partner | 1 | `workspace HORECA` | P1 in `partner_email(..., step=1)` |
| partner | 2 | `stoc + NIR` | P2 in `partner_email(..., step=2)` |

Segment value line for C1 (from `SEGMENT_VALUE` in `generate-payloads.py`):
- `cafenea` → Casă la counter, TVA pe produs și raport Z — fără taxă per angajat, trial asistat 15 zile fără card pentru deschiderea casei.
- `restaurant mic` → POS + display bucătărie, stoc și rețete cu marjă — închiderea zilei și raportul Z în același workspace, personal nelimitat.
- `takeaway/patiserie` → Vitrină, stoc pe ingrediente și rețete — fără Excel după program ca să știți marja înainte să schimbați meniul.
- `multi_location` → Vânzări și casă pe fiecare locație, rapoarte centralizate și NIR — cu ghid FiscalNet când extindeți rețeaua.
- default → use `restaurant mic` line

Greeting: ` Bună ziua` + contact name if present and not `Echipă`.

6. **Safety dedup** before each send — Supabase MCP:

```sql
SELECT email FROM profiles WHERE email = '<email>' LIMIT 1;
```

If a row exists → update `outreach_log` to `skipped_existing_user`, skip send, continue.

7. Send via **ZohoMCP** `ZohoMail_sendEmail`:
   - `path_variables.accountId`: `5857436000000002002`
   - `body.fromAddress`: `info@franchisetech.ro`
   - `body.toAddress`: recipient email
   - `body.subject`: from table above
   - `body.content`: full Romanian plaintext body
   - `body.mailFormat`: `plaintext`

8. **Wait 30 seconds** between sends (shell `sleep 30` between MCP calls).

9. After each send, update Supabase via MCP:

```sql
UPDATE outreach_log
SET status = 'sent', sent_at = now(), error_message = null
WHERE id = '<uuid>';
```

On ZohoMCP failure:

```sql
UPDATE outreach_log
SET status = 'failed', sent_at = now(), error_message = '<short error>'
WHERE id = '<uuid>';
```

10. Chat feedback per row: `✅ Sent to [company]` or `❌ Failed: [company] — [reason]` or `⏭ Skipped (existing user): [company]`

11. Final summary: `📧 Done: X sent, Y failed, Z skipped. Check outreach_log in Supabase for details.`

## Safety rules

- Never send to an email that exists in `profiles` (already a trial/customer)
- Never send more than 10 customer + 4 partner emails per run
- Always wait 30s between sends
- If ZohoMCP returns an error, mark as `failed` and continue — **never retry in the same session**
- Do not paste service role keys or Zoho tokens in chat

## Morning routine

1. Run **Outreach — Daily Planner** in n8n (manual trigger) — plans step 1 batch
2. When due: **Outreach — C2 Follow-up Planner** queues step 2 (day 4 after step 1 sent)
3. In Cursor, invoke this skill (`/daily-outreach`)
4. Cursor sends via ZohoMCP and updates `outreach_log`

Follow-up cadence: `lib/outreach/followup.ts` (`customer` C2 = 4 days, C3 = 10 days; `partner` P2 = 3 days).

## Useful queries (Supabase MCP)

This week:

```sql
SELECT type, status, count(*) FROM outreach_log
WHERE sent_at >= date_trunc('week', now())
GROUP BY type, status ORDER BY type, status;
```
