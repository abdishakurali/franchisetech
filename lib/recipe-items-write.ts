export type RecipeItemRow = Record<string, unknown> & { organisation_id: string; recipe_id: string };

export type RecipeWriteResult =
  | { ok: true }
  | { ok: false; stage: "insert" | "delete"; message: string };

/**
 * Replace a recipe's ingredient lines without ever leaving it empty.
 *
 * Before 2026-11-12 updateRecipeFromProducts deleted every line first and then
 * inserted the new ones without checking the result: a failed insert left the
 * recipe with 0 ingredients while the page said "saved". Now the new lines are
 * inserted first; the old ones are deleted only after that succeeds. If the
 * delete fails, the new lines are removed again so the recipe keeps exactly its
 * old lines. Callers must surface `ok: false`.
 */
export async function replaceRecipeItems(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  orgId: string,
  recipeId: string,
  items: RecipeItemRow[],
): Promise<RecipeWriteResult> {
  // An empty replace would wipe the recipe; callers refuse empty recipes first.
  if (!items.length) return { ok: false, stage: "insert", message: "no lines" };
  const ins = await supabase.from("recipe_items").insert(items).select("id");
  if (ins?.error || !Array.isArray(ins?.data) || ins.data.length !== items.length) {
    return { ok: false, stage: "insert", message: String(ins?.error?.message ?? "insert returned no rows") };
  }
  const newIds = (ins.data as Array<{ id: string }>).map((r) => r.id);

  const del = await supabase
    .from("recipe_items")
    .delete()
    .eq("recipe_id", recipeId)
    .eq("organisation_id", orgId)
    .not("id", "in", `(${newIds.join(",")})`);
  if (del?.error) {
    // Undo the insert so the recipe is back to its old lines, not doubled.
    await supabase.from("recipe_items").delete().in("id", newIds).eq("organisation_id", orgId);
    return { ok: false, stage: "delete", message: String(del.error.message ?? del.error) };
  }
  return { ok: true };
}
