# Onboarding finding — 2026-11-13 screen recording

Source: owner's screen recording `Screen Recording 2026-11-13 at 11.17.16.mov` (92 s, no speech; frames read every 2 s).
DB check (read-only): org `cafea prajita` created 2026-11-13 11:17:50 UTC, `anaf_vat_registered = false`, `anaf_cif = null`, 1 product, VAT rate `0`.

## What the recording shows

1. `/` → "Încercați gratuit 15 zile" → `/signup?plan=growth`. Signup is the cream/brass marketing look (serif "Casa se potrivește cu sertarul — creează cont", brass button). First email already existed ("Există deja un cont cu acest email"), second one worked.
2. `/onboarding` step 1 "Firma" is a different visual system: grey app shell, sans font, black buttons. He picks "Takeaway", leaves CUI empty, **leaves "Plătitor de TVA" unchecked** (it defaults to unchecked), types a name.
3. Step 2 "Funcționalități": ticks Rețete → Stoc is ticked and greyed out ("Rețetele folosesc și gestiunea stocului"). Ticks Achiziții.
4. Step 3 "Meniu": **the VAT choice offers only one option, "0% Scutit 0%"**, with "Firma este setată ca neplătitoare de TVA, așa că este disponibilă doar cota 0%. Puteți schimba această setare în Setări." He adds "capucino mick" 12 lei.
5. Step 4 FiscalNet: toggles Live/Test, chooses "Continuă în mod test".
6. First sale in POS (card, 12 RON), step 6 "Gata", dashboard.

## The restriction

The VAT-payer status is decided by an unchecked checkbox nobody is asked to think about, and it then locks the whole menu to 0% VAT:

- `app/onboarding/page.tsx:84` — `anafVatRegistered: false` default; `:277-285` is a small plain checkbox under an *optional* CUI field. Skipping the CUI (allowed) means the owner never confirms VAT status.
- `app/actions/onboarding.ts:195` — saved as `anaf_vat_registered`.
- `app/onboarding/menu/page.tsx:52-56` — rates filtered through `validateVatRateForOrg`, so only 0% is selectable; `:71` sets `vatRestrictedToZero`.
- `components/onboarding/MenuBuilder.tsx:37` — the "doar cota 0%" note, which sends the owner to Settings mid-onboarding.

Effect: a VAT-registered café that skips the CUI ends onboarding with every product at 0% VAT. In test mode that is harmless; once FiscalNet goes live those receipts would print the wrong VAT. The owner cannot fix it inside onboarding.

Secondary (the "mixed design"): `/signup` uses the marketing brass/serif identity, `/onboarding/*` deliberately uses the neutral `.app-shell` (comment at `components/onboarding/OnboardingShell.tsx:16-21`), and step 2 checkboxes are brass while buttons are black. Signup → step 1 looks like two different products.

## Proposed fix (not implemented — needs owner approval)

Not implemented on this branch because it changes how an org's VAT status is set, which flows into fiscal receipts (CLAUDE.md: VAT/fiscal changes need sign-off).

1. Step 1: replace the checkbox with a required Da / Nu question, "Firma este plătitoare de TVA?", no default; block "Continuă" until answered. If a CUI is looked up, prefill from ANAF (already done at `page.tsx:160`) but still show the answer.
2. Step 3: when the org is non-VAT, replace the dead-end note with an inline "Firma mea este plătitoare de TVA — schimbă" link that flips the setting and reloads the rates, instead of sending the owner to Settings.
3. Optional, cosmetic: bring signup and onboarding onto one look (either signup on `.app-shell`, or onboarding header/buttons on brass). Pure CSS, no risk; say which direction you want.

No change to VAT calculation, rates or historical data in any of the above.
