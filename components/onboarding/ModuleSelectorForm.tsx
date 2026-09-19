"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { saveOnboardingModules } from "@/app/actions/onboarding-steps";

type ModuleKey = "purchases_enabled" | "recipe_costing_enabled" | "inventory_enabled";

const STRINGS = {
  ro: {
    core: "Vânzări și POS",
    coreDesc: "Mereu activ — meniul, casa și rapoartele de bază.",
    inventory: "Stoc",
    inventoryDesc: "Urmărește cafeaua, laptele, paharele și celelalte produse.",
    purchases: "Achiziții",
    purchasesDesc: "Înregistrează furnizorii, recepțiile și NIR-urile.",
    recipes: "Rețete și ingrediente",
    recipesDesc: "Scade automat ingredientele când vinzi un produs.",
    recipesNote: "Rețetele folosesc și gestiunea stocului.",
    continueBtn: "Continuă",
    saving: "Se salvează…",
  },
  en: {
    core: "Sales & POS",
    coreDesc: "Always on — menu, till, and core reports.",
    inventory: "Stock",
    inventoryDesc: "Track coffee, milk, cups, and other supplies.",
    purchases: "Purchases",
    purchasesDesc: "Log suppliers, deliveries, and purchase receipts.",
    recipes: "Recipes & ingredients",
    recipesDesc: "Automatically deduct ingredients when you sell a product.",
    recipesNote: "Recipes also use stock management.",
    continueBtn: "Continue",
    saving: "Saving…",
  },
};

export function ModuleSelectorForm({
  locale,
  initial,
}: {
  locale: "ro" | "en";
  initial: { inventory_enabled: boolean; purchases_enabled: boolean; recipe_costing_enabled: boolean };
}) {
  const t = STRINGS[locale];
  const [pending, startTransition] = useTransition();
  const [modules, setModules] = useState(initial);

  const toggle = (key: ModuleKey, value: boolean) => {
    setModules((current) => {
      const next = { ...current, [key]: value };
      // Recipes require stock — checking Recipes silently also checks Stock,
      // with a one-sentence explanation, not a dependency graph (spec Section 5).
      if (key === "recipe_costing_enabled" && value) next.inventory_enabled = true;
      return next;
    });
  };

  const submit = () => {
    startTransition(async () => {
      const result = await saveOnboardingModules(modules);
      if (result && "error" in result && result.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 rounded-md border border-brass/30 bg-accent px-4 py-3">
        <input type="checkbox" checked disabled className="mt-0.5 h-4 w-4 rounded border-border accent-brass" />
        <div>
          <p className="text-sm font-medium text-foreground">{t.core}</p>
          <p className="text-xs text-mid">{t.coreDesc}</p>
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-card px-4 py-3 transition-colors hover:border-brass/40">
        <input
          type="checkbox"
          checked={modules.inventory_enabled}
          onChange={(e) => toggle("inventory_enabled", e.target.checked)}
          disabled={modules.recipe_costing_enabled}
          className="mt-0.5 h-4 w-4 rounded border-border accent-brass"
        />
        <div>
          <p className="text-sm font-medium text-foreground">{t.inventory}</p>
          <p className="text-xs text-mid">{t.inventoryDesc}</p>
          {modules.recipe_costing_enabled && (
            <p className="mt-1 text-xs italic text-brass">{t.recipesNote}</p>
          )}
        </div>
      </label>

      <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-card px-4 py-3 transition-colors hover:border-brass/40">
        <input
          type="checkbox"
          checked={modules.purchases_enabled}
          onChange={(e) => toggle("purchases_enabled", e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-border accent-brass"
        />
        <div>
          <p className="text-sm font-medium text-foreground">{t.purchases}</p>
          <p className="text-xs text-mid">{t.purchasesDesc}</p>
        </div>
      </label>

      <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-card px-4 py-3 transition-colors hover:border-brass/40">
        <input
          type="checkbox"
          checked={modules.recipe_costing_enabled}
          onChange={(e) => toggle("recipe_costing_enabled", e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-border accent-brass"
        />
        <div>
          <p className="text-sm font-medium text-foreground">{t.recipes}</p>
          <p className="text-xs text-mid">{t.recipesDesc}</p>
        </div>
      </label>

      <div className="border-t border-border pt-6">
        <Button
          className="h-11 w-full bg-primary px-8 text-base text-primary-foreground hover:bg-primary/90 sm:w-auto"
          disabled={pending}
          onClick={submit}
        >
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.saving}
            </>
          ) : (
            <>
              {t.continueBtn} <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
