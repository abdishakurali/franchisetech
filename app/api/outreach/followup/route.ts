import { NextRequest, NextResponse } from "next/server";
import { authorizeCron } from "@/lib/outreach/csv";
import { FOLLOWUP_DAYS_AFTER_PREV, loadFollowupDue } from "@/lib/outreach/followup";

export const dynamic = "force-dynamic";

/** GET /api/outreach/followup?type=customer&step=2&limit=10 — due follow-ups for n8n planner. */
export async function GET(req: NextRequest) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const typeRaw = req.nextUrl.searchParams.get("type") ?? "customer";
  const type = typeRaw === "partner" ? "partner" : "customer";

  const stepRaw = req.nextUrl.searchParams.get("step") ?? "2";
  const step = Math.min(4, Math.max(2, Number.parseInt(stepRaw, 10) || 2));

  const limitRaw = req.nextUrl.searchParams.get("limit") ?? "10";
  const limit = Math.min(50, Math.max(1, Number.parseInt(limitRaw, 10) || 10));

  const minDays = FOLLOWUP_DAYS_AFTER_PREV[type][step];
  if (!minDays) {
    return NextResponse.json({ error: "Invalid step for type" }, { status: 400 });
  }

  try {
    const rows = await loadFollowupDue(type, step, limit);
    return NextResponse.json({
      rows,
      count: rows.length,
      type,
      step,
      limit,
      min_days_after_prev: minDays,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load follow-up queue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
