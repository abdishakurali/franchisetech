/** Category lists are shown A–Z by name (customer-facing). */
export function sortCategoriesByName<T extends { name: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}
