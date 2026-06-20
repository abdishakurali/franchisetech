"use client";

import { TourOverlay } from "@/components/app/TourOverlay";

const POS_FIRST_SALE_STEPS = [
  {
    target: "pos-product",
    title: "Tap a product",
    content: "Choose any demo item to add it to the order. You can replace these with your own menu later.",
    placement: "bottom" as const,
  },
  {
    target: "pos-cart",
    title: "Review the order",
    content: "Your cart shows items and the total. Adjust quantities here if needed.",
    placement: "left" as const,
  },
  {
    target: "pos-charge",
    title: "Charge the sale",
    content: "Tap Charge, then choose cash or card and confirm. Card is selected by default.",
    placement: "top" as const,
  },
  {
    target: "pos-charge",
    title: "Next sale",
    content: "After payment, you stay on POS for the next sale — choose New sale when ready.",
    placement: "top" as const,
  },
];

export function PosFirstSaleTour() {
  return <TourOverlay tourId="pos_first_sale" steps={POS_FIRST_SALE_STEPS} />;
}
