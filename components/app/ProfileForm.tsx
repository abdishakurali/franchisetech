"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";

export function ProfileForm({
  userId,
  email,
  profile,
  organisation,
  canEditBusiness,
}: {
  userId: string;
  email: string;
  profile: { full_name: string | null; role_title?: string | null; phone?: string | null } | null;
  organisation: { id: string; name: string; business_type: string | null } | null;
  canEditBusiness: boolean;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: profile?.full_name ?? "",
    roleTitle: profile?.role_title ?? "",
    phone: profile?.phone ?? "",
    businessName: organisation?.name ?? "",
    businessType: organisation?.business_type ?? "",
  });

  const save = async () => {
    setSaving(true);
    setMessage(null);
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      email,
      full_name: form.fullName || null,
      role_title: form.roleTitle || null,
      phone: form.phone || null,
    });
    const { error: orgError } = canEditBusiness && organisation
      ? await supabase.from("organisations").update({
          name: form.businessName,
          business_type: form.businessType || null,
        }).eq("id", organisation.id)
      : { error: null };
    setSaving(false);
    if (profileError || orgError) {
      setMessage({ type: "error", text: profileError?.message ?? orgError?.message ?? "Could not save profile." });
      return;
    }
    setMessage({ type: "success", text: "Profile saved." });
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {message && (
        <Alert className={message.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}
      <Card className="border-slate-100">
        <CardHeader><CardTitle className="text-base">Your profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5"><Label>Full name</Label><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Role/title</Label><Input value={form.roleTitle} onChange={(e) => setForm({ ...form, roleTitle: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Phone optional</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Email</Label><Input value={email} readOnly /></div>
        </CardContent>
      </Card>
      <Card className="border-slate-100">
        <CardHeader><CardTitle className="text-base">Business</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5"><Label>Business name</Label><Input value={form.businessName} disabled={!canEditBusiness} onChange={(e) => setForm({ ...form, businessName: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Business type</Label><Input value={form.businessType} disabled={!canEditBusiness} onChange={(e) => setForm({ ...form, businessType: e.target.value })} /></div>
          {!canEditBusiness && <p className="text-xs text-slate-500">Only owners and managers can edit business details.</p>}
        </CardContent>
      </Card>
      <Button onClick={save} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
        {saving ? "Saving..." : "Save profile"}
      </Button>
    </div>
  );
}
