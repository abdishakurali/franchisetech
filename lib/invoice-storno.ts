/**
 * Lines of a storno (reversing) invoice: the original lines with negative
 * quantities. stockQty is negated too, so issuing the storno returns exactly
 * the stock the original invoice took out.
 */
export function buildStornoLines<T extends { quantity: number; stockQty?: number }>(lines: T[]): Array<T & { id: number }> {
  return lines.map((line, i) => ({
    ...line,
    id: i + 1,
    quantity: -Math.abs(Number(line.quantity)),
    ...(line.stockQty ? { stockQty: -Math.abs(Number(line.stockQty)) } : {}),
  }));
}
