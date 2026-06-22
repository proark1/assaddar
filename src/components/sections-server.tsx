import {
  ArrowRight,
  Briefcase,
  Building2,
  Car,
  HardHat,
  HeartPulse,
  Landmark,
  ShoppingCart,
  SprayCan,
  Stethoscope,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { Dict, Locale } from "@/content";
import { posts as blogPosts } from "@/blog/posts";
import { aboutContent } from "@/about";
import { Button, Container, Kicker, Section } from "./ui";
import { Reveal } from "./motion";

function DecorativeLines() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 320 360"
      className="pointer-events-none absolute -right-10 top-4 hidden h-[420px] w-[380px] opacity-40 lg:block"
    >
      <path
        d="M10 30 C120 50 70 120 160 130 C250 140 200 210 90 220 C10 228 70 300 250 320"
        fill="none"
        strokeWidth="1.5"
        className="stroke-slate"
      />
      <path
        d="M10 30 L250 30 L250 100 L100 100 L100 170 L310 170 L310 320"
        fill="none"
        strokeWidth="1.5"
        className="stroke-copper"
      />
      <circle cx="10" cy="30" r="4" strokeWidth="1.5" className="fill-bg stroke-copper" />
      <circle cx="250" cy="100" r="4" strokeWidth="1.5" className="fill-bg stroke-copper" />
      <circle cx="100" cy="170" r="4" strokeWidth="1.5" className="fill-bg stroke-copper" />
      <circle cx="310" cy="320" r="4" className="fill-copper" />
    </svg>
  );
}

