import { requireBusinessModule } from "@/lib/module-guard";

export default async function StockReportLayout({ children }: { children: React.ReactNode }) {
  await requireBusinessModule("inventory");
  return children;
}
