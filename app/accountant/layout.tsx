import Link from "next/link";
import { redirect } from "next/navigation";
import { BriefcaseBusiness } from "lucide-react";
import { createClient, getAuthUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AccountantLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await getAuthUser();
  if (!user) redirect("/login");
  const { count } = await supabase.from("organisation_members").select("id", { count: "exact", head: true }).eq("user_id", user.id).in("role", ["owner", "manager", "accountant"]).or("status.is.null,status.eq.active");
  if (!count) redirect("/app");
  return <div className="min-h-screen bg-background"><header className="border-b border-border bg-card"><div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4"><Link href="/accountant" className="flex items-center gap-2 font-semibold"><BriefcaseBusiness className="size-5 text-brass" />Portal contabil</Link><span className="text-xs text-muted-foreground">Acces extern · doar citire</span></div></header>{children}</div>;
}
