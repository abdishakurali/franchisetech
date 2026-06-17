import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getActiveOrg } from "@/lib/kitchenops/data";
import { canManageTeam } from "@/lib/access-control";

function makeAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(_req: Request, { params }: { params: Promise<{ memberId: string }> }) {
  try {
    const { memberId } = await params;
    const { membership, user, orgId } = await getActiveOrg();
    if (!canManageTeam(membership.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const admin = makeAdminClient();
    const { data: member } = await admin
      .from("organisation_members")
      .select("id,role,user_id,status")
      .eq("id", memberId)
      .eq("organisation_id", orgId)
      .maybeSingle();

    if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (member.user_id === user.id) {
      return NextResponse.json({ error: "Cannot disable yourself" }, { status: 400 });
    }

    const disable = member.status !== "disabled";
    await admin.from("organisation_members").update({
      status: disable ? "disabled" : "active",
      disabled_at: disable ? new Date().toISOString() : null,
    }).eq("id", memberId).eq("organisation_id", orgId);

    await admin.from("team_audit_events").insert({
      organisation_id: orgId,
      actor_user_id: user.id,
      target_user_id: member.user_id,
      action: disable ? "user_disabled" : "user_reactivated",
    });

    return NextResponse.json({ success: true, disabled: disable });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
