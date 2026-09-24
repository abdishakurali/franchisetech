"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Trash2, UserRoundPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Accountant = {
  id: string;
  status: string | null;
  last_access_at: string | null;
  accountant_permissions?: string[];
  profile: { full_name: string | null; email: string | null } | null;
};

const permissions = [
  ["sales", "Vânzări"], ["cash", "Casă"], ["stock", "Stoc"],
  ["purchases", "Achiziții"], ["documents", "Documente"],
] as const;

export function AccountantAccessCard({ compact = false }: { compact?: boolean }) {
  const [accountants, setAccountants] = useState<Accountant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/team", { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    setAccountants((payload.members ?? []).filter((member: { role?: string }) => member.role === "accountant"));
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/team", { cache: "no-store" }).then(async (response) => {
      const payload = await response.json().catch(() => ({}));
      if (!active) return;
      setAccountants((payload.members ?? []).filter((member: { role?: string }) => member.role === "accountant"));
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  async function invite(formData: FormData) {
    setSaving(true); setMessage("");
    const email = String(formData.get("email") ?? "").trim();
    const fullName = String(formData.get("fullName") ?? "").trim() || "Contabil";
    const response = await fetch("/api/team", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, fullName, role: "accountant", sendInvite: true, accountantPermissions: formData.getAll("accountantPermissions") }),
    });
    const payload = await response.json().catch(() => ({}));
    setMessage(response.ok ? "Accesul a fost acordat. Contabilul poate folosi contul gratuit." : (payload.error ?? "Invitația nu a putut fi trimisă."));
    if (response.ok) await load();
    setSaving(false);
  }

  async function revoke(memberId: string) {
    if (!window.confirm("Revoci accesul acestui contabil?")) return;
    const response = await fetch(`/api/team/${memberId}`, { method: "DELETE" });
    setMessage(response.ok ? "Accesul a fost revocat." : "Accesul nu a putut fi revocat.");
    if (response.ok) await load();
  }

  return <Card className={compact ? "border-brass/30" : undefined}>
    <CardHeader>
      <CardTitle>Contabil</CardTitle>
      <CardDescription>Contabilul primește acces gratuit, doar pentru citire, la datele necesare. Îl poți revoca oricând.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-5">
      {loading ? <Loader2 className="size-4 animate-spin text-muted-foreground" /> : accountants.length > 0 ? (
        <div className="space-y-2">{accountants.map((accountant) => <div key={accountant.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
          <div className="min-w-0"><p className="truncate text-sm font-semibold">{accountant.profile?.full_name || "Contabil"}</p><p className="truncate text-xs text-muted-foreground">{accountant.profile?.email}</p><p className="mt-1 text-xs text-reconciled">Acces: {permissions.filter(([key]) => accountant.accountant_permissions?.includes(key)).map(([, label]) => label).join(", ") || "date contabile"}</p>{accountant.last_access_at && <p className="mt-1 text-xs text-muted-foreground">Ultimul acces: {new Intl.DateTimeFormat("ro-RO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(accountant.last_access_at))}</p>}</div>
          <Button type="button" variant="ghost" size="icon" aria-label="Revocă accesul" onClick={() => void revoke(accountant.id)}><Trash2 className="size-4" /></Button>
        </div>)}</div>
      ) : <p className="text-sm text-muted-foreground">Nu ai conectat încă un contabil.</p>}

      {!compact && <form action={invite} className="space-y-4 border-t border-border pt-5">
        <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-1.5"><Label htmlFor="accountant-email">Email contabil</Label><Input id="accountant-email" name="email" type="email" required autoComplete="email" /></div><div className="space-y-1.5"><Label htmlFor="accountant-name">Nume (opțional)</Label><Input id="accountant-name" name="fullName" /></div></div>
        <fieldset><legend className="mb-2 text-sm font-medium">Acces</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{permissions.map(([key, label]) => <label key={key} className="flex items-center gap-2 text-sm"><input type="checkbox" name="accountantPermissions" value={key} defaultChecked className="size-4 accent-[var(--brass)]" />{label}</label>)}</div><p className="mt-2 text-xs text-muted-foreground">Categoriile selectate sunt disponibile doar pentru citire.</p></fieldset>
        <Button type="submit" disabled={saving}>{saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <UserRoundPlus className="mr-2 size-4" />}Trimite invitația</Button>
      </form>}
      {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
    </CardContent>
  </Card>;
}
