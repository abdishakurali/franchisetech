import { HeroDashboardPreview } from "@/components/marketing/HeroDashboardPreview";
import { HeroPosTableOrderPreview } from "@/components/marketing/HeroPosTableOrderPreview";
import { HeroTableFloorPreview } from "@/components/marketing/HeroTableFloorPreview";

/** Internal full-size previews for capturing showcase PNGs (not linked in nav). */
export default function HeroPreviewPage() {
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div id="table-floor" className="mb-8 h-[800px] w-[1400px] overflow-hidden rounded-xl border bg-white shadow-lg">
        <HeroTableFloorPreview />
      </div>
      <div id="pos-table-order" className="mb-8 h-[900px] w-[1200px] overflow-hidden rounded-xl border bg-white shadow-lg">
        <HeroPosTableOrderPreview />
      </div>
      <div id="owner-dashboard" className="h-[900px] w-[1400px] overflow-hidden rounded-xl border bg-white shadow-lg">
        <HeroDashboardPreview />
      </div>
    </div>
  );
}