export function Hero({ t }: { t: Dict["hero"] }) {
  return (
    <Section className="relative overflow-hidden pt-14 md:pt-20">
      <DecorativeLines />
      <Container className="relative">
        <Kicker>{t.kicker}</Kicker>
        <h1 className="mt-6 max-w-3xl font-serif text-[34px] font-normal leading-[1.12] tracking-[-0.01em] text-ink sm:text-5xl md:text-[56px]">
          {t.line1} <span className="text-copper">{t.line2}</span>
        </h1>
        <p className="mt-7 max-w-xl text-base leading-relaxed text-ink2">{t.sub}</p>
        <Reveal delay={0.1}>
          <div className="mt-9 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <Button href={t.ctaPrimaryHref}>{t.ctaPrimary}</Button>
            <div>
              <a
                href={t.ctaSecondaryHref}
                className="inline-flex items-center gap-1.5 border-b border-copper pb-0.5 text-sm text-ink transition-colors hover:text-copper"
              >
                {t.ctaSecondary}
                <ArrowRight className="h-3.5 w-3.5 text-copper" />
              </a>
              <p className="mt-2 text-xs text-muted">{t.ctaSecondaryHint}</p>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

export function Market({ t }: { t: Dict["market"] }) {
  return (
    <div className="border-y border-hairline bg-surface2">
      <Container className="py-14">
        <Reveal>
          <Kicker>{t.kicker}</Kicker>
          <h2 className="mt-4 max-w-2xl font-serif text-2xl font-normal text-ink md:text-3xl">
            {t.heading}
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-ink2">{t.intro}</p>
        </Reveal>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {t.stats.map((s, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div className="border-l-2 border-copper pl-5">
                <div className="font-serif text-4xl text-copper md:text-5xl">
                  {s.value}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink2">{s.label}</p>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                  {s.source}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-ink">{t.note}</p>
      </Container>
    </div>
  );
}

export function MethodSection({ t }: { t: Dict["method"] }) {
  return (
    <Section id="methode">
      <Container>
        <Reveal>
          <div className="flex flex-wrap items-baseline gap-3">
            <Kicker>{t.kicker}</Kicker>
            <span className="font-mono text-[11px] italic text-muted">{t.by}</span>
          </div>
          <h2 className="mt-5 max-w-3xl font-serif text-3xl font-normal leading-[1.18] text-ink md:text-[40px]">
            {t.heading}
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink2">{t.sub}</p>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="mt-8 grid max-w-5xl gap-5 md:grid-cols-3">
            {t.copy.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-muted">
                {p}
              </p>
            ))}
          </div>
        </Reveal>

        <div className="relative mt-16">
          <div className="absolute left-[10%] right-[10%] top-6 hidden h-px bg-copper/40 lg:block" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
            {t.phases.map((ph, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className="relative">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-copper bg-bg font-serif text-xl text-copper">
                    {ph.letter}
                  </div>
                  <div className="text-base font-medium text-ink">{ph.title}</div>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {ph.meaning}
                  </p>
                  <div className="mt-3 inline-flex rounded-md bg-copper/10 px-2.5 py-1 text-[12px] text-copper">
                    {ph.result}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <p className="mt-12 font-mono text-[12px] uppercase tracking-[0.12em] text-copper">
          {t.tagline}
        </p>
      </Container>
    </Section>
  );
}

export function Angebote({ t }: { t: Dict["angebote"] }) {
  return (
    <Section id="angebote" className="border-t border-hairline">
      <Container>
        <Reveal>
          <Kicker>{t.kicker}</Kicker>
          <h2 className="mt-5 font-serif text-3xl font-normal text-ink md:text-[40px]">
            {t.heading}
          </h2>
          <p className="mt-4 max-w-2xl text-base text-ink2">{t.sub}</p>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.items.map((s, i) => (
            <Reveal key={s.product} delay={i * 0.05}>
              <div
                className={`flex h-full flex-col rounded-xl border p-6 shadow-card ${
                  s.featured ? "border-copper bg-surface2" : "border-hairline bg-surface"
                }`}
              >
                <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-copper">
                  {t.methodLabel}: {s.methodik}
                </span>
                <h3 className="mt-3 font-serif text-xl text-ink">{s.product}</h3>
                <div className="mt-1 text-lg font-medium text-copper">
                  {s.price}
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-ink2">
                  {s.purpose}
                </p>
                <a
                  href="#kontakt"
                  className="group mt-6 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-copper"
                >
                  {s.cta}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted">{t.note}</p>
      </Container>
    </Section>
  );
}

const BRANCHEN_ICONS: Record<string, LucideIcon> = {
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
};

export function Branchen({ t }: { t: Dict["branchen"] }) {
  return (
    <Section id="branchen" className="border-t border-hairline">
      <Container>
        <Reveal>
          <Kicker>{t.kicker}</Kicker>
          <h2 className="mt-5 max-w-3xl font-serif text-3xl font-normal text-ink md:text-[40px]">
            {t.heading}
          </h2>
          <p className="mt-4 max-w-2xl text-base text-ink2">{t.intro}</p>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {t.items.map((b, i) => {
            const Icon = BRANCHEN_ICONS[b.icon] ?? Briefcase;
            return (
              <Reveal key={b.title} delay={(i % 3) * 0.05}>
                <div className="flex h-full flex-col rounded-xl border border-hairline bg-surface p-6 shadow-card">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-copper/10 text-copper">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-medium text-ink">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink2">{b.copy}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

export function Proof({ t }: { t: Dict["proof"] }) {
  return (
    <Section className="border-t border-hairline">
      <Container>
        <Reveal>
          <div className="rounded-2xl border border-hairline bg-surface2 p-8 shadow-card md:p-12">
            <Kicker>{t.kicker}</Kicker>
            <h2 className="mt-5 max-w-2xl font-serif text-2xl font-normal leading-snug text-ink md:text-3xl">
              {t.heading}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink2">
              {t.body}
            </p>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

export function About({ t, locale }: { t: Dict["about"]; locale: Locale }) {
  return (
    <Section id="ueber-mich" className="border-t border-hairline">
      <Container>
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <Reveal>
            <div>
              <Kicker>{t.kicker}</Kicker>
              <h2 className="mt-5 font-serif text-3xl font-normal leading-tight text-ink md:text-[38px]">
                {t.heading}
              </h2>
              <div className="mt-8 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-strong font-serif text-lg text-copper">
                  AD
                </div>
                <div className="text-sm text-muted">{t.signature}</div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="space-y-5">
              {t.paragraphs.map((p, i) => (
                <p
                  key={i}
                  className={`text-base leading-relaxed ${
                    i === t.paragraphs.length - 1
                      ? "border-l-2 border-copper pl-5 text-ink"
                      : "text-ink2"
                  }`}
                >
                  {p}
                </p>
              ))}
              <Link
                href={`/${locale}/ueber-mich`}
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-copper"
              >
                {t.more}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

export function ProductsPreview({ locale }: { locale: Locale }) {
  const a = aboutContent[locale];
  const isDe = locale === "de";

  return (
    <Section id="meine-produkte" className="border-t border-hairline">
      <Container>
        <Reveal>
          <Kicker>{a.productsTitle}</Kicker>
          <h2 className="mt-5 max-w-3xl font-serif text-3xl font-normal text-ink md:text-[40px]">
            {isDe
              ? "Eigene KI-Produkte als Praxisbeweis."
              : "Own AI products as proof of practice."}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink2">
            {isDe
              ? "Ich berate nicht nur über KI und Digitalisierung. Ich baue solche Systeme selbst: von Produktlogik und Datenmodell bis Nutzerführung, Automatisierung und Betrieb."
              : "I do not only advise on AI and digitalization. I build these systems myself: from product logic and data models to UX, automation, and operations."}
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {a.products.map((product, i) => (
            <Reveal key={product.name} delay={i * 0.05}>
              <article className="flex h-full flex-col rounded-xl border border-hairline bg-surface p-6 shadow-card">
                <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-copper">
                  {product.tagline}
                </div>
                <h3 className="mt-3 font-serif text-xl text-ink">
                  {product.name}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink2">
                  {product.text}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-10">
            <Link
              href={`/${locale}/meine-produkte`}
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-copper"
            >
              {isDe ? "Produkte im Detail ansehen" : "View products in detail"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

export function Blog({ t }: { t: Dict["blog"] }) {
  return (
    <Section id="blog" className="border-t border-hairline">
      <Container>
        <Reveal>
          <Kicker>{t.kicker}</Kicker>
          <h2 className="mt-5 max-w-3xl font-serif text-3xl font-normal text-ink md:text-[40px]">
            {t.heading}
          </h2>
          <p className="mt-4 max-w-2xl text-base text-ink2">{t.intro}</p>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 0.05}>
              <Link
                href={`/de/blog/${p.slug}`}
                className="group flex h-full flex-col rounded-xl border border-hairline bg-surface p-6 shadow-card transition-colors hover:border-copper"
              >
                <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-copper">
                  {p.category}
                </span>
                <h3 className="mt-3 font-serif text-lg leading-snug text-ink">
                  {p.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink2">
                  {p.teaser}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-muted">
                  {p.readingTimeMin} Min · {t.readMore}
                  <ArrowRight className="h-3.5 w-3.5 text-copper transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1}>
          <div className="mt-10">
            <Link
              href="/de/blog"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-copper"
            >
              {t.viewAll}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

export function FinalCta({ t }: { t: Dict["finalCta"] }) {
  return (
    <Section id="kontakt" className="border-t border-hairline">
      <Container>
        <Reveal>
          <div className="rounded-2xl border border-copper/30 bg-surface2 p-10 text-center shadow-card md:p-16">
            <Kicker>{t.kicker}</Kicker>
            <h2 className="mx-auto mt-5 max-w-2xl font-serif text-3xl font-normal leading-tight text-ink md:text-[42px]">
              {t.heading}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink2">
              {t.sub}
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button href={t.ctaHref}>{t.cta}</Button>
              <span className="text-sm text-muted">
                {t.or}{" "}
                <a
                  href={`mailto:${t.email}`}
                  className="text-copper transition-colors hover:text-copper-hi"
                >
                  {t.email}
                </a>
              </span>
            </div>
            <p className="mt-6 text-xs text-muted">{t.reassure}</p>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
