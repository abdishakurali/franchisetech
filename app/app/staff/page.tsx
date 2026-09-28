import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { canManageTeam } from "@/lib/access-control";

export default async function StaffPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("organisation_members")
    .select("id, organisation_id, role")
    .eq("user_id", user.id)
    .or("status.is.null,status.eq.active")
    .limit(1)
    .single();

  if (!membership) redirect("/onboarding");

  const isOwner = canManageTeam(membership.role);

  const { data: members } = await supabase
    .from("organisation_members")
    .select("id, role, status, created_at, user_id, profiles(full_name, email, created_at)")
    .eq("organisation_id", membership.organisation_id)
    .or("status.is.null,status.eq.active")
    .order("created_at", { ascending: true });

  // Fetch sites for the org
  const { data: sites } = await supabase
    .from("sites")
    .select("id, name")
    .eq("organisation_id", membership.organisation_id)
    .order("name", { ascending: true });

  // Fetch site access for all members in one query
  const { data: allSiteAccess } = await supabase
    .from("member_site_access")
    .select("member_id, site_id, sites(name)")
    .eq("organisation_id", membership.organisation_id);

  const sitesByMember = new Map<string, { site_id: string; name: string }[]>();
  for (const row of allSiteAccess ?? []) {
    const siteName = (row.sites as unknown as { name: string } | null)?.name ?? "Unknown";
    const existing = sitesByMember.get(row.member_id) ?? [];
    existing.push({ site_id: row.site_id, name: siteName });
    sitesByMember.set(row.member_id, existing);
  }

  const roleColors: Record<string, string> = {
    owner: "bg-purple-50 text-purple-700 border-purple-200",
    manager: "bg-accent text-brass border-brass/25",
    staff: "bg-secondary text-foreground border-border",
    cashier: "bg-amber-50 text-amber-700 border-amber-200",
    auditor: "bg-reconciled/10 text-reconciled border-reconciled/25",
    kitchen: "bg-orange-50 text-orange-700 border-orange-200",
  };

  const multiSite = (sites?.length ?? 0) > 1;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Staff</h1>
        <p className="text-muted-foreground text-sm mt-1">Team members and their access levels</p>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-brass" />
              Organisation Members
            </CardTitle>
            <Badge variant="secondary">{members?.length ?? 0} members</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {!members || members.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No members found.</p>
          ) : (
            <div className="space-y-3">
              {members.map((m) => {
                const profile = m.profiles as unknown as { full_name: string | null; email: string | null; created_at: string } | null;
                const initials = (profile?.full_name ?? profile?.email ?? "?")
                  .split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                const memberSites = sitesByMember.get(m.id) ?? [];
                const isThisMemberOwner = m.role === "owner";
                return (
                  <div key={m.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="bg-accent text-brass text-sm font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{profile?.full_name ?? "Unnamed"}</p>
                        <p className="text-xs text-muted-foreground truncate">{profile?.email ?? "—"}</p>
                        {multiSite && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {isThisMemberOwner ? (
                              <span className="text-[10px] text-muted-foreground italic">All locations</span>
                            ) : memberSites.length > 0 ? (
                              memberSites.map((s) => (
                                <span key={s.site_id} className="text-[10px] bg-secondary text-mid rounded px-1.5 py-0.5">
                                  {s.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-amber-600 italic">No locations assigned</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pl-12 sm:pl-0">
                      <p className="text-xs text-muted-foreground hidden sm:block">
                        Joined {profile?.created_at ? format(new Date(profile.created_at), "d MMM yyyy") : "—"}
                      </p>
                      <Badge
                        variant="outline"
                        className={"text-xs capitalize " + (roleColors[m.role] ?? "")}
                      >
                        {m.role}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {multiSite && !isOwner && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
          <p className="text-sm text-amber-800">Location assignments are managed by the account owner.</p>
        </div>
      )}

      {multiSite && isOwner && (
        <div className="mt-4 p-3 bg-accent border border-brass/15 rounded-lg">
          <p className="text-sm text-brass font-medium">Multi-location access</p>
          <p className="text-xs text-brass mt-1">Staff site assignments shown above. Full location assignment management will be available in a future update.</p>
        </div>
      )}

      <div className="mt-6 p-4 bg-secondary rounded-lg border border-border">
        <h3 className="font-medium text-foreground mb-2">Access levels</h3>
        <div className="grid sm:grid-cols-2 gap-2 text-sm text-mid">
          {[
            { role: "Owner", desc: "Full access — manage organisation, staff, assets, and settings" },
            { role: "Manager", desc: "Verify records, view dashboards, manage corrective actions" },
            { role: "Cashier", desc: "POS only — create sales at assigned locations" },
            { role: "Kitchen", desc: "Kitchen display only — view and update orders at assigned kitchen" },
            { role: "Staff", desc: "Log temperature checks and corrective actions" },
            { role: "Auditor", desc: "Read-only access — view and export records" },
          ].map((r) => (
            <div key={r.role} className="flex gap-2">
              <span className="font-medium text-foreground w-16 flex-shrink-0">{r.role}:</span>
              <span>{r.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
