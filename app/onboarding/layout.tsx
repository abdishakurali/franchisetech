import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Skip onboarding for users who already belong to an organisation. */
export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("organisation_members")
    .select("id")
    .eq("user_id", user.id)
    .or("status.is.null,status.eq.active")
    .limit(1)
    .maybeSingle();

  if (membership) {
    redirect("/app");
  }

  if (membership) {
    redirect("/app");
  }

  return children;
}
