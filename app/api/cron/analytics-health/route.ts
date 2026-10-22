import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { analyticsHealthState, shouldSendAnalyticsAlert } from "@/lib/analytics/health";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function runAnalyticsHealth(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  if ((req.headers.get("authorization") ?? "") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = await createServiceClient();
  const now = new Date().toISOString();
  const { data: previous } = await service
    .from("analytics_health_checks")
    .select("last_success_at,last_error")
    .eq("source", "posthog")
    .maybeSingle();
  const lastSuccessAt = previous?.last_success_at ?? null;
  const state = analyticsHealthState({ lastSuccessAt });
  await service.from("analytics_health_checks").upsert({
    source: "posthog",
    last_attempt_at: now,
    last_success_at: lastSuccessAt,
    last_error: state === "alert" ? "no_production_events_24h" : null,
    updated_at: now,
  });

  if (shouldSendAnalyticsAlert(previous?.last_error, state) && process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "franchisetech <onboarding@resend.dev>",
      to: [process.env.SUPPORT_EMAIL ?? "contact@franchisetech.ro"],
      subject: "Alertă: evenimentele PostHog s-au oprit",
      text: `Nu a fost confirmat niciun eveniment de producție în ultimele 24 de ore. Ultimul succes: ${lastSuccessAt ?? "niciodată"}.`,
    });
  }

  return NextResponse.json({ state, lastSuccessAt }, { status: state === "alert" ? 503 : 200 });
}

export const GET = runAnalyticsHealth;
export const POST = runAnalyticsHealth;
