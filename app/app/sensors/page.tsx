import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SensorsPage } from "@/components/app/SensorsPage";

export default async function SensorsRoute() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("organisation_members")
    .select("organisation_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/onboarding");
  const orgId = membership.organisation_id;

  const [{ data: devices }, { data: recentReadings }, { data: assets }, { data: sites }] = await Promise.all([
    supabase
      .from("sensor_devices")
      .select("*, assets(name, asset_type), sites(name)")
      .eq("organisation_id", orgId)
      .order("created_at", { ascending: false }),

    supabase
      .from("sensor_readings")
      .select("*, sensor_devices(device_name), assets(name)")
      .eq("organisation_id", orgId)
      .order("recorded_at", { ascending: false })
      .limit(20),

    supabase.from("assets").select("*, sites(name)").eq("organisation_id", orgId).eq("active", true).order("name"),

    supabase.from("sites").select("*").eq("organisation_id", orgId).order("name"),
  ]);

  return (
    <SensorsPage
      devices={devices ?? []}
      recentReadings={recentReadings ?? []}
      assets={assets ?? []}
      sites={sites ?? []}
      orgId={orgId}
      userId={user.id}
      canManage={["owner", "manager"].includes(membership.role)}
    />
  );
}
