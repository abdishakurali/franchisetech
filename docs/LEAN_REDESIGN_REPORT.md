# Lean redesign report

## Public product changes

- Rebuilt the homepage around one outcome: sell quickly and close the day clearly.
- Added real POS proof from the supplied screenshot and in-location video.
- Reduced public pricing to Core (€49/location/month) and Operations (€79/location/month).
- Removed the restaurant page, KDS, table service, loyalty, advanced reports, and unvalidated integrations from the primary public journey.
- Added a five-field Romanian contact/demo form with consent, validation, honeypot protection, status states, email delivery, and analytics.
- Added the `/web/login` redirect and a Romanian 404 page.

## Removed code

- Third-party support widget, configuration, hooks, types, styles, environment variables, support buttons, and documentation.
- Physical drawer command UI, API routes, services, types, FiscalNet commands, translations, tests, and audit pages.
- Database tables and migrations were deliberately retained.

## SEO and analytics

- Updated the Romanian homepage title, description, canonical metadata, sitemap, and robots output.
- Removed parked feature and restaurant URLs from the sitemap.
- Added contact and demo events plus `landing_page_view`, `cta_clicked`, `till_opened`, `sale_started`, `sale_completed`, `receipt_issued`, and `raport_z_generated`.
- Added account classification for internal, test, demo, and real-customer activity.

## Performance comparison

- Hero screenshot: 1.9 MB PNG to 33 KB WebP.
- In-location video: 10 MB source to 791 KB mobile MP4.
- Production build: passed with 283 static pages generated.
- Mobile verification: 390 px viewport and 390 px document width on homepage and contact page.

## Claims requiring verification

- Exact supported fiscal-register and printer models.
- Saga, e-Factura, QR receipt, offline sync, and delivery integration production reliability before renewed promotion.
- Any SLA, uptime percentage, certification, or broad fiscal-compliance wording.
- Unlimited-user fair-use limits and whether every setup case is free.
- Final VAT treatment and third-party FiscalNet, hardware, payment-provider, or integration fees.

## Verification

- `npm run typecheck`: passed.
- `npm run verify-lean-product-scope`: passed.
- `npm run build`: passed.
- Focused lint: new marketing/contact files passed; two existing React Compiler errors remain in `PosRegister.tsx`.
- Contact validation and honeypot responses: passed.
- No third-party support-widget references or network requests found.
