# Growth analysis + incident note — 2026-08-31

## 1. Incident: paying customers lost Operations features for ~13 hours

**This was caused by the deploy I ran in this session. Owning it plainly.**

| | |
|---|---|
| Introduced | release `20260830_230219`, deployed **2026-08-30 22:02 UTC** |
| Detected | owner report, 2026-08-31 (~11:50 UTC) |
| Fixed | release `20260831_115209`, deployed **2026-08-31 10:52 UTC** |
| Duration | **~12h 50m** |
| Affected | every org on `pro`/Operations — Dolce Nera (actively selling throughout) and Emerald Bites |

**What broke.** `lib/product-scope.ts` defines `LEAN_PRODUCT_SCOPE_ENABLED`, defaulting to `true`
whenever `NEXT_PUBLIC_LEAN_PRODUCT_SCOPE` is unset — and it is unset in production. That flag was
written to trim the *public marketing* surface (which industry and feature pages are advertised),
but it was also gating the *authenticated app*:

- `AppShell.tsx` — Recipes nav required `!LEAN`; Stock/Purchases/Suppliers required `!LEAN`
- `app-report-links.ts` — a four-path whitelist dropped stock, purchases, margins and gestiune reports

The per-org gates were correct the whole time: Dolce Nera has `inventory_enabled: true` and
`recipe_costing_enabled: true` in the database, and the `operations` plan grants both. A marketing
flag was overriding a billing entitlement.

**Why it reached production.** `lib/product-scope.ts` was **untracked** — it had never been
committed, so it appears in no git history. It sat in the working tree as part of the unreviewed
"lean redesign" work, and `deploy.sh` rsyncs the entire working tree. Every release before
`20260830_230219` (all four from 26 Aug) has no `product-scope.ts` at all. I flagged the
whole-tree scope before deploying and it was approved, but the regression still came from that
deploy — the risk was real and it landed on a paying customer.

**Fix.** In-app nav and report visibility now depend only on the org's own module flags plus plan
entitlement. `LEAN_PRODUCT_SCOPE_ENABLED` retains its marketing-scope job and no longer touches
`/app/*`. KDS, table service and loyalty were deliberately left parked — they are separately
flag-gated and were not part of the report.

**Process lessons worth acting on**
1. `deploy.sh` ships untracked files. An untested feature flag reached paying customers without
   ever being committed or reviewed. Commit before deploying, or make the deploy refuse on a dirty
   tree.
2. Never let a marketing/presentation flag gate a paid entitlement. Entitlement checks belong in
   `entitlement-resolver.ts` / org module flags only.
3. There is no smoke test that logs in as a paying org and asserts its paid nav is present. The
   post-deploy smoke suite checks public routes and three `/app` routes for non-5xx — it would
   never have caught this.

---

## 2. Where customers actually come from — the honest answer

**Attribution is unavailable, and that is itself the finding.** All four orgs have
`acquisition_source = NULL`:

- **Dolce Nera** (9 Jun) and **Emerald Bites** (5 Jun) predate the acquisition-tracking migration
  entirely — the columns did not exist when they signed up.
- **Angels Cafee** (17 Aug) arrived with no UTM parameters at all — direct, or via a channel that
  stripped them.

So "mirror your first user" cannot be executed against data. It can only be answered from your own
recollection of how Dolce Nera and Emerald Bites were found — which is worth writing down before
the memory fades, because right now it exists nowhere.

**The plumbing is wired and appears correct**: `lib/marketing/acquisition.ts` writes a cookie at
`/signup?plan=X`, `app/onboarding/page.tsx` reads it, and `app/actions/onboarding.ts:137-145`
persists nine acquisition columns. It has simply never had a UTM-tagged signup to capture.

**Next action:** send yourself a real tagged link
(`https://franchisetech.ro/?utm_source=facebook&utm_medium=paid&utm_campaign=test`), complete a
signup end-to-end, and confirm `acquisition_source` lands non-null. Until that is proven, every
euro of ad spend is unattributable — and with Facebook at ~76% of traffic, that is the single
measurement worth fixing before spending more.

---

## 3. The two accounts that need attention today

