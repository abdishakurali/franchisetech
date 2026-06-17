import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";

export const SITE_COOKIE = "franchisetech_active_site_id";

export interface AccessibleSite {
  id: string;
  name: string;
}

/** Owner sees every site in the org; others only see their assigned sites. */
export async function listAccessibleSites(
  supabase: SupabaseClient,
  orgId: string,
  memberId: string,
  role: string | null
): Promise<AccessibleSite[]> {
  if (role === "owner") {
    const { data } = await supabase
      .from("sites")
      .select("id, name")
      .eq("organisation_id", orgId)
      .order("name", { ascending: true });
    return (data ?? []) as AccessibleSite[];
  }

  const { data } = await supabase
    .from("member_site_access")
    .select("sites!inner(id, name)")
    .eq("organisation_id", orgId)
    .eq("member_id", memberId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => row.sites as AccessibleSite);
}

/**
 * Reads the active-site cookie, validates the user can still access that site,
 * and falls back to the first accessible site. Returns null if no sites accessible.
 */
export async function getActiveSiteId(
  accessibleSites: AccessibleSite[]
): Promise<string | null> {
  if (accessibleSites.length === 0) return null;
  const cookieStore = await cookies();
  const cookieSiteId = cookieStore.get(SITE_COOKIE)?.value ?? null;
  if (cookieSiteId && accessibleSites.some((s) => s.id === cookieSiteId)) {
    return cookieSiteId;
  }
  return accessibleSites[0].id;
}

/**
 * Returns the validated active site id and the accessible sites list.
 * Redirects to settings if user has no accessible sites.
 */
export async function requireActiveSite(
  supabase: SupabaseClient,
  orgId: string,
  memberId: string,
  role: string | null
): Promise<{ siteId: string; sites: AccessibleSite[] }> {
  const sites = await listAccessibleSites(supabase, orgId, memberId, role);
  const siteId = await getActiveSiteId(sites);
  if (!siteId) redirect("/app/settings?error=no_site_access");
  return { siteId, sites };
}
