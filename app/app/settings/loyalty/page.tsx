export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { LoyaltySettingsClient } from "@/components/app/LoyaltySettingsClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function canManage(role: string | null | undefined) {
  return role === "owner" || role === "manager";
}

type LoyaltyOrgRow = {
  loyalty_enabled: boolean;
  loyalty_stamps_required: number;
  loyalty_reward_type: "discount" | "free_item";
  loyalty_reward_discount_lei: number | null;
  loyalty_reward_free_product_id: string | null;
  loyalty_reward_description: string | null;
  loyalty_regulars_min_visits: number;
  loyalty_regulars_at_risk_days: number;
};

export default async function LoyaltySettingsPage() {
  const { supabase, orgId, membership } = await getKitchenOpsContext();

  if (!canManage(membership.role)) {
    redirect("/app/settings");
  }

  const { data: org } = await supabase
    .from("organisations")
    .select(
      "loyalty_enabled,loyalty_stamps_required,loyalty_reward_type,loyalty_reward_discount_lei," +
        "loyalty_reward_free_product_id,loyalty_reward_description,loyalty_regulars_min_visits,loyalty_regulars_at_risk_days"
    )
    .eq("id", orgId)
    .maybeSingle<LoyaltyOrgRow>();

  const loyaltyEnabled = Boolean(org?.loyalty_enabled);

  const { data: products } = loyaltyEnabled
    ? await supabase
        .from("products")
        .select("id,name")
        .eq("organisation_id", orgId)
        .eq("active", true)
        .order("name")
    : { data: [] };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Program de fidelizare</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Card de ștampile pe număr de telefon, fără aplicație. Vezi clienții fideli care nu au mai venit.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Modul fidelizare</CardTitle>
            <Badge variant={loyaltyEnabled ? "default" : "outline"}>
              {loyaltyEnabled ? "Activ" : "Neactiv"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {!loyaltyEnabled ? (
            <p className="text-sm text-muted-foreground">
              Activează modulul din{" "}
              <Link href="/app/settings?tab=integrations" className="text-primary underline">
                Integrări
              </Link>
              {" "}pentru a configura recompensele.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Modul activ. Casierii aleg clientul din POS, iar ștampilele se acumulează automat
              la fiecare vânzare finalizată.
            </p>
          )}
        </CardContent>
      </Card>

      {loyaltyEnabled && (
        <LoyaltySettingsClient
          settings={{
            stampsRequired: org?.loyalty_stamps_required ?? 8,
            rewardType: (org?.loyalty_reward_type as "discount" | "free_item") ?? "discount",
            rewardDiscountLei: org?.loyalty_reward_discount_lei ?? null,
            rewardFreeProductId: org?.loyalty_reward_free_product_id ?? null,
            rewardDescription: org?.loyalty_reward_description ?? "",
            regularsMinVisits: org?.loyalty_regulars_min_visits ?? 3,
            regularsAtRiskDays: org?.loyalty_regulars_at_risk_days ?? 21,
          }}
          products={products ?? []}
        />
      )}
    </div>
  );
}
