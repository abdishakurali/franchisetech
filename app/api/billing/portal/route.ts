import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { canManageBilling } from "@/lib/access-control";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.NEXT_PUBLIC_APP_URL) {
    return NextResponse.json({ error: "Billing not configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { data: membership } = await supabase
    .from("organisation_members")
    .select("organisation_id, role, status")
    .eq("user_id", user.id)
    .or("status.is.null,status.eq.active")
    .limit(1)
    .maybeSingle();

  if (!membership || !canManageBilling(membership.role)) {
    return NextResponse.json({ error: "Only an owner can manage billing" }, { status: 403 });
  }

  const service = await createServiceClient();
  const { data: sub } = await service
    .from("billing_subscriptions")
    .select("stripe_customer_id")
    .eq("organisation_id", membership.organisation_id)
    .not("stripe_customer_id", "is", null)
    .limit(1)
    .maybeSingle();

  if (!sub?.stripe_customer_id) {
    return NextResponse.json({ error: "No billing account found. Start a subscription first." }, { status: 404 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/billing`,
  });

  return NextResponse.json({ url: session.url });
}
