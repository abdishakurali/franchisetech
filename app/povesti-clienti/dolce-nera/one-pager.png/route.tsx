import { ImageResponse } from "next/og";
import { marketingNavy } from "@/lib/marketing/tokens";

export const dynamic = "force-static";

const GOLD = "#D9A94E";

// WhatsApp-friendly one-pager for the Dolce Nera case study — portrait,
// readable at phone-screen size, real numbers only. Not linked/published
// anywhere; fetched directly and handed to the founder as a file. Do not
// wire this into any public nav/share flow before the case study page
// itself is approved (see app/povesti-clienti/dolce-nera/page.tsx).
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 72,
          background: marketingNavy,
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "#1A1D1C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 700,
              color: GOLD,
            }}
          >
            ft
          </div>
          <span style={{ fontSize: 20, opacity: 0.7 }}>franchisetech.ro</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 56 }}>
          <span style={{ fontSize: 22, fontWeight: 600, color: GOLD, textTransform: "uppercase", letterSpacing: 2 }}>
            Poveste de succes
          </span>
          <span style={{ fontSize: 52, fontWeight: 700, marginTop: 16, lineHeight: 1.15 }}>
            Dolce Nera își dublează vânzările lunar.
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28, marginTop: 72 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
            <span style={{ fontSize: 64, fontWeight: 700, color: GOLD, width: 260 }}>31</span>
            <span style={{ fontSize: 26, opacity: 0.85, maxWidth: 560 }}>vânzări/zi în ultima săptămână din septembrie — față de ~15/zi la început de lună</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
            <span style={{ fontSize: 64, fontWeight: 700, color: GOLD, width: 260 }}>9.400 lei</span>
            <span style={{ fontSize: 26, opacity: 0.85, maxWidth: 560 }}>vânzări în 23 de zile de tranzacționare, septembrie 2026</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
            <span style={{ fontSize: 64, fontWeight: 700, color: GOLD, width: 260 }}>100%</span>
            <span style={{ fontSize: 26, opacity: 0.85, maxWidth: 560 }}>din zilele de tranzacționare cu casă deschisă și închisă corect</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", paddingTop: 48, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
          <span style={{ fontSize: 24, fontWeight: 600 }}>Configurare gratuită în 48h — franchisetech.ro</span>
        </div>
      </div>
    ),
    { width: 1080, height: 1350 },
  );
}
