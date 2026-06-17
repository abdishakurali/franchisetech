import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProcessCheckForm } from "@/components/app/KitchenDemoForms";

export default async function CookingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: membership } = await supabase.from("organisation_members").select("organisation_id").eq("user_id", user.id).limit(1).single();
  if (!membership) redirect("/onboarding");
  const { data: sites } = await supabase.from("sites").select("id,name").eq("organisation_id", membership.organisation_id).order("name");
  return <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto"><ProcessCheckForm orgId={membership.organisation_id} userId={user.id} sites={sites ?? []} type="cooking" title="Cooking check" /></div>;
}
