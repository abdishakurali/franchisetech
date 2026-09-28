import type { PackageSection } from "./permissions";

export const ACCOUNTANT_EXPORTS = [
  { id: "Vanzari", section: "sales", title: "Jurnal vânzări detaliat", description: "Document, articol, cantitate, preț unitar, bază, TVA și total." },
  { id: "Vanzari-pe-cote-TVA", section: "sales", title: "Centralizator TVA", description: "Bază, TVA și total grupate pe cotă." },
  { id: "Retururi", section: "sales", title: "Retururi", description: "Documentele de corecție și valorile returnate." },
  { id: "Nomenclator-produse", section: "sales", title: "Nomenclator articole", description: "Cod, UM, preț de vânzare, cost și cotă TVA." },
  { id: "Incasari-pe-metode-plata", section: "payments", title: "Încasări pe metode", description: "Numerar, card și alte încasări pentru reconciliere." },
  { id: "Registru-de-casa-operativ", section: "cash", title: "Registru de casă operativ", description: "Încasări, plăți și sold cronologic; se validează cu actele justificative." },
  { id: "Reconciliere-inchideri-si-Z", section: "cash", title: "Închideri și control Z", description: "Numerar așteptat, numărat, diferențe și confirmarea raportului Z." },
  { id: "Achizitii", section: "purchases", title: "Jurnal achiziții", description: "Furnizor, CUI, factură, NIR, bază, TVA și total." },
  { id: "Achizitii-detaliu", section: "purchases", title: "Achiziții pe articole", description: "Cantități recepționate, preț furnizor și TVA pe linie." },
  { id: "Balanta-stoc", section: "stock", title: "Situație stoc", description: "Cantități scriptice, diferențe și cost mediu ponderat." },
] as const satisfies ReadonlyArray<{ id: string; section: PackageSection; title: string; description: string }>;

export type AccountantExportId = (typeof ACCOUNTANT_EXPORTS)[number]["id"];
