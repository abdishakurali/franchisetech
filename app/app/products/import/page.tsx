import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { ProductsImportClient } from "./ProductsImportClient";

// Server wrapper so the preview can show the org currency (display only).
export default async function ProductsImportPage() {
  const { currency } = await getKitchenOpsContext();
  return <ProductsImportClient currency={currency} />;
}
