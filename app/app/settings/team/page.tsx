import { redirect } from "next/navigation";

// Team lives at /app/settings?tab=team now, merged into the settings hub.
// TeamClient.tsx stays in this folder and is imported directly by the hub.
// Kept as a redirect so old links/bookmarks still work.
export default function TeamSettingsRedirect() {
  redirect("/app/settings?tab=team");
}
