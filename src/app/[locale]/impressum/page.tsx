import type { Metadata } from "next";
import { isLocale, type Locale } from "@/content";
import { LegalPage } from "@/components/legal-page";

export function generateStaticParams() {
  return [{ locale: "de" }, { locale: "en" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  return {
    title: safe === "de" ? "Impressum" : "Imprint",
    robots: { index: false, follow: true },
    alternates: { canonical: `/${safe}/impressum` },
  };
}

export default async function ImpressumPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  return <LegalPage locale={safe} docKey="impressum" />;
}
