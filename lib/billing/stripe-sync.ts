import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { invalidateEntitlementCache } from "@/lib/billing/entitlement-resolver";
import { getPriceId, STRIPE_CANONICAL_PRICE_IDS, type BillingPlan } from "@/lib/billing/plans";

const VALID_PLANS: BillingPlan[] = ["starter", "core", "pro", "operations", "multi_location", "scale"];

type SubscriptionWithPeriods = Stripe.Subscription & {
  trial_start?: number | null;
  trial_end?: number | null;
  current_period_end?: number | null;
};

type SubscriptionItemWithPeriods = Stripe.SubscriptionItem & {
  current_period_end?: number | null;
};

type ExistingSubscriptionRow = {
  id: string;
  organisation_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: string | null;
  status: string | null;
};

export type StripeSubscriptionSyncResult = {
  synced: boolean;
  organisationId: string | null;
  subscriptionId: string | null;
  status: string | null;
  plan: BillingPlan | null;
  reason?: string;
};

function toDate(value?: number | null) {
  return value ? new Date(value * 1000).toISOString() : null;
}

function normalizePlan(value: string | null | undefined): BillingPlan | null {
  return value && VALID_PLANS.includes(value as BillingPlan) ? (value as BillingPlan) : null;
}

function planFromPriceId(priceId: string | null | undefined): BillingPlan | null {
  if (!priceId) return null;
  for (const plan of VALID_PLANS) {
    if (STRIPE_CANONICAL_PRICE_IDS[plan] === priceId) return plan;
    if (getPriceId(plan, "month") === priceId || getPriceId(plan, "year") === priceId) return plan;
  }
  return null;
}

async function findReusableRow(
  organisationId: string,
  customerId: string,
  subscriptionId: string,
): Promise<ExistingSubscriptionRow | null> {
  const supabase = await createServiceClient();

  const { data: bySubscription } = await supabase
    .from("billing_subscriptions")
    .select("id, organisation_id, stripe_customer_id, stripe_subscription_id, plan, status")
    .eq("stripe_subscription_id", subscriptionId)
    .maybeSingle();

  if (bySubscription) return bySubscription as ExistingSubscriptionRow;

  const { data: pending } = await supabase
    .from("billing_subscriptions")
    .select("id, organisation_id, stripe_customer_id, stripe_subscription_id, plan, status")
    .eq("organisation_id", organisationId)
    .eq("stripe_customer_id", customerId)
    .is("stripe_subscription_id", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (pending as ExistingSubscriptionRow | null) ?? null;
}

export async function syncStripeSubscription(
  subscription: Stripe.Subscription,
  opts?: {
    fallbackOrganisationId?: string | null;
    fallbackPlan?: string | null;
    setGracePeriod?: boolean;
    clearGracePeriod?: boolean;
  },
): Promise<StripeSubscriptionSyncResult> {
  const supabase = await createServiceClient();
  const sub = subscription as SubscriptionWithPeriods;
  const item = subscription.items.data[0] as SubscriptionItemWithPeriods | undefined;
  const priceId = item?.price.id ?? null;
  const currentPeriodEnd = sub.current_period_end ?? item?.current_period_end ?? null;
  const customerId = String(subscription.customer);
  const metadata = subscription.metadata ?? {};
  const organisationId = metadata.organisation_id ?? opts?.fallbackOrganisationId ?? null;

  if (!organisationId) {
    return {
      synced: false,
      organisationId: null,
      subscriptionId: subscription.id,
      status: subscription.status,
      plan: null,
      reason: "missing_organisation_id",
    };
  }

  const existing = await findReusableRow(organisationId, customerId, subscription.id);
  const plan =
    normalizePlan(metadata.plan) ??
    normalizePlan(opts?.fallbackPlan) ??
    normalizePlan(existing?.plan) ??
    planFromPriceId(priceId);

  if (!plan) {
    return {
      synced: false,
      organisationId,
      subscriptionId: subscription.id,
      status: subscription.status,
      plan: null,
      reason: "missing_plan",
    };
  }

  let gracePeriodEndsAt: string | null | undefined = undefined;
  if (opts?.setGracePeriod && sub.current_period_end) {
    gracePeriodEndsAt = new Date(sub.current_period_end * 1000 + 3 * 86_400_000).toISOString();
  } else if (opts?.clearGracePeriod) {
    gracePeriodEndsAt = null;
  }

  const payload: Record<string, unknown> = {
    organisation_id: organisationId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    plan,
    status: subscription.status,
    trial_start: toDate(sub.trial_start),
    trial_end: toDate(sub.trial_end),
    current_period_end: toDate(currentPeriodEnd),
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  };

  if (gracePeriodEndsAt !== undefined) payload.grace_period_ends_at = gracePeriodEndsAt;

  const { error } = existing
    ? await supabase.from("billing_subscriptions").update(payload).eq("id", existing.id)
    : await supabase.from("billing_subscriptions").insert(payload);

  if (error) throw error;

  invalidateEntitlementCache(organisationId);

  // Revoke scale-only module access when plan drops below scale.
  // saga_export requires reports.accountant_pack which is scale-only.
  // This ensures plan downgrades are enforced even if the install flag was set previously.
  if (plan !== "scale") {
    await supabase
      .from("organisations")
      .update({ saga_export_enabled: false })
      .eq("id", organisationId)
      .eq("saga_export_enabled", true);
  }

  return {
    synced: true,
    organisationId,
    subscriptionId: subscription.id,
    status: subscription.status,
    plan,
  };
}

export async function syncStripeCheckoutSession(
  stripe: Stripe,
  sessionId: string,
  opts?: { allowedUserId?: string; allowedOrganisationIds?: string[] },
): Promise<StripeSubscriptionSyncResult> {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const sessionOrgId = session.metadata?.organisation_id ?? session.client_reference_id ?? null;
  const sessionUserId = session.metadata?.user_id ?? null;

  if (opts?.allowedUserId && sessionUserId && sessionUserId !== opts.allowedUserId) {
    return { synced: false, organisationId: sessionOrgId, subscriptionId: null, status: null, plan: null, reason: "user_mismatch" };
  }

  if (opts?.allowedOrganisationIds?.length && (!sessionOrgId || !opts.allowedOrganisationIds.includes(sessionOrgId))) {
    return { synced: false, organisationId: sessionOrgId, subscriptionId: null, status: null, plan: null, reason: "organisation_mismatch" };
  }

  if (!session.subscription) {
    return { synced: false, organisationId: sessionOrgId, subscriptionId: null, status: null, plan: null, reason: "missing_subscription" };
  }

  const subscription = await stripe.subscriptions.retrieve(String(session.subscription));
  return syncStripeSubscription(subscription, {
    fallbackOrganisationId: sessionOrgId,
    fallbackPlan: session.metadata?.plan,
    clearGracePeriod: true,
  });
}
