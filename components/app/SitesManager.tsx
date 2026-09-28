"use client";

import { useState } from "react";
import { MapPin, Plus, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { addSite } from "@/app/actions/kitchenops";
import { toast } from "sonner";

type Site = {
  id: string;
  organisation_id: string;
  name: string;
  address: string | null;
  city: string | null;
  eircode: string | null;
  created_at: string;
};

interface Props {
  sites: Site[];
  assetCounts: Record<string, number>;
  canManage: boolean;
}

export function SitesManager({ sites: initialSites, assetCounts, canManage }: Props) {
  const [sites, setSites] = useState(initialSites);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", city: "", eircode: "" });

  const handleAdd = async () => {
    if (!form.name) { toast.error("Site name is required"); return; }
    setSaving(true);
    const fd = new FormData();
    fd.set("name", form.name);
    fd.set("address", form.address);
    fd.set("city", form.city);
    fd.set("eircode", form.eircode);
    const result = await addSite(fd);
    setSaving(false);
    if (!result.ok) { toast.error("Failed to add site: " + result.error); return; }
    setSites((prev) => [...prev, result.site]);
    setOpen(false);
    setForm({ name: "", address: "", city: "", eircode: "" });
    toast.success("Site added");
  };

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground h-9 px-4 py-2 transition-colors outline-none">
              <Plus className="h-4 w-4" />Add site
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Add site</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label>Site name *</Label>
                  <Input placeholder="e.g. Temple Bar Kitchen" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Address</Label>
                  <Input placeholder="Street address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>City</Label>
                    <Input placeholder="Dublin" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Eircode</Label>
                    <Input placeholder="D02 X285" value={form.eircode} onChange={(e) => setForm((f) => ({ ...f, eircode: e.target.value }))} />
                  </div>
                </div>
                <Button onClick={handleAdd} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={saving}>
                  {saving ? "Adding…" : "Add site"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {sites.length === 0 ? (
        <Card className="border-border">
          <CardContent className="text-center py-12">
            <Building className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No sites yet</p>
            <p className="text-muted-foreground text-sm mt-1">Add your first site to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {sites.map((site) => (
            <Card key={site.id} className="border-border hover:border-brass/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-brass" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{site.name}</p>
                    {site.address && <p className="text-sm text-muted-foreground mt-0.5">{site.address}</p>}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {[site.city, site.eircode].filter(Boolean).join(" · ")}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="secondary" className="text-xs">
                        {assetCounts[site.id] ?? 0} asset{(assetCounts[site.id] ?? 0) !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
