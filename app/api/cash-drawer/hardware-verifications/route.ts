import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { assertEntitlement, entitlementDeniedResponse } from "@/lib/billing/entitlement-resolver";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      organisationId,
      terminalId,
      locationId,
      verificationSource,
      verifiedAt,
      connectorVersion,
      printerIp,
      notes,
    } = body;

    if (!organisationId) {
      return NextResponse.json(
        { error: "organisationId is required" },
        { status: 400 }
      );
    }

    const source = (verificationSource as string) || "human_setup_confirmation";
    const allowedSources = ["human_setup_confirmation", "periodic_recheck", "support_override"];
    if (!allowedSources.includes(source)) {
      return NextResponse.json(
        { error: "Invalid verificationSource" },
        { status: 400 }
      );
    }

    const admin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Verify the user belongs to this organisation
    const { data: membership } = await admin
      .from("organisation_members")
      .select("role")
      .eq("organisation_id", organisationId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    try {
      await assertEntitlement(organisationId, "pos.cash_drawer_connector");
    } catch (error) {
      const response = entitlementDeniedResponse(error);
      if (response) return response;
      throw error;
    }

    const verifiedAtTs = verifiedAt ? new Date(verifiedAt).toISOString() : new Date().toISOString();

    // 2. Insert hardware verification record
    const { data: verification, error: verifyErr } = await admin
      .from("cash_drawer_hardware_verifications")
      .insert({
        organisation_id: organisationId,
        terminal_id: terminalId ?? null,
        location_id: locationId ?? null,
        verified_by_user_id: user.id,
        verified_at: verifiedAtTs,
        verification_source: source,
        connector_version: connectorVersion ?? null,
        printer_ip: printerIp ?? null,
        notes: notes ?? null,
      })
      .select()
      .single();

    if (verifyErr) {
      console.error("hardware-verifications POST", verifyErr);
      return NextResponse.json(
        { error: "Failed to record hardware verification" },
        { status: 500 }
      );
    }

    // 3. Also write a cash_drawer_events row so it appears in the audit log
    await admin.from("cash_drawer_events").insert({
      organisation_id: organisationId,
      terminal_id: terminalId ?? null,
      location_id: locationId ?? null,
      triggered_by_user_id: user.id,
      event_type: "hardware_verification",
      result: "hardware_verified",
      reason: "setup",
      source: source,
      connector_version: connectorVersion ?? null,
      printer_ip: printerIp ?? null,
    });

    return NextResponse.json({ ok: true, verification }, { status: 201 });
  } catch (err) {
    console.error("hardware-verifications POST", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const organisationId = searchParams.get("organisationId");
    if (!organisationId) {
      return NextResponse.json(
        { error: "organisationId is required" },
        { status: 400 }
      );
    }

    const admin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: membership } = await admin
      .from("organisation_members")
      .select("role")
      .eq("organisation_id", organisationId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await admin
      .from("cash_drawer_hardware_verifications")
      .select("*")
      .eq("organisation_id", organisationId)
      .order("verified_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("hardware-verifications GET", error);
      return NextResponse.json({ error: "Failed to fetch verifications" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, verifications: data });
  } catch (err) {
    console.error("hardware-verifications GET", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
