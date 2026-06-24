"use server";

import { revalidatePath } from "next/cache";
import { getActiveOrg } from "@/lib/kitchenops/data";
import { assertEntitlement, EntitlementDeniedError } from "@/lib/billing/entitlement-resolver";

export type OwnerDigestSettingsResult = { ok: true } | { ok: false; error: string };

function parseRecipients(raw: string, ownerEmail: string): string[] {
  const extras = raw
    .split(/[,;\s]+/)
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.includes("@"));
  const set = new Set<string>([ownerEmail.toLowerCase(), ...extras]);
  return [...set];
}

export async function saveOwnerDigestSettings(formData: FormData): Promise<OwnerDigestSettingsResult> {
  try {
    const { supabase, orgId, membership, user } = await getActiveOrg();
    if (!["owner", "manager"].includes(membership.role ?? "")) {
      return { ok: false, error: "Forbidden" };
    }
    try {
      await assertEntitlement(orgId, "owner_digest.enabled");
    } catch (error) {
      if (error instanceof EntitlementDeniedError) return { ok: false, error: error.body.error };
      throw error;
    }

    const enabledCheckbox = formData.get("owner_digest_enabled") === "on";
    const frequencyRaw = String(formData.get("owner_digest_frequency") ?? "off");
    let frequency =
      frequencyRaw === "daily" || frequencyRaw === "weekly" ? frequencyRaw : "off";
    // Either control can turn digest on; default to daily when only the checkbox is checked.
    const active = enabledCheckbox || frequency !== "off";
    if (active && frequency === "off") {
      frequency = "daily";
    }
    const dayOfWeek = Math.min(7, Math.max(1, Number(formData.get("owner_digest_day_of_week") ?? 1)));
    const timeOfDay = String(formData.get("owner_digest_time_of_day") ?? "08:00").slice(0, 5);
    const timezone = String(formData.get("owner_digest_timezone") ?? "Europe/Bucharest").trim() || "Europe/Bucharest";
    const recipientsRaw = String(formData.get("owner_digest_recipients") ?? "");
    const ownerEmail = user.email ?? "";
    if (!ownerEmail) {
      return { ok: false, error: "No owner email" };
    }
    const recipients = parseRecipients(recipientsRaw, ownerEmail);

    const { error } = await supabase
      .from("organisations")
      .update({
        owner_digest_enabled: active,
        owner_digest_frequency: active ? frequency : "off",
        owner_digest_day_of_week: dayOfWeek,
        owner_digest_time_of_day: `${timeOfDay}:00`,
        owner_digest_timezone: timezone,
        owner_digest_recipients: recipients,
      })
      .eq("id", orgId);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/app/settings");
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: message };
  }
}
