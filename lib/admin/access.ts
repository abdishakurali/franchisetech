import { notFound, redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getAuthUser } from "@/lib/supabase/server";
import { isLeadAdmin } from "@/lib/leads/admin";

export type AdminAccess = "login" | "deny" | "allow";

/**
 * Who may open /admin. Same rule as /app/leads and /app/admin/efactura:
 * a signed-in user whose CONFIRMED email is in LEAD_ADMIN_EMAILS. Org roles
 * (owner, manager, cashier) never matter: an owner of a paying café is still
 * refused. Kept pure so the gate is unit-tested without Next or Supabase.
 */
export function adminAccessFor(user: Pick<User, "email" | "email_confirmed_at"> | null | undefined): AdminAccess {
  if (!user) return "login";
  return isLeadAdmin(user) ? "allow" : "deny";
}

/**
 * Call at the top of every /admin page (not only the layout: a layout is not
 * re-run on every client navigation, and pages must not rely on it).
 * Anonymous → /login. Signed in but not an admin → 404, so the panel's
 * existence isn't revealed. Only after this returns may a page create the
 * service-role client.
 */
export async function requirePlatformAdmin(): Promise<User> {
  const { data: { user } } = await getAuthUser();
  const access = adminAccessFor(user);
  if (access === "login") redirect("/login");
  if (access === "deny" || !user) notFound();
  return user;
}
