import {
  AlertTriangle,
  Banknote,
  Building2,
  Calculator,
  ChefHat,
  Clock,
  CreditCard,
  FileBarChart,
  FileText,
  Landmark,
  Package,
  PackageCheck,
  PackageX,
  Percent,
  Printer,
  QrCode,
  Receipt,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Truck,
  Users,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import type { BlogPost } from "@/lib/marketing/blog";
import { blogCoverFor } from "@/lib/marketing/blog-cover";
import { marketingBorder, marketingPrimary, marketingTint } from "@/lib/marketing/tokens";

// Every post shows its generated cover (lib/marketing/blog-cover.ts): a real
// screen from the Romanian demo café for product topics, a branded card for the
// rest. The old screenshot set carried stale pre-pivot demo data (EUR, Irish
// VAT bands), which is why the screens were re-captured on 2026-11-13 from a
// lei-priced Romanian demo account. The topic icon below is only the fallback
// for a post whose cover has not been generated yet.

// A few posts need more precision than their tags give (e.g. the QR-code
// post is tagged the same as several others). Keyed by slug, checked first.
const SLUG_ICON_OVERRIDES: Record<string, LucideIcon> = {
  "e-obligatoriu-qr-code-pe-bonul-fiscal": QrCode,
  "fiscalnet-offline-ce-faceti-cand-vreti-sa-emiteti-bonul": Wifi,
  "bon-fiscal-pierdut-sau-deteriorat-ce-faci": ShieldCheck,
};

// Checked in order — the first matching tag on the post wins, so a specific
// tag like "amenzi" outranks a generic one like "fiscal" on the same post.
const TAG_ICON_PRIORITY: Array<[string, LucideIcon]> = [
  ["amenzi", AlertTriangle],
  ["control-anaf", ShieldAlert],
  ["control-itm", ShieldAlert],
  ["defectiune", Printer],
  ["storno", RotateCcw],
  ["fiscalnet", Wifi],
  ["casa-de-marcat", Banknote],
  ["tva", Percent],
  ["raport-z", FileBarChart],
  ["raport-x", FileBarChart],
  ["rapoarte", FileBarChart],
  ["nir", PackageCheck],
  ["bon-de-consum", Receipt],
  ["bon-fiscal", Receipt],
  ["stoc-negativ", PackageX],
  ["stoc", Package],
  ["materii-prime", Package],
  ["retete", ChefHat],
  ["cost-reteta", ChefHat],
  ["patiserie", ChefHat],
  ["dark-kitchen", ChefHat],
  ["marja", TrendingUp],
  ["performanta", TrendingUp],
  ["financiar", Landmark],
  ["contabilitate", Calculator],
  ["export-contabil", Calculator],
  ["personal", Users],
  ["pontaj", Clock],
  ["training", Users],
  ["delivery", Truck],
  ["food-truck", Truck],
  ["franciza", Building2],
  ["multi-locatie", Building2],
  ["caen", Building2],
  ["pos", CreditCard],
  ["fiscal", Receipt],
  ["gdpr", ShieldCheck],
  ["haccp", ShieldCheck],
];

function resolveBlogTopicIcon(post: Pick<BlogPost, "slug" | "tags">): LucideIcon {
  const override = SLUG_ICON_OVERRIDES[post.slug];
  if (override) return override;
  for (const [tag, Icon] of TAG_ICON_PRIORITY) {
    if (post.tags.includes(tag)) return Icon;
  }
  return FileText;
}

const sizeClasses = {
  card: { wrap: "aspect-[16/10]", icon: "h-9 w-9" },
  hero: { wrap: "aspect-[16/9]", icon: "h-14 w-14" },
} as const;

export function BlogTopicHeader({
  post,
  size = "card",
  /** "standalone" draws its own rounded border (detail page). "embedded"
   *  skips both — the parent card already clips it into shape. */
  variant = "standalone",
  className = "",
}: {
  post: Pick<BlogPost, "slug" | "tags">;
  size?: "card" | "hero";
  variant?: "standalone" | "embedded";
  className?: string;
}) {
  const { wrap, icon } = sizeClasses[size];
  const shape = variant === "standalone" ? "overflow-hidden rounded-2xl border" : "border-b";
  const cover = blogCoverFor(post.slug);
  if (cover) {
    return (
      <div
        className={`relative ${shape} ${wrap} ${className}`}
        style={{ background: marketingTint, borderColor: marketingBorder }}
      >
        <Image
          src={cover.src}
          alt={cover.alt}
          aria-hidden={cover.alt ? undefined : true}
          fill
          priority={size === "hero"}
          sizes={size === "hero" ? "(min-width: 768px) 768px, 100vw" : "(min-width: 1024px) 384px, (min-width: 768px) 50vw, 100vw"}
          className="object-cover"
        />
      </div>
    );
  }
  const Icon = resolveBlogTopicIcon(post);
  return (
    <div
      className={`relative flex items-center justify-center ${shape} ${wrap} ${className}`}
      style={{ background: marketingTint, borderColor: marketingBorder }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(70% 100% at 85% 0%, ${marketingPrimary}1a, transparent 60%)`,
        }}
      />
      {/* eslint-disable-next-line react-hooks/static-components -- picks between a fixed set of static lucide icons by post tag, not a dynamically-created component */}
      <Icon className={icon} style={{ color: marketingPrimary }} strokeWidth={1.5} aria-hidden />
    </div>
  );
}
