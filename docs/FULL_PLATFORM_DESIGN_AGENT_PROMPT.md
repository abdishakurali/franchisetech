# FranchiseTech Full-Platform Redesign Prompt

You are the lead product designer and design systems architect for FranchiseTech. Redesign the complete public website and authenticated product experience. Produce a coherent, implementation-ready system rather than disconnected mockups.

Do not add features. Do not redesign from assumptions alone. First audit the current application, routes, real workflows, existing UI components, feature flags, screenshots, and Romanian copy. Preserve working business logic and simplify how it is presented.

## 1. Product context

FranchiseTech is Romanian cloud POS and business operations software for small and medium businesses that sell at a counter:

- Cafés.
- Takeaway and fast-food businesses.
- Bakeries and patisseries.
- Mini-markets and shops.
- Service businesses.
- Businesses with one or more locations, where supported by the selected plan.

The initial wedge is a one-location Romanian café or takeaway. The decision maker is usually the owner, aged roughly 35–55, often non-technical, frequently working from a phone, and currently combining an old POS, Excel, WhatsApp, and an accountant.

The core product promise is:

> Vinde rapid și închide ziua fără surprize.

The core job is:

> Add products, configure fiscal settings, open the till, complete sales, issue fiscal receipts, close the day, and understand the totals.

The product is not franchise-management software. It is not an “everything for everyone” restaurant suite. It must feel Romanian, practical, reliable, and direct.

## 2. Business truths

Treat these as non-negotiable:

- The product is self-service signup. The main CTA is not a demo request.
- Primary CTA: **Începe trialul de 15 zile**.
- Primary CTA destination: `/signup?plan=starter`.
- The trial begins after a one-time €1 card verification.
- Core costs €49 per location per month.
- Operations costs €79 per location per month.
- Prices exclude VAT, fiscal hardware, FiscalNet, payment processing, and third-party fees.
- Guided in-app setup is included.
- Large imports, team training, and on-site fiscal configuration may be separate services.
- Contact is secondary and exists for questions, compatibility, and account support.
- Never use “Solicită o demonstrație” as the primary CTA.
- Never claim support for every fiscal register, printer, terminal, or device.
- Never claim certification, universal compliance, a specific uptime percentage, or “ANAF certified” without documented proof.
- FiscalNet runs locally on the cashier device. The cloud backend must not be presented as directly controlling local fiscal hardware.

## 3. Product scope

Design the core experience around:

- POS sales.
- Products and categories.
- Product templates.
- Discounts and supported payment methods.
- VAT/TVA configuration.
- FiscalNet receipt workflow.
- Till open, cash movement records, till close, and cash reconciliation.
- Raport Z.
- Sales history and basic reports.
- Stock and purchasing where included in Operations.
- Recipes and ingredient cost where included in Operations.
- Billing, trial status, profile, team, and location settings.

Park these from primary navigation, onboarding, pricing copy, and marketing:

- Kitchen Display System.
- Table service and table plans.
- Loyalty.
- Advanced reports that are not validated.
- Complex restaurant workflows.
- Unvalidated integrations.
- Delivery workflows.
- AI features without a proven customer problem.

Parked modules may remain behind feature flags for existing or internal accounts. Do not expose them to new customers by default. Do not delete database structures as part of design work.

## 4. Success criteria

The redesign succeeds when a new Romanian owner can:

1. Understand the product in under ten seconds.
2. See the monthly price without contacting sales.
3. Start signup directly from every primary CTA.
4. Create the business and first location.
5. Select a product template or add products.
6. Complete the €1 card verification.
7. Configure VAT and fiscal setup.
8. Open the till.
9. Record the first sale.
10. Issue or correctly handle the fiscal receipt state.
11. Close the day and understand expected versus counted cash.
12. Find the relevant report without training.

Optimize for first sale within the first session and full activation within 48 hours.

## 5. Design character

The product should feel:

