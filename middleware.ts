import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import {
  MARKETING_LOCALE_COOKIE,
  isMarketingLocale,
  isRomanianMarketingHost,
} from '@/lib/marketing/locale'

export async function middleware(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get('lang')
  const response = await updateSession(request)
  const cookieOptions = {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax' as const,
  }

  if (isMarketingLocale(lang)) {
    response.cookies.set(MARKETING_LOCALE_COOKIE, lang, cookieOptions)
  } else {
    const existing = request.cookies.get(MARKETING_LOCALE_COOKIE)?.value
    const host = request.headers.get('host') ?? ''
    if (!isMarketingLocale(existing) && isRomanianMarketingHost(host)) {
      response.cookies.set(MARKETING_LOCALE_COOKIE, 'ro', cookieOptions)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
