import { cache } from 'react'
import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// cache() memoizes this for the lifetime of one request only (React's
// per-render dedup, not a cross-request cache) — every caller within the
// same request gets the same client instance instead of re-reading cookies
// and re-constructing a client each time. This is what lets getActiveOrg(),
// fetchOrgModuleFlags(), etc. below dedupe correctly by argument identity,
// since they all end up sharing this one client reference per request.
export const createClient = cache(async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server component — ignore
          }
        },
      },
    }
  )
})

// cache()-wraps the auth round-trip itself (a call to the Supabase auth
// server, not just a local Postgres query) so every call site within one
// request shares a single result — app/app/layout.tsx and getActiveOrg()
// (lib/kitchenops/data.ts) used to each call supabase.auth.getUser()
// independently, doubling that round-trip on nearly every /app/* navigation.
export const getAuthUser = cache(async function getAuthUser() {
  const supabase = await createClient()
  return supabase.auth.getUser()
})

/**
 * Anon-key client with no cookie/session plumbing at all — safe to call
 * from contexts that have no HTTP request (generateStaticParams,
 * sitemap.ts), where next/headers' cookies() would throw. Still respects
 * RLS via the anon key, same as createClient() — only difference is it
 * never reads/writes a user session, which public-data reads don't need.
 */
export function createPublicClient() {
  return createSupabaseJsClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  )
}

export async function createServiceClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase service client is not configured");
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // Service-role clients must not read or write user session cookies.
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  )
}
