import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RemindersPage } from "@/components/app/RemindersPage";

export default async function RemindersPageRoute() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("organisation_members")
    .select("organisation_id, role, organisations(id, name)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/onboarding");

  const orgId = membership.organisation_id;

  const { data: schedules } = await supabase
    .from("reminder_schedules")
    .select("*, assets(name, asset_type), sites(name)")
    .eq("organisation_id", orgId)
    .order("time_of_day");

  const { data: assets } = await supabase
    .from("assets")
    .select("id, name, asset_type")
    .eq("organisation_id", orgId)
    .eq("active", true)
    .order("name");

  return (
    <RemindersPage
      schedules={schedules ?? []}
      assets={assets ?? []}
      orgId={orgId}
      userEmail={user.email ?? ""}
      userRole={membership.role}
    />
  );
}
