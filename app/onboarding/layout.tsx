import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { onboardingStepRoute, type OnboardingStep } from "@/lib/onboarding/steps";

/**
 * Guards the whole /onboarding/* journey (account -> modules -> menu ->
 * fiscal -> first sale -> result). Unlike the old version, having an org
 * membership no longer means "leave onboarding" — it means "resume at
 * whichever step the org's onboarding_step column says." Only
 * onboarding_completed = true sends a user to /app. See
 * docs/onboarding-redesign-audit-2026-09-19.md Section S.
 */
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
    .select("organisation_id")
    .eq("user_id", user.id)
    .or("status.is.null,status.eq.active")
    .limit(1)
    .maybeSingle();

  if (!membership?.organisation_id) return children;

  const { data: org } = await supabase
    .from("organisations")
    .select("onboarding_completed, onboarding_step, country_code")
    .eq("id", membership.organisation_id)
    .maybeSingle();

  if (!org || org.onboarding_completed) {
    redirect("/app");
  }

  const isRO = org.country_code === "RO";
  const targetRoute = onboardingStepRoute(org.onboarding_step as OnboardingStep | null, isRO);

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  if (pathname !== targetRoute) {
    redirect(targetRoute);
  }

  return children;
}
