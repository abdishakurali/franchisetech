const INTERNAL_EMAIL_SUFFIXES = ["@franchisetech.ro"];
const THROWAWAY_EMAIL_SUFFIXES = [
  "@mailinator.com",
  "@guerrillamail.com",
  "@10minutemail.com",
  "@tempmail.com",
  "@yopmail.com",
];

export type AccountType = "internal" | "test" | "demo" | "real_customer";

/**
 * Shared with PostHogIdentify (client, post-auth) so pre-auth events like
 * signup_started can carry the same classification instead of only the
 * person/group properties set after identify() — those don't backfill
 * events already sent before the user exists as a PostHog person.
 */
export function deriveAccountType(email?: string | null, orgName?: string | null): AccountType {
  const normalizedEmail = email?.toLowerCase().trim() ?? "";
  const normalizedOrg = orgName?.toLowerCase() ?? "";
  if (INTERNAL_EMAIL_SUFFIXES.some((suffix) => normalizedEmail.endsWith(suffix))) return "internal";
  if (THROWAWAY_EMAIL_SUFFIXES.some((suffix) => normalizedEmail.endsWith(suffix))) return "test";
  if (normalizedOrg.includes("test")) return "test";
  if (normalizedOrg.includes("demo")) return "demo";
  return "real_customer";
}
