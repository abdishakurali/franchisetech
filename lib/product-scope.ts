/**
 * Default-on product scope for the current Romania-first POS wedge.
 * Set NEXT_PUBLIC_LEAN_PRODUCT_SCOPE=false to expose parked modules again.
 */
export const LEAN_PRODUCT_SCOPE_ENABLED =
  process.env.NEXT_PUBLIC_LEAN_PRODUCT_SCOPE !== "false";

export const LEAN_PUBLIC_FEATURE_SLUGS = new Set([
  "pos",
  "z-report",
  "offline",
  "setup-onboarding",
  "qr-code-receipts",
  // Un-parked 2026-09-06: the header's "Produs" dropdown links to a real
  // Gestiune page — this is real, already-built, already-written content
  // (see lib/marketing/seo.ts), not new marketing copy.
  "stock-management",
]);

export function isLeanPublicFeature(slug: string): boolean {
  return !LEAN_PRODUCT_SCOPE_ENABLED || LEAN_PUBLIC_FEATURE_SLUGS.has(slug);
}
