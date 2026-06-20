import { requireBusinessModule } from "@/lib/module-guard";

export default async function MarginsReportLayout({ children }: { children: React.ReactNode }) {
  await requireBusinessModule("recipe_costing");
  return children;
}
