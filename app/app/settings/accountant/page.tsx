import { redirect } from "next/navigation";

// Accountant setup lives at /app/settings?tab=accountant now, merged into
// the settings hub. Kept as a redirect (preserving install=saga) so old
// links/bookmarks still work.
export default async function AccountantSettingsRedirect({
  searchParams,
}: {
  searchParams?: Promise<{ install?: string }>;
}) {
  const params = await searchParams;
  redirect(`/app/settings?tab=accountant${params?.install ? `&install=${params.install}` : ""}`);
}
