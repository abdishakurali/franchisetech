import { redirect } from "next/navigation";

// The Marketplace lives at /app/settings?tab=integrations — this route existed
// as a second, unlinked copy of the same IntegrationCards UI and only confused
// which one was "real." Kept as a redirect so old links/bookmarks still land
// somewhere useful.
export default function IntegrationsPage() {
  redirect("/app/settings?tab=integrations");
}
