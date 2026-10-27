import type { User } from "@supabase/supabase-js";

/**
 * Who may see and update demo leads. Comma-separated LEAD_ADMIN_EMAILS, defaulting
 * to the company inbox owner. Everyone else gets a 404 (the page's existence isn't
 * revealed). The email must be confirmed so an unverified signup can't claim it.
 */
export function leadAdminEmails(): string[] {
  return (process.env.LEAD_ADMIN_EMAILS ?? "info@franchisetech.ro")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isLeadAdmin(user: Pick<User, "email" | "email_confirmed_at"> | null | undefined): boolean {
  if (!user?.email || !user.email_confirmed_at) return false;
  return leadAdminEmails().includes(user.email.toLowerCase());
}
