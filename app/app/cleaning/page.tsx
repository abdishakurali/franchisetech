import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CleaningForm } from "@/components/app/KitchenDemoForms";

export default async function CleaningPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: membership } = await supabase.from("organisation_members").select("organisation_id").eq("user_id", user.id).limit(1).single();
  if (!membership) redirect("/onboarding");
  const [{ data: sites }, { data: records }] = await Promise.all([
    supabase.from("sites").select("id,name").eq("organisation_id", membership.organisation_id).order("name"),
    supabase.from("cleaning_checks").select("*").eq("organisation_id", membership.organisation_id).order("completed_at", { ascending: false }).limit(10),
  ]);
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900">Cleaning</h1>
      <p className="text-slate-500 text-sm mt-1 mb-6">Complete daily and weekly cleaning checks without paper sheets.</p>
      {(records ?? []).length === 0 && (
        <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-slate-900">No cleaning checks yet.</p>
          <a href="#cleaning-form" className="text-sm font-medium text-blue-700 hover:underline">Complete cleaning check</a>
        </div>
      )}
      <div id="cleaning-form">
      <CleaningForm orgId={membership.organisation_id} userId={user.id} sites={sites ?? []} records={records ?? []} />
      </div>
    </div>
  );
}
