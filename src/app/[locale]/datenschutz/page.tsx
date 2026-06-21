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
    title: safe === "de" ? "Datenschutzerklärung" : "Privacy Policy",
    robots: { index: false, follow: true },
    alternates: { canonical: `/${safe}/datenschutz` },
  };
}

export default async function DatenschutzPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  return <LegalPage locale={safe} docKey="datenschutz" />;
}
