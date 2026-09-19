"use client";

import { useTransition } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { completeOnboardingJourney } from "@/app/actions/onboarding-steps";

export function CompleteOnboardingButton({ label }: { label: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      className="h-11 w-full bg-primary px-8 text-base text-primary-foreground hover:bg-primary/90 sm:w-auto"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await completeOnboardingJourney();
          if (result && "error" in result && result.error) toast.error(result.error);
        })
      }
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : (
        <>
          {label} <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}
