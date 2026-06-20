import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { competitorLogoForOg, FRANCHISETECH_BRAND, getCompetitorBrand } from "@/lib/marketing/competitor-brands";

export const compareOgSize = { width: 1200, height: 630 };
export const compareOgContentType = "image/png";

async function loadImageData(publicPath: string): Promise<string | null> {
  const ext = publicPath.split(".").pop()?.toLowerCase();
  if (!ext || !["png", "jpg", "jpeg", "webp", "svg"].includes(ext)) return null;
  try {
    const buf = await readFile(join(process.cwd(), "public", publicPath.replace(/^\//, "")));
    const mime =
      ext === "svg" ? "image/svg+xml" : ext === "webp" ? "image/webp" : ext === "png" ? "image/png" : "image/jpeg";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function renderCompareOgImage({
  competitorSlug,
  title,
  subtitle,
}: {
  competitorSlug?: string;
  title: string;
  subtitle: string;
}) {
  const brand = competitorSlug ? getCompetitorBrand(competitorSlug) : undefined;
  const ftLogo =
    (await loadImageData(FRANCHISETECH_BRAND.logoSrc)) ??
    (await loadImageData(FRANCHISETECH_BRAND.logoFallbackSrc));
  const competitorLogo = competitorSlug ? await loadImageData(competitorLogoForOg(competitorSlug)) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 56,
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #2563eb 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {ftLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ftLogo} alt="" width={72} height={72} style={{ borderRadius: 16, objectFit: "contain" }} />
          ) : (
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 16,
                background: FRANCHISETECH_BRAND.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              ft
            </div>
          )}
          {brand ? (
            <>
              <span style={{ fontSize: 36, opacity: 0.7 }}>vs</span>
              {competitorLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={competitorLogo}
                  alt=""
                  width={72}
                  height={72}
                  style={{ borderRadius: 16, objectFit: "contain", background: "white" }}
                />
              ) : (
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 16,
                    background: brand.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    fontWeight: 700,
                  }}
                >
                  {brand.name.slice(0, 2)}
                </div>
              )}
            </>
          ) : null}
          <span style={{ marginLeft: "auto", fontSize: 22, opacity: 0.85 }}>franchisetech.ro</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 980 }}>
          <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1 }}>{title}</div>
          <div style={{ fontSize: 26, lineHeight: 1.35, opacity: 0.92 }}>{subtitle}</div>
        </div>

        <div style={{ display: "flex", gap: 12, fontSize: 20, opacity: 0.8 }}>
          <span>POS</span>
          <span>•</span>
          <span>Stock</span>
          <span>•</span>
          <span>Recipes</span>
          <span>•</span>
          <span>Z-report</span>
          {brand?.market === "ro" ? (
            <>
              <span>•</span>
              <span>FiscalNet</span>
            </>
          ) : null}
        </div>
      </div>
    ),
    { ...compareOgSize },
  );
}
