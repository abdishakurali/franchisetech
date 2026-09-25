import type { AccountantPermission } from "./permissions";

export type AccountantDocument = {
  permission: AccountantPermission;
  title: string;
  role: "Document justificativ" | "Evidență operativă" | "Control contabil";
  purpose: string;
  source: string;
  fields: string;
};

export const ACCOUNTANT_DOCUMENTS: AccountantDocument[] = [
  { permission: "cash", title: "Registru de casă", role: "Evidență operativă", purpose: "Urmărește zilnic numerarul scriptic și soldul de casă.", source: "Vânzări în numerar, depuneri/retrageri și închideri POS", fields: "Data, document/explicație, încasare, plată, sold" },
  { permission: "sales", title: "Vânzări, retururi și TVA", role: "Control contabil", purpose: "Reconciliază vânzările cu încasările și centralizatorul fiscal.", source: "Bonuri și retururi înregistrate în POS", fields: "Document, dată, articol, cantitate, preț unitar, net, TVA, brut, metodă de plată" },
  { permission: "cash", title: "Închideri POS și raport Z", role: "Control contabil", purpose: "Arată dacă ziua a fost închisă și dacă raportul Z fiscal a fost confirmat.", source: "Sesiunea POS și confirmarea FiscalNet", fields: "Deschidere, închidere, numerar așteptat, numerar numărat, diferență, stare Z fiscal" },
  { permission: "purchases", title: "Achiziții și NIR", role: "Document justificativ", purpose: "Leagă factura furnizorului de recepția cantitativă și valorică.", source: "Factura introdusă și NIR postat", fields: "Furnizor, CUI, factură și dată, NIR și dată, produs, UM, cantități, preț furnizor, TVA" },
  { permission: "stock", title: "Fișă de magazie și stoc", role: "Evidență operativă", purpose: "Explică intrările, ieșirile, consumul și diferențele de inventar.", source: "NIR, bonuri de consum, vânzări și inventare", fields: "Produs, UM, cantitate scriptică, cantitate curentă, diferență, cost mediu ponderat" },
  { permission: "documents", title: "Documente justificative", role: "Document justificativ", purpose: "Permite verificarea valorilor din export față de documentul-sursă.", source: "Facturi, bonuri, chitanțe și documente încărcate de firmă", fields: "Tip, număr, dată, emitent, valoare și fișier atașat" },
];

export const ACCOUNTING_ONLY_DOCUMENTS = [
  "Registrul-jurnal",
  "Registrul-inventar",
  "Cartea mare",
  "Balanța de verificare",
  "Declarațiile fiscale",
] as const;

export function visibleAccountantDocuments(permissions: AccountantPermission[]) {
  return ACCOUNTANT_DOCUMENTS.filter((document) => permissions.includes(document.permission));
}
