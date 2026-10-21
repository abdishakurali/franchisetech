import { NextRequest, NextResponse } from "next/server";
import { activationEventsForOrg, type ActivationSourceRow } from "@/lib/analytics/activation-backfill";
import { captureServerEventAsync } from "@/lib/posthog-server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  if ((req.headers.get("authorization") ?? "") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = await createServiceClient();
  const { data: organisations, error } = await service
    .from("organisations")
    .select("id,trial_started_at,growth_till_opened_at,growth_first_sale_at,growth_first_report_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let delivered = 0;
  let failed = 0;
  for (const organisation of (organisations ?? []) as ActivationSourceRow[]) {
    for (const milestone of activationEventsForOrg(organisation)) {
      const ok = await captureServerEventAsync(
        `organisation:${organisation.id}`,
        milestone.event,
        {
          organisation_id: organisation.id,
          milestone_at: milestone.timestamp,
          backfilled: true,
          $insert_id: `activation-backfill:${organisation.id}:${milestone.event}`,
        },
        { organisation: organisation.id },
      );
      if (ok) delivered += 1;
      else failed += 1;
    }
  }

  return NextResponse.json({ organisations: organisations?.length ?? 0, delivered, failed }, { status: failed ? 503 : 200 });
}
