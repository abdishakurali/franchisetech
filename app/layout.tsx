import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_URL } from "@/lib/marketing/seo";
import { MARKETING_KEYWORDS, localeAlternates } from "@/lib/marketing/site-locale";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: DEFAULT_TITLE,
    template: "%s | franchisetech",
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [...MARKETING_KEYWORDS],
  authors: [{ name: "franchisetech" }],
  creator: "franchisetech",
  metadataBase: new URL(SITE_URL),
  manifest: "/manifest.webmanifest",
  alternates: localeAlternates("/"),
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    siteName: "franchisetech",
    type: "website",
    locale: "en",
    url: SITE_URL,
    images: [{ url: "/showcase/reports-dashboard.png", width: 1200, height: 750, alt: "franchisetech owner dashboard — today at a glance" }],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ["/showcase/reports-dashboard.png"],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-outfit)]">
        {process.env.NEXT_PUBLIC_GA_ID ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `}</Script>
          </>
        ) : null}
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