- Quiet and operational.
- Trustworthy and Romanian.
- Fast under pressure.
- Clear to non-technical owners.
- Dense enough for repeated work without becoming visually crowded.
- Modern, but not fashionable at the expense of usability.

Use:

- White and neutral surfaces with restrained contrast.
- FranchiseTech blue for primary actions and selected states.
- Green for confirmed success.
- Amber for attention and incomplete setup.
- Red only for destructive actions, fiscal failure, or meaningful cash discrepancies.
- Clear tables, lists, filters, tabs, segmented controls, and dialogs.
- Lucide icons where a familiar icon exists.
- 8px or smaller card radius unless an existing component requires otherwise.
- Stable dimensions for product grids, cart panels, toolbars, totals, and table rows.

Avoid:

- Decorative gradients, blobs, or background ornaments.
- Oversized dashboard headings.
- Marketing-style cards inside the authenticated application.
- Nested cards.
- Excessive shadows.
- Purple-dominated, beige, brown, or dark-slate themes.
- Long explanatory paragraphs inside workflows.
- Multiple competing CTAs.
- Animation that delays work.
- Icons without labels or tooltips when meaning is unclear.
- Text inside rounded pills when a standard icon or control would be clearer.

Use Outfit if retaining the current brand typography. Do not scale typography using viewport width. Keep letter spacing at zero except restrained uppercase eyebrow labels on marketing pages.

## 6. Language and copy

Romanian is the primary language for all public and product UI. English may remain as a complete alternate language, but never mix languages inside one interface.

Copy rules:

- Use plain Romanian business language.
- Prefer concrete verbs: Vinde, Adaugă, Deschide casa, Încasează, Închide ziua, Vezi raportul.
- Use “locație,” “casă,” “vânzare,” “numerar,” “card,” “TVA,” and “raport Z” consistently.
- Avoid jargon such as omnichannel, ecosystem, stack, enablement, or digital transformation.
- Explain consequences in error messages and provide the next action.
- Do not describe the UI visually inside the UI.
- Do not expose internal feature-flag or entitlement terminology.
- Use correct Romanian diacritics.

## 7. Information architecture

### Public navigation

Keep it short:

- Produs.
- Tip afacere.
- Resurse.
- Prețuri.
- Contact.
- Autentificare.
- Primary CTA: Începe trialul.

Do not make every feature a top-level navigation item.

### Authenticated navigation

Design a role-aware application shell. The default lean navigation should prioritize:

- Panou.
- POS.
- Produse.
- Stoc, only when entitled.
- Achiziții, only when entitled.
- Rețete, only when entitled.
- Rapoarte.
- Setări.

Place account, billing, location switcher, language, and logout in a predictable account menu. Put infrequent actions in contextual menus rather than permanent navigation.

On desktop, use a compact top navigation or restrained sidebar based on which best supports POS and back-office workflows. On mobile, use a clear menu or bottom navigation only for the most frequent destinations. Do not squeeze the desktop table navigation into a small viewport.

## 8. Public website

### Homepage

The first viewport must contain:

- Eyebrow: POS cloud pentru afaceri din România.
- H1: **Vinde rapid și închide ziua fără surprize.**
- Short subheadline naming cafés, takeaway, bakeries, shops, and services.
- One primary CTA: **Începe trialul de 15 zile**.
- CTA destination: `/signup?plan=starter`.
- Supporting truth: verificare unică a cardului de 1 €.
- Three concise confidence points: configurare ghidată, fără contract pe termen lung, preț public pe locație.
- A real FranchiseTech product image showing products, active sale, payment, or daily close.

Do not use a generic coffee image as primary proof. Do not put the hero inside a card. Keep a visible hint of the next section.

Recommended page structure:

1. Hero and product proof.
2. Three-step workflow: configurează, vinde, închide ziua.
3. Real product-in-location video.
4. Four grouped workflow areas, not a feature wall.
5. Daily close/report proof.
6. Core-first pricing.
7. Direct owner questions.
8. Final signup CTA.
9. Legal footer.

### Features page

