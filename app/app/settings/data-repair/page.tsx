import { redirect } from "next/navigation";

// Controlul datelor lives at /app/settings?tab=data-repair now, merged into
// the settings hub. Kept as a redirect so old links/bookmarks still work.
export default function DataRepairRedirect() {
  redirect("/app/settings?tab=data-repair");
}
