import { packageSections } from "./permissions";

const SECTION_FILES = {
  sales: ["Vanzari", "Vanzari-pe-cote-TVA"],
  payments: ["Incasari-pe-metode-plata"],
  cash: ["Inchideri-casa"],
  purchases: ["Achizitii"],
  stock: ["Balanta-stoc"],
  documents: [],
} as const;

export function buildPackageFilePlan(permissions: unknown): string[] {
  return packageSections(permissions).flatMap((section) =>
    SECTION_FILES[section].flatMap((name) => [`${name}.csv`, `${name}.xlsx`]),
  );
}