Use simple icon-led workflow sections or cards. Group by:

- POS și vânzări.
- Fiscal și TVA.
- Produse și stoc.
- Rapoarte și închiderea zilei.

No stock photography. No KDS, table service, loyalty, or “coming soon” cards.

### Pricing

Show Core first and Operations second. Make the unit explicit: per location, per month.

Each plan must show:

- Exact monthly price.
- Who it is for.
- The few important included outcomes.
- What is not included.
- Primary action that starts signup for that plan.

Do not promote hidden Scale or multi-location offers in the default public comparison unless the business has explicitly approved the pricing. Do not use “Contact sales” for Core or Operations.

### Segment pages

Create or redesign focused pages for cafés, takeaway, bakeries, mini-markets, shops, and services only where the content is materially different. Each page needs:

- The segment’s daily workflow.
- Three real problems.
- Relevant product proof.
- Applicable features only.
- Price/trial truth.
- One signup CTA.

Do not recreate a restaurant page until customer evidence justifies it.

### Contact

Contact is not a conversion gate. Keep it for questions about setup, compatibility, or an existing account. Use a short form with name, phone or email, business type, location count, message, and privacy consent. CTA: **Trimite mesajul**.

## 9. Signup and billing verification

Design signup as a direct self-service flow, not a lead form.

Required states:

- Default signup.
- Inline validation.
- Existing email.
- Weak password.
- Email confirmation required.
- Loading.
- Provider/auth failure.
- Successful account creation.
- Resume after interruption.

Show the selected plan and price clearly. Explain the €1 verification before the user reaches Stripe. State what happens after verification and when monthly billing begins. Never surprise the user with a card requirement after claiming no card is needed.

Track CTA attribution and preserve plan/UTM parameters through signup.

## 10. Onboarding

The onboarding must be a short activation flow, not a business questionnaire.

Design this sequence:

1. Business identity and country.
2. First location.
3. Business type and product template.
4. Review products and VAT.
5. Fiscal setup status.
6. Open till.
7. Guided first sale.
8. Daily close/report introduction.

Use progressive disclosure. Ask only for data required for the next action. Save after every meaningful step. Show a compact progress indicator with task names, not a decorative percentage.

Support:

- Skip only when safe.
- Resume later.
- Empty template.
- Template selected.
- Import products.
- Fiscal setup incomplete.
- Fiscal hardware not yet available.
- Trial/card verification pending.
- Setup complete.

Do not ask new users about KDS, tables, loyalty, delivery, or advanced integrations.

## 11. Application shell and dashboard

The application should open to a useful operational state, not a generic analytics homepage.

Owner dashboard priorities:

- Today’s sales.
- Cash and card totals.
- Till status.
- Expected cash or unresolved difference.
- First-sale/setup progress for new accounts.
- Low-stock attention only when stock is enabled.
- Clear link to sales report and daily close.

Cashier priorities:

- Open POS.
- Current till state.
- Resume held sale if supported.
- No owner-only financial noise.

Every dashboard metric must have a clear period, currency, and link to its source detail. Use skeletons that preserve layout. Design meaningful zero states for no sales, closed till, and incomplete setup.

## 12. POS

POS is the highest-priority screen. Design for speed, touch, and failure recovery.

Desktop/tablet layout:

- Product search and category navigation.
- Stable product grid.
- Clear product names and prices.
- Selected state without layout shift.
- Persistent cart/order panel.
- Quantity controls.
- Discount control only where entitled.
- Customer attachment as secondary.
- Large total.
- Clear payment action.

Checkout states:

- Empty cart.
- Product added.
- Quantity edited.
- Discount applied.
- Cash payment.
- Card payment.
- Split payment, only when enabled.
- Underpayment blocked.
- Change due.
- Saving sale.
- Sale completed.
- Fiscal receipt pending.
- Fiscal receipt issued.
- Fiscal receipt failed with retry/fallback.
- Offline queued.
- Syncing.
- Synced.
- Duplicate-submit protection.

