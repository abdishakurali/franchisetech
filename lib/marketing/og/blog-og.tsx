import { ImageResponse } from "next/og";
import { marketingNavy, marketingPrimary } from "@/lib/marketing/tokens";

export const blogOgSize = { width: 1200, height: 630 };
export const blogOgContentType = "image/png";

/**
 * Short accent-badge text derived straight from a post's own tag — e.g.
 * "tva" -> "T", "raport-z" -> "RZ", "bon-de-consum" -> "BDC". Deliberately
 * not a second slug/tag → label lookup table: BlogTopicHeader.tsx's
 * resolveBlogTopicIcon already warns against a second mapping that can
 * drift out of sync, and lucide icons can't render here (see below), so
 * this derives the badge from the same tag data instead of hand-picking
 * one label per topic.
 */
export function badgeLabelFromTag(tag?: string): string {
  if (!tag) return "FT";
  return tag
    .split("-")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);
}

/**
 * Every blog post's share/OG image, generated at request time — not a
 * screenshot. The old approach (reusing app screenshots from public/marketing)
 * carried stale pre-pivot demo data (EUR pricing, wrong VAT bands) that's
 * wrong for a Romanian audience; on-page headers were already fixed the same
 * way (BlogTopicHeader, icon-per-topic instead of a photo). This applies the
 * same fix to the share-card image — always accurate, nothing to source or
 * go stale.
 *
 * No lucide-react icon here on purpose: its icon components carry a "use
 * client" directive (transitively, via the shared Icon.mjs factory every
 * icon is built from), so they can't be invoked inside next/og's server-side
 * ImageResponse render — confirmed by a real build failure, not a guess.
 * Uses the same colored-initial-badge pattern already proven in
 * lib/marketing/og/compare-og.tsx instead of fighting that boundary.
 */
export function renderBlogOgImage({
  title,
  tagLabel,
  badgeLabel,
}: {
  title: string;
  tagLabel?: string;
  /** 1-3 letters shown in the accent badge, e.g. "TVA", "NIR", "Z". */
  badgeLabel: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: marketingNavy,
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: "#1A1D1C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
              color: marketingPrimary,
            }}
          >
            ft
          </div>
          <span style={{ fontSize: 22, opacity: 0.75 }}>franchisetech.ro / blog</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 36, maxWidth: 1060 }}>
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: 24,
              background: "rgba(22,93,252,0.14)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: badgeLabel.length > 2 ? 34 : 52,
              fontWeight: 700,
              color: marketingPrimary,
              letterSpacing: -1,
            }}
          >
            {badgeLabel}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {tagLabel ? (
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  color: "#5B9CFF",
                }}
              >
                {tagLabel}
              </span>
            ) : null}
            <div style={{ fontSize: 46, fontWeight: 700, lineHeight: 1.15, letterSpacing: -1 }}>{title}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, fontSize: 20, opacity: 0.7 }}>
          <span>POS</span>
          <span>•</span>
          <span>Stoc</span>
          <span>•</span>
          <span>Rețete</span>
          <span>•</span>
          <span>Raport Z</span>
          <span>•</span>
          <span>Driver fiscal</span>
        </div>
      </div>
    ),
    { ...blogOgSize },
  );
}
