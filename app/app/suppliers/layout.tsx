import { requireBusinessModule } from "@/lib/module-guard";

export default async function SuppliersLayout({ children }: { children: React.ReactNode }) {
  await requireBusinessModule("inventory");
  return children;
}
