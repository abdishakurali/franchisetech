import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_URL } from "@/lib/marketing/seo";
import { localeAlternates, marketingKeywords } from "@/lib/marketing/site-locale";
import { getMarketingLocale } from "@/lib/marketing/locale-server";
import { marketingHtmlLang, marketingOpenGraphLocale } from "@/lib/marketing/locale";
import { getMarketingMessages } from "@/lib/marketing/i18n";
import { GlobalSeoJsonLd } from "@/components/marketing/GlobalSeoJsonLd";

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
      images: [{ url: "/showcase/reports-dashboard.png", width: 1200, height: 750, alt: "franchisetech owner dashboard" }],
    },
    twitter: {
      card: "summary_large_image",
      title: t.home.meta.title || DEFAULT_TITLE,
      description: t.home.meta.description || DEFAULT_DESCRIPTION,
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
      className={`${outfit.variable} h-full antialiased`}
    >
      <head>
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM site summary" />
        <link rel="alternate" type="text/plain" href="/llms-full.txt" title="LLM full site index" />
      </head>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-outfit)]">
        <GlobalSeoJsonLd />
        {/* GA4 — accepts both NEXT_PUBLIC_GA_MEASUREMENT_ID (preferred) and legacy NEXT_PUBLIC_GA_ID */}
        {(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID) ? (() => {
          const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID;
          return (
            <>
              <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
              <Script id="ga-init" strategy="afterInteractive">{`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}</Script>
            </>
          );
        })() : null}
        {/* Meta Pixel */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID ? (
          <Script id="meta-pixel" strategy="afterInteractive">{`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
            document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init','${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
            fbq('track','PageView');
          `}</Script>
        ) : null}
        {/* LinkedIn Insight Tag */}
        {process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID ? (
          <Script id="linkedin-insight" strategy="afterInteractive">{`
            _linkedin_partner_id="${process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID}";
            window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];
            window._linkedin_data_partner_ids.push(_linkedin_partner_id);
            (function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};
            window.lintrk.q=[]}var s=document.getElementsByTagName("script")[0];
            var b=document.createElement("script");b.type="text/javascript";b.async=true;
            b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";
            s.parentNode.insertBefore(b,s)})(window.lintrk);
          `}</Script>
        ) : null}
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
