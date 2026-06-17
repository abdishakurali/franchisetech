import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getActiveOrg } from "@/lib/kitchenops/data";
import { DB_ROLES, canManageTeam, type DbRole } from "@/lib/access-control";

const VALID_ROLES = DB_ROLES;
type Role = DbRole;

function makeAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// GET /api/team
export async function GET() {
  try {
    const { membership, orgId } = await getActiveOrg();
    if (!canManageTeam(membership.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Use admin client so we can read all profiles without RLS blocking
    const admin = makeAdminClient();

    const { data: members, error } = await admin
      .from("organisation_members")
      .select("id,user_id,role,status,created_at,invited_by,disabled_at")
      .eq("organisation_id", orgId)
      .order("created_at");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const userIds = (members ?? []).map((m) => m.user_id);
    const { data: profiles } = await admin
      .from("profiles")
      .select("id,full_name,email,role_title,phone")
      .in("id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);

    const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));
    const result = (members ?? []).map((m) => ({
      ...m,
      profile: profileMap[m.user_id] ?? null,
    }));
    return NextResponse.json({ members: result });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// POST /api/team — create or add a team member
export async function POST(req: NextRequest) {
  try {
    const { membership, user, orgId } = await getActiveOrg();
    if (!canManageTeam(membership.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { email, fullName, role, phone, temporaryPassword, sendInvite } = body as {
      email: string;
      fullName: string;
      role: Role;
      phone?: string;
      temporaryPassword?: string;
      sendInvite?: boolean;
    };

    if (!email || !fullName || !role) {
      return NextResponse.json({ error: "email, fullName, and role are required" }, { status: 400 });
    }
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (role === "owner" && membership.role !== "owner") {
      return NextResponse.json({ error: "Only owners can add other owners" }, { status: 403 });
    }

    const admin = makeAdminClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://franchisetech.ro";
    const redirectTo = `${appUrl}/auth/callback`;

    // ── Check if auth user already exists ──────────────────────────────────
    const { data: existingList } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existingAuthUser = existingList?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    let authUserId: string;
    let resultStatus: "created" | "added_existing";
    let resetLink: string | null = null;

    if (existingAuthUser) {
      // ── EXISTING USER ───────────────────────────────────────────────────
      authUserId = existingAuthUser.id;
      resultStatus = "added_existing";

      if (temporaryPassword) {
        // Set a temporary password (user must change after login)
        await admin.auth.admin.updateUserById(authUserId, {
          password: temporaryPassword,
          email_confirm: true,
        });
      } else if (sendInvite) {
        // Generate a password reset link so the existing user can set a new password
        const { data: linkData } = await admin.auth.admin.generateLink({
          type: "recovery",
          email,
          options: { redirectTo },
        });
        resetLink = linkData?.properties?.action_link ?? null;
      }
    } else {
      // ── NEW USER ────────────────────────────────────────────────────────
      if (temporaryPassword) {
        // Create with explicit password, confirm email immediately
        const { data: newUser, error: createError } = await admin.auth.admin.createUser({
          email,
          password: temporaryPassword,
          email_confirm: true,
          user_metadata: { full_name: fullName },
        });
        if (createError || !newUser?.user) {
          return NextResponse.json({ error: createError?.message ?? "Failed to create user" }, { status: 500 });
        }
        authUserId = newUser.user.id;
      } else {
        // Send invite email via Supabase — this emails the user automatically
        const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
          redirectTo,
          data: { full_name: fullName },
        });
        if (inviteError || !invited?.user) {
          return NextResponse.json({ error: inviteError?.message ?? "Failed to invite user" }, { status: 500 });
        }
        authUserId = invited.user.id;
        // Also get the generated link to show in the UI as a fallback
        const { data: linkData } = await admin.auth.admin.generateLink({
          type: "invite",
          email,
          options: { redirectTo },
        });
        resetLink = linkData?.properties?.action_link ?? null;
      }
      resultStatus = "created";
    }

    // ── Upsert profile (must use admin client — RLS blocks cross-user inserts) ──
    await admin.from("profiles").upsert({
      id: authUserId,
      email,
      full_name: fullName,
      phone: phone ?? null,
    }, { onConflict: "id" });

    // ── Org membership ──────────────────────────────────────────────────────
    const { data: existingMember } = await admin
      .from("organisation_members")
      .select("id,status")
      .eq("organisation_id", orgId)
      .eq("user_id", authUserId)
      .maybeSingle();

    if (existingMember) {
      const { error: memberUpdateError } = await admin
        .from("organisation_members")
        .update({ role, status: "active", disabled_at: null })
        .eq("id", existingMember.id);
      if (memberUpdateError) {
        return NextResponse.json(
          { error: `Failed to update membership: ${memberUpdateError.message}` },
          { status: 500 }
        );
      }
    } else {
      const { error: memberInsertError } = await admin
        .from("organisation_members")
        .insert({
          organisation_id: orgId,
          user_id: authUserId,
          role,
          status: "active",
          invited_by: user.id,
        });
      if (memberInsertError) {
        return NextResponse.json(
          { error: `Failed to create membership: ${memberInsertError.message}` },
          { status: 500 }
        );
      }
    }

    // ── Audit ───────────────────────────────────────────────────────────────
    await admin.from("team_audit_events").insert({
      organisation_id: orgId,
      actor_user_id: user.id,
      target_user_id: authUserId,
      action: existingMember ? "user_added_to_org" : "user_created",
      new_role: role,
      metadata: { email, fullName },
    });

    return NextResponse.json({ status: resultStatus, userId: authUserId, role, resetLink });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
