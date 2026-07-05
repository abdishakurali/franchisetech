import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getActiveOrg } from "@/lib/kitchenops/data";
import { canManageTeam, isDbRole } from "@/lib/access-control";
import { assertEntitlement, entitlementDeniedResponse } from "@/lib/billing/entitlement-resolver";

const ADVANCED_ROLES = new Set(["manager", "auditor", "kitchen"]);

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

    const body = await req.json() as { role?: string; fullName?: string; phone?: string; roleTitle?: string; email?: string; password?: string };
    const { role, fullName, phone, roleTitle, email, password } = body;
    if (role && !isDbRole(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (role === "owner" && membership.role !== "owner") {
      return NextResponse.json({ error: "Only owners can assign the owner role" }, { status: 403 });
    }
    if (role && ADVANCED_ROLES.has(role)) {
      try {
        await assertEntitlement(orgId, "team.advanced_roles");
      } catch (error) {
        const response = entitlementDeniedResponse(error);
        if (response) return response;
        throw error;
      }
    }

    const admin = makeAdminClient();
    const { data: member } = await admin
      .from("organisation_members")
      .select("id,role,user_id")
      .eq("id", memberId)
      .eq("organisation_id", orgId)
      .maybeSingle();

    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });
    if (member.role === "owner" && membership.role !== "owner") {
      return NextResponse.json({ error: "Only owners can change another owner" }, { status: 403 });
    }

    if (role) {
      const { error: updateError } = await admin
        .from("organisation_members")
        .update({ role })
        .eq("id", memberId)
        .eq("organisation_id", orgId);
      if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

      if (role !== member.role) {
        await admin.from("team_audit_events").insert({
          organisation_id: orgId,
          actor_user_id: user.id,
          target_user_id: member.user_id,
          action: "role_changed",
          old_role: member.role,
          new_role: role,
        });
      }
    }

    if (email || password) {
      const authUpdates: { email?: string; password?: string } = {};
      if (email) authUpdates.email = email.trim().toLowerCase();
      if (password) {
        if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
        authUpdates.password = password;
      }
      const { error: authError } = await admin.auth.admin.updateUserById(member.user_id, authUpdates);
      if (authError) return NextResponse.json({ error: authError.message }, { status: 500 });

      if (email) {
        await admin.from("profiles").update({ email: email.trim().toLowerCase() }).eq("id", member.user_id);
      }
      await admin.from("team_audit_events").insert({
        organisation_id: orgId,
        actor_user_id: user.id,
        target_user_id: member.user_id,
        action: email && password ? "email_and_password_changed" : email ? "email_changed" : "password_changed",
      });
    }

    if (fullName !== undefined || phone !== undefined || roleTitle !== undefined) {
      const profileUpdates: Record<string, string | null> = {};
      if (fullName !== undefined) profileUpdates.full_name = fullName || null;
      if (phone !== undefined) profileUpdates.phone = phone || null;
      if (roleTitle !== undefined) profileUpdates.role_title = roleTitle || null;

      const { error: profileError } = await admin
        .from("profiles")
        .update(profileUpdates)
        .eq("id", member.user_id);
      if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });

      await admin.from("team_audit_events").insert({
        organisation_id: orgId,
        actor_user_id: user.id,
        target_user_id: member.user_id,
        action: "profile_updated",
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ memberId: string }> }) {
  try {
    const { memberId } = await params;
    const { membership, user, orgId } = await getActiveOrg();
    if (!canManageTeam(membership.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const admin = makeAdminClient();
    const { data: member } = await admin
      .from("organisation_members")
      .select("id,role,user_id")
      .eq("id", memberId)
      .eq("organisation_id", orgId)
      .maybeSingle();

    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });
    if (member.user_id === user.id) {
      return NextResponse.json({ error: "You cannot remove yourself" }, { status: 400 });
    }
    if (member.role === "owner" && membership.role !== "owner") {
      return NextResponse.json({ error: "Only owners can remove another owner" }, { status: 403 });
    }

    // Prevent removing the last owner
    if (member.role === "owner") {
      const { count } = await admin
        .from("organisation_members")
        .select("id", { count: "exact", head: true })
        .eq("organisation_id", orgId)
        .eq("role", "owner")
        .eq("status", "active");
      if ((count ?? 0) <= 1) {
        return NextResponse.json({ error: "Cannot remove the only owner" }, { status: 400 });
      }
    }

    const { error: deleteError } = await admin
      .from("organisation_members")
      .delete()
      .eq("id", memberId)
      .eq("organisation_id", orgId);
    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

    await admin.from("team_audit_events").insert({
      organisation_id: orgId,
      actor_user_id: user.id,
      target_user_id: member.user_id,
      action: "member_removed",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
