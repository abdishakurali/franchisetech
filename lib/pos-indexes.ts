export function indexProducts<T extends { id: string }>(products: readonly T[]) {
  return new Map(products.map((product) => [product.id, product]));
}

export function indexCartQuantities(items: readonly { product_id: string; quantity: number }[]) {
  return new Map(items.map((item) => [item.product_id, item.quantity]));
}
