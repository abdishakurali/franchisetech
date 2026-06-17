import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getActiveOrg } from "@/lib/kitchenops/data";
import { canManageTeam, isDbRole } from "@/lib/access-control";

function makeAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ memberId: string }> }) {
  try {
    const { memberId } = await params;
    const { membership, user, orgId } = await getActiveOrg();
    if (!canManageTeam(membership.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json() as { role?: string };
    const { role } = body;
    if (role && !isDbRole(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (role === "owner" && membership.role !== "owner") {
      return NextResponse.json({ error: "Only owners can assign the owner role" }, { status: 403 });
    }

    const admin = makeAdminClient();
    const { data: member } = await admin
      .from("organisation_members")
      .select("id,role,user_id")
      .eq("id", memberId)
      .eq("organisation_id", orgId)
      .maybeSingle();

    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

    const updates: Record<string, unknown> = {};
    if (role) updates.role = role;
    await admin.from("organisation_members").update(updates).eq("id", memberId).eq("organisation_id", orgId);

    if (role && role !== member.role) {
      await admin.from("team_audit_events").insert({
        organisation_id: orgId,
        actor_user_id: user.id,
        target_user_id: member.user_id,
        action: "role_changed",
        old_role: member.role,
        new_role: role,
      });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
