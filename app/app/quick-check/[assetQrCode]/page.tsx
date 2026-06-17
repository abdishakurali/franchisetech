import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogCheckForm } from "@/components/app/LogCheckForm";
import { QrCode } from "lucide-react";

interface Props {
  params: Promise<{ assetQrCode: string }>;
}

export default async function QuickCheckPage({ params }: Props) {
  const { assetQrCode } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/app/quick-check/${assetQrCode}`);

  const { data: membership } = await supabase
    .from("organisation_members")
    .select("organisation_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/onboarding");
  const orgId = membership.organisation_id;

  const { data: asset } = await supabase
    .from("assets")
    .select("*, sites(*)")
    .eq("qr_code", assetQrCode)
    .eq("organisation_id", orgId)
    .single();

  const [{ data: sites }, { data: assets }] = await Promise.all([
    supabase.from("sites").select("*").eq("organisation_id", orgId).order("name"),
    supabase.from("assets").select("*, sites(name)").eq("organisation_id", orgId).eq("active", true).order("name"),
  ]);

  if (!asset) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto text-center py-20">
        <QrCode className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-slate-900 mb-2">QR code not recognised</h1>
        <p className="text-slate-500">
          This QR code does not match any asset in your organisation.
        </p>
        <p className="text-slate-400 text-sm mt-4">Check the code on the unit label and try again.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <QrCode className="h-4 w-4" />
          Quick check via QR
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{asset.name}</h1>
        <p className="text-slate-500 text-sm mt-1">
          {asset.sites?.name}{asset.location ? ` · ${asset.location}` : ""}
        </p>
      </div>
      <LogCheckForm
        sites={sites ?? []}
        assets={assets ?? []}
        orgId={orgId}
        userId={user.id}
        preselectedAssetId={asset.id}
        preselectedSiteId={asset.site_id}
      />
    </div>
  );
}
