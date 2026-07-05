"use client";

import { TourOverlay } from "@/components/app/TourOverlay";
import type { AppLocale } from "@/lib/app-i18n";
import { getAppText } from "@/lib/app-i18n";

const PLACEMENTS = ["bottom", "left", "top", "top"] as const;

type Props = {
  locale?: AppLocale;
};

export function PosFirstSaleTour({ locale = "ro" }: Props) {
  const appT = getAppText(locale);
  const steps = appT.activation.firstSaleTour.map((step, i) => ({
    target: ["pos-product", "pos-cart", "pos-charge", "pos-charge"][i] ?? "pos-charge",
    title: step.title,
    content: step.content,
    placement: PLACEMENTS[i] ?? "top",
  }));

  return (
    <TourOverlay
      tourId="pos_first_sale"
      steps={steps}
      labels={{
        skip: appT.activation.tourSkip,
        back: appT.activation.tourBack,
        next: appT.activation.tourNext,
        done: appT.activation.tourDone,
        skipAria: appT.activation.tourSkipAria,
      }}
    />
  );
}
