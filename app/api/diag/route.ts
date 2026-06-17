import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "not authenticated", authErr: authErr?.message });
    
    const { data: membership, error: memErr } = await supabase
      .from("organisation_members")
      .select("organisation_id, role")
      .eq("user_id", user.id)
      .limit(1)
      .single();
    
    if (!membership) return NextResponse.json({ error: "no membership", memErr: memErr?.message });
    
    const orgId = membership.organisation_id;
    
    const { data: suppliers, error: suppErr } = await supabase
      .from("suppliers")
      .select("id,name")
      .eq("organisation_id", orgId)
      .limit(5);
    
    return NextResponse.json({
      ok: true,
      userId: user.id,
      orgId,
      role: membership.role,
      suppliers: suppliers ?? [],
      suppErr: suppErr?.message
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) });
  }
}
