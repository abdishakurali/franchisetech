export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { VerifyCardButton } from "@/components/onboarding/VerifyCardButton";

export const metadata = { title: "Verificare card — franchisetech" };

const copy = {
  ro: {
    title: "Un ultim pas: verificarea cardului",
    body: "Pentru a porni trialul de 15 zile, verificăm cardul cu o plată unică de 1 €. Nu este un abonament — nu se percepe nimic altceva în timpul trialului.",
    points: [
      "Plată unică de 1 € — atât, nimic recurent",
      "Trialul de 15 zile pornește imediat după plată",
      "Poți anula oricând — trialul nu se transformă automat în abonament",
    ],
    button: "Verifică cardul (1 €)",
    loading: "Se deschide plata securizată…",
    canceled: "Plata a fost anulată. Poți relua verificarea oricând — trialul pornește imediat după.",
    secure: "Plată securizată prin Stripe",
  },
  en: {
    title: "One last step: card verification",
    body: "To start your 15-day trial we verify your card with a one-time €1 charge. This is not a subscription — nothing else is charged during the trial.",
    points: [
      "One-time €1 charge — that's all, nothing recurring",
      "Your 15-day trial starts immediately after payment",
      "Cancel anytime — the trial does not auto-convert to a subscription",
    ],
    button: "Verify card (€1)",
    loading: "Opening secure payment…",
    canceled: "Payment was canceled. You can retry anytime — the trial starts right after.",
    secure: "Secure payment via Stripe",
  },
} as const;

export default async function VerifyCardPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("organisation_members")
    .select("organisation_id, organisations(country_code, trial_started_at, card_verified_at)")
    .eq("user_id", user.id)
    .or("status.is.null,status.eq.active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!membership) redirect("/onboarding");

  const org = Array.isArray(membership.organisations)
    ? membership.organisations[0]
    : membership.organisations;

  if (org?.trial_started_at || org?.card_verified_at) {
    redirect("/app/pos?welcome=1");
  }

  const t = org?.country_code === "RO" ? copy.ro : copy.en;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100/80 px-4 py-10">
      <section className="w-full max-w-md space-y-6 rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <img src="/marketing/franchise-tech-logo.png" alt="franchisetech" className="h-8 w-auto" />

        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <ShieldCheck className="h-8 w-8" aria-hidden="true" />
          </div>
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-xl font-bold text-slate-900">{t.title}</h1>
          <p className="text-sm text-slate-500">{t.body}</p>
        </div>

        {params.canceled && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {t.canceled}
          </p>
        )}

        <ul className="space-y-2 text-sm text-slate-600">
          {t.points.map((point) => (
            <li key={point} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>

        <VerifyCardButton label={t.button} loadingLabel={t.loading} />

        <p className="text-center text-xs text-slate-400">{t.secure}</p>
      </section>
    </main>
  );
}
