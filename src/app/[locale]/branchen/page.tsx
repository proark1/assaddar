import type { Metadata } from "next";
import Link from "next/link";
import {
  Briefcase,
  Building,
  Building2,
  Car,
  Factory,
  GraduationCap,
  HardHat,
  HeartPulse,
  Landmark,
  ShoppingCart,
  ShieldCheck,
  SprayCan,
  Stethoscope,
  Truck,
  UtensilsCrossed,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { getDict, isLocale, locales, SITE_URL, type Locale } from "@/content";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { FinalCta } from "@/components/sections-server";

const ICONS: Record<string, LucideIcon> = {
  HeartPulse,
  Car,
  Building2,
  SprayCan,
  HardHat,
  Stethoscope,
  Landmark,
  UtensilsCrossed,
  ShoppingCart,
  Briefcase,
  Factory,
  Truck,
  GraduationCap,
  ShieldCheck,
  UsersRound,
  Building,
};

const INDUSTRY_LEVERS: Record<string, Record<Locale, string[]>> = {
  HeartPulse: {
    de: [
      "Dokumentation und Übergaben strukturieren.",
      "Dienstplanung, Erinnerungen und interne Kommunikation vereinfachen.",
      "Qualitäts- und Prüfaufgaben nachvollziehbar machen.",
    ],
    en: [
      "Structure documentation and handovers.",
      "Simplify shift planning, reminders, and internal communication.",
      "Make quality and audit tasks traceable.",
    ],
  },
  Car: {
    de: [
      "Leads automatisch erfassen, qualifizieren und nachfassen.",
      "Fahrzeugtexte, Inserate und Kundenantworten schneller erstellen.",
      "Werkstatttermine und Statusupdates verlässlicher steuern.",
    ],
    en: [
      "Capture, qualify, and follow up leads automatically.",
      "Create vehicle copy, listings, and customer replies faster.",
      "Run workshop appointments and status updates more reliably.",
    ],
  },
  Building2: {
    de: [
      "Objektdaten zentral strukturieren und wiederverwenden.",
      "Exposés, Anfragen und Besichtigungen effizienter vorbereiten.",
      "Interessenten vorqualifizieren und Rückfragen reduzieren.",
    ],
    en: [
      "Structure property data centrally and reuse it.",
      "Prepare listings, inquiries, and viewings more efficiently.",
      "Pre-qualify prospects and reduce follow-up questions.",
    ],
  },
  SprayCan: {
    de: [
      "Digitale Checklisten für Touren, Qualität und Übergaben nutzen.",
      "Kundenmeldungen und Einsatzupdates automatisiert vorbereiten.",
      "Planung, Nachweise und Reklamationen transparenter machen.",
    ],
    en: [
      "Use digital checklists for routes, quality, and handovers.",
      "Prepare customer notices and job updates automatically.",
      "Make planning, proof of work, and complaints more transparent.",
    ],
  },
  HardHat: {
    de: [
      "Angebote, Baustellenberichte und Fotodokumentation beschleunigen.",
      "Informationen aus E-Mail, Bildern, PDFs und Notizen zusammenführen.",
      "Kundenupdates und Nachträge sauberer steuern.",
    ],
    en: [
      "Speed up quotes, site reports, and photo documentation.",
      "Connect information from email, images, PDFs, and notes.",
      "Manage customer updates and change orders more cleanly.",
    ],
  },
  Stethoscope: {
    de: [
      "Terminprozesse und Patientenfragen besser vorsortieren.",
      "Empfang, Erinnerungen und interne Aufgaben entlasten.",
      "Dokumentations- und Standardkommunikation strukturieren.",
    ],
    en: [
      "Pre-sort appointment workflows and patient questions.",
      "Reduce load on reception, reminders, and internal tasks.",
      "Structure documentation and standard communication.",
    ],
  },
  Landmark: {
    de: [
      "Dokumente vorsortieren und Fristen sichtbar machen.",
      "Mandantenkommunikation, Standardantworten und Zusammenfassungen vorbereiten.",
      "Wissen aus Akten, E-Mails und Vorlagen leichter nutzbar machen.",
    ],
    en: [
      "Pre-sort documents and make deadlines visible.",
      "Prepare client communication, standard replies, and summaries.",
      "Make knowledge from files, emails, and templates easier to use.",
    ],
  },
  UtensilsCrossed: {
    de: [
      "Reservierungen, Bewertungen und Gästekommunikation systematisieren.",
      "Schichtplanung und wiederkehrende operative Aufgaben vereinfachen.",
      "Marketingaktionen und lokale Inhalte schneller vorbereiten.",
    ],
    en: [
      "Systematize reservations, reviews, and guest communication.",
      "Simplify shift planning and recurring operational tasks.",
      "Prepare campaigns and local content faster.",
    ],
  },
  ShoppingCart: {
    de: [
      "Produktdaten, Beschreibungen und Varianten konsistenter pflegen.",
      "Kundenservice, Retourengründe und Kampagnen schneller auswerten.",
      "Shop-, CRM- und Marketingdaten besser verbinden.",
    ],
    en: [
      "Maintain product data, descriptions, and variants more consistently.",
      "Analyze service, returns, and campaigns faster.",
      "Connect shop, CRM, and marketing data better.",
    ],
  },
  Briefcase: {
    de: [
      "Briefings, Angebote und Projektübergaben standardisieren.",
      "Meeting-Protokolle, Reporting und Recherche vorbereiten lassen.",
      "Kundenstatus und interne Aufgaben verlässlicher sichtbar machen.",
    ],
    en: [
      "Standardize briefings, proposals, and project handovers.",
      "Prepare meeting notes, reporting, and research.",
      "Make customer status and internal tasks more reliably visible.",
    ],
  },
  Factory: {
    de: [
      "Schichtübergaben, Qualitätsdaten und Produktionsabweichungen strukturieren.",
      "Wartung, Arbeitsanweisungen und Prüfprotokolle schneller zugänglich machen.",
      "Produktions- und Managementreporting aus vorhandenen Daten vorbereiten.",
    ],
    en: [
      "Structure shift handovers, quality data, and production deviations.",
      "Make maintenance, work instructions, and inspection logs easier to access.",
      "Prepare production and management reporting from existing data.",
    ],
  },
  Truck: {
    de: [
      "Touren, Sendungsstatus und Ausnahmen zentral sichtbar machen.",
      "Kundenupdates, Lieferavis und interne Eskalationen automatisiert vorbereiten.",
      "Disposition, Dokumente und Nachweise besser verbinden.",
    ],
    en: [
      "Make routes, shipment status, and exceptions centrally visible.",
      "Prepare customer updates, delivery notices, and internal escalations automatically.",
      "Connect dispatching, documents, and proof of delivery more cleanly.",
    ],
  },
  GraduationCap: {
    de: [
      "Lernmaterialien, Kursunterlagen und Wissensdatenbanken schneller erstellen.",
      "Teilnehmerfragen, Feedback und Zertifikatsprozesse strukturieren.",
      "Interne Trainings und Onboarding-Inhalte leichter aktuell halten.",
    ],
    en: [
      "Create learning materials, course documents, and knowledge bases faster.",
      "Structure participant questions, feedback, and certificate workflows.",
      "Keep internal training and onboarding content easier to update.",
    ],
  },
  ShieldCheck: {
    de: [
      "Anfragen, Unterlagen und Risikoinformationen vorqualifizieren.",
      "Beratungsdokumentation, Standardantworten und Zusammenfassungen vorbereiten.",
      "Compliance-nahe Prüf- und Freigabeprozesse nachvollziehbarer machen.",
    ],
    en: [
      "Pre-qualify inquiries, documents, and risk information.",
      "Prepare advisory documentation, standard replies, and summaries.",
      "Make compliance-adjacent review and approval processes more traceable.",
    ],
  },
  UsersRound: {
    de: [
      "Bewerbungen, Profile und Gesprächsnotizen strukturiert vorsortieren.",
      "Onboarding, HR-Wissen und Mitarbeiteranfragen schneller beantworten.",
      "Standardkommunikation und interne Übergaben konsistenter machen.",
    ],
    en: [
      "Pre-sort applications, profiles, and interview notes in a structured way.",
      "Answer onboarding, HR knowledge, and employee questions faster.",
      "Make standard communication and internal handovers more consistent.",
    ],
  },
  Building: {
    de: [
      "Bürgeranfragen, Formulare und Vorgänge nach Thema und Dringlichkeit vorsortieren.",
      "Antwortentwürfe, Wissensdatenbanken und interne Arbeitsanweisungen vorbereiten.",
      "Medienbrüche zwischen E-Mail, PDF, Fachverfahren und Akten reduzieren.",
    ],
    en: [
      "Pre-sort citizen inquiries, forms, and cases by topic and urgency.",
      "Prepare draft replies, knowledge bases, and internal work instructions.",
      "Reduce handoff breaks between email, PDFs, specialist systems, and files.",
    ],
  },
};

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
  const title =
    safe === "de"
      ? "Branchen — KI- & Automatisierungsberatung | Assad Dar"
      : "Industries — AI & automation consulting | Assad Dar";

  return {
    title,
    description: t.branchen.intro,
    alternates: { canonical: `/${safe}/branchen` },
    openGraph: {
      type: "website",
      title,
      description: t.branchen.intro,
      url: `/${safe}/branchen`,
    },
  };
}

