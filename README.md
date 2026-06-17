This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
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
