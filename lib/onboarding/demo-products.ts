export type DemoProductSeed = {
  name: string;
  sale_price: number;
  sort_order: number;
};

export function demoProductsForCountry(countryCode: string): DemoProductSeed[] {
  const isRO = countryCode.toUpperCase() === "RO";
  if (isRO) {
    return [
      { name: "Espresso", sale_price: 12, sort_order: 1 },
      { name: "Croissant", sale_price: 15, sort_order: 2 },
      { name: "Latte", sale_price: 18, sort_order: 3 },
      { name: "Sandwich", sale_price: 32, sort_order: 4 },
    ];
  }
  return [
    { name: "Espresso", sale_price: 2.5, sort_order: 1 },
    { name: "Croissant", sale_price: 3.2, sort_order: 2 },
    { name: "Latte", sale_price: 3.8, sort_order: 3 },
    { name: "Sandwich", sale_price: 6.5, sort_order: 4 },
  ];
}

export const FIRST_SALE_DONE_KEY = "fp_first_sale_done";
