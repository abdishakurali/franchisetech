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
import { cn } from "@/lib/utils";
import { Percent, Gift, Stamp, Users } from "lucide-react";

type LoyaltySettings = {
  stampsRequired: number;
  rewardType: "discount" | "free_item";
  rewardDiscountLei: number | null;
  rewardFreeProductId: string | null;
  rewardDescription: string;
  regularsMinVisits: number;
  regularsAtRiskDays: number;
};

const REWARD_TYPES = [
  {
    value: "discount" as const,
    icon: Percent,
    title: "Discount fix",
    description: "O sumă fixă în lei, scăzută automat din total la casă.",
  },
  {
    value: "free_item" as const,
    icon: Gift,
    title: "Produs gratuit",
    description: "Casierul primește un indiciu să adauge produsul ales, gratuit.",
  },
];

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
    <form action={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Stamp className="h-4 w-4 text-muted-foreground" />
            Cum se câștigă recompensa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="stamps_required">Ștampile necesare</Label>
          <Input
            id="stamps_required"
            name="stamps_required"
            type="number"
            min={3}
            max={20}
            defaultValue={settings.stampsRequired}
            className="mt-1 max-w-[8rem]"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            La fiecare vânzare finalizată, clientul primește o ștampilă. Între 3 și 20 vizite.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tip recompensă</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {REWARD_TYPES.map((option) => {
              const Icon = option.icon;
              const selected = rewardType === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRewardType(option.value)}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors",
                    selected ? "border-amber-300 bg-amber-50/60 ring-1 ring-amber-300" : "border-border hover:border-border"
                  )}
                >
                  <Icon className={cn("h-5 w-5", selected ? "text-amber-700" : "text-muted-foreground")} />
                  <span className="text-sm font-semibold text-foreground">{option.title}</span>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </button>
              );
            })}
          </div>
          <input type="hidden" name="reward_type" value={rewardType} />

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
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-muted-foreground" />
            Clienți fideli care nu au mai venit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-xs text-muted-foreground">
            Praguri pentru panoul din pagina Clienți — cine numărăm ca „fidel” și după câte zile
            de absență apare ca „în risc”.
          </p>
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
        </CardContent>
      </Card>

      <Button type="submit" disabled={pending}>
        {pending ? "Se salvează…" : "Salvează"}
      </Button>
    </form>
  );
}
