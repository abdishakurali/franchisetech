import { NextRequest, NextResponse } from "next/server";
import { authorizeCron, loadPendingPartners } from "@/lib/outreach/csv";

export const dynamic = "force-dynamic";

/** GET /api/outreach/partners?limit=4 — pending rows for n8n daily planner (CRON_SECRET). */
export async function GET(req: NextRequest) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limitRaw = req.nextUrl.searchParams.get("limit") ?? "4";
  const limit = Math.min(20, Math.max(1, Number.parseInt(limitRaw, 10) || 4));

  try {
    const rows = loadPendingPartners(limit);
    return NextResponse.json({ rows, count: rows.length, limit });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to read partner CSV";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
