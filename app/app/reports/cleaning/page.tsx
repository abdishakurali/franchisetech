import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function CleaningReportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("organisation_members")
    .select("organisation_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();
  if (!membership) redirect("/onboarding");

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
      <div className="rounded-xl border border-slate-100 bg-white p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <ClipboardCheck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Cleaning Records</h1>
              <p className="text-sm text-slate-500">Cleaning report</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">Coming soon</Badge>
        </div>
        <p className="text-sm text-slate-600">
          Cleaning records are planned. Fridge/freezer checks are working today.
        </p>
        <div className="mt-5">
          <Link href="/app/checks/new">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">Go to fridge check</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
