import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { MARKETING_LOCALE_COOKIE, isMarketingLocale } from '@/lib/marketing/locale'

export async function middleware(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get('lang')
  const response = await updateSession(request)

  if (isMarketingLocale(lang)) {
    response.cookies.set(MARKETING_LOCALE_COOKIE, lang, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
