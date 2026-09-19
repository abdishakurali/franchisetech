import Image from "next/image";
import { Section, SectionLabel } from "@/components/marketing/MarketingShell.primitives";
import { marketingHeading } from "@/lib/marketing/tokens";
import { useMarketingLocaleContext } from "@/lib/marketing/marketing-locale-context";

/**
 * Real hospitality photography, not another UI screenshot. Everything else on
 * this page is either a product screen or an icon — without this, the whole
 * homepage reads as generic B2B software rather than something built for a
 * counter and a café. Filenames on these assets don't
 * match their actual content (mismatched during an earlier upload — verified
 * by opening each one), so they're captioned here by what they show, not by
 * their path.
 */
const photos = [
  { src: "/marketing/industry-cafe.png", captionRo: "Cafenea", captionEn: "Café" },
  { src: "/marketing/industry-food-truck.png", captionRo: "Tejghea și POS", captionEn: "Counter & POS" },
] as const;

export function IndustryShowcase() {
  const { locale } = useMarketingLocaleContext();
  const isRo = locale === "ro";

  return (
    <Section>
      <div className="mb-8 max-w-2xl">
        <SectionLabel>{isRo ? "Unde funcționează" : "Where it runs"}</SectionLabel>
        <h2 className={`mt-3 ${marketingHeading}`}>
          {isRo ? "Construit pentru tejghea, nu pentru birou" : "Built for the counter, not the back office"}
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {photos.map((photo) => (
          <div key={photo.src} className="group relative overflow-hidden rounded-2xl">
            <Image
              src={photo.src}
              alt={isRo ? photo.captionRo : photo.captionEn}
              width={1024}
              height={576}
              className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/0 to-transparent" />
            <p className="absolute bottom-3 left-4 text-sm font-semibold text-white">
              {isRo ? photo.captionRo : photo.captionEn}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
