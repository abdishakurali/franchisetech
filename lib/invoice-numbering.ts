/** Placeholder number for drafts without a manual number; issue_sales_invoice replaces it with the next real number. */
export const DRAFT_NUMBER_PREFIX = "CIORNA-";

export function isDraftPlaceholderNumber(invoiceNumber: string | null | undefined): boolean {
  return String(invoiceNumber ?? "").startsWith(DRAFT_NUMBER_PREFIX);
}

/** What to show for an invoice number: drafts without a final number read "Ciornă". */
export function displayInvoiceNumber(invoiceNumber: string | null | undefined): string {
  return isDraftPlaceholderNumber(invoiceNumber) ? "Ciornă (nr. la emitere)" : String(invoiceNumber ?? "");
}
