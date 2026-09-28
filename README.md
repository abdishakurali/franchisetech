# franchise

FranchiseTech is a Romanian operations workspace for cafés, restaurants and
takeaways: POS, stock, recipes, purchases and daily closing in one application.

## Local development

```bash
npm ci
npm run dev
```

Open http://localhost:3000.

Run the checks before committing:

```bash
npx tsc --noEmit
npm test -- --run
npx playwright test
```

## Shared EC2 Docker deployment

See [the deployment runbook](docs/aws-shared-ec2.md). The application runs as a
standalone Next.js container behind one shared Caddy proxy, with a hostname and
volumes isolated per project.
# Google OAuth setup

FridgeProof supports email/password auth and Google sign-in through Supabase Auth.

Google sign-in is hidden unless `NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=true` is set. Keep it unset or `false` until the Google provider is enabled in Supabase; email/password login continues to work.

Founder demo tools are hidden unless `NEXT_PUBLIC_ENABLE_DEMO_TOOLS=true` is set. Leave it false/off for real customers.

In Supabase Dashboard -> Authentication -> Providers -> Google:
- Enable Google provider.
- Add the Google Client ID.
- Add the Google Client Secret.
- Copy the Google callback URL shown by Supabase for this provider. Do not guess it. It is usually shaped like `https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback`.

In Supabase Dashboard -> Authentication -> URL Configuration:
- Site URL: `https://fridgeproof.franchisetech.ro`
- Redirect URLs:
  - `https://fridgeproof.franchisetech.ro/auth/callback`
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3001/auth/callback`

In Google Cloud Console, create an OAuth Client ID:
- Application type: Web application.
- Authorized JavaScript origins:
  - `https://fridgeproof.franchisetech.ro`
  - `http://localhost:3000`
- Authorized redirect URIs:
  - Use the exact callback URL copied from Supabase Authentication -> Providers -> Google.
