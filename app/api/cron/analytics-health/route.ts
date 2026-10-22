import { NextRequest, NextResponse } from "next/server";
import { analyticsHealthState } from "@/lib/analytics/health";
import { captureServerEventAsync } from "@/lib/posthog-server";
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
  const delivered = await captureServerEventAsync(
    "system:analytics-health",
    "analytics_health_check",
    { checked_at: now },
  );
  const { data: previous } = await service
    .from("analytics_health_checks")
    .select("last_success_at")
    .eq("source", "posthog")
    .maybeSingle();
  const lastSuccessAt = delivered ? now : previous?.last_success_at ?? null;
  await service.from("analytics_health_checks").upsert({
    source: "posthog",
    last_attempt_at: now,
    last_success_at: lastSuccessAt,
    last_error: delivered ? null : "delivery_failed",
    updated_at: now,
  });

  const state = analyticsHealthState({ lastSuccessAt });
  return NextResponse.json({ state, delivered, lastSuccessAt }, { status: state === "alert" ? 503 : 200 });
}

export const GET = runAnalyticsHealth;
export const POST = runAnalyticsHealth;
