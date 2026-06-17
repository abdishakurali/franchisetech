"use client";

import { useState } from "react";
import { ClipboardCheck, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type Site = { id: string; name: string };
type DeliveryRecord = { supplier_name: string; product_name: string; status: string; received_at?: string; created_at?: string; profiles?: { full_name: string | null; email?: string | null } | null };
type CleaningRecord = { checklist_name: string; status: string };

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
      <Card className="lg:col-span-2 border-slate-100">
        <CardHeader><CardTitle>Delivery label check</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-500">Enter supplier, batch, use-by, storage, and delivery evidence.</p>
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
          <Button onClick={save} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">{saving ? "Saving..." : "Save delivery check"}</Button>
        </CardContent>
      </Card>
      <RecentList title="Recent deliveries" records={records.map((r) => `${r.product_name} - ${r.supplier_name} - ${r.status.replace("_", " ")} - ${r.profiles?.full_name ?? r.profiles?.email ?? "Unknown staff"}`)} />
    </div>
  );
}

export function CleaningForm({ orgId, userId, sites, records }: { orgId: string; userId: string; sites: Site[]; records: CleaningRecord[] }) {
  const supabase = createClient();
  const items = ["Food contact surfaces cleaned", "Fridge handles cleaned", "Floors cleaned", "Bins emptied", "Sanitiser available", "Handwash station stocked"];
  const [checked, setChecked] = useState<Record<string, boolean>>(Object.fromEntries(items.map((i) => [i, true])));
  const [siteId, setSiteId] = useState(sites[0]?.id ?? "");
  const [notes, setNotes] = useState("");

  const save = async () => {
    const allDone = items.every((i) => checked[i]);
    const { error } = await supabase.from("cleaning_checks").insert({
      organisation_id: orgId,
      site_id: siteId || null,
      checklist_name: "Daily close-down cleaning",
      items: items.map((label) => ({ label, completed: checked[label] })),
      status: allDone ? "completed" : "partial",
      completed_by: userId,
      notes,
    });
    if (error) return toast.error(error.message);
    toast.success("Cleaning check saved");
    location.reload();
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 border-slate-100">
        <CardHeader><CardTitle>Cleaning check</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <SelectBox label="Kitchen" value={siteId} values={sites.map((s) => [s.id, s.name])} onChange={setSiteId} />
          <div className="space-y-2">
            {items.map((item) => (
              <label key={item} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 text-sm">
                <input type="checkbox" checked={checked[item]} onChange={(e) => setChecked({ ...checked, [item]: e.target.checked })} />
                {item}
              </label>
            ))}
          </div>
          <Textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <Button onClick={save} className="bg-blue-600 hover:bg-blue-700 text-white">Save cleaning check</Button>
        </CardContent>
      </Card>
      <RecentList title="Recent cleaning checks" records={records.map((r) => `${r.checklist_name} - ${r.status.replace("_", " ")}`)} />
    </div>
  );
}

export function ProcessCheckForm({ orgId, userId, sites, type, title }: { orgId: string; userId: string; sites: Site[]; type: "cooking" | "cooling" | "hot_hold"; title: string }) {
  const supabase = createClient();
  const [form, setForm] = useState({ siteId: sites[0]?.id ?? "", food: "", temp: "", startTemp: "", endTemp: "", action: "", notes: "" });
  const temp = Number(form.temp);
  const status = type === "hot_hold" ? (temp >= 63 ? "pass" : temp >= 60 ? "warning" : "fail") : type === "cooking" ? (temp >= 70 ? "pass" : "fail") : "pass";

  const save = async () => {
    if (status === "fail" && !form.action) return toast.error("Record the action taken");
    const { error } = await supabase.from("food_process_checks").insert({
      organisation_id: orgId,
      site_id: form.siteId || null,
      check_type: type,
      food_item: form.food,
      temperature_c: form.temp ? Number(form.temp) : null,
      start_temp_c: form.startTemp ? Number(form.startTemp) : null,
      end_temp_c: form.endTemp ? Number(form.endTemp) : null,
      status,
      action_taken: form.action || null,
      checked_by: userId,
      notes: form.notes,
    });
    if (error) return toast.error(error.message);
    toast.success(`${title} saved`);
  };

  return (
    <Card className="border-slate-100 max-w-2xl">
      <CardHeader><CardTitle className="flex items-center gap-2"><Flame className="h-5 w-5 text-blue-600" />{title}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <SelectBox label="Kitchen" value={form.siteId} values={sites.map((s) => [s.id, s.name])} onChange={(siteId) => setForm({ ...form, siteId })} />
        <Field label="Food item" value={form.food} onChange={(food) => setForm({ ...form, food })} />
        {type === "cooling" ? (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start temp °C" type="number" value={form.startTemp} onChange={(startTemp) => setForm({ ...form, startTemp })} />
            <Field label="End temp °C" type="number" value={form.endTemp} onChange={(endTemp) => setForm({ ...form, endTemp })} />
          </div>
        ) : (
          <Field label={type === "cooking" ? "Core temperature °C" : "Hot-hold temperature °C"} type="number" value={form.temp} onChange={(temp) => setForm({ ...form, temp })} />
        )}
        {type !== "cooling" && <p className="text-sm text-slate-600">Status: <strong className={status === "pass" ? "text-green-700" : status === "warning" ? "text-amber-700" : "text-red-700"}>{status}</strong></p>}
        {status === "fail" && <Field label="Action taken" value={form.action} onChange={(action) => setForm({ ...form, action })} />}
        <Textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <Button onClick={save} className="bg-blue-600 hover:bg-blue-700 text-white">Save check</Button>
      </CardContent>
    </Card>
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
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
          No kitchen found. Complete onboarding or add a kitchen first.
        </div>
      </div>
    );
  }
  return <div className="space-y-1.5"><Label>{label}</Label><Select value={value} onValueChange={onChange}><SelectTrigger><span className="truncate">{selectedLabel}</span></SelectTrigger><SelectContent>{values.map(([v,l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></div>;
}

function RecentList({ title, records }: { title: string; records: string[] }) {
  return (
    <Card className="border-slate-100">
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><ClipboardCheck className="h-4 w-4" />{title}</CardTitle></CardHeader>
      <CardContent>{records.length ? <div className="space-y-2">{records.slice(0, 8).map((r) => <p key={r} className="text-sm text-slate-600 border-b border-slate-50 pb-2">{r}</p>)}</div> : <p className="text-sm text-slate-400">No checks yet.</p>}</CardContent>
    </Card>
  );
}
