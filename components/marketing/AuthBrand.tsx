import { MarketingBrand } from "@/components/marketing/MarketingBrand";
import { MarketingLocaleSwitcher } from "@/components/marketing/MarketingLocaleSwitcher";

export function AuthBrand() {
  return (
    <div className="mb-8 flex items-center justify-between gap-4">
      <MarketingBrand />
      <MarketingLocaleSwitcher />
    </div>
  );
}
