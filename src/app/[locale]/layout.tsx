import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { headers } from "next/headers";
import { Source_Serif_4 } from "next/font/google";
import { getDict, isLocale, locales, type Locale } from "@/content";
import { AssaddarPlatformWidget } from "@/components/assaddar-platform-widget";
import { AnalyticsEvents } from "@/components/analytics-events";
import { THEME_BOOTSTRAP_SCRIPT } from "@/lib/theme-script";
import "../globals.css";

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
  weight: ["400", "500", "600"],
});

const SITE_URL = "https://assad-dar.de";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const t = getDict(safe);
  return {
    metadataBase: new URL(SITE_URL),
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: `/${safe}`,
      languages: { de: "/de", en: "/en", "x-default": "/de" },
    },
    openGraph: {
      type: "website",
      locale: safe === "de" ? "de_DE" : "en_US",
      title: t.meta.title,
      description: t.meta.description,
      url: `/${safe}`,
      siteName: "Assad Dar",
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.title,
      description: t.meta.description,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const nonce = (await headers()).get("x-csp-nonce") ?? undefined;

  return (
    <html
      lang={safe}
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} ${serif.variable}`}
    >
      <head>
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }}
        />
      </head>
      <body>
        {children}
        <AnalyticsEvents />
        <AssaddarPlatformWidget />
      </body>
    </html>
  );
}
