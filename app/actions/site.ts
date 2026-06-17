"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getActiveOrg } from "@/lib/kitchenops/data";
import { listAccessibleSites, SITE_COOKIE } from "@/lib/site-context";

/**
 * Switches the active site. Validates the user can access the requested site
 * before writing the cookie — client cannot spoof site selection.
 */
export async function setActiveSite(siteId: string): Promise<void> {
  const { supabase, orgId, membership } = await getActiveOrg();
  const accessible = await listAccessibleSites(supabase, orgId, membership.id, membership.role);
  if (!accessible.some((s) => s.id === siteId)) {
    redirect("/app?error=site_access_denied");
  }
  const cookieStore = await cookies();
  cookieStore.set(SITE_COOKIE, siteId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  revalidatePath("/app", "layout");
}
