import type { Metadata, Viewport } from "next";
import { Fraunces, Public_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_URL } from "@/lib/marketing/seo";
import { localeAlternates, marketingKeywords } from "@/lib/marketing/site-locale";
import { getMarketingLocale } from "@/lib/marketing/locale-server";
import { marketingHtmlLang, marketingOpenGraphLocale } from "@/lib/marketing/locale";
import { getMarketingMessages } from "@/lib/marketing/i18n";
import { GlobalSeoJsonLd } from "@/components/marketing/GlobalSeoJsonLd";
import { CookieConsent } from "@/components/consent/CookieConsent";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  axes: ["opsz", "SOFT", "WONK"],
});

const publicSans = Public_Sans({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  weight: "variable",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
});

export const viewport: Viewport = {
  themeColor: "#1C1712",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getMarketingLocale();
  const t = getMarketingMessages(locale);
  return {
    title: {
      default: t.home.meta.title || DEFAULT_TITLE,
      template: "%s | franchisetech",
    },
    description: t.home.meta.description || DEFAULT_DESCRIPTION,
    keywords: marketingKeywords(locale),
    authors: [{ name: "franchisetech" }],
    creator: "franchisetech",
    metadataBase: new URL(SITE_URL),
    manifest: "/manifest.webmanifest",
    alternates: localeAlternates("/", locale),
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    openGraph: {
      title: t.home.meta.title || DEFAULT_TITLE,
      description: t.home.meta.description || DEFAULT_DESCRIPTION,
      siteName: "franchisetech",
      type: "website",
      locale: marketingOpenGraphLocale(locale),
      url: SITE_URL,
      // Not the old /marketing/live/dashboard.png — stale pre-pivot screenshot
      // (EUR pricing, Irish VAT bands). Falls back to the real logo until a
      // correct, current OG image exists.
      images: [{ url: "/franchise-tech-logo.png", width: 900, height: 237, alt: "franchisetech" }],
    },
    twitter: {
      card: "summary_large_image",
      title: t.home.meta.title || DEFAULT_TITLE,
      description: t.home.meta.description || DEFAULT_DESCRIPTION,
      images: ["/franchise-tech-logo.png"],
    },
    icons: {
      icon: [
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/favicon.ico", sizes: "32x32" },
      ],
      apple: [
        { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      ],
      shortcut: "/favicon.ico",
    },
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? {
          verification: {
            google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
          },
        }
      : {}),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getMarketingLocale();
  const htmlLang = marketingHtmlLang(locale);

  return (
    <html
      lang={htmlLang}
      className={`${fraunces.variable} ${publicSans.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM site summary" />
        <link rel="alternate" type="text/plain" href="/llms-full.txt" title="LLM full site index" />
      </head>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-body)]">
        <GlobalSeoJsonLd />
        {children}
        <Toaster position="top-right" richColors />
        {/* Analytics scripts load only after consent; see components/consent/CookieConsent.tsx */}
        <CookieConsent
          ids={{
            gaId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID,
            metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID,
            linkedinPartnerId: process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID,
          }}
        />
      </body>
    </html>
  );
}
