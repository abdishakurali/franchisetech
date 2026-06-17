# Deployment Safety

## Golden rule

**Never build in the live directory.** Never run `pm2 restart`. Always use the release pipeline.

---

## Zero-downtime deploy process

### From Mac (standard deploy)

```bash
cd ~/Documents/Codex/2026-06-02/files-mentioned-by-the-user-pasted/work/fridgeproof
bash deploy.sh
```

The `deploy.sh` script:
1. Calls `scripts/predeploy-guard.sh` — blocks if brand/file guards fail
2. Rsyncs source to a new timestamped release on the server: `/var/www/fp-releases/releases/YYYYMMDD_HHMMSS/`
3. Calls `/var/www/fp-releases/build.sh <release_dir>` on the server
4. Server: `npm ci` → `npm run build` → validates `.next/BUILD_ID` exists
5. Server: atomic symlink swap `ln -sfn <new_release> /var/www/fp-releases/current`
6. Server: `pm2 reload fridgeproof --update-env` (rolling, zero-downtime)
7. Server: health check on `localhost:3001/`
8. Deploy script: smoke check on public routes

### Server-side components

| Script | Location | Purpose |
|---|---|---|
| `build.sh` | `/var/www/fp-releases/build.sh` | Installs deps, builds, swaps symlink, reloads PM2 |
| `rollback.sh` | `/var/www/fp-releases/rollback.sh` | Validates and switches to a prior release |

---

## Rollback process

```bash
ssh do-server 'bash /var/www/fp-releases/rollback.sh'
```

The rollback script:
1. Scans all releases in `/var/www/fp-releases/releases/`
2. Validates each one (see release validation below)
3. Lists valid targets; quarantines invalid ones
4. Prompts for confirmation
5. Switches symlink to target
6. `pm2 reload fridgeproof --update-env`
7. Health checks

To rollback to a specific release:
```bash
ssh do-server 'bash /var/www/fp-releases/rollback.sh 20260617_122603'
```

**Important:** Rollback switches the app code. It does NOT undo database migrations. Design migrations to be forwards-compatible so rollback is always safe.

---

## Release validation

A release passes validation if ALL of the following are true:

| Check | Command |
|---|---|
| `.next/BUILD_ID` exists | `[ -f .next/BUILD_ID ]` |
| `package.json` exists | `[ -f package.json ]` |
| `app/page.tsx` exists | `[ -f app/page.tsx ]` |
| Homepage contains `franchisetech` | `grep -q 'franchisetech' app/page.tsx` |
| Homepage does NOT contain `KitchenOps` | `! grep -q 'KitchenOps' app/page.tsx` |
| `components/marketing/MarketingShell.tsx` exists | `[ -f components/marketing/MarketingShell.tsx ]` |
| `public/franchise-tech-logo.png` exists | `[ -f public/franchise-tech-logo.png ]` |

Use the shared validator:
```bash
# On server:
bash /var/www/fp-releases/releases/<name>/scripts/validate-release.sh /var/www/fp-releases/releases/<name>

# Or from Mac (local source):
bash scripts/validate-release.sh /var/www/fp-releases/releases/<name>
# (requires SSH access to do-server)
```

---

## Current release context

| Key | Value |
|---|---|
| Current good release | `20260617_122603` |
| Release path | `/var/www/fp-releases/releases/20260617_122603` |
| Current symlink | `/var/www/fp-releases/current` |
| PM2 app name | `fridgeproof` |
| Port | `3001` |

---

## Quarantine rules

A release is quarantined (not offered for rollback) if:
- `.next/BUILD_ID` is missing (build never completed)
- `components/marketing/MarketingShell.tsx` is missing
- `public/franchise-tech-logo.png` is missing
- `app/page.tsx` contains `KitchenOps`
- `app/page.tsx` does not contain `franchisetech`

**Known quarantined releases as of 2026-06-17:**
- `20260617_121312` — missing logo
- `20260617_120841` — no .next build
- `20260617_114952` — missing MarketingShell.tsx
- `20260617_114135` — no .next build

---

## Brand guard rules

The pre-deploy guard (`scripts/predeploy-guard.sh`) blocks deploy if:

1. `app/page.tsx`, `app/pricing/page.tsx`, or `app/layout.tsx` contain `KitchenOps` or `Simple POS and operations for small food businesses`
2. `app/page.tsx` does not contain `franchisetech`
3. Any of these required files are missing from local source:
   - `components/marketing/MarketingShell.tsx`
   - `components/marketing/JsonLd.tsx`
   - `app/page.tsx`
   - `app/pricing/page.tsx`
   - `app/industries/page.tsx`
   - `app/help/page.tsx`
   - `public/franchise-tech-logo.png`
   - `supabase/migrations/035_purchase_inventory_model.sql`
4. Protected paths are modified:
   - `public/downloads/`
   - `fp-android/`
   - `android-connector/`
   - any `.apk` file

---

## Required public routes

All of these must return the indicated HTTP status after every deploy:

| Route | Required status |
|---|---|
| `/` | 200 |
| `/pricing` | 200 |
| `/help` | 200 |
| `/industries` | 200 |
| `/industries/cafes` | 200 |
| `/features` | 200 |
| `/resources` | 200 |
| `/login` | 200 |
| `/signup` | 200 |
| `/app/pos` | 200 or 307 |
| `/app/settings` | 200 or 307 |

Logo asset: `https://franchisetech.ro/franchise-tech-logo.png` must return 200.

---

## Banned commands

Never run these:

```bash
cd /var/www/fridgeproof && npm run build       # builds in live dir
cd /var/www/fridgeproof && rm -rf .next        # destroys live build
pm2 restart fridgeproof                        # hard restart
pm2 restart all                                # affects all apps
pm2 stop fridgeproof                           # takes site offline
```

If you see these in a script, that script is wrong. Use the release pipeline instead.

---

## Stale local source

The Mac source can drift from the server. Before deploying after a gap:

```bash
# Sync specific paths from server that may have changed:
rsync -av do-server:/var/www/fridgeproof/app/ \
  ~/Documents/Codex/.../fridgeproof/app/

rsync -av do-server:/var/www/fridgeproof/components/ \
  ~/Documents/Codex/.../fridgeproof/components/

rsync -av do-server:/var/www/fridgeproof/public/ \
  ~/Documents/Codex/.../fridgeproof/public/
```

The pre-deploy guard catches the most common stale-source problems (missing required files, KitchenOps branding). But it cannot detect all possible drift — sync from server when in doubt.

---

## Emergency deploy (skipping interactive guard)

If you must deploy without interactive confirmation (e.g., automated CI), set:

```bash
PREDEPLOY_NONINTERACTIVE=1 bash deploy.sh
```

This passes `--non-interactive` to guard checks that would normally prompt. Guards that block (not prompt) still block.

This flag must be documented in the commit or PR that uses it. Do not use it routinely.
