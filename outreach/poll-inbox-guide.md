# Zoho inbox reply monitoring (24/7 loop)

**Inbox:** `info@franchisetech.ro` · account `5857436000000002002` · folder `5857436000000002014`

## Each poll (agent loop tick)

1. **Search** Zoho MCP `ZohoMail_SearchEmails`:
   - `searchKey`: `in:inbox::fromDate:DD-MMM-YYYY` (since last poll in `inbox-state.json`)
   - Exclude our own sends: filter `fromAddress != info@franchisetech.ro`

2. **Classify** each inbound message:

| Signal | Classification | CSV status |
|--------|----------------|------------|
| `stop`, `unsubscribe`, `nu mai`, `remove` | `opt_out` | `opted_out` |
| Mailer-Daemon, Undelivered, delivery failed | `bounce` | `failed_bounce` |
| Question, demo, trial, call, interested | `interested` | `replied_interested` |
| Out of office, automatic reply | `auto_reply` | (note only) |
| Else | `other` | log only |

3. **Append** new rows to `inbox-replies.json` (dedupe by `message_id`).

4. **Apply:** `python3 outreach/apply-inbox-replies.py`

5. **Update** `inbox-state.json` (`last_poll_at`, `last_message_id`).

6. **Report** new opt-outs and interested replies (founder action within 24h for interested).

## Compliance

- **Never send C2/C3** to `opted_out` or `failed_bounce`.
- Opt-out is permanent for that address/company.
- Match partner replies on alternate emails via `EMAIL_ALIASES` in `apply-inbox-replies.py`.

## Loop command (Cursor)

```
/loop 15m Poll Zoho inbox info@franchisetech.ro: search new inbox replies since inbox-state.json, classify opt_out/bounce/interested, append inbox-replies.json, run apply-inbox-replies.py, summarize new opt-outs and hot leads.
```

Or dynamic: agent self-paces with 15m fallback heartbeat.
