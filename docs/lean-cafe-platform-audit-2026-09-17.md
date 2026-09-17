# Lean café platform audit — 17 September 2026

## Product decision

For a Romanian independent coffee shop, the product is the daily-control loop:

1. Open cash drawer.
2. Sell coffee and food quickly.
3. Record purchases and stock.
4. See shortages, cash difference and margin.
5. Close the day with a trustworthy report.

This is the activation path. Everything else must be hidden until it is needed,
not deleted until it has been observed unused in a separate test organisation.

## Evidence

- Romanian hospitality faces cost pressure: restaurant expenses grew faster than
  sales in 2025 ([Sphera annual report](https://bvb.ro/infocont/infocont26/SFG_20260327181351_SFG-2025-Annual-EN.pdf)).
- The reported 2025 priorities are staffing, regulatory change and operational
  cost reduction ([Hospitality Culture Institute survey coverage](https://industriacarnii.ro/Articol-Lipsa-personalului-si-instabilitatea-economica%2C-principalele-provocari-pentru-sectorul-HoReCa%2C-in-2025/10918)).
- RO e-Factura is a live compliance concern, but fiscal receipts and e-Factura
  are distinct workflows ([OUG 120/2021, current text](https://legislatie.just.ro/Public/DetaliiDocument/298707)).

## Keep prominent

- Sign up, sign in, onboarding with optional ANAF CUI lookup.
- Products, categories, unit of measure and VAT configuration.
- POS: open till, cash/card sale, offline-safe retry, close till.
- Purchases/NIR, stock movement and low-stock view.
- One owner dashboard: sales, expected vs actual cash, stock warnings, Z report.
- Settings as the five designed lists; FiscalNet is explicitly opt-in and local.

## Conditional, not activation blockers

- Recipes and theoretical consumption: only cafés making food or batches.
- ANAF e-Factura: only an organisation issuing invoices through SPV.
- FiscalNet: only after its local driver, VAT groups and payment mapping are
  configured and a provider/accountant has checked a test receipt.
- Owner digest/reminders: only after recipients, entitlement and a protected
  n8n/cron trigger are configured.

## Hide/defer for a one-location café

Kitchen display, tables/floor plan, deliveries, loyalty, multi-site, staff
analytics, food safety, SOPs, customer CRM, integrations marketplace and
specialist reports. Preserve routes and data; remove them from onboarding and
primary navigation unless the business type or a module entitlement requires
them.

## Audit findings

### P0 — split selling VAT from purchase VAT

`lib/vat-rates.ts` currently makes every non-zero product/import rate invalid
for a Romanian organisation not registered for VAT. This protects the sale-side
rate but also leaks into a purchase default because purchase lines start from
the product VAT rate. The desired rule is: sales default to 0% for that
organisation; supplier purchase lines may retain the supplier invoice VAT and
must calculate acquisition cost correctly. Implement this only with a new
migration if schema separation is needed, unit tests for both paths, and a
fresh test organisation. Never migrate or edit Dolcenera.

### P1 — the activation E2E path is incomplete

The existing browser tests cover marketing-to-signup, auth boundaries and the
five settings lists. They do not create an organisation, look up a CUI, open a
till, save a sale, receive a purchase, or close a day. The scratch Supabase
project is missing required operational tables, so this cannot be safely tested
there yet.

Read-only schema verification confirms that the scratch project is missing
`pos_sessions`, `stock_movements`, `growth_milestones`,
`organisation_modules`, `subscription_status`, `invoices` and `stock_levels`.
It must be made schema-compatible before any authenticated first-day test.

### P1 — reminders need an operational proof

Owner digest and billing reminders correctly require `CRON_SECRET`; the owner
digest also needs a scheduler, recipients and entitlement. Add a non-production
trigger proof after the scratch schema is repaired; do not send a live email as
a test.

### P1 — FiscalNet must remain local-only

The code has substantial command, parser and receipt-attempt coverage. A real
receipt test requires the customer’s local FiscalNet driver and hardware. Do
not call FiscalNet from the deployed Next.js server.

## Verification completed locally

- 86 focused unit tests passed: café starter products, VAT/NIR costing,
  FiscalNet command/logging, POS totals and offline replay.
- 3 desktop browser tests passed: auth boundaries, marketing-to-signup, and
  settings-list interaction.
- No sign-up, ANAF, FiscalNet, purchase, stock or reminder action was sent to
  any live customer organisation.

## Next implementation order

1. Repair/complete the isolated test schema and create a test organisation.
2. Implement and test sale-VAT versus purchase-VAT separation.
3. Run the full first-day E2E script: signup → ANAF lookup → onboarding → till
   → sale → purchase/NIR → low stock → close/Z report.
4. Gate conditional modules by business type and entitlement, then compare each
   remaining screen against the supplied design.
