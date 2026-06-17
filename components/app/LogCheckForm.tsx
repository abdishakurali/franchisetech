"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2, Thermometer, Clock, HelpCircle, Info } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatTemp, assetTypeLabel, assetDisplayName } from "@/lib/temperature";
import {
  type CheckCategory,
  type TempStatus,
  evaluateByCategory,
  evaluateCooling,
  getCategoryForAssetType,
  statusBg,
  statusLabel,
  targetRangeLabelForCategory,
  categoryNeedsUnit,
  CATEGORY_META,
  CHECK_TYPE_OPTIONS,
} from "@/lib/food-safety-rules";
import { toast } from "sonner";
import type { Site, Asset } from "@/lib/types";
import { differenceInHours } from "date-fns";

function toDatetimeLocal(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

const schema = z.object({
  checkCategory:      z.string().min(1),
  siteId:             z.string().optional(),
  assetId:            z.string().optional(),
  foodItem:           z.string().optional(),
  supplierName:       z.string().optional(),
  deliveryType:       z.string().optional(),
  valueC:             z.string().optional(),
  takenAt:            z.string().min(1, "Enter when the check happened"),
  finishedCookingAt:  z.string().optional(),
  placedInFridgeAt:   z.string().optional(),
  source:             z.enum(["manual", "probe", "bluetooth"]),
  notes:              z.string().optional(),
});

const actionSchema = z.object({
  actionType:        z.string().min(1, "Select what was done"),
  description:       z.string().min(5, "Describe what was done"),
  followUpRequired:  z.boolean().optional(),
});

type FormData       = z.infer<typeof schema>;
type ActionFormData = z.infer<typeof actionSchema>;

const ACTION_OPTIONS = [
  { value: "door_checked",         label: "Checked door was closed" },
  { value: "moved_stock",          label: "Moved stock to backup unit" },
  { value: "adjusted_unit",        label: "Adjusted thermostat / settings" },
  { value: "rechecked",            label: "Rechecked after 30 minutes" },
  { value: "called_maintenance",   label: "Called maintenance" },
  { value: "discarded_food",       label: "Discarded affected food" },
  { value: "escalated_to_manager", label: "Escalated to manager" },
  { value: "other",                label: "Other" },
];

const SUGGESTED_DESCRIPTIONS = [
  "Checked door was fully closed",
  "Moved stock to backup unit and called maintenance",
  "Adjusted thermostat and will recheck in 30 minutes",
  "Discarded affected food and called maintenance",
  "Escalated to manager on duty",
];

interface Props {
  sites:               Site[];
  assets:              Array<Asset & { sites?: { name: string } | null }>;
  orgId:               string;
  userId:              string;
  preselectedAssetId?: string;
  preselectedSiteId?:  string;
  initialCategory?:    CheckCategory;
  tour?:               string;
}

export function LogCheckForm({
  sites,
  assets,
  orgId,
  userId,
  preselectedAssetId,
  preselectedSiteId,
  initialCategory,
  tour,
}: Props) {
  const router   = useRouter();
  const supabase = createClient();

  const [tempStatus,   setTempStatus]   = useState<TempStatus | null>(null);
  const [showAction,   setShowAction]   = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [readingId,    setReadingId]    = useState<string | null>(null);
  const [savedOk,      setSavedOk]      = useState(false);
  const [coolingStatus, setCoolingStatus] = useState<TempStatus | null>(null);

  // Infer initial category from preselected asset
  const inferredCategory = (): CheckCategory => {
    if (initialCategory) return initialCategory;
    if (preselectedAssetId) {
      const a = assets.find((x) => x.id === preselectedAssetId);
      if (a) return getCategoryForAssetType(a.asset_type);
    }
    return "cold_storage";
  };

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      checkCategory:  inferredCategory(),
      siteId:         preselectedSiteId  ?? sites[0]?.id ?? "",
      assetId:        preselectedAssetId ?? "",
      takenAt:        toDatetimeLocal(new Date()),
      source:         "manual",
      deliveryType:   "chilled",
    },
  });

  const actionForm = useForm<ActionFormData>({
    resolver: zodResolver(actionSchema),
    defaultValues: { actionType: "", description: "", followUpRequired: false },
  });

  const watchedCategory  = form.watch("checkCategory") as CheckCategory;
  const watchedAssetId   = form.watch("assetId");
  const watchedSiteId    = form.watch("siteId");
  const watchedTemp      = form.watch("valueC");
  const watchedDelivery  = form.watch("deliveryType");
  const watchedFinished  = form.watch("finishedCookingAt");
  const watchedFridge    = form.watch("placedInFridgeAt");

  const needsUnit       = categoryNeedsUnit(watchedCategory);
  const isCooling       = watchedCategory === "cooling";
  const isDelivery      = watchedCategory === "delivery";
  const categoryMeta    = CATEGORY_META[watchedCategory];

  const filteredAssets  = watchedSiteId
    ? assets.filter((a) => a.site_id === watchedSiteId)
    : assets;
  const selectedAsset   = assets.find((a) => a.id === watchedAssetId) ?? null;

  // Auto-switch category when unit changes
  useEffect(() => {
    if (selectedAsset && needsUnit) {
      const cat = getCategoryForAssetType(selectedAsset.asset_type);
      form.setValue("checkCategory", cat);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedAssetId]);

  // Live status preview for temperature checks
  useEffect(() => {
    if (isCooling) { setTempStatus(null); return; }
    const v = parseFloat(watchedTemp ?? "");
    if (isNaN(v)) { setTempStatus(null); return; }
    setTempStatus(evaluateByCategory(watchedCategory, v, {
      deliveryType: watchedDelivery,
      customMin: selectedAsset?.min_temp ?? undefined,
      customMax: selectedAsset?.max_temp ?? undefined,
    }));
  }, [watchedTemp, watchedCategory, watchedDelivery, selectedAsset, isCooling]);

  // Live cooling status preview
  useEffect(() => {
    if (!isCooling || !watchedFinished || !watchedFridge) { setCoolingStatus(null); return; }
    setCoolingStatus(evaluateCooling(new Date(watchedFinished), new Date(watchedFridge)));
  }, [isCooling, watchedFinished, watchedFridge]);

  const resolveStatus = (): TempStatus => {
    if (isCooling) return coolingStatus ?? "pass";
    return tempStatus ?? "pass";
  };

  const saveReading = async (data: FormData, status: TempStatus) => {
    const valueC = data.valueC ? parseFloat(data.valueC) : null;
    return supabase.from("temperature_readings").insert({
      organisation_id: orgId,
      site_id:         data.siteId || null,
      asset_id:        data.assetId || null,
      value_c:         valueC,
      source:          data.source,
      taken_by:        userId,
      taken_at:        new Date(data.takenAt).toISOString(),
      status,
      notes:           data.notes || null,
      check_category:  data.checkCategory,
      food_item:       data.foodItem || null,
      supplier_name:   data.supplierName || null,
      delivery_type:   data.deliveryType || null,
      finished_cooking_at: data.finishedCookingAt ? new Date(data.finishedCookingAt).toISOString() : null,
      placed_in_fridge_at: data.placedInFridgeAt  ? new Date(data.placedInFridgeAt).toISOString()  : null,
    }).select().single();
  };

  const onSubmit = async (data: FormData) => {
    const status = resolveStatus();

    // Fail → pause and ask for action first
    if (status === "fail" && !readingId) {
      setSaving(true);
      const { data: reading, error } = await saveReading(data, status);
      setSaving(false);
      if (error) { toast.error("Failed to save: " + error.message); return; }
      console.info("[franchisetech] fail reading saved", { reading_id: reading.id, check_category: data.checkCategory });
      setReadingId(reading.id);
      setShowAction(true);
      toast.warning("Out of range — record the action taken.");
      return;
    }

    // Pass/warning — save directly
    setSaving(true);
    let finalReadingId = readingId;
    if (!readingId) {
      const { data: reading, error } = await saveReading(data, status);
      if (error) { setSaving(false); toast.error("Failed to save: " + error.message); return; }
      finalReadingId = reading.id;
      console.info("[franchisetech] reading saved", { reading_id: reading.id, check_category: data.checkCategory });
    }

    await supabase.from("audit_log").insert({
      organisation_id: orgId, actor_id: userId,
      action: "temperature_reading_created", entity_type: "temperature_readings",
      entity_id: finalReadingId,
      metadata: { check_category: data.checkCategory, status },
    }).select();

    setSaving(false);
    toast.success(`Check saved — ${statusLabel(status)}`);
    setSavedOk(true);
  };

  const onActionSubmit = async (actionData: ActionFormData) => {
    if (!readingId) return;
    setSaving(true);
    const { error } = await supabase.from("corrective_actions").insert({
      organisation_id:    orgId,
      site_id:            form.getValues("siteId") || null,
      asset_id:           form.getValues("assetId") || null,
      reading_id:         readingId,
      action_type:        actionData.actionType,
      description:        actionData.description,
      completed_by:       userId,
      completed_at:       new Date().toISOString(),
      follow_up_required: actionData.followUpRequired ?? false,
    });
    setSaving(false);
    if (error) { toast.error("Failed to save action: " + error.message); return; }
    toast.success("Action recorded.");
    setSavedOk(true);
  };

  // ── After successful save ──────────────────────────────────────────────────
  if (savedOk) {
    return (
      <div className="space-y-4 max-w-lg">
        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-900">Check saved successfully.</p>
              <p className="text-sm text-slate-600 mt-1">It now appears in your check records.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => { setSavedOk(false); setReadingId(null); setShowAction(false); setTempStatus(null); setCoolingStatus(null); form.reset({ checkCategory: watchedCategory, siteId: form.getValues("siteId"), assetId: form.getValues("assetId"), takenAt: toDatetimeLocal(new Date()), source: "manual", deliveryType: "chilled" }); actionForm.reset(); }} className="bg-blue-600 hover:bg-blue-700 text-white">
            Log another check
          </Button>
          <Button variant="outline" onClick={() => router.push("/app/checks")}>
            View all checks
          </Button>
          <Button variant="outline" onClick={() => router.push("/app/reports/refrigeration")}>
            View report
          </Button>
        </div>
      </div>
    );
  }

  // ── Action form ────────────────────────────────────────────────────────────
  if (showAction && readingId) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-800">Out of range — record the action taken</p>
              <p className="text-sm text-slate-600 mt-1">Every failed check must have an action recorded.</p>
            </div>
          </div>
        </div>
        <Card className="border-red-100">
          <CardHeader><CardTitle className="text-base">What action was taken?</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={actionForm.handleSubmit(onActionSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Action taken</Label>
                <Select value={actionForm.watch("actionType")} onValueChange={(v) => actionForm.setValue("actionType", v)}>
                  <SelectTrigger>
                    <span className="truncate">
                      {ACTION_OPTIONS.find((o) => o.value === actionForm.watch("actionType"))?.label ?? "Select what was done…"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {ACTION_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                {actionForm.formState.errors.actionType && <p className="text-xs text-red-600">{actionForm.formState.errors.actionType.message}</p>}
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">Quick fill:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_DESCRIPTIONS.map((s) => (
                    <button key={s} type="button" onClick={() => actionForm.setValue("description", s)}
                      className="text-xs rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 hover:border-blue-300 hover:text-blue-700 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea rows={3} placeholder="Describe exactly what was done…" {...actionForm.register("description")} />
                {actionForm.formState.errors.description && <p className="text-xs text-red-600">{actionForm.formState.errors.description.message}</p>}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="followUp" className="h-4 w-4 rounded border-slate-300" {...actionForm.register("followUpRequired")} />
                <Label htmlFor="followUp" className="font-normal text-sm">Follow-up check required</Label>
              </div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={saving}>
                {saving ? "Saving…" : "Save action taken"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Main log form ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 max-w-2xl">
      {/* Educational microcopy */}
      <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5">
        <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-600">
          These are default food-safety guidance values (FSAI-style). Your business remains responsible
          for following official guidance and your own food-safety procedures.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Thermometer className="h-5 w-5 text-blue-600" />
            Log a temperature check
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            {/* Check type */}
            <div className="space-y-1.5">
              <Label>Check type</Label>
              <Select
                value={watchedCategory}
                onValueChange={(v) => {
                  form.setValue("checkCategory", v);
                  // Clear unit/food fields when switching
                  if (!categoryNeedsUnit(v as CheckCategory)) {
                    form.setValue("assetId", "");
                  }
                }}
              >
                <SelectTrigger>
                  <span className="truncate">{categoryMeta?.label ?? watchedCategory}</span>
                </SelectTrigger>
                <SelectContent>
                  {CHECK_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div>
                        <span>{opt.label}</span>
                        <span className="text-slate-400 ml-2 text-xs">{opt.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {categoryMeta?.targetLabel && (
                <p className="text-xs text-slate-500">Target: {categoryMeta.targetLabel}</p>
              )}
              {categoryMeta?.disclaimer && (
                <p className="text-xs text-amber-700">{categoryMeta.disclaimer}</p>
              )}
            </div>

            {/* Kitchen (always shown) */}
            <div className="space-y-1.5">
              <Label>Kitchen</Label>
              <Select
                value={form.watch("siteId") ?? ""}
                onValueChange={(v) => { form.setValue("siteId", v); if (needsUnit) form.setValue("assetId", ""); }}
              >
                <SelectTrigger>
                  <span className="truncate">{sites.find((s) => s.id === form.watch("siteId"))?.name ?? "Choose kitchen…"}</span>
                </SelectTrigger>
                <SelectContent>
                  {sites.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Unit — only for unit-based checks */}
            {needsUnit && (
              <div className="space-y-1.5">
                <Label>Unit</Label>
                <Select value={form.watch("assetId") ?? ""} onValueChange={(v) => form.setValue("assetId", v)}>
                  <SelectTrigger>
                    <span className="truncate">
                      {selectedAsset ? `${selectedAsset.name} · ${assetTypeLabel(selectedAsset.asset_type)}` : "Choose unit…"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {filteredAssets.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name} · {assetTypeLabel(a.asset_type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Food item — for cooking/reheating/cooling */}
            {!needsUnit && !isDelivery && (
              <div className="space-y-1.5">
                <Label>Food item</Label>
                <Input placeholder="e.g. Roast chicken, Beef stew, Rice" {...form.register("foodItem")} />
              </div>
            )}

            {/* Delivery fields */}
            {isDelivery && (
              <>
                <div className="space-y-1.5">
                  <Label>Supplier</Label>
                  <Input placeholder="Supplier name" {...form.register("supplierName")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Product / description</Label>
                  <Input placeholder="e.g. Chicken fillets, Mixed salad" {...form.register("foodItem")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Delivery type</Label>
                  <Select value={form.watch("deliveryType") ?? "chilled"} onValueChange={(v) => form.setValue("deliveryType", v)}>
                    <SelectTrigger>
                      <span className="truncate capitalize">{form.watch("deliveryType") ?? "chilled"}</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chilled">Chilled (≤5°C)</SelectItem>
                      <SelectItem value="frozen">Frozen (≤-18°C)</SelectItem>
                      <SelectItem value="hot">Hot (≥63°C)</SelectItem>
                      <SelectItem value="ambient">Ambient (no temp rule)</SelectItem>
                    </SelectContent>
                  </Select>
                  {watchedDelivery && (
                    <p className="text-xs text-slate-500">
                      Target: {targetRangeLabelForCategory("delivery", watchedDelivery)}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Cooling: time fields */}
            {isCooling ? (
              <>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-slate-400" />Finished cooking at</Label>
                  <Input type="datetime-local" className="w-64" {...form.register("finishedCookingAt")} />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-slate-400" />Placed in fridge at</Label>
                  <Input type="datetime-local" className="w-64" {...form.register("placedInFridgeAt")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Temperature when placed in fridge °C (optional)</Label>
                  <Input type="number" step="0.1" placeholder="e.g. 18.0" className="w-40" {...form.register("valueC")} />
                </div>
                {coolingStatus && (
                  <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
                    coolingStatus === "pass" ? "bg-green-50 border-green-200" : coolingStatus === "warning" ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"
                  }`}>
                    {coolingStatus === "pass" ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
                    <span className={`text-sm font-medium ${coolingStatus === "pass" ? "text-green-700" : coolingStatus === "warning" ? "text-amber-700" : "text-red-700"}`}>
                      {coolingStatus === "pass" ? "Within 2 hours — pass" : coolingStatus === "warning" ? "Over 2 hours — warning" : "Over 2.5 hours — fail (action required)"}
                    </span>
                  </div>
                )}
              </>
            ) : (
              /* Temperature field for all non-cooling checks */
              <div className="space-y-1.5">
                <Label htmlFor="valueC">Temperature (°C)</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="valueC"
                    type="number"
                    step="0.1"
                    placeholder={
                      watchedCategory === "cooking" || watchedCategory === "reheating" ? "e.g. 75.0" :
                      watchedCategory === "hot_holding" ? "e.g. 65.0" :
                      watchedCategory === "frozen_storage" ? "e.g. -20.0" :
                      "e.g. 4.0"
                    }
                    className="w-40"
                    {...form.register("valueC")}
                  />
                  {tempStatus && (
                    <Badge variant="outline" className={`text-sm px-3 py-1 ${statusBg(tempStatus)}`}>
                      {statusLabel(tempStatus)}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Checked at */}
            {!isCooling && (
              <div className="space-y-1.5">
                <Label htmlFor="takenAt" className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  When was this checked?
                </Label>
                <Input id="takenAt" type="datetime-local" className="w-64" {...form.register("takenAt")} />
                {form.watch("takenAt") && differenceInHours(new Date(), new Date(form.watch("takenAt"))) >= 2 && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 w-fit">
                    <Clock className="h-3 w-3" /> Entered later — this will be noted.
                  </div>
                )}
              </div>
            )}

            {/* Cooling checked-at */}
            {isCooling && (
              <div className="space-y-1.5">
                <Label htmlFor="takenAt">Record entered at</Label>
                <Input id="takenAt" type="datetime-local" className="w-64" {...form.register("takenAt")} />
              </div>
            )}

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" rows={2} placeholder="Any observations…" {...form.register("notes")} />
            </div>

            {/* Status alerts */}
            {!isCooling && tempStatus === "fail" && (
              <Alert className="bg-red-50 border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  Out of safe range. You will need to record what action was taken.
                </AlertDescription>
              </Alert>
            )}
            {!isCooling && tempStatus === "warning" && (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700">In the warning range — monitor closely.</AlertDescription>
              </Alert>
            )}
            {!isCooling && tempStatus === "pass" && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">Within the safe range.</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={saving}>
              {saving ? "Saving…" : (resolveStatus() === "fail" ? "Save & record action taken" : "Save check")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
