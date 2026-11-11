"use server";

import { enableBusinessModule, type SaveActionResult } from "@/app/actions/kitchenops";

export async function enableInventoryFromDashboard(): Promise<SaveActionResult> {
  return enableBusinessModule("inventory");
}

export async function enableRecipeFromDashboard(): Promise<SaveActionResult> {
  return enableBusinessModule("recipe_costing");
}
