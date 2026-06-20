import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  if (!supabaseUrl || !supabaseKey) {
    // Env vars missing (build env); treat as unauthenticated
    const url = request.nextUrl.clone()
    if (url.pathname.startsWith('/app')) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    return NextResponse.next({ request })
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request: { headers: requestHeaders },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const isAppRoute = url.pathname.startsWith('/app')
  const isAuthRoute = url.pathname.startsWith('/login') || url.pathname.startsWith('/signup')

  if (!user && isAppRoute) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    url.pathname = '/app'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
