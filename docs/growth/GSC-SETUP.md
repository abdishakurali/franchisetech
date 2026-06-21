# Google Search Console — franchisetech.ro

Manual setup (~30 min). Required once; then weekly checks in GSC.

## 1. Verify property

1. Open [Google Search Console](https://search.google.com/search-console).
2. Add property: **URL prefix** `https://franchisetech.ro` (or Domain property if you control DNS).
3. Choose **HTML tag** verification.
4. Copy the `content=` value from the meta tag.
5. Set in production env (and `.env.local` for preview):

```bash
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-token-here
```

6. Redeploy so `app/layout.tsx` emits the verification meta tag.
7. Click **Verify** in GSC.

## 2. Submit sitemap

After verification:

- **Sitemap URL:** `https://franchisetech.ro/sitemap.xml`
- GSC → Sitemaps → add the URL above → Submit.

The sitemap includes compare pages, RO resources, industries, and help articles (~66 paths × locale alternates).

## 3. Request indexing (priority URLs)

Use **URL Inspection** → **Request indexing** for these (once after deploy):

See `docs/growth/index-priority-urls.txt` for the canonical list.

High priority:

- `https://franchisetech.ro/compare`
- `https://franchisetech.ro/compare/smartbill`
- `https://franchisetech.ro/compare/saga`
- `https://franchisetech.ro/industries/romania`
- `https://franchisetech.ro/resources/choose-pos-romania`
- `https://franchisetech.ro/resources/objections-pos-romania`
- `https://franchisetech.ro/help/romania-fiscalnet`
- `https://franchisetech.ro/partners`

Add `?lang=ro` in marketing links; indexed URLs are locale-neutral paths above.

## 4. Weekly monitoring (5 min)

| Check | Where | Target |
|-------|--------|--------|
| Compare impressions | Performance → Pages filter `/compare` | Rising week over week |
| Index coverage | Pages → Indexed | No spike in “Excluded” |
| Sitemap | Sitemaps | Success, discovered URLs > 0 |

Export impressions for compare pages into your weekly growth spreadsheet (see `docs/growth/WEEKLY-METRICS.md`).

## 5. llms.txt / AI crawlers

Already live:

- `https://franchisetech.ro/llms.txt`
- `https://franchisetech.ro/llms-full.txt`

No GSC action needed; optional spot-check in server logs for GPTBot / ClaudeBot hits.
