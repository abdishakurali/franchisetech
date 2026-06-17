# Business Flow Regression Checklist

Every P1-or-above change must verify these flows before shipping. Any ❌ is a blocker.

---

## Till open

- [ ] Owner/manager navigates to `/app/pos`
- [ ] Opening balance prompt appears
- [ ] Entering an amount and confirming creates exactly one POS session record
- [ ] Submitting twice does not create two sessions (idempotent)
- [ ] FiscalNet opening balance is sent at most once per session (even if user refreshes or retries)
- [ ] Opening balance failure does not block the session from opening locally
- [ ] Session open state persists on page reload

---

## Cash sale

- [ ] Staff adds products to cart
- [ ] Total displayed matches sum of (sale_price × quantity) for each item
- [ ] VAT breakdown displays correctly (9% / 19% / 23% per product)
- [ ] Tendering cash: change due = cash received − total (never negative)
- [ ] Underpayment (cash received < total): blocked, clear error shown
- [ ] Overpayment: sale records at actual total, not cash received
- [ ] Sale is saved to DB with correct amount (never inflated by change)
- [ ] FiscalNet payment amount = sale total, NOT cash received
- [ ] Drawer open command sent after sale (if connector available)
- [ ] Drawer failure does not block sale from saving
- [ ] Receipt printed or print dialog shown

---

## Card sale

- [ ] Card payment option selectable
- [ ] Amount charged = sale total
- [ ] No change due for card
- [ ] FiscalNet payment amount = sale total
- [ ] Sale saved to DB correctly

---

## Split payment (cash + card)

- [ ] Both amounts editable
- [ ] Cash + card sum must equal total (enforced before submit)
- [ ] FiscalNet receives correct split amounts
- [ ] Overpayment on cash portion: change = cash portion − (total − card portion)

---

## Till close (X report / Z report)

- [ ] X report: read-only snapshot, does not reset counters, no fiscal event
- [ ] Z report: sends fiscal closure, resets daily counters — requires admin role
- [ ] Z report is never triggered automatically
- [ ] Z report button is not visible to non-admin staff
- [ ] Running Z report twice in a row is safe (idempotent or clearly blocked)

---

## Cash in / Cash out

- [ ] Cash in/out requires admin or manager role
- [ ] Movement is recorded in till log
- [ ] Does not affect sale revenue in reports
- [ ] Drawer opens on cash movement (if connector available)
- [ ] Failure does not corrupt the till balance

---

## Purchases (Record Purchase)

- [ ] Purchase form accessible from `/app/purchases` or relevant nav
- [ ] Only products with `is_purchaseable = true` appear in product dropdown
- [ ] TVA (Romanian) displays correctly when currency is RON
- [ ] VAT displays correctly when currency is EUR/GBP
- [ ] UM (unit of measure) field present and saves correctly
- [ ] Saving purchase creates one purchase record
- [ ] Saving twice does not create duplicate purchase records
- [ ] Purchase cost does not affect POS sale totals

---

## Products

- [ ] New product saves with correct VAT rate, unit, category
- [ ] `is_purchaseable` checkbox saves correctly
- [ ] `item_type` dropdown saves correctly
- [ ] `available_in_pos` toggle correctly shows/hides product on POS
- [ ] `is_stock_tracked` saves correctly
- [ ] Product image uploads and displays
- [ ] Deleted product no longer appears on POS or in reports

---

## Reports

- [ ] Sales report loads for correct org/site
- [ ] Sales figures match sum of individual sales for the period
- [ ] Cash/card split in report matches individual sale payment types
- [ ] Stock report reflects purchase records if stock tracking enabled
- [ ] Purchase report shows purchases for org (not other orgs)
- [ ] Reports are not accessible to staff without permission

---

## Multi-site / multi-org isolation

- [ ] Staff logged into site A cannot see site B's sales
- [ ] Staff logged into site A cannot see site B's products
- [ ] Owner of org A cannot see org B's data
- [ ] All Supabase queries include `organisation_id` filter (RLS enforced)

---

## Billing and team management

- [ ] Billing page accessible to owner only
- [ ] Team member invite requires owner/manager role
- [ ] Staff cannot access billing or team management
- [ ] Stripe customer ID is never exposed to browser
- [ ] Stripe webhook validates signature before processing

---

## FiscalNet-specific (Romanian customers)

- [ ] FiscalNet is called from the browser/local client — never from Next.js server
- [ ] If FiscalNet connector is unreachable: POS session still opens locally, clear error shown
- [ ] Fiscal receipt number is not duplicated across retries
- [ ] Opening balance is not sent twice for the same session
- [ ] Currency for fiscal operations is RON (not EUR or GBP) when `currency = 'RON'`

---

## Regression sign-offs

When making any P1 change, tick the relevant sections above and note:

```
Regression check: [date]
Change: [description]
Sections verified: [list]
Tested by: [name or agent]
Environment: [local dev / staging / production]
```
