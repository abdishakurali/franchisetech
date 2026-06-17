import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/app/ProfileForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("organisation_members").select("role, organisations(id, name, business_type)").eq("user_id", user.id).limit(1).single(),
  ]);
  if (!membership) redirect("/onboarding");

  const organisation = Array.isArray(membership.organisations) ? membership.organisations[0] : membership.organisations;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Edit your account and business details.</p>
      </div>
      <ProfileForm
        userId={user.id}
        email={user.email ?? ""}
        profile={profile}
        organisation={organisation ?? null}
        canEditBusiness={["owner", "manager"].includes(membership.role)}
      />
    </div>
  );
}
