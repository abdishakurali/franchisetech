import { requireBusinessModule } from "@/lib/module-guard";

export default async function RecipesLayout({ children }: { children: React.ReactNode }) {
  await requireBusinessModule("recipe_costing");
  return children;
}
