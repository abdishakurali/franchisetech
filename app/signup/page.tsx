"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthBrand } from "@/components/marketing/AuthBrand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleIcon } from "@/components/ui/google-icon";
import { createClient } from "@/lib/supabase/client";
import { useAppI18n } from "@/lib/app-i18n-context";
import { mapSupabaseAuthError } from "@/lib/auth-error-messages";
import { toast } from "sonner";
import { getPlan } from "@/lib/billing/plans";
import { isPreferredBillingPlan, writePreferredPlanClient } from "@/lib/billing/preferred-plan";
import {
  hasAcquisitionData,
  parseAcquisitionFromSearchParams,
  readGaClientIdClient,
  writeAcquisitionClient,
} from "@/lib/marketing/acquisition";
import { MARKETING_LOCALE_COOKIE } from "@/lib/marketing/locale";
import { captureClientEvent } from "@/lib/analytics/client-events";

const googleAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");
  const supabase = createClient();
  const { t, locale } = useAppI18n();
  const a = t.auth.signup;
  const [loading, setLoading] = useState(false);
  const [, startHydrate] = useTransition();
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    if (isPreferredBillingPlan(planParam)) {
      writePreferredPlanClient(planParam);
    } else {
      writePreferredPlanClient("starter");
    }
  }, [planParam]);

  useEffect(() => {
    const acquisition = parseAcquisitionFromSearchParams(searchParams);
    const gaClientId = readGaClientIdClient();
    if (gaClientId) acquisition.ga_client_id = gaClientId;
    if (hasAcquisitionData(acquisition) || gaClientId) {
      writeAcquisitionClient(acquisition);
    }
    if (acquisition.lang) {
      document.cookie = `${MARKETING_LOCALE_COOKIE}=${acquisition.lang};path=/;max-age=31536000;samesite=lax`;
    }
  }, [searchParams]);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (!emailParam) return;
    startHydrate(() => {
      setForm((prev) => (prev.email ? prev : { ...prev, email: emailParam }));
    });
  }, [searchParams, startHydrate]);

  const selectedPlan = isPreferredBillingPlan(planParam) ? getPlan(planParam) : null;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error(a.errors.passwordLength);
      return;
    }
    captureClientEvent("signup_started", { plan: planParam ?? null });
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/onboarding`,
        },
      });
      if (error) {
        captureClientEvent("signup_failed", { reason: error.message?.slice(0, 120) ?? null });
        toast.error(mapSupabaseAuthError(error.message, locale));
      } else if (data.session) {
        captureClientEvent("signup_session_created", {});
        toast.success(a.successSession);
        router.push("/onboarding");
        router.refresh();
      } else if (data.user && data.user.identities?.length === 0) {
        // Supabase's anti-enumeration behavior: signing up with an email that
        // already belongs to a CONFIRMED account returns no error, no session,
        // and an empty identities array — and sends no email. Without this
        // check we'd tell the user to "check their email" for one that will
        // never arrive.
        toast.error(a.existingAccount);
      } else {
        captureClientEvent("signup_email_sent", {});
        toast.success(a.successEmail);
        router.push(`/check-email?email=${encodeURIComponent(form.email)}`);
      }
    } catch {
      // Network failure, ad-blocker/privacy-extension interference, etc. —
      // without this, a rejected promise here left the button stuck showing
      // its loading spinner forever with no feedback.
      toast.error(mapSupabaseAuthError("network_error", locale));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-svh items-center justify-center bg-[#F3F0E8] px-4 py-10 text-[#0D0F0E]">
      <div className="w-full max-w-[460px]">
      <AuthBrand />
      <Card className="rounded-xl border-[#DFDCD2] bg-white py-8 shadow-none">
        <CardHeader className="space-y-2 text-left sm:px-8">
          <CardTitle className="font-[family-name:var(--font-display)] text-[30px] font-bold leading-[1.1] tracking-[-0.03em]">{a.title}</CardTitle>
          <CardDescription>
            {selectedPlan ? a.descPlan(selectedPlan.name) : a.descDefault}
          </CardDescription>
        </CardHeader>
        <CardContent className="sm:px-8 [&_input]:h-12 [&_input]:border-[#DFDCD2] [&_input]:bg-white">
          {googleAuthEnabled && (
            <>
              <Link href={planParam ? `/auth/google?plan=${planParam}` : "/auth/google"}>
                <Button type="button" variant="outline" className="w-full mb-4 gap-2">
                  <GoogleIcon />
                  {a.google}
                </Button>
              </Link>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-xs text-slate-400">{a.or}</span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>
            </>
          )}
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">{a.email}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="nume@cafeneaua.ro"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{a.password}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={a.passwordPlaceholder}
              />
            </div>
            <Button type="submit" className="h-12 w-full rounded-[10px] bg-[#165DFC] text-base hover:bg-[#104bd1]" disabled={loading}>
              {loading ? a.submitting : a.submit}
            </Button>
          </form>
          <p className="text-center text-xs text-slate-400 mt-4">
            {a.legal}{" "}
            <Link href="/terms" className="underline hover:text-slate-600">{a.legalTermsLink}</Link>{" "}
            {a.legalAnd}{" "}
            <Link href="/privacy" className="underline hover:text-slate-600">{a.legalPrivacyLink}</Link>.
          </p>
          <p className="text-center text-sm text-slate-500 mt-3">
            {a.hasAccount}{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              {a.signInLink}
            </Link>
          </p>
        </CardContent>
      </Card>
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-slate-400">
        <span>{locale === "ro" ? "✓ Probă 15 zile fără card" : "✓ 15-day trial, no card required"}</span>
        <span>{locale === "ro" ? "✓ Configurare ghidată" : "✓ Guided setup"}</span>
      </div>
      </div>
    </main>
  );
}
