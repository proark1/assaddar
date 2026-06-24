import type { Metadata } from "next";
import { ArrowRight, Calendar, Mail, Phone } from "lucide-react";
import { CAL_LINK, getDict, isLocale, type Locale } from "@/content";
import { ContactForm } from "@/components/contact-form";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

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
  const t = getDict(safe);
  return {
    title: t.termin.title,
    description: t.termin.intro,
    alternates: { canonical: `/${safe}/termin` },
  };
}

export default async function TerminPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    source?: string;
    score?: string;
    band?: string;
    bottleneck?: string;
    monthlyHours?: string;
    monthlyValue?: string;
    annualValue?: string;
  }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const t = getDict(safe);
  const tt = t.termin;
  const email = t.finalCta.email;
  const leadContext =
    query.source === "asdar-check"
      ? [
          "ASDAR Potenzial-Check",
          query.score && `Score: ${query.score}/100`,
          query.band && `Einordnung: ${query.band}`,
          query.bottleneck && `Engpass: ${query.bottleneck}`,
          query.monthlyHours && `Geschätzte freie Stunden/Monat: ${query.monthlyHours}`,
          query.monthlyValue && `Geschätzter Wert/Monat: ${query.monthlyValue} EUR`,
          query.annualValue && `Geschätzter Wert/Jahr: ${query.annualValue} EUR`,
        ]
          .filter(Boolean)
          .join("\n")
      : "";

  return (
    <>
      <Nav t={t.nav} locale={safe} subpage />

      <main id="main" className="outline-none">
        <section className="mx-auto w-full max-w-[760px] px-6 py-16 md:px-10 md:py-20">
          <h1 className="font-serif text-3xl font-normal leading-tight text-ink md:text-[44px]">
            {tt.title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink2">
            {tt.intro}
          </p>

          <div className="mt-10 rounded-2xl border border-hairline bg-surface p-6 shadow-card md:p-8">
            <h2 className="mb-6 font-serif text-xl font-normal text-ink">
              {tt.formTitle}
            </h2>
            <ContactForm
              t={tt}
              email={email}
              locale={safe}
              leadContext={leadContext}
            />
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-hairline bg-surface2 p-6">
              <h3 className="text-base font-medium text-ink">{tt.directTitle}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink2">
                {tt.directNote}
              </p>
              <div className="mt-4 space-y-2 text-sm">
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-2 text-copper hover:underline"
                >
                  <Mail className="h-4 w-4" />
                  {email}
                </a>
                <div className="flex items-center gap-2 text-ink2">
                  <Phone className="h-4 w-4 text-copper" />
                  {tt.phone}
                </div>
              </div>
            </div>

            {CAL_LINK && (
              <div className="flex flex-col rounded-xl border border-copper/30 bg-surface2 p-6">
                <h3 className="text-base font-medium text-ink">{tt.calTitle}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink2">
                  {tt.calNote}
                </p>
                <a
                  href={`https://cal.com/${CAL_LINK}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-4 inline-flex w-fit items-center gap-2 rounded-lg bg-copper px-5 py-3 text-sm font-medium text-oncopper shadow-[0_2px_8px_rgba(166,110,47,0.25)] transition-all hover:-translate-y-0.5 hover:bg-copper-hi"
                >
                  <Calendar className="h-4 w-4" />
                  {tt.calCta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer t={t.footer} locale={safe} />
    </>
  );
}
