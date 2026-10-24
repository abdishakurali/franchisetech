type NamedOption = { id: string; name: string };
type DraftLine = { quantity: string; unit_cost: string; tax_rate: string };
type SelectableProduct = { id: string; unit_of_measure?: string | null; vat_rate?: number | null };

function searchable(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("ro");
}

export function filterPurchaseOptions<T extends NamedOption>(options: T[], query: string, limit: number): T[] {
  const needle = searchable(query.trim());
  const matches = needle ? options.filter((option) => searchable(option.name).includes(needle)) : options;
  return matches.slice(0, limit);
}

export function purchaseLineTotalsFromDraft(lines: DraftLine[]) {
  return lines.reduce((totals, line) => {
    const quantity = Number.parseFloat(line.quantity) || 0;
    const unitCost = Number.parseFloat(line.unit_cost) || 0;
    const taxRate = Number.parseFloat(line.tax_rate) || 0;
    const subtotal = quantity * unitCost;
    const tax = subtotal * taxRate / 100;
    return { subtotal: totals.subtotal + subtotal, tax: totals.tax + tax, total: totals.total + subtotal + tax };
  }, { subtotal: 0, tax: 0, total: 0 });
}

export function purchaseLineForSelectedProduct<T extends DraftLine & { product_id: string; unit_of_measure: string }>(
  line: T,
  product: SelectableProduct | undefined,
  units: string[],
  defaultUnit: string,
): T {
  const unit = product?.unit_of_measure && units.includes(product.unit_of_measure)
    ? product.unit_of_measure
    : defaultUnit;
  return {
    ...line,
    product_id: product?.id ?? "",
    unit_of_measure: unit,
    tax_rate: product?.vat_rate != null ? String(product.vat_rate) : line.tax_rate,
  };
}
