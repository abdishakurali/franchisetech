"use client";

import Link from "next/link";
import { Package, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  showInventoryPrompt: boolean;
  showRecipePrompt: boolean;
  enableInventoryAction: () => Promise<void>;
  enableRecipeAction: () => Promise<void>;
};

export function DashboardModulePrompts({
  showInventoryPrompt,
  showRecipePrompt,
  enableInventoryAction,
  enableRecipeAction,
}: Props) {
  if (!showInventoryPrompt && !showRecipePrompt) return null;

  return (
    <Card className="border-brass/30 bg-accent/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Unlock stock &amp; recipes</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        {showInventoryPrompt ? (
          <form action={enableInventoryAction} className="flex items-center gap-2">
            <Package className="h-4 w-4 text-brass" />
            <span className="text-sm text-foreground">Track ingredient costs?</span>
            <Button type="submit" size="sm" variant="outline">
              Enable stock
            </Button>
          </form>
        ) : null}
        {showRecipePrompt ? (
          <form action={enableRecipeAction} className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-brass" />
            <span className="text-sm text-foreground">See recipe margins?</span>
            <Button type="submit" size="sm" variant="outline">
              Enable recipes
            </Button>
          </form>
        ) : null}
        <Link href="/app/settings?tab=operations" className="text-sm text-brass hover:underline self-center">
          Settings → operations
        </Link>
      </CardContent>
    </Card>
  );
}
