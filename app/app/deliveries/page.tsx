import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DeliveryForm } from "@/components/app/KitchenDemoForms";
import { PageHelp } from "@/components/app/PageHelp";

export default async function DeliveriesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: membership } = await supabase.from("organisation_members").select("organisation_id").eq("user_id", user.id).limit(1).single();
  if (!membership) redirect("/onboarding");
  const [{ data: sites, error: sitesError }, { data: records, error: recordsError }] = await Promise.all([
    supabase.from("sites").select("id,name").eq("organisation_id", membership.organisation_id).order("name"),
    supabase.from("delivery_records").select("*").eq("organisation_id", membership.organisation_id).order("created_at", { ascending: false }).limit(10),
  ]);
  const loadError = sitesError || recordsError;
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Delivery Checks</h1>
          <p className="text-slate-500 text-sm mt-1">Record supplier, batch, use-by, storage, and delivery evidence.</p>
        </div>
        <PageHelp
          title="Deliveries help"
          purpose="Use this page when food or ingredients arrive."
          first="Add the supplier and product, then save the delivery check."
          good="The delivery has supplier, batch, use-by date, and storage noted."
        />
      </div>
      {loadError && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Delivery checks could not load yet. Your data is safe. Try again after deployment finishes.
        </div>
      )}
      {(records ?? []).length === 0 && (
        <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-slate-900">No deliveries recorded yet.</p>
          <a href="#delivery-form" className="text-sm font-medium text-blue-700 hover:underline">Add delivery</a>
        </div>
      )}
      <div id="delivery-form">
      <DeliveryForm orgId={membership.organisation_id} userId={user.id} sites={sites ?? []} records={records ?? []} />
      </div>
    </div>
  );
}
