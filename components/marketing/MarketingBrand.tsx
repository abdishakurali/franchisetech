import Link from "next/link";

type MarketingBrandProps = {
  /** Invert for dark backgrounds (footer) */
  variant?: "default" | "footer";
  className?: string;
  onClick?: () => void;
};

export function MarketingBrand({ variant = "default", className = "", onClick }: MarketingBrandProps) {
  return (
    <Link href="/" className={`inline-flex items-center ${className}`} onClick={onClick}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/franchise-tech-logo.png"
        alt="franchisetech"
        className={`h-10 w-auto max-w-[260px] object-contain object-left ${
          variant === "footer" ? "brightness-0 invert" : ""
        }`}
      />
    </Link>
  );
}
