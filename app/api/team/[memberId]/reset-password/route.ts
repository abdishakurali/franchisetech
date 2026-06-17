import { NextRequest, NextResponse } from "next/server";
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

export async function POST(req: NextRequest, { params }: { params: Promise<{ memberId: string }> }) {
  try {
    const { memberId } = await params;
    const { membership, user, orgId } = await getActiveOrg();
    if (!canManageTeam(membership.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json() as { temporaryPassword?: string };
    const { temporaryPassword } = body;

    const admin = makeAdminClient();

    const { data: member } = await admin
      .from("organisation_members")
      .select("id,user_id")
      .eq("id", memberId)
      .eq("organisation_id", orgId)
      .maybeSingle();

    if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: profile } = await admin
      .from("profiles")
      .select("email")
      .eq("id", member.user_id)
      .maybeSingle();

    if (!profile?.email) return NextResponse.json({ error: "No email on record" }, { status: 400 });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://franchisetech.ro";
    const redirectTo = `${appUrl}/auth/callback`;

    let resetLink: string | null = null;

    if (temporaryPassword) {
      await admin.auth.admin.updateUserById(member.user_id, {
        password: temporaryPassword,
        email_confirm: true,
      });
      await admin.from("team_audit_events").insert({
        organisation_id: orgId,
        actor_user_id: user.id,
        target_user_id: member.user_id,
        action: "temporary_password_set",
        metadata: { email: profile.email },
      });
    } else {
      // Generate magic link and also send email
      const { data: linkData } = await admin.auth.admin.generateLink({
        type: "recovery",
        email: profile.email,
        options: { redirectTo },
      });
      resetLink = linkData?.properties?.action_link ?? null;
      await admin.from("team_audit_events").insert({
        organisation_id: orgId,
        actor_user_id: user.id,
        target_user_id: member.user_id,
        action: "password_reset_link_generated",
        metadata: { email: profile.email },
      });
    }

    return NextResponse.json({ success: true, resetLink });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
