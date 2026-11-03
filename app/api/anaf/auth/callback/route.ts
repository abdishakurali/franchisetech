export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { exchangeCode, storeOrgTokens } from "@/lib/anaf/auth";
import { authLinkSecret, verifyAuthState } from "@/lib/anaf/auth-link";

// Two ways in:
// 1. A signed authorisation link (lib/anaf/auth-link.ts). Whoever holds it —
//    the owner or their accountant, who is not a member — signs on ANAF with a
//    certificate; the organisation comes from our signature, not from the URL.
// 2. Legacy: a signed-in owner/manager with the organisation id as state.
export async function GET(req: Request): Promise<NextResponse> {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const signedOrgId = verifyAuthState(state, authLinkSecret());
  const done = (status: "connected" | "error", msg?: string) =>
    NextResponse.redirect(new URL(
      signedOrgId
        ? `/anaf/autorizare?status=${status}${msg ? `&msg=${msg}` : ""}`
        : `/app/settings?tab=anaf&status=${status}${msg ? `&msg=${msg}` : ""}`,
      req.url,
    ));

  if (!code) return done("error", "no_code");

  let orgId: string | null = signedOrgId;
  if (!orgId) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.redirect(new URL("/login", req.url));
    if (!state) return done("error", "missing_state");
    const { data: membership } = await supabase
      .from("organisation_members")
      .select("role")
      .eq("organisation_id", state)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!membership || !["owner", "manager"].includes(membership.role ?? "")) return done("error", "unauthorized");
    orgId = state;
  }

  const clientId = process.env.ANAF_CLIENT_ID;
  const clientSecret = process.env.ANAF_CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://franchisetech.ro";
  const redirectUri = `${baseUrl}/api/anaf/auth/callback`;
  if (!clientId || !clientSecret) return done("error", "server_config");

  try {
    const service = await createServiceClient();
    const { data: org } = await service.from("organisations").select("anaf_cif").eq("id", orgId).maybeSingle();
    if (!org?.anaf_cif) return done("error", "cif_required");

    const tokens = await exchangeCode(code, clientId, clientSecret, redirectUri);
    await storeOrgTokens(orgId, org.anaf_cif, tokens);
    return done("connected");
  } catch (err) {
    console.error("[ANAF OAuth callback]", err);
    return done("error", "exchange_failed");
  }
}