export default async function BranchenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const t = getDict(safe);
  const isDe = safe === "de";

  const industryLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: isDe ? "Branchen für KI-Beratung" : "Industries for AI consulting",
    itemListElement: t.branchen.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.title,
      description: item.copy,
      url: `${SITE_URL}/${safe}/branchen`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(industryLd) }}
      />
      <Nav t={t.nav} locale={safe} subpage />

      <main id="main" className="outline-none">
        <div className="mx-auto w-full max-w-[1120px] px-6 py-16 md:px-10 md:py-20">
          <nav
            aria-label={isDe ? "Brotkrumen" : "Breadcrumb"}
            className="flex flex-wrap items-center gap-1.5 text-[12px] text-muted"
          >
            <Link href={`/${safe}`} className="transition-colors hover:text-ink">
              Home
            </Link>
            <span className="text-strong">/</span>
            <span className="text-ink2">{t.branchen.kicker}</span>
          </nav>

          <header className="mt-6 max-w-3xl">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-copper">
              {t.branchen.kicker}
            </span>
            <h1 className="mt-5 font-serif text-3xl font-normal leading-[1.15] text-ink md:text-[46px]">
              {t.branchen.heading}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink2">
              {t.branchen.intro}
            </p>
          </header>

          <section className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {t.branchen.items.map((item) => {
              const Icon = ICONS[item.icon] ?? Briefcase;
              const levers = INDUSTRY_LEVERS[item.icon]?.[safe] ?? [];

              return (
                <article
                  key={item.title}
                  className="flex h-full flex-col rounded-xl border border-hairline bg-surface p-6 shadow-card"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-copper/10 text-copper">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-base font-medium text-ink">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink2">
                    {item.copy}
                  </p>
                  <div className="mt-5 border-t border-hairline pt-4">
                    <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-copper">
                      {isDe ? "Typische Hebel" : "Typical levers"}
                    </div>
                    <ul className="mt-3 space-y-2">
                      {levers.map((lever) => (
                        <li
                          key={lever}
                          className="flex gap-2 text-sm leading-relaxed text-ink2"
                        >
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-copper" />
                          {lever}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </section>
        </div>

        <FinalCta t={t.finalCta} />
      </main>

      <Footer t={t.footer} locale={safe} />
    </>
  );
}
