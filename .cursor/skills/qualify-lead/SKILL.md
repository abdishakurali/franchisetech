---
name: qualify-lead
description: Qualify a new lead for FranchiseTech. Use when I paste a name, email, LinkedIn URL, business name, or lead info. Score, draft outreach, update Supabase if they exist.
---

# Lead Qualification

## Input

I will paste lead information — could be: name + business + city, LinkedIn URL, email, or raw notes from a call.

## Process

1. Extract: name, business name, city, type (café/restaurant/takeaway/patisserie), estimated locations, role
2. Check Supabase MCP: does this email already exist in auth.users? If yes, they're already a trial/customer — report their status.
3. Score 1–10 using scoring rules from the sales-ops rule (02-sales-ops.mdc)
4. Write a 4-line cold email in Romanian:
   - Line 1: personal hook referencing their specific business type
   - Line 2: one specific pain point relevant to their situation
   - Line 3: what FranchiseTech does for that exact pain
   - Line 4: low-friction CTA ("15 zile trial paralel cu ce folosești acum?")
5. Draft a Cal.com booking link message for assisted setup if score ≥ 7

## Output format:

LEAD: [name] — [business] — [city]
SCORE: X/10 — [High/Mid/Low]
REASON: [1 sentence why]

EMAIL DRAFT:

[4-line Romanian email]

NEXT ACTION: [call today / send email / nurture sequence / skip]
