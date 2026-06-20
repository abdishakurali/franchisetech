"use client";

import Link from "next/link";
import { Package, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TourOverlay } from "@/components/app/TourOverlay";

const FIRST_SALE_TOUR = [
  {
    target: "open-pos",
    title: "Open POS",
    content: "Start here to open the till and ring up your first sale.",
    placement: "bottom" as const,
  },
  {
    target: "setup-guide",
    title: "Setup guide",
    content: "Follow the checklist if you want step-by-step help before selling.",
    placement: "bottom" as const,
  },
];

type Props = {
  showInventoryPrompt: boolean;
  showRecipePrompt: boolean;
  showFirstSaleTour: boolean;
  enableInventoryAction: () => Promise<void>;
  enableRecipeAction: () => Promise<void>;
};

export function DashboardModulePrompts({
  showInventoryPrompt,
  showRecipePrompt,
  showFirstSaleTour,
  enableInventoryAction,
  enableRecipeAction,
}: Props) {
  return (
    <>
      {showFirstSaleTour ? (
        <TourOverlay tourId="first_sale" steps={FIRST_SALE_TOUR} />
      ) : null}

      {(showInventoryPrompt || showRecipePrompt) ? (
        <Card className="border-blue-200 bg-blue-50/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Unlock stock &amp; recipes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {showInventoryPrompt ? (
              <form action={enableInventoryAction} className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-slate-700">Track ingredient costs?</span>
                <Button type="submit" size="sm" variant="outline">Enable stock</Button>
              </form>
            ) : null}
            {showRecipePrompt ? (
              <form action={enableRecipeAction} className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-slate-700">See recipe margins?</span>
                <Button type="submit" size="sm" variant="outline">Enable recipes</Button>
              </form>
            ) : null}
            <Link href="/app/settings?tab=modules" className="text-sm text-blue-700 hover:underline self-center">
              Settings → modules
            </Link>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