The sale must visually complete even if fiscal delivery requires follow-up. Clearly separate “vânzare salvată” from “bon fiscal emis.” Never imply hardware success before confirmation.

Quick access should contain only frequent, valid actions: add product, products, payment methods, sales history/reports, cash movement, close till, refund, hold sale where supported, and Raport Z. Remove physical drawer-command controls.

On mobile, optimize owner review and emergency use. Do not pretend a 390px phone is the ideal high-volume cashier terminal. Keep actions reachable and content free from horizontal clipping.

## 13. Products

Design product management for catalogs from tens to hundreds of products.

List requirements:

- Search.
- Category filter.
- Active/inactive filter.
- Product type filter where required.
- Sort.
- Bulk selection and safe bulk actions.
- Name, image, category, price, cost, TVA, type, and stock where relevant.
- Clear add-product action.
- Mobile list alternative to wide tables.

Product create/edit requirements:

- Basic information first.
- Price and TVA grouped together.
- POS visibility.
- Stock behavior only when enabled.
- Recipe/ingredient settings only when relevant.
- Image upload with fallback.
- Save, cancel, validation, unsaved-change protection, success, and error states.

Templates must show what will be added before confirmation. Make bulk imports recoverable with row-level errors.

## 14. Stock, purchases, and recipes

These belong to Operations and must not overwhelm Core users.

Stock:

- Current quantity.
- Unit of measure.
- Low-stock threshold.
- Last movement.
- Search/filter.
- Adjustment with reason.
- Movement history.

Purchases/NIR:

- Supplier.
- Document details.
- Draft versus issued status.
- Line items with quantity, unit, cost, TVA, and totals.
- Clear warning that issuing updates stock.
- Review before irreversible actions.
- Print/export states where supported.

Recipes:

- Finished product.
- Ingredient lines.
- Quantity and unit.
- Cost per portion.
- Sale price and gross margin.
- Missing-cost warnings.
- Current stock/can-make only if reliable.

Use domain-appropriate tables and forms. Do not turn these workflows into decorative dashboards.

## 15. Till close and Raport Z

This is the product’s defining trust workflow.

Design a guided daily close showing:

- Opening cash.
- Cash sales.
- Card and other payment totals.
- Cash in/out records.
- Expected cash.
- Counted cash input.
- Difference.
- Notes.
- Fiscal Raport Z status.

The hierarchy must make expected versus counted cash unmistakable. Treat non-zero difference as attention, not automatic catastrophe. Require confirmation before close and before fiscal Raport Z. Explain that Raport Z is irreversible where applicable.

Support:

- Balanced close.
- Over/short difference.
- No sales.
- Fiscal setup unavailable.
- Report already generated.
- Browser/local FiscalNet handoff.
- Download/manual confirmation mode.
- Failure and retry.
- Closed-session summary.

## 16. Reports

Start with basic reports users can understand:

- Sales summary.
- Transactions.
- Payment methods.
- VAT.
- Daily close/Raport Z.
- Stock and purchases for Operations.

Every report needs:

- Explicit date range.
- Location context.
- Currency.
- Filters with clear reset.
- Totals that reconcile with detail.
- Export only where working.
- Empty, loading, stale, and error states.

Do not expose a wall of advanced reports in the main report index. Group infrequent reports under “Mai multe rapoarte” only for entitled users.

## 17. Settings

Organize settings by user intent:

- Afacere și locație.
- TVA și fiscal.
- Metode de plată.
- Echipă și permisiuni.
- Abonament și facturare.
- Profil și limbă.
- Module, only where controlled and safe.

Use section navigation on desktop and a drill-in list on mobile. Show current status before edit controls. Separate destructive actions. Never surface raw environment variables, internal IDs, or feature-flag names.

Fiscal settings must clearly show configured, incomplete, unavailable, test/mock, and error states. Compatibility language must remain cautious and factual.

## 18. Billing and entitlements

Show:

