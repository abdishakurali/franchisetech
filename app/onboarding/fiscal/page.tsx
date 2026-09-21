import { redirect } from "next/navigation";
import { getActiveOrg } from "@/lib/kitchenops/data";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { FiscalOnboardingCard } from "@/components/onboarding/FiscalOnboardingCard";
import { onboardingStepLabels, onboardingStepOfLabel } from "@/lib/onboarding/steps";

export default async function OnboardingFiscalPage() {
  const { supabase, orgId, countryCode } = await getActiveOrg();
  if (countryCode !== "RO") redirect("/app/pos?onboarding=1&welcome=1");

  const { data: org } = await supabase
    .from("organisations")
    .select("fiscalnet_enabled, fiscalnet_mock_mode, fiscalnet_api_host, fiscalnet_operator_code")
    .eq("id", orgId)
    .maybeSingle();

  const stepLabels = onboardingStepLabels(true, "ro");

  return (
    <OnboardingShell
      stepLabels={stepLabels}
      currentStepIndex={3}
      title="Conectează casa fiscală"
      subtitle="Poți exersa în mod test acum și conecta hardware-ul real mai târziu."
      timeEstimate="~1 minut"
      stepOfLabel={onboardingStepOfLabel(3, stepLabels.length, "ro")}
      trialBadge="Probă 15 zile · fără card necesar"
    >
      <FiscalOnboardingCard
        initial={{
          enabled: Boolean(org?.fiscalnet_enabled),
          mockMode: org?.fiscalnet_mock_mode ?? true,
          apiHost: (org?.fiscalnet_api_host as string) ?? "http://localhost:65400",
          operatorCode: (org?.fiscalnet_operator_code as string) ?? "1",
        }}
      />
    </OnboardingShell>
  );
}