### Angels Cafee — signed up 17 Aug, **zero sales in two weeks**

Your only real signup since the ads started, and it never activated. No transaction has ever been
recorded. This is the entire funnel outcome of ~1,510 visitors, sitting idle.

Worth knowing before contact: their trial was governed by the old 12-day fallback, so on paper it
has already lapsed. Today's deploy moved the constant to 15 days, which recomputes from
`created_at` — they are still past it either way. If the conversation goes well, extending them
manually is reasonable.

Draft (Romanian, `dumneavoastră`, for **you** to send — I have sent nothing):

> Bună ziua,
>
> V-ați creat cont pe franchisetech pe 17 august și am observat că nu ați ajuns încă să faceți
> prima vânzare. Nu vă scriu ca să vă vând ceva — vreau doar să știu ce v-a oprit.
>
> Dacă a fost ceva legat de casa de marcat sau de configurarea fiscală, vă ajut eu direct: îmi
> spuneți modelul casei și vă spun exact dacă merge și ce pași sunt.
>
> Dacă pur și simplu nu a fost momentul potrivit, e în regulă — spuneți-mi și atât.
>
> O zi bună,

### Emerald Bites Café — paying `pro`, **no transaction since 14 July**

Seven weeks silent while still being billed €79/month. 102 lifetime transactions, so they did
activate — then stopped. Silent-but-billing is the worst churn shape: they will notice eventually,
and the conversation is much harder once they have paid for two unused months.

To be clear on causation: **this predates today's incident by six weeks**, so the entitlement bug
did not cause it. It may, however, have made the last 13 hours worse if they did log in.

Also outstanding on this account from earlier work: a stale-catalog issue that was found and never
fixed, and a loyalty test row left in their data.

Draft (Romanian, `dumneavoastră`, for **you** to send):

> Bună ziua,
>
> Am văzut că nu ați mai folosit casa în franchisetech din iulie și voiam să verific dacă e ceva
> ce nu a funcționat bine.
>
> Dacă ați revenit la vechiul sistem sau ceva vă încurcă în aplicație, spuneți-mi direct — prefer
> să știu, chiar dacă răspunsul e că nu vă mai este util.
>
> Dacă vreți să reluați, vă ajut eu cu configurarea, fără cost.
>
> O zi bună,

---

## 4. What actually constrains growth right now

Ranked by evidence, not by effort:

1. **Activation, not acquisition.** You have one real signup this quarter and it never made a sale.
   Doubling traffic against a funnel that converts 1,510 → 1 → 0 multiplies nothing. The signup →
   first-sale path is where the next fix belongs.
2. **The offer was misdescribed until today.** Every page promised "15 days after a €1 card
   verification." The card step did not exist, and the trial was really 12 days. Visitors were
   being asked to accept a payment step that would never happen — your own code comment identifies
   the card ask as the dominant drop-off. The site now says 15 days, no card, and both are true.
3. **Attribution is unmeasured** (section 2). Fix before more spend.
4. **Upgrade takes 3-4 clicks, not 2**, and the plan the visitor picked on `/pricing` is stored in
   a cookie that the billing page then ignores. Not yet fixed — see pending work below.

---

## Pending from the approved plan (not yet done)

The P1 took priority and shipped alone. Still outstanding:

- Merge the empty `/onboarding` step 1 (zero fields, zero decisions) into step 0
- Redirect onboarding completion to `/app/pos` instead of the setup checklist, whose hero CTA
  points 100% of Romanian signups at FiscalNet setup instead of their first sale
- Pre-select the plan from `PREFERRED_PLAN_COOKIE` on `/app/billing`; move the €199/€349/€499 setup
  options off the in-app billing screen
- Suppress the zero-value KPI/report tiles on a brand-new org's dashboard
- Delete confirmed-dead components (`TrialBanner`, `PricingCards`, `DashboardContent`,
  `DashboardModulePrompts`, `VerifyCardPendingRefresh`) and the unreachable `/onboarding/verify-card`
  tree
- **Contact as a phone number — blocked**: no franchisetech number exists anywhere in the repo, and
  I will not publish an invented one. Supply the number and it ships in the next pass.
