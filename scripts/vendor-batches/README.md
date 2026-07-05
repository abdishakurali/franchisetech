# Vendor directory batch files

Each file here is a reviewable batch of up to 25 HoReCa vendor entries, following the naming convention `YYYY-MM-DD-category-slug.json` (e.g. `2026-07-04-coffee-equipment.json`).

## Workflow

1. Research and write a batch as a JSON array (schema below), citing a primary source for every entry — the vendor's own website, ONRC/trade registry, or reputable Romanian business press. Never use generic listing sites (Cylex, Kompass, etc.) as a source of truth; only to discover a name to then verify directly.
2. Commit the batch file in a PR. The diff is the review artifact — a human reviewer spot-checks every website URL, confirms `logo_source_url` is on the same domain as `website_url`, confirms the category assignment, and confirms `contact_email`/`contact_phone` (if present) come from the vendor's own site, never from registry data.
3. On merge, run:
   ```bash
   node scripts/publish-vendor-batch.mjs --batch=scripts/vendor-batches/2026-07-04-coffee-equipment.json --reviewer=you@franchisetech.ro
   ```
   `--reviewer` must be on the `AUTHORIZED_VENDOR_REVIEWERS` allowlist (env var, comma-separated staff emails) AND resolve to a real `profiles` row — both checks must pass, or the script refuses to run.
4. The script downloads each logo from `logo_source_url`, validates it's actually an image and under 2MB, checks the domain matches `website_url`, re-hosts it to Supabase Storage, and upserts the vendor (matched on `slug`) with `reviewed_by`/`reviewed_at` set — only rows with these set, and `verification_status` of `listed` or `verified_partner`, are ever publicly visible.
5. Re-verification uses the same shape: a new batch file with updated `last_checked`/fields, reviewed via PR, published via the same script (upsert on `slug`).

## Batch entry schema

```jsonc
{
  "legal_name": "Example SRL",                 // required — must be a real, verified legal name. Never a placeholder like
                                                // "unconfirmed — possible match X" or a review note; if the legal name can't
                                                // be verified yet, leave the entry out of the batch rather than putting a
                                                // note in a fact field (the publish script only checks presence, not content).
  "brand_name": "Example",                     // optional, if different from legal_name
  "cui": "12345678",                            // optional, from ONRC. BARE DIGITS ONLY — no "RO" prefix, to match every
                                                 // already-published vendor. If the vendor's own site doesn't disclose a CUI,
                                                 // it may be corroborated via an independent registry (termene.ro, risco.ro,
                                                 // confidas.ro, etc.) ONLY if the match is unambiguous — exact address match,
                                                 // or the domain name itself encodes the exact legal entity name. Never a
                                                 // same-name guess (see the Adelin Impex case: two unrelated companies with
                                                 // the same name in different counties — dropped rather than guessed). Note
                                                 // which corroboration method was used in that source's `note` field.
  "slug": "example",                            // required, unique, url-safe
  "category": "coffee_equipment",               // required, one of lib/marketing/vendor-categories.ts VENDOR_CATEGORY_SLUGS
  "subcategories": ["espresso-machines"],       // optional — free-text refinements WITHIN this vendor's single assigned
                                                 // category, not other top-level category slugs (this schema doesn't support
                                                 // a vendor belonging to multiple categories; pick the one gap-filling
                                                 // category and mention breadth in the description instead)
  "description": "Factual, own-words description — never copied verbatim from marketing copy.",
  "website_url": "https://example.ro",          // required
  "hq_city": "Cluj-Napoca",                      // optional
  "logo_source_url": "https://example.ro/logo.png", // required — MUST be on the same domain as website_url
  "logo_background": "light",                    // optional, default "light". Set to "dark" ONLY if you've actually loaded
                                                  // the image and it's white-on-transparent / designed for a dark navbar —
                                                  // don't guess from file type or vendor branding alone.
  "contact_email": "contact@example.ro",         // optional — ONLY from the vendor's own published site, never registry data
  "contact_phone": "+40 000 000 000",            // optional — same rule as contact_email
  "verification_status": "listed",               // "listed" or "verified_partner" (default "listed" if omitted)
  "last_checked": "2026-07-04",
  "counties": ["cluj", "bucuresti"],             // LOWERCASE SLUGS from ro_counties (e.g. "satu-mare", "bucuresti") — never
                                                  // the spelled-out/capitalized name ("Satu Mare", "București"). A wrong
                                                  // format here fails silently: the vendor still publishes, it just gets zero
                                                  // county associations recorded, since the publish script doesn't currently
                                                  // check for errors on this specific insert.
  "serves_all_counties": false,                  // optional, default false. Self-reported "delivers nationally" claim from the
                                                  // vendor's own marketing copy — NOT the same as verified `counties`. If true,
                                                  // the vendor renders on every county page for its category regardless of
                                                  // `counties`. Only set this from an explicit claim on the vendor's own site
                                                  // ("livrare în toată țara" or similar) — don't infer it from silence.
  "sources": [
    { "kind": "official_site", "url": "https://example.ro", "checked_at": "2026-07-04" },
    { "kind": "onrc", "url": "https://listafirme.ro/example-srl", "note": "CUI confirmed", "checked_at": "2026-07-04" }
  ]
}
```
