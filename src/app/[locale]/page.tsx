import { getDict, isLocale, locales, SITE_URL, type Locale } from "@/content";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import {
  About,
  Angebote,
  BeforeAfterWorkflow,
  Blog,
  Branchen,
  EvidenceNumbers,
  FinalCta,
  Hero,
  Market,
  MethodSection,
  MiniCaseStudies,
  NextStepsTimeline,
  ProductsPreview,
  TrustSignals,
  WhyAssad,
} from "@/components/sections-server";
import { AiExamples } from "@/components/examples";
import { Faq } from "@/components/faq";
import { ReadinessAndRoiTools } from "@/components/landing-tools";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const t = getDict(safe);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Assad Dar",
    description: t.meta.description,
    url: `${SITE_URL}/${safe}`,
    email: "assad.dar@gmail.com",
    knowsLanguage: ["de", "en"],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Mönchengladbach",
      addressCountry: "DE",
    },
    founder: {
      "@type": "Person",
      "@id": `${SITE_URL}/#assad-dar`,
      name: "Assad Dar",
      url: `${SITE_URL}/${safe}/ueber-mich`,
      jobTitle:
        safe === "de"
          ? "KI- & Transformationsberater"
          : "AI & Transformation Advisor",
      sameAs: ["https://linkedin.com/in/assaddar"],
    },
    makesOffer: t.angebote.items.map((s) => ({
      "@type": "Offer",
      price: s.price.replace(/[^\d]/g, ""),
      priceCurrency: "EUR",
      itemOffered: {
        "@type": "Service",
        name: `${s.product} — ${s.methodik}`,
        description: s.purpose,
      },
    })),
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faq.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-copper focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-oncopper"
      >
        {t.nav.skip}
      </a>
      <Nav t={t.nav} locale={safe} />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero t={t.hero} />
        <Market t={t.market} />
        <EvidenceNumbers locale={safe} />
        <ReadinessAndRoiTools locale={safe} />
        <TrustSignals locale={safe} />
        <MiniCaseStudies locale={safe} />
        <NextStepsTimeline locale={safe} />
        <MethodSection t={t.method} />
        <BeforeAfterWorkflow locale={safe} />
        <AiExamples t={t.examples} />
        <WhyAssad locale={safe} />
        <Angebote t={t.angebote} />
        <Branchen t={t.branchen} />
        <About t={t.about} locale={safe} />
        <ProductsPreview locale={safe} />
        <Blog t={t.blog} />
        <Faq t={t.faq} />
        <FinalCta t={t.finalCta} />
      </main>
      <Footer t={t.footer} locale={safe} />
    </>
  );
}
