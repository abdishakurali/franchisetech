export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeCode, storeOrgTokens } from "@/lib/anaf/auth";

export async function GET(req: Request): Promise<NextResponse> {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state"); // we encode orgId as state

  if (!code) {
    return NextResponse.redirect(new URL("/app/settings?tab=anaf&status=error&msg=no_code", req.url));
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // orgId comes from state param we set when building the authorization URL
  const orgId = state ?? null;
  if (!orgId) {
    return NextResponse.redirect(new URL("/app/settings?tab=anaf&status=error&msg=missing_state", req.url));
  }

  // Verify this user is owner/manager of the org
  const { data: membership } = await supabase
    .from("organisation_members")
    .select("role")
    .eq("organisation_id", orgId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership || !["owner", "manager"].includes(membership.role ?? "")) {
    return NextResponse.redirect(new URL("/app/settings?tab=anaf&status=error&msg=unauthorized", req.url));
  }

  const clientId = process.env.ANAF_CLIENT_ID;
  const clientSecret = process.env.ANAF_CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://franchisetech.ro";
  const redirectUri = `${baseUrl}/api/anaf/auth/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/app/settings?tab=anaf&status=error&msg=server_config", req.url));
  }

  try {
    const tokens = await exchangeCode(code, clientId, clientSecret, redirectUri);

    // Fetch CIF from org settings
    const { data: org } = await supabase
      .from("organisations")
      .select("anaf_cif")
      .eq("id", orgId)
      .single();

    if (!org?.anaf_cif) {
      return NextResponse.redirect(
        new URL("/app/settings?tab=anaf&status=error&msg=cif_required", req.url),
      );
    }

    await storeOrgTokens(orgId, org.anaf_cif, tokens);

    return NextResponse.redirect(new URL("/app/settings?tab=anaf&status=connected", req.url));
  } catch (err) {
    console.error("[ANAF OAuth callback]", err);
    return NextResponse.redirect(new URL("/app/settings?tab=anaf&status=error&msg=exchange_failed", req.url));
  }
}
