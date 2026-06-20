import { requireBusinessModule } from "@/lib/module-guard";

export default async function CashDrawerAuditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireBusinessModule("team_advanced");
  return children;
}
