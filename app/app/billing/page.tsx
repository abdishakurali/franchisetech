import { redirect } from "next/navigation";

// Billing lives at /app/settings?tab=billing — this route rendered the exact
// same BillingPanel as a second, duplicate entry point. Kept as a redirect
// (preserving reason/checkout) so old links/bookmarks still land somewhere useful.
export default async function BillingRedirect({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; checkout?: string }>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams({ tab: "billing" });
  if (params.reason) qs.set("reason", params.reason);
  if (params.checkout) qs.set("checkout", params.checkout);
  redirect(`/app/settings?${qs.toString()}`);
}
