import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { RecipeImportClient } from "./RecipeImportClient";

// Server wrapper so the preview can show the org currency (display only).
export default async function RecipeImportPage() {
  const { currency } = await getKitchenOpsContext();
  return <RecipeImportClient currency={currency} />;
}
