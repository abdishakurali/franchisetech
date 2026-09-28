import { redirect } from "next/navigation";

// Table settings live at /app/settings?tab=tables now, merged into the
// settings hub. Kept as a redirect so old links/bookmarks still work.
export default function TablesSettingsRedirect() {
  redirect("/app/settings?tab=tables");
}
