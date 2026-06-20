import { compareOgContentType, compareOgSize, renderCompareOgImage } from "@/lib/marketing/og/compare-og";

export const alt = "Compare POS and restaurant software — franchisetech";
export const size = compareOgSize;
export const contentType = compareOgContentType;

export default async function Image() {
  return renderCompareOgImage({
    title: "Compare POS for restaurants & cafes",
    subtitle: "SmartBill, Saga, RezoSoft, Square, SumUp — honest comparisons with logos",
  });
}
