import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const t0 = Date.now();
  try {
    const supabase = await createClient();
    const t1 = Date.now();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    const t2 = Date.now();
    if (!user) return NextResponse.json({ step: 'no_user', authError: authError?.message, ms: { client: t1-t0, getUser: t2-t1 } });
    const { data: membership, error: memError } = await supabase
      .from('organisation_members')
      .select('organisation_id, role, organisations(id, name, business_type)')
      .eq('user_id', user.id)
      .limit(1)
      .single();
    const t3 = Date.now();
    return NextResponse.json({ 
      ok: !!membership, 
      orgId: membership?.organisation_id,
      memError: memError?.message,
      ms: { client: t1-t0, getUser: t2-t1, membership: t3-t2, total: t3-t0 }
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e), ms: Date.now() - t0 });
  }
}
