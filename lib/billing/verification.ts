// Card verification → trial start. The 15-day trial begins only after the
// one-time €1 card verification payment is confirmed. Called from both the
// verification success page (authed user) and the Stripe webhook (no session),
// so the trial-start update must be idempotent: only the call that flips
// trial_started_at from NULL fires the trial_started events.

import { createServiceClient } from "@/lib/supabase/server";
import { trackLoopsEvent, upsertLoopsContact } from "@/lib/loops";
import { captureServerEvent } from "@/lib/posthog-server";
import { reportTrialConversion } from "@/lib/analytics/server-conversions";

const TRIAL_DAYS = 15;

type StartTrialInput = {
  organisationId: string;
  paymentIntentId?: string | null;
  /** Present when called from the success page; resolved from the org owner when absent (webhook). */
  actor?: { userId: string; email?: string | null } | null;
};

export type StartTrialResult = {
  started: boolean;
  alreadyStarted: boolean;
};

export async function startTrialAfterCardVerification(
  input: StartTrialInput
): Promise<StartTrialResult> {
  const supabase = await createServiceClient();
  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + TRIAL_DAYS * 86400000);

  // Idempotency guard: only the request that flips trial_started_at from NULL wins.
  const { data: updated, error } = await supabase
    .from("organisations")
    .update({
      trial_started_at: now.toISOString(),
      trial_ends_at: trialEndsAt.toISOString(),
      card_verified_at: now.toISOString(),
      card_verification_payment_intent: input.paymentIntentId ?? null,
    })
    .eq("id", input.organisationId)
    .is("trial_started_at", null)
    .select(
      "id, name, country_code, business_type, acquisition_gclid, acquisition_gbraid, acquisition_wbraid, acquisition_fbclid"
    )
    .maybeSingle();

  if (error) {
    console.error("[card_verification] trial start update failed", error.message);
    return { started: false, alreadyStarted: false };
  }

  if (!updated) {
    // Trial already started (webhook and success page both fired) — nothing to do.
    return { started: false, alreadyStarted: true };
  }

  let userId = input.actor?.userId ?? null;
  let email = input.actor?.email ?? null;

  if (!userId) {
    const { data: owner } = await supabase
      .from("organisation_members")
      .select("user_id")
      .eq("organisation_id", input.organisationId)
      .eq("role", "owner")
      .limit(1)
      .maybeSingle();
    userId = owner?.user_id ?? null;
  }
  if (!email && userId) {
    const { data: authUser } = await supabase.auth.admin.getUserById(userId).catch(() => ({ data: null }));
    email = authUser?.user?.email ?? null;
  }

  // ── trial_started events — best-effort, never block the payment flow ──────
  // Google Ads offline conversion + Meta Conversions API (card-verified trial =
  // primary bidding signal for both). Idempotent by construction: only the call
  // that flipped trial_started_at gets here.
  void reportTrialConversion({
    organisationId: input.organisationId,
    gclid: updated.acquisition_gclid,
    gbraid: updated.acquisition_gbraid,
    wbraid: updated.acquisition_wbraid,
    fbclid: updated.acquisition_fbclid,
    email,
  }).catch((e: unknown) => console.error("[card_verification] ad platform trial conversion failed", e));

  if (email) {
    void upsertLoopsContact(email, { trialStartedAt: now.toISOString() }).catch((e: unknown) =>
      console.error("[card_verification] loops contact failed", e)
    );
    void trackLoopsEvent(email, "trial_started", {
      businessName: updated.name ?? "",
      countryCode: updated.country_code ?? "",
    }).catch((e: unknown) => console.error("[card_verification] loops event failed", e));
  }

  if (userId) {
    captureServerEvent(
      userId,
      "trial_started",
      {
        organisation_id: input.organisationId,
        country_code: updated.country_code ?? null,
        business_type: updated.business_type ?? null,
        card_verified: true,
      },
      { organisation: input.organisationId },
    );
  }

  return { started: true, alreadyStarted: false };
}