- Current plan.
- Price and billing interval.
- Trial end date.
- Card verification status.
- Next payment date.
- Location count if relevant.
- Upgrade/downgrade effects.
- Cancellation consequences.
- Payment failure and recovery.

When a user reaches an Operations-only feature, explain the business outcome and exact plan difference. Do not show a generic lock without context. Do not interrupt a live sale with an upgrade modal.

## 19. Roles and permissions

Design for owner, manager, cashier/staff, and accountant where currently supported.

- Hide inaccessible navigation when it prevents confusion.
- Disable with explanation only when visibility is useful.
- Owners manage billing, fiscal setup, and team.
- Cashiers focus on POS and allowed till actions.
- Accountants receive relevant reports/exports, not operational controls.
- Permission errors must explain what role is required.

## 20. System states

Every important screen must include designs for:

- First-use empty state.
- Normal populated state.
- Loading/skeleton state.
- Inline validation.
- Recoverable error.
- Permission denied.
- Offline.
- Stale data.
- Success confirmation.
- Destructive confirmation.
- Long-running processing.

Avoid generic “Something went wrong.” State what failed, whether data was saved, and what the user can do next.

## 21. Responsive behavior

Design and verify at minimum:

- 390×844 mobile.
- 768×1024 tablet.
- 1280×800 laptop.
- 1440×900 desktop.

Requirements:

- No horizontal document overflow.
- No clipped Romanian words or button labels.
- No controls below inaccessible fixed regions.
- Touch targets at least 44×44px for critical touch actions.
- Tables convert intentionally on mobile; do not merely shrink.
- Fixed POS panels must retain stable dimensions.
- Keyboard appearance must not hide active mobile fields or submit actions.
- Safe-area support for in-app browsers.
- Test inside Facebook/Instagram in-app browser assumptions: limited viewport, keyboard, back navigation, and slow connection.

## 22. Accessibility

Meet WCAG 2.1 AA:

- Semantic heading order.
- One H1 per public page.
- Keyboard-complete navigation and dialogs.
- Visible focus states.
- Proper labels and descriptions.
- Error summaries linked to fields.
- Color is never the only status signal.
- Sufficient contrast.
- Reduced-motion support.
- Screen-reader announcements for sale completion, sync, and form status.
- Logical focus return after dialogs and sheets.

## 23. Design system deliverables

Create a documented system covering:

- Color tokens.
- Typography scale.
- Spacing scale.
- Borders, radius, elevation, and focus treatment.
- Icon usage.
- Buttons and icon buttons.
- Inputs, selects, textareas, checkboxes, switches, sliders, and segmented controls.
- Tables, list rows, filters, pagination, and bulk actions.
- Tabs, navigation, breadcrumbs, and account menus.
- Alerts, banners, badges, status indicators, toasts, and inline feedback.
- Dialogs, sheets, confirmation flows, and mobile drawers.
- Empty, loading, error, and permission states.
- POS product tile, cart line, payment selector, totals, and receipt status.
- Reporting metric, date control, reconciliation row, and export state.

Every component must include variants, responsive behavior, accessibility notes, content limits, and usage guidance.

## 24. Analytics alignment

Design the UI so these events map to explicit user actions:

Marketing:

- `landing_page_view`
- `cta_clicked`
- `contact_form_started`
- `contact_form_submitted`
- `trial_started`

Onboarding:

- `account_created`
- `location_created`
- `template_selected`
- `product_added`
- `fiscal_setup_started`
- `fiscal_setup_completed`
- `till_created`

Product:

- `till_opened`
- `sale_started`
- `sale_completed`
- `receipt_issued`
- `first_sale_recorded`
- `daily_close_completed`
- `raport_z_generated`

Revenue:

- `checkout_started`
- `payment_succeeded`
- `payment_failed`
- `subscription_started`
- `subscription_cancelled`

Do not add analytics interactions that do not correspond to real user intent. Exclude internal, test, and demo accounts from business reporting.

## 25. Reference principles

Use real references to study interaction patterns, not to copy branding:

