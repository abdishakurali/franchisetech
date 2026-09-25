import { packageSections } from "./permissions";

const SECTION_FILES = {
  sales: ["Vanzari", "Vanzari-pe-cote-TVA", "Retururi", "Nomenclator-produse"],
  payments: ["Incasari-pe-metode-plata"],
  cash: ["Registru-de-casa-operativ", "Reconciliere-inchideri-si-Z"],
  purchases: ["Achizitii", "Achizitii-detaliu"],
  stock: ["Balanta-stoc"],
  documents: [],
} as const;

export function buildPackageFilePlan(permissions: unknown): string[] {
  return packageSections(permissions).flatMap((section) =>
    SECTION_FILES[section].flatMap((name) => [`${name}.csv`, `${name}.xlsx`]),
  );
}
