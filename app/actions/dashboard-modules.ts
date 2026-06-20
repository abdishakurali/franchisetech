"use server";

import { enableBusinessModule } from "@/app/actions/kitchenops";

export async function enableInventoryFromDashboard(): Promise<void> {
  return enableBusinessModule("inventory");
}

export async function enableRecipeFromDashboard(): Promise<void> {
  return enableBusinessModule("recipe_costing");
}
