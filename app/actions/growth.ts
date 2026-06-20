"use server";

import { recordGrowthMilestone } from "@/lib/growth/activation";
import { getActiveOrg } from "@/lib/kitchenops/data";

export async function markGrowthReportViewed(): Promise<void> {
  const { supabase, orgId, user, membership } = await getActiveOrg();
  await recordGrowthMilestone(supabase, orgId, "first_report");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orgRow = (membership as any).organisations;
  const orgInfo = Array.isArray(orgRow) ? orgRow[0] : orgRow;
  const businessName = (orgInfo?.name as string | undefined) ?? "Unknown";
  const email = user.email ?? "";

  // Trial Conversion Alert — non-blocking, fire-and-forget
  void fetch("https://n8n.franchisetech.ro/webhook/z-report-viewed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      userId: user.id,
      businessName,
      organisationId: orgId,
    }),
  }).catch(() => {});
}
