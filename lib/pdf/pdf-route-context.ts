import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

type PdfRouteContext = {
  supabase: SupabaseClient;
  userId: string;
  orgId: string;
  org: { name: string | null; fiscalnet_cif: string | null; currency_code: string | null } | null;
  currency: string;
  generatedBy: string;
};

/**
 * Shared auth/org/profile lookup for report PDF routes, so each route only
 * needs its own report-specific data fetch, not another copy of this
 * boilerplate. Returns a Response directly when the caller should bail out
 * (unauthenticated / no org) instead of throwing, since Route Handlers don't
 * get the redirect() treatment RSC pages do.
 */
export async function getReportPdfContext(): Promise<PdfRouteContext | { error: NextResponse }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: new NextResponse("Unauthorized", { status: 401 }) };

  const { data: membership } = await supabase
    .from("organisation_members")
    .select("organisation_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();
  if (!membership) return { error: new NextResponse("No org", { status: 403 }) };
  const orgId = membership.organisation_id;

  const { data: org } = await supabase
    .from("organisations")
    .select("name,fiscalnet_cif,currency_code")
    .eq("id", orgId)
    .single();

  const { data: profile } = await supabase.from("profiles").select("full_name,email").eq("id", user.id).single();
  const generatedBy = profile?.full_name || profile?.email || user.email || "—";

  return {
    supabase,
    userId: user.id,
    orgId,
    org: org ?? null,
    currency: org?.currency_code ?? "EUR",
    generatedBy,
  };
}
