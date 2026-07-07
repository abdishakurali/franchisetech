/**
 * Balanță Cantitativ-Valorică (Quantitative-Value Balance) types for Romanian
 * accounting: opening stock, entries (NIR), exits (sales consumption), and
 * closing stock for a period. HTML/text generation lives in
 * app/api/reports/balanta/pdf/route.ts via the shared ReportPdfDocument.
 */

export type BalantaIntegrityStatus =
  | "ok"
  | "archived"
  | "missing"
  | "not_tracked"
  | "qty_mismatch";

export type BalantaItem = {
  productId?: string;
  productName: string;
  unit: string;
  openingQty: number;
  openingValue: number;
  entryQty: number;
  entryValue: number;
  exitQty: number;
  exitValue: number;
  closingQty: number;
  closingValue: number;
  integrityStatus?: BalantaIntegrityStatus;
  catalogQty?: number;
  ledgerQty?: number;
};

export type BalantaData = {
  orgName: string;
  orgCui?: string;
  gestiune?: string;
  dateFrom: string;
  dateTo: string;
  currency?: string;
  items: BalantaItem[];
  integrityLabels?: Partial<Record<BalantaIntegrityStatus, string>>;
};
