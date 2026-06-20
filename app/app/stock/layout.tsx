import { requireBusinessModule } from "@/lib/module-guard";

export default async function StockLayout({ children }: { children: React.ReactNode }) {
  await requireBusinessModule("inventory");
  return children;
}
