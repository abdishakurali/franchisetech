"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, QrCode, Thermometer, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { assetTypeLabel, getDefaultThresholds } from "@/lib/temperature";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Asset, Site } from "@/lib/types";

interface Props {
  assets: Array<Asset & { sites?: { name: string; city: string | null } | null }>;
  sites: Site[];
  orgId: string;
  canManage: boolean;
}

const assetTypes = [
  { value: "fridge", label: "Fridge" },
  { value: "freezer", label: "Freezer" },
  { value: "cold_room", label: "Cold Room" },
  { value: "chill_display", label: "Chill Display" },
  { value: "hot_hold", label: "Hot Hold" },
  { value: "probe", label: "Probe" },
  { value: "other", label: "Other" },
];

function generateQrCode() {
  return `FP-ASSET-${Math.random().toString(36).toUpperCase().slice(2, 8)}`;
}

export function AssetsManager({ assets: initialAssets, sites, orgId, canManage }: Props) {
  const supabase = createClient();
  const [assets, setAssets] = useState(initialAssets);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    siteId: "",
    name: "",
    assetType: "fridge" as Asset["asset_type"],
    location: "",
    minTemp: "",
    maxTemp: "",
    qrCode: generateQrCode(),
  });
  const selectedSiteName = sites.find((site) => site.id === form.siteId)?.name;
  const selectedTypeLabel = assetTypes.find((type) => type.value === form.assetType)?.label ?? "Fridge";

  const handleTypeChange = (type: Asset["asset_type"]) => {
    const defaults = getDefaultThresholds(type);
    setForm((f) => ({
      ...f,
      assetType: type,
      minTemp: defaults.minTemp !== null ? String(defaults.minTemp) : "",
      maxTemp: defaults.maxTemp !== null ? String(defaults.maxTemp) : "",
    }));
  };

  const handleAdd = async () => {
    if (!form.siteId || !form.name || !form.assetType) {
      toast.error("Please fill in required fields");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("assets")
      .insert({
        organisation_id: orgId,
        site_id: form.siteId,
        name: form.name,
        asset_type: form.assetType,
        location: form.location || null,
        qr_code: form.qrCode,
        min_temp: form.minTemp ? parseFloat(form.minTemp) : null,
        max_temp: form.maxTemp ? parseFloat(form.maxTemp) : null,
        active: true,
      })
      .select("*, sites(name, city)")
      .single();

    setSaving(false);
    if (error) {
      toast.error("Failed to add asset: " + error.message);
      return;
    }
    setAssets((prev) => [...prev, data]);
    setOpen(false);
    setForm({ siteId: "", name: "", assetType: "fridge", location: "", minTemp: "", maxTemp: "", qrCode: generateQrCode() });
    toast.success("Asset added");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 py-2 transition-colors outline-none">
              <Plus className="h-4 w-4" />
              Add fridge/freezer/unit
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add fridge/freezer/unit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label>Kitchen</Label>
                  <Select value={form.siteId} onValueChange={(v: string) => setForm((f) => ({ ...f, siteId: v }))}>
                    <SelectTrigger><span className="truncate">{selectedSiteName ?? "Select kitchen…"}</span></SelectTrigger>
                    <SelectContent>
                      {sites.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input
                    placeholder="e.g. Walk-in Cold Room"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <Select value={form.assetType} onValueChange={(v: string) => handleTypeChange(v as Asset["asset_type"])}>
                    <SelectTrigger><span className="truncate">{selectedTypeLabel}</span></SelectTrigger>
                    <SelectContent>
                      {assetTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Location (optional)</Label>
                  <Input
                    placeholder="e.g. Back of house, left of corridor"
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Min temp (°C)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 0"
                      value={form.minTemp}
                      onChange={(e) => setForm((f) => ({ ...f, minTemp: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Max temp (°C)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 5"
                      value={form.maxTemp}
                      onChange={(e) => setForm((f) => ({ ...f, maxTemp: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>QR code</Label>
                  <div className="flex gap-2">
                    <Input value={form.qrCode} readOnly className="font-mono text-sm" />
                    <Button variant="outline" size="sm" onClick={() => setForm((f) => ({ ...f, qrCode: generateQrCode() }))}>
                      Regenerate
                    </Button>
                  </div>
                  <p className="text-xs text-slate-400">
                    Staff can scan this code to open the quick-check form for this unit.
                  </p>
                </div>
                <Button onClick={handleAdd} className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={saving}>
                  {saving ? "Adding…" : "Add fridge/freezer/unit"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {assets.length === 0 ? (
        <Card className="border-slate-100">
          <CardContent className="text-center py-12">
            <Thermometer className="h-10 w-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No equipment yet</p>
            <p className="text-slate-400 text-sm mt-1">Add your first fridge, freezer, or cold room.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => (
            <Card key={asset.id} className="border-slate-100 hover:border-blue-200 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-900">{asset.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{asset.sites?.name}</p>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize flex-shrink-0 ml-2">
                    {assetTypeLabel(asset.asset_type)}
                  </Badge>
                </div>
                {asset.location && (
                  <p className="text-xs text-slate-500 mb-3">{asset.location}</p>
                )}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span>
                    Range:{" "}
                    {asset.min_temp !== null ? `${asset.min_temp}°C` : "—"}
                    {" "}to{" "}
                    {asset.max_temp !== null ? `${asset.max_temp}°C` : "—"}
                  </span>
                  <Badge variant={asset.active ? "secondary" : "outline"} className="text-xs">
                    {asset.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {asset.qr_code && (
                  <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 mb-3">
                    <QrCode className="h-3 w-3" />
                    {asset.qr_code}
                  </div>
                )}
                <div className="flex gap-2">
                  <Link href={`/app/checks/new?assetId=${asset.id}&siteId=${asset.site_id}`} className="flex-1">
                    <Button size="sm" variant="outline" className="w-full gap-1.5">
                      <Thermometer className="h-3 w-3" />
                      Log check
                    </Button>
                  </Link>
                  {asset.qr_code && (
                    <Link href={`/app/quick-check/${asset.qr_code}`}>
                      <Button size="sm" variant="ghost" className="px-2">
                        <QrCode className="h-4 w-4 text-slate-500" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