- Square: operational dashboard hierarchy and clear POS actions.
- Lightspeed: domain-specific POS vocabulary and setup expectations.
- Modern self-service SaaS: direct trial CTA, visible price, and clear signup progression.
- FranchiseTech’s supplied product screenshots and in-location video: source of truth for the real product.

Do not imitate a foreign product and translate it. Start from Romanian owner workflows, terminology, fiscal constraints, and real FranchiseTech capabilities.

## 26. Required design process

1. Audit all existing routes, components, screenshots, role rules, entitlements, and feature flags.
2. Build a route and workflow inventory.
3. Mark each surface as keep, simplify, park, merge, redirect, or remove.
4. Map the core journey from landing page to daily close.
5. Identify inconsistencies and unsupported claims before visual work.
6. Define information architecture.
7. Define design tokens and core components.
8. Produce low-fidelity flows for the complete core journey.
9. Produce high-fidelity responsive designs.
10. Prototype the critical interactions.
11. Test with realistic Romanian data and long labels.
12. Run accessibility and responsive reviews.
13. Produce developer-ready specifications.

Do not begin by recoloring every existing screen. Resolve hierarchy, navigation, workflow, copy, and state behavior first.

## 27. Deliverables

Provide:

1. Product and UX audit with severity and evidence.
2. Keep/simplify/park/remove inventory.
3. Revised public and authenticated information architecture.
4. End-to-end flow maps for signup, onboarding, first sale, receipt, and daily close.
5. Responsive designs for all priority screens.
6. Component library and design tokens.
7. Prototype for the complete activation journey.
8. Copy deck in Romanian, with English equivalents where retained.
9. Empty/loading/error/offline/permission states.
10. Role and entitlement behavior matrix.
11. Accessibility review.
12. Developer handoff with dimensions, behavior, validation, and analytics annotations.
13. List of parked features and routes.
14. List of claims requiring business, technical, or legal verification.
15. Prioritized implementation plan split into safe phases.

## 28. Priority screens

Design these first:

1. Homepage.
2. Pricing.
3. Signup and €1 card-verification explanation.
4. Onboarding and product-template selection.
5. Application shell.
6. POS empty/open-sale/payment/completed/fiscal-failure states.
7. Product list and product editor.
8. Till open and till close.
9. Raport Z.
10. Owner dashboard.
11. Sales report and transaction detail.
12. Fiscal settings.
13. Billing/trial status.
14. Mobile versions of every critical step.

Only then continue to stock, purchases, recipes, team, and secondary settings.

## 29. Acceptance criteria

The redesign is complete only when:

- The public site explains what, for whom, how, and how much.
- Every primary marketing CTA starts self-service signup.
- Contact is clearly secondary.
- The €1 card verification is disclosed before signup completion.
- Core appears before Operations.
- KDS, table service, loyalty, restaurant-specific flows, and unvalidated integrations are absent from default public and new-user UX.
- A new user can reach the POS without navigating unrelated modules.
- The first sale flow is understandable without training.
- Saved-sale and fiscal-receipt states are visually distinct.
- Till close makes expected versus counted cash obvious.
- Romanian terminology is consistent.
- All critical screens have loading, empty, error, and permission states.
- No mobile overflow or clipped content exists at 390px.
- Keyboard and touch workflows work on tablet POS devices.
- The design meets WCAG 2.1 AA.
- Claims are factual and verifiable.
- The design can be implemented using the current Next.js, React, Tailwind, and shadcn architecture without rewriting business logic.

## Final instruction

Do not add more product surface. Redesign to make the existing core journey faster, clearer, and more trustworthy:

```text
Understand FranchiseTech
→ see price
→ start trial
→ verify card
→ create location
→ add products
→ configure fiscal setup
→ open till
→ complete first sale
→ issue receipt
→ close the day
→ understand the numbers
```

Every design decision must improve clarity, activation, reliability, repeated daily use, or trust. If it does not support one of those outcomes, remove it, park it, or make it secondary.
