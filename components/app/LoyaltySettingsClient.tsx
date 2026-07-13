"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveLoyaltyProgramSettings } from "@/app/actions/loyalty";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LoyaltySettings = {
  stampsRequired: number;
  rewardType: "discount" | "free_item";
  rewardDiscountLei: number | null;
  rewardFreeProductId: string | null;
  rewardDescription: string;
  regularsMinVisits: number;
  regularsAtRiskDays: number;
};

export function LoyaltySettingsClient({
  settings,
  products,
}: {
  settings: LoyaltySettings;
  products: { id: string; name: string }[];
}) {
  const [rewardType, setRewardType] = useState(settings.rewardType);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await saveLoyaltyProgramSettings(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Setări salvate.");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Configurare recompensă</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="stamps_required">Ștampile pentru recompensă</Label>
            <Input
              id="stamps_required"
              name="stamps_required"
              type="number"
              min={3}
              max={20}
              defaultValue={settings.stampsRequired}
              className="mt-1 max-w-[8rem]"
            />
            <p className="mt-1 text-xs text-muted-foreground">Între 3 și 20 vizite finalizate.</p>
          </div>

          <div>
            <Label htmlFor="reward_type">Tip recompensă</Label>
            <Select
              name="reward_type"
              value={rewardType}
              onValueChange={(value) => setRewardType(value as "discount" | "free_item")}
            >
              <SelectTrigger id="reward_type" className="mt-1 max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discount">Discount fix (lei)</SelectItem>
                <SelectItem value="free_item">Produs gratuit</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="reward_type" value={rewardType} />
          </div>

          {rewardType === "discount" ? (
            <div>
              <Label htmlFor="reward_discount_lei">Valoare discount (lei)</Label>
              <Input
                id="reward_discount_lei"
                name="reward_discount_lei"
                type="number"
                min={0.01}
                step="0.01"
                defaultValue={settings.rewardDiscountLei ?? undefined}
                className="mt-1 max-w-[8rem]"
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="reward_free_product_id">Produs gratuit</Label>
              <Select name="reward_free_product_id" defaultValue={settings.rewardFreeProductId ?? undefined}>
                <SelectTrigger id="reward_free_product_id" className="mt-1 max-w-xs">
                  <SelectValue placeholder="Selectează produsul…" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-muted-foreground">
                La casă, casierul va vedea un indiciu să adauge acest produs cu 100% discount.
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="reward_description">Descriere recompensă (opțional)</Label>
            <Input
              id="reward_description"
              name="reward_description"
              defaultValue={settings.rewardDescription}
              placeholder="ex: Cafea gratuită"
              className="mt-1"
            />
          </div>

          <div className="border-t pt-4 space-y-1">
            <p className="text-sm font-medium">Clienți fideli care nu au mai venit</p>
            <p className="text-xs text-muted-foreground">
              Praguri pentru panoul din pagina Clienți — cine numărăm ca „fidel” și după câte zile
              de absență apare ca „în risc”.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div>
              <Label htmlFor="regulars_min_visits">Vizite minime</Label>
              <Input
                id="regulars_min_visits"
                name="regulars_min_visits"
                type="number"
                min={1}
                defaultValue={settings.regularsMinVisits}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="regulars_at_risk_days">Zile de absență</Label>
              <Input
                id="regulars_at_risk_days"
                name="regulars_at_risk_days"
                type="number"
                min={1}
                defaultValue={settings.regularsAtRiskDays}
                className="mt-1"
              />
            </div>
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? "Se salvează…" : "Salvează"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
