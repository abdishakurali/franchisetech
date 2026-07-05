import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const appOrigin = process.env.NEXT_PUBLIC_APP_URL ?? origin
  const code = searchParams.get('code')
  const next = searchParams.get('next')
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : null

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      if (safeNext) return NextResponse.redirect(`${appOrigin}${safeNext}`)

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: membership } = await supabase
          .from('organisation_members')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle()
        return NextResponse.redirect(`${appOrigin}${membership ? '/app' : '/onboarding'}`)
      }
    }
  }

  return NextResponse.redirect(`${appOrigin}/login?error=auth_callback_failed`)
}
