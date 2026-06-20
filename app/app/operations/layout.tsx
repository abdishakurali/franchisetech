import { requireBusinessModule } from "@/lib/module-guard";

export default async function OperationsLayout({ children }: { children: React.ReactNode }) {
  await requireBusinessModule("inventory");
  return children;
}
