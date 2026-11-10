/**
 * Product choices for the recipe new/edit screens.
 *
 * Archived products (products.active = false) must not be offered as new
 * choices. But an existing recipe that already points at an archived product
 * (the finished product or an ingredient) must still show it, marked
 * archived. Otherwise the select silently shows "— alege —", the user cannot
 * tell what the recipe used, and saving would drop or change the link.
 */
export type RecipeProductCandidate = { id: string; active?: boolean | null };

export function buildRecipeProductChoices<T extends RecipeProductCandidate>(
  candidates: T[],
  linkedRows: T[],
  linkedIds: Array<string | null | undefined>,
): Array<T & { archived: boolean }> {
  const choices: Array<T & { archived: boolean }> = candidates
    .filter((p) => p.active !== false)
    .map((p) => ({ ...p, archived: false }));
  const seen = new Set(choices.map((p) => p.id));
  const byId = new Map<string, T>();
  for (const p of [...candidates, ...linkedRows]) byId.set(p.id, p);

  for (const id of linkedIds) {
    if (!id || seen.has(id)) continue;
    const row = byId.get(id);
    if (!row) continue; // deleted product: nothing to show
    choices.push({ ...row, archived: row.active === false });
    seen.add(id);
  }
  return choices;
}

/** Ids linked by an existing recipe that are missing from the active choices
 * and therefore need a separate lookup (which ignores the active filter). */
export function missingLinkedIds(
  activeIds: Iterable<string>,
  linkedIds: Array<string | null | undefined>,
): string[] {
  const have = new Set(activeIds);
  return [...new Set(linkedIds.filter((id): id is string => Boolean(id) && !have.has(id as string)))];
}
