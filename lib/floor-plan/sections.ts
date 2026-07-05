import type { FloorSection } from "@/app/actions/table-service";

/** Canonical Romanian section labels for deduplication. */
export function canonicalSectionName(name: string): string {
  const n = name.trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  if (n === "sala") return "Sală";
  if (n === "terasa" || n === "teresa") return "Terasă";
  if (n === "bar") return "Bar";
  return name.trim();
}

/** Keep one section per canonical name — prefers the row with the most tables. */
export function dedupeFloorSections(
  sections: FloorSection[],
  tableCountBySectionId: Map<string, number>
): FloorSection[] {
  const best = new Map<string, FloorSection>();

  for (const section of sections) {
    const label = canonicalSectionName(section.name);
    const count = tableCountBySectionId.get(section.id) ?? 0;
    const prev = best.get(label);
    if (!prev) {
      best.set(label, { ...section, name: label });
      continue;
    }
    const prevCount = tableCountBySectionId.get(prev.id) ?? 0;
    if (count > prevCount || (count === prevCount && section.sort_order < prev.sort_order)) {
      best.set(label, { ...section, name: label });
    }
  }

  return [...best.values()].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, "ro"));
}
