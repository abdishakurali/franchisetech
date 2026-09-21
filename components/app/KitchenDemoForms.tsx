"use client";

import { useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// CleaningForm and ProcessCheckForm (cooking/cooling/hot-hold) lived here
// until Step 10 deleted the HACCP check routes that used them. DeliveryForm
// stays — /app/deliveries still calls it, and delivery is a separate,
// not-yet-due deletion group.
type Site = { id: string; name: string };
type DeliveryRecord = { supplier_name: string; product_name: string; status: string; received_at?: string; created_at?: string; profiles?: { full_name: string | null; email?: string | null } | null };

export function DeliveryForm({ orgId, userId, sites, records }: { orgId: string; userId: string; sites: Site[]; records: DeliveryRecord[] }) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    siteId: sites[0]?.id ?? "",
    supplier: "",
    product: "",
    batch: "",
    useBy: "",
    storage: "chilled",
    quantity: "",
    status: "conditional",
    receivedAt: new Date().toISOString().slice(0, 16),
    notes: "",
  });

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("delivery_records").insert({
      organisation_id: orgId,
      site_id: form.siteId || null,
      supplier_name: form.supplier,
      product_name: form.product,
      batch_lot: form.batch,
      use_by_date: form.useBy || null,
      storage_type: form.storage,
      quantity: form.quantity,
      status: form.status,
      received_at: form.receivedAt ? new Date(form.receivedAt).toISOString() : new Date().toISOString(),
      notes: form.notes,
      created_by: userId,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Delivery check saved");
    location.reload();
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 border-border">
        <CardHeader><CardTitle>Delivery label check</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Enter supplier, batch, use-by, storage, and delivery evidence.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Supplier" value={form.supplier} onChange={(supplier) => setForm({ ...form, supplier })} />
            <Field label="Product" value={form.product} onChange={(product) => setForm({ ...form, product })} />
            <Field label="Batch / lot" value={form.batch} onChange={(batch) => setForm({ ...form, batch })} />
            <Field label="Use-by" type="date" value={form.useBy} onChange={(useBy) => setForm({ ...form, useBy })} />
            <Field label="Quantity" value={form.quantity} onChange={(quantity) => setForm({ ...form, quantity })} />
            <Field label="Received at" type="datetime-local" value={form.receivedAt} onChange={(receivedAt) => setForm({ ...form, receivedAt })} />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <SelectBox label="Kitchen" value={form.siteId} values={sites.map((s) => [s.id, s.name])} onChange={(siteId) => setForm({ ...form, siteId })} />
            <SelectBox label="Storage" value={form.storage} values={[["chilled","Chilled"],["frozen","Frozen"],["dry","Dry"],["hot","Hot"],["ambient","Ambient"]]} onChange={(storage) => setForm({ ...form, storage })} />
            <SelectBox label="Status" value={form.status} values={[["accepted","Accepted"],["rejected","Rejected"],["conditional","Needs review"]]} onChange={(status) => setForm({ ...form, status })} />
          </div>
          <Textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <Button onClick={save} disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground">{saving ? "Saving..." : "Save delivery check"}</Button>
        </CardContent>
      </Card>
      <RecentList title="Recent deliveries" records={records.map((r) => `${r.product_name} - ${r.supplier_name} - ${r.status.replace("_", " ")} - ${r.profiles?.full_name ?? r.profiles?.email ?? "Unknown staff"}`)} />
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return <div className="space-y-1.5"><Label>{label}</Label><Input type={type} value={value} onChange={(e) => onChange(e.target.value)} /></div>;
}

function SelectBox({ label, value, values, onChange }: { label: string; value: string; values: string[][]; onChange: (v: string) => void }) {
  const selectedLabel = values.find(([v]) => v === value)?.[1] ?? "Select…";
  if (!values.length) {
    return (
      <div className="space-y-1.5">
        <Label>{label}</Label>
        <div className="rounded-md border border-border bg-secondary px-3 py-2 text-sm text-muted-foreground">
          No kitchen found. Complete onboarding or add a kitchen first.
        </div>
      </div>
    );
  }
  return <div className="space-y-1.5"><Label>{label}</Label><Select value={value} onValueChange={onChange}><SelectTrigger><span className="truncate">{selectedLabel}</span></SelectTrigger><SelectContent>{values.map(([v,l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></div>;
}

function RecentList({ title, records }: { title: string; records: string[] }) {
  return (
    <Card className="border-border">
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><ClipboardCheck className="h-4 w-4" />{title}</CardTitle></CardHeader>
      <CardContent>{records.length ? <div className="space-y-2">{records.slice(0, 8).map((r) => <p key={r} className="text-sm text-mid border-b border-border pb-2">{r}</p>)}</div> : <p className="text-sm text-muted-foreground">No checks yet.</p>}</CardContent>
    </Card>
  );
}
