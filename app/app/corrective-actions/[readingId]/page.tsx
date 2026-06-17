"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { AlertTriangle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";
import { formatTemp, targetRangeLabel, statusBg } from "@/lib/temperature";
import { toast } from "sonner";
import Link from "next/link";

const ACTION_OPTIONS = [
  { value: "door_checked", label: "Checked door was closed" },
  { value: "moved_stock", label: "Moved stock to backup fridge/freezer" },
  { value: "adjusted_unit", label: "Adjusted thermostat" },
  { value: "rechecked", label: "Rechecked after 30 minutes" },
  { value: "called_maintenance", label: "Called maintenance" },
  { value: "discarded_food", label: "Discarded affected food" },
  { value: "escalated_to_manager", label: "Escalated to manager" },
  { value: "other", label: "Other" },
];

const SUGGESTED = [
  "Checked door was fully closed",
  "Moved stock to backup fridge and called maintenance",
  "Adjusted thermostat and will recheck in 30 minutes",
  "Discarded affected food and called maintenance",
  "Escalated to manager on duty",
];

const schema = z.object({
  actionType: z.string().min(1, "Select what was done"),
  description: z.string().min(5, "Describe what was done (at least 5 characters)"),
  followUpRequired: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

type Reading = {
  id: string;
  value_c: number | null;
  check_category?: string | null;
  food_item?: string | null;
  status: string;
  taken_at: string;
  organisation_id: string;
  site_id: string | null;
  asset_id: string | null;
  taken_by: string | null;
  assets?: { name: string; asset_type: string; min_temp: number | null; max_temp: number | null } | null;
  sites?: { name: string } | null;
  profiles?: { full_name: string | null; email: string | null } | null;
};

export default function RecordActionPage() {
  const params = useParams<{ readingId: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [reading, setReading] = useState<Reading | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { actionType: "", description: "", followUpRequired: false },
  });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);

      const { data: r, error } = await supabase
        .from("temperature_readings")
        .select("id, value_c, status, taken_at, organisation_id, site_id, asset_id, taken_by, check_category, food_item, assets(name, asset_type, min_temp, max_temp), sites(name), profiles!taken_by(full_name, email)")
        .eq("id", params.readingId)
        .single();

      if (error || !r) {
        setLoadError("Could not load this check. It may not exist.");
        return;
      }
      if (r.status !== "fail") {
        setLoadError("This check does not require an action (not a fail).");
        return;
      }

      // Verify user belongs to same org
      const { data: member } = await supabase
        .from("organisation_members")
        .select("organisation_id")
        .eq("user_id", user.id)
        .eq("organisation_id", r.organisation_id)
        .single();

      if (!member) {
        setLoadError("You do not have access to this record.");
        return;
      }

      // Check if action already exists
      const { data: existingAction } = await supabase
        .from("corrective_actions")
        .select("id")
        .eq("reading_id", params.readingId)
        .limit(1)
        .single();

      if (existingAction) {
        router.push("/app/corrective-actions");
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setReading(r as any);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.readingId]);

  const onSubmit = async (data: FormData) => {
    if (!reading || !userId) return;
    setSaving(true);

    const { error } = await supabase.from("corrective_actions").insert({
      organisation_id: reading.organisation_id,
      site_id: reading.site_id,
      asset_id: reading.asset_id,
      reading_id: reading.id,
      action_type: data.actionType,
      description: data.description,
      completed_by: userId,
      completed_at: new Date().toISOString(),
      follow_up_required: data.followUpRequired ?? false,
    });

    setSaving(false);

    if (error) {
      console.error("[record-action] insert error", { code: error.code, message: error.message });
      toast.error("Failed to save: " + error.message);
      return;
    }

    setSaved(true);
    toast.success("Action recorded successfully.");
    setTimeout(() => router.push("/app/corrective-actions"), 1200);
  };

  if (loadError) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href="/app/corrective-actions">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Actions Taken
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!reading) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <p className="text-sm text-slate-500">Loading check…</p>
      </div>
    );
  }

  if (saved) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
          <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-3" />
          <p className="font-semibold text-slate-900">Action recorded</p>
          <p className="text-sm text-slate-600 mt-1">Returning to Actions Taken…</p>
        </div>
      </div>
    );
  }

  const asset = reading.assets as { asset_type?: string | null; name?: string | null } | null;
  const site = reading.sites as { name?: string | null } | null;
  const profile = reading.profiles as { full_name?: string | null; email?: string | null } | null;
  const assetType = asset?.asset_type ?? null;
  const unitName = asset?.name ?? "Unknown unit";
  const kitchenName = site?.name ?? "";
  const staffName = profile?.full_name ?? profile?.email ?? "Staff";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-5">
        <Link href="/app/corrective-actions" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> Actions Taken
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Record action taken</h1>
        <p className="text-slate-500 text-sm mt-1">
          Record what was done when this temperature check failed.
        </p>
      </div>

      {/* Failed reading summary */}
      <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-red-800">
              {reading.value_c != null ? `Failed check — ${formatTemp(reading.value_c)}` : `Failed check — ${reading.food_item ?? "food item"}`}
            </p>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-slate-600">
              <span>
                <span className="text-slate-400">Unit:</span> {unitName}
                {assetType && ` (${assetType.replace("_", " ")})`}
              </span>
              {kitchenName && (
                <span><span className="text-slate-400">Kitchen:</span> {kitchenName}</span>
              )}
              <span>
                <span className="text-slate-400">Checked at:</span>{" "}
                {format(new Date(reading.taken_at), "d MMM yyyy, HH:mm")}
              </span>
              <span><span className="text-slate-400">By:</span> {staffName}</span>
              {assetType && (
                <span>
                  <span className="text-slate-400">Safe range:</span>{" "}
                  {targetRangeLabel(assetType as Parameters<typeof targetRangeLabel>[0])}
                </span>
              )}
            </div>
          </div>
          <Badge variant="outline" className={statusBg("fail")}>Fail</Badge>
        </div>
      </div>

      <Card className="border-slate-100">
        <CardHeader><CardTitle className="text-base">What action was taken?</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Action type */}
            <div className="space-y-1.5">
              <Label>Action taken</Label>
              <Select
                value={form.watch("actionType")}
                onValueChange={(v) => form.setValue("actionType", v)}
              >
                <SelectTrigger>
                  <span className="truncate">
                    {ACTION_OPTIONS.find((o) => o.value === form.watch("actionType"))?.label ?? "Select what was done…"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {ACTION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.actionType && (
                <p className="text-xs text-red-600">{form.formState.errors.actionType.message}</p>
              )}
            </div>

            {/* Quick fill chips */}
            <div>
              <p className="text-xs text-slate-500 mb-2">Quick fill:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => form.setValue("description", s)}
                    className="text-xs rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 hover:border-blue-300 hover:text-blue-700 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Describe exactly what was done, when, and by whom…"
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className="text-xs text-red-600">{form.formState.errors.description.message}</p>
              )}
            </div>

            {/* Follow-up */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="followUp"
                className="h-4 w-4 rounded border-slate-300"
                {...form.register("followUpRequired")}
              />
              <Label htmlFor="followUp" className="font-normal text-sm">
                Follow-up check required
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save action taken"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
