import Link from "next/link";

type MarketingBrandProps = {
  /** Invert for dark backgrounds (footer) */
  variant?: "default" | "footer";
  className?: string;
};

export function MarketingBrand({ variant = "default", className = "" }: MarketingBrandProps) {
  return (
    <Link href="/" className={`inline-flex items-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/marketing/franchise-tech-logo.png"
        alt="franchisetech"
        className={`h-8 w-auto max-w-[220px] object-contain object-left ${
          variant === "footer" ? "brightness-0 invert" : ""
        }`}
      />
    </Link>
  );
}
