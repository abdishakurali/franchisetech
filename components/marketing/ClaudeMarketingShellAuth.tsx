import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { ClaudeMarketingShell } from "@/components/marketing/ClaudeMarketing";

/** Resolves the signed-in user (if any) server-side, then renders the shared
 * marketing shell with a Dashboard/profile chip instead of Login/Signup.
 * Every marketing page should use this — not the plain ClaudeMarketingShell —
 * so a logged-in visitor sees the same header everywhere on the site. */
export async function ClaudeMarketingShellAuth({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <ClaudeMarketingShell>{children}</ClaudeMarketingShell>;

  const displayName = user.user_metadata?.full_name || user.email || "Cont";
  const initials = displayName
    .split(/[ @._-]/)
    .filter(Boolean)
    .map((part: string) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return <ClaudeMarketingShell user={{ displayName, initials }}>{children}</ClaudeMarketingShell>;
}
