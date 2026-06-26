import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Building,
  Building2,
  Car,
  CheckCircle2,
  Clock3,
  ClipboardCheck,
  Factory,
  FileCheck2,
  FileSpreadsheet,
  GraduationCap,
  HardHat,
  HeartPulse,
  Landmark,
  ListChecks,
  Mail,
  ShoppingCart,
  ShieldCheck,
  Sparkles,
  SprayCan,
  Stethoscope,
  Truck,
  UtensilsCrossed,
  Workflow,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
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
    <Section className="relative overflow-hidden pb-0 pt-10 md:pt-14">
      <DecorativeLines />
      <Container className="relative">
        <div className="grid gap-3 sm:gap-8 lg:min-h-[500px] lg:grid-cols-[minmax(0,0.98fr)_minmax(340px,0.72fr)] lg:items-end">
          <div className="pb-10 md:pb-14 lg:pb-16">
            <Kicker>{t.kicker}</Kicker>
            <h1 className="mt-5 max-w-3xl font-serif text-[34px] font-normal leading-[1.12] tracking-[-0.01em] text-ink sm:text-5xl md:text-[52px]">
              {t.line1} <span className="text-copper">{t.line2}</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink2">
              {t.sub}
            </p>
            <Reveal delay={0.1}>
              <div className="mt-7 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
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
              <div className="mt-6 flex flex-wrap gap-2">
                {t.chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-md border border-copper/30 bg-copper/10 px-3 py-2 text-[12px] text-copper"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <div className="relative mx-auto flex min-h-[220px] w-full max-w-[340px] items-end justify-center overflow-hidden sm:min-h-[390px] sm:max-w-[420px] lg:min-h-[500px] lg:max-w-none">
              <svg
                aria-hidden="true"
                viewBox="0 0 420 520"
                className="absolute bottom-0 left-1/2 h-[92%] w-[92%] -translate-x-1/2 text-copper opacity-25"
              >
                <path
                  d="M62 434 C 114 334 73 208 165 139 C 240 83 356 118 376 224 C 399 346 291 433 165 452"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M46 384 L356 384 M82 312 L320 312 M116 240 L286 240"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </svg>
              <Image
                src="/people/assad-dar-portrait.png"
                alt="Assad Dar"
                width={800}
                height={1200}
                priority
                className="relative z-10 h-[230px] w-auto object-contain object-bottom sm:h-[390px] lg:h-[500px]"
              />
            </div>
          </Reveal>
        </div>
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

export function EvidenceNumbers({ locale }: { locale: Locale }) {
  const isDe = locale === "de";
  const stats = isDe
    ? [
        {
          value: "88 %",
          label:
            "der befragten Organisationen berichten regelmäßige KI-Nutzung in mindestens einer Business-Funktion.",
          source: "McKinsey State of AI 2025",
          href: "https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai",
        },
        {
          value: "80 %",
          label:
            "der globalen Belegschaft fehlt laut Microsoft genug Zeit oder Energie für die steigenden Anforderungen.",
          source: "Microsoft Work Trend Index 2025",
          href: "https://www.microsoft.com/en-us/worklab/work-trend-index/2025-the-year-the-frontier-firm-is-born",
        },
        {
          value: "0,5-3,4 PP",
          label:
            "zusätzliches jährliches Produktivitätswachstum könnte Arbeitsautomation laut McKinsey beitragen.",
          source: "McKinsey GenAI Productivity Frontier",
          href: "https://www.mckinsey.com/capabilities/tech-and-ai/our-insights/the-economic-potential-of-generative-ai-the-next-productivity-frontier",
        },
      ]
    : [
        {
          value: "88%",
          label:
            "of surveyed organizations report regular AI use in at least one business function.",
          source: "McKinsey State of AI 2025",
          href: "https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai",
        },
        {
          value: "80%",
          label:
            "of the global workforce lacks enough time or energy for rising demands, according to Microsoft.",
          source: "Microsoft Work Trend Index 2025",
          href: "https://www.microsoft.com/en-us/worklab/work-trend-index/2025-the-year-the-frontier-firm-is-born",
        },
        {
          value: "0.5-3.4 pp",
          label:
            "additional annual productivity growth could be contributed by work automation, according to McKinsey.",
          source: "McKinsey GenAI Productivity Frontier",
          href: "https://www.mckinsey.com/capabilities/tech-and-ai/our-insights/the-economic-potential-of-generative-ai-the-next-productivity-frontier",
        },
      ];

  return (
    <Section className="border-t border-hairline">
      <Container>
        <Reveal>
          <Kicker>{isDe ? "Externe Signale" : "External signals"}</Kicker>
          <h2 className="mt-5 max-w-3xl font-serif text-3xl font-normal leading-tight text-ink md:text-[40px]">
            {isDe
              ? "Die Frage ist nicht mehr, ob KI kommt. Die Frage ist, welcher Prozess zuerst einfacher wird."
              : "The question is no longer whether AI is coming. The question is which process gets simpler first."}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink2">
            {isDe
              ? "Die Zahlen zeigen den Druck: KI ist angekommen, Teams sind ausgelastet, und Produktivität entsteht nur, wenn aus Tools konkrete Abläufe werden."
              : "The numbers show the pressure: AI has arrived, teams are stretched, and productivity only appears when tools become concrete workflows."}
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {stats.map((item, index) => (
            <Reveal key={item.source} delay={index * 0.05}>
              <article className="flex h-full flex-col rounded-xl border border-hairline bg-surface p-6 shadow-card">
                <div className="font-serif text-4xl text-copper md:text-5xl">
                  {item.value}
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-ink2">
                  {item.label}
                </p>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-copper transition-colors hover:text-copper-hi"
                >
                  {item.source}
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
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

export function NextStepsTimeline({ locale }: { locale: Locale }) {
  const isDe = locale === "de";
  const steps = isDe
    ? [
        {
          icon: Clock3,
          title: "1. Erstgespräch",
          body: "30 Minuten: Ziel, Ausgangslage, Engpass und passendes ASDAR Paket klären.",
        },
        {
          icon: ListChecks,
          title: "2. Prozessaufnahme",
          body: "Abläufe, Tools, Daten, Dokumente und Verantwortlichkeiten strukturiert erfassen.",
        },
        {
          icon: ClipboardCheck,
          title: "3. ASDAR Analyse",
          body: "Quick Wins, Risiken, Aufwand, Nutzen und Roadmap priorisieren.",
        },
        {
          icon: Workflow,
          title: "4. Pilot oder Umsetzung",
          body: "Einen konkreten Workflow testen, messen und im Kundenportal sichtbar halten.",
        },
      ]
    : [
        {
          icon: Clock3,
          title: "1. Intro call",
          body: "30 minutes: clarify goal, current state, bottleneck, and the right ASDAR package.",
        },
        {
          icon: ListChecks,
          title: "2. Process intake",
          body: "Capture workflows, tools, data, documents, and responsibilities in a structured way.",
        },
        {
          icon: ClipboardCheck,
          title: "3. ASDAR analysis",
          body: "Prioritize quick wins, risks, effort, value, and roadmap.",
        },
        {
          icon: Workflow,
          title: "4. Pilot or execution",
          body: "Test one concrete workflow, measure it, and keep progress visible in the portal.",
        },
      ];

  return (
    <Section className="border-t border-hairline">
      <Container>
        <Reveal>
          <Kicker>{isDe ? "Was passiert danach?" : "What happens next?"}</Kicker>
          <h2 className="mt-5 max-w-3xl font-serif text-3xl font-normal leading-tight text-ink md:text-[40px]">
            {isDe
              ? "Von der Anfrage zu einem umsetzbaren Automatisierungsschritt."
              : "From request to one actionable automation step."}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink2">
            {isDe
              ? "Der Ablauf bleibt bewusst einfach. Sie sehen jederzeit, was entschieden ist, was offen ist und welcher Schritt als nächstes kommt."
              : "The flow stays deliberately simple. You always see what is decided, what is open, and which step comes next."}
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Reveal key={step.title} delay={index * 0.05}>
                <article className="relative h-full rounded-xl border border-hairline bg-surface p-6 shadow-card">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-copper/10 text-copper">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-medium text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink2">
                    {step.body}
                  </p>
                  {index < steps.length - 1 && (
                    <ArrowRight className="absolute -right-3 top-10 hidden h-5 w-5 text-copper/60 lg:block" />
                  )}
                </article>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

export function BeforeAfterWorkflow({ locale }: { locale: Locale }) {
  const isDe = locale === "de";
  const before = isDe
    ? [
        {
          icon: Mail,
          title: "E-Mail-Pingpong",
          body: "Anfragen, Rückfragen und Status liegen in einzelnen Postfächern.",
        },
        {
          icon: FileSpreadsheet,
          title: "Excel & Einzeldokumente",
          body: "Informationen sind verteilt, doppelt gepflegt und schwer auszuwerten.",
        },
        {
          icon: Clock3,
          title: "Manuelle Nacharbeit",
          body: "Wiederkehrende Aufgaben kosten Zeit, ohne besser zu werden.",
        },
      ]
    : [
        {
          icon: Mail,
          title: "Email back-and-forth",
          body: "Requests, follow-ups, and status updates live in individual inboxes.",
        },
        {
          icon: FileSpreadsheet,
          title: "Excel & separate documents",
          body: "Information is scattered, duplicated, and hard to evaluate.",
        },
        {
          icon: Clock3,
          title: "Manual rework",
          body: "Recurring tasks consume time without improving.",
        },
      ];

  const after = isDe
    ? [
        {
          icon: FileCheck2,
          title: "Geführter Intake",
          body: "Alle relevanten Projektinformationen landen strukturiert im Portal.",
        },
        {
          icon: Sparkles,
          title: "KI-gestützte Vorarbeit",
          body: "Vorlagen, Ideen, Statusentwürfe und Roadmaps entstehen schneller.",
        },
        {
          icon: BarChart3,
          title: "Messbare Roadmap",
          body: "Quick Wins, Aufgaben, Entscheidungen und nächste Schritte bleiben sichtbar.",
        },
      ]
    : [
        {
          icon: FileCheck2,
          title: "Guided intake",
          body: "All relevant project information lands in the portal in a structured way.",
        },
        {
          icon: Sparkles,
          title: "AI-supported preparation",
          body: "Templates, ideas, status drafts, and roadmaps are prepared faster.",
        },
        {
          icon: BarChart3,
          title: "Measurable roadmap",
          body: "Quick wins, tasks, decisions, and next steps stay visible.",
        },
      ];

  const impact = isDe
    ? [
        { label: "Transparenz", before: 35, after: 86 },
        { label: "Reaktionsgeschwindigkeit", before: 42, after: 82 },
        { label: "Automatisierbarkeit", before: 28, after: 78 },
      ]
    : [
        { label: "Transparency", before: 35, after: 86 },
        { label: "Response speed", before: 42, after: 82 },
        { label: "Automation readiness", before: 28, after: 78 },
      ];

  return (
    <Section className="border-t border-hairline bg-surface2">
      <Container>
        <Reveal>
          <Kicker>{isDe ? "Vorher / Nachher" : "Before / after"}</Kicker>
          <h2 className="mt-5 max-w-3xl font-serif text-3xl font-normal leading-tight text-ink md:text-[40px]">
            {isDe
              ? "Die Landingpage soll sofort zeigen, was sich praktisch verbessert."
              : "The landing page should immediately show what improves in practice."}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink2">
            {isDe
              ? "ASDAR macht aus gewachsenen Abläufen eine beratbare, digitale und automatisierbare Projektstruktur."
              : "ASDAR turns grown-over workflows into a consultable, digital, and automatable project structure."}
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1fr_0.35fr_1fr] lg:items-stretch">
          <div className="rounded-xl border border-hairline bg-surface p-5 shadow-card md:p-6">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
              {isDe ? "Heute oft" : "Often today"}
            </div>
            <div className="mt-5 space-y-4">
              {before.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-hairline text-muted">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-ink">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted">
                        {item.body}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="flex w-full items-center justify-center gap-3 rounded-xl border border-copper/30 bg-copper/10 px-5 py-4 text-copper lg:h-full lg:flex-col">
              <Workflow className="h-6 w-6" />
              <span className="font-mono text-[12px] uppercase tracking-[0.14em]">
                ASDAR
              </span>
              <ArrowRight className="h-4 w-4 lg:rotate-90" />
            </div>
          </div>

          <div className="rounded-xl border border-copper/30 bg-surface p-5 shadow-card md:p-6">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-copper">
              {isDe ? "Nach der Analyse" : "After the analysis"}
            </div>
            <div className="mt-5 space-y-4">
              {after.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-copper/10 text-copper">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-ink">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink2">
                        {item.body}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <Reveal delay={0.1}>
          <div className="mt-6 rounded-xl border border-hairline bg-surface p-5 shadow-card md:p-6">
            <div className="grid gap-5 md:grid-cols-3">
              {impact.map((item) => (
                <div key={item.label}>
                  <div className="mb-3 text-sm font-medium text-ink">
                    {item.label}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="mb-1 flex justify-between text-[12px] text-muted">
                        <span>{isDe ? "Vorher" : "Before"}</span>
                        <span>{item.before}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-hairline">
                        <div
                          className="h-full rounded-full bg-muted/50"
                          style={{ width: `${item.before}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-[12px] text-copper">
                        <span>{isDe ? "Mit ASDAR" : "With ASDAR"}</span>
                        <span>{item.after}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-copper/10">
                        <div
                          className="h-full rounded-full bg-copper"
                          style={{ width: `${item.after}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 text-[12px] leading-relaxed text-muted">
              {isDe
                ? "Visualisierung als Beratungsmodell, keine pauschale Leistungszusage. Die echten Werte entstehen projektspezifisch."
                : "Visualization as a consulting model, not a generic performance promise. Real values are project-specific."}
            </p>
          </div>
        </Reveal>
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
                <Link
                  href={t.ctaHref}
                  className="group mt-6 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-copper"
                >
                  {s.cta}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
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
  Factory,
  Truck,
  GraduationCap,
  ShieldCheck,
  UsersRound,
  Building,
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

export function WhyAssad({ locale }: { locale: Locale }) {
  const isDe = locale === "de";
  const items = isDe
    ? [
        {
          icon: Building2,
          title: "Beratung plus Umsetzung",
          body: "Nicht nur Strategie: Prozesse, Portal, Vorlagen, Automatisierung und Übergabe werden praktisch gedacht.",
        },
        {
          icon: Sparkles,
          title: "Eigene KI-Produkte gebaut",
          body: "Assad berät nicht aus Tool-Folien heraus, sondern aus eigener Produkt- und Automatisierungserfahrung.",
        },
        {
          icon: ShieldCheck,
          title: "Prozess zuerst, Tool danach",
          body: "Wenn ein einfacher Workflow besser ist als KI, wird genau das empfohlen. Ziel ist Nutzen, nicht Hype.",
        },
        {
          icon: FileCheck2,
          title: "Transparenz im Kundenportal",
          body: "Kunden sehen Status, Aufgaben, Dateien, Rechnungen und Ergebnisse. Interne Beratung bleibt getrennt.",
        },
      ]
    : [
        {
          icon: Building2,
          title: "Consulting plus execution",
          body: "Not only strategy: processes, portal, templates, automation, and handover are designed pragmatically.",
        },
        {
          icon: Sparkles,
          title: "Own AI products built",
          body: "Assad does not advise from tool slides, but from his own product and automation experience.",
        },
        {
          icon: ShieldCheck,
          title: "Process first, tool second",
          body: "If a simple workflow is better than AI, that is the recommendation. The goal is value, not hype.",
        },
        {
          icon: FileCheck2,
          title: "Transparency in the client portal",
          body: "Clients see status, tasks, files, invoices, and outcomes. Internal consulting stays separate.",
        },
      ];

  return (
    <Section className="border-t border-hairline bg-surface2">
      <Container>
        <Reveal>
          <Kicker>{isDe ? "Warum Assad?" : "Why Assad?"}</Kicker>
          <h2 className="mt-5 max-w-3xl font-serif text-3xl font-normal text-ink md:text-[40px]">
            {isDe
              ? "KI-Beratung, die Prozesse versteht und Ergebnisse sichtbar macht."
              : "AI consulting that understands processes and makes outcomes visible."}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink2">
            {isDe
              ? "Der Unterschied liegt in der Verbindung aus Prozessblick, Produktdenken und sauberer Projektkommunikation."
              : "The difference is the combination of process thinking, product thinking, and clean project communication."}
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={index * 0.05}>
                <article className="h-full rounded-xl border border-hairline bg-surface p-6 shadow-card">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-copper/10 text-copper">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-medium text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink2">
                    {item.body}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

export function TrustSignals({ locale }: { locale: Locale }) {
  const isDe = locale === "de";
  const items = isDe
    ? [
        {
          icon: Workflow,
          title: "Vom Prozess zum Pilot",
          body: "Kein abstrakter KI-Vortrag: ein echter Ablauf wird analysiert, priorisiert und in einen testbaren Automatisierungsschritt übersetzt.",
        },
        {
          icon: FileCheck2,
          title: "Klare Unterlagen",
          body: "Kunden sehen Status, Aufgaben, Dateien, Angebote, Rechnungen und nächste Schritte im Portal. Interne Beratungsnotizen bleiben privat.",
        },
        {
          icon: CheckCircle2,
          title: "Messbare nächste Schritte",
          body: "Jedes Projekt endet nicht bei Ideen, sondern bei konkreten Quick Wins, Verantwortlichkeiten und einer pragmatischen Roadmap.",
        },
      ]
    : [
        {
          icon: Workflow,
          title: "From process to pilot",
          body: "No abstract AI talk: one real workflow is analyzed, prioritized, and translated into a testable automation step.",
        },
        {
          icon: FileCheck2,
          title: "Clear project documents",
          body: "Clients see status, tasks, files, proposals, invoices, and next steps in the portal. Internal consulting notes stay private.",
        },
        {
          icon: CheckCircle2,
          title: "Measurable next steps",
          body: "Every project moves from ideas to concrete quick wins, owners, and a pragmatic roadmap.",
        },
      ];

  const metrics = isDe
    ? ["Prozessanalyse", "KI-Potenziale", "Portal-Transparenz", "Umsetzungsplan"]
    : ["Process analysis", "AI opportunities", "Portal transparency", "Implementation plan"];

  return (
    <Section className="border-t border-hairline bg-surface2">
      <Container>
        <Reveal>
          <Kicker>{isDe ? "Was Kunden bekommen" : "What clients get"}</Kicker>
          <h2 className="mt-5 max-w-3xl font-serif text-3xl font-normal text-ink md:text-[40px]">
            {isDe
              ? "Beratung, die im Projekt sichtbar bleibt."
              : "Consulting that stays visible throughout the project."}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink2">
            {isDe
              ? "Der Kunde sieht Fortschritt, offene Punkte und Ergebnisse. Assad sieht intern die Diagnose, Playbooks, Vorlagen und nächste Beratungsaktionen."
              : "The client sees progress, open items, and deliverables. Assad sees the internal diagnosis, playbooks, templates, and next consulting actions."}
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={index * 0.05}>
                <article className="h-full rounded-xl border border-hairline bg-surface p-6 shadow-card">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-copper/10 text-copper">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-medium text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink2">
                    {item.body}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.12}>
          <div className="mt-8 flex flex-wrap gap-2">
            {metrics.map((metric) => (
              <span
                key={metric}
                className="rounded-md border border-copper/30 bg-copper/10 px-3 py-2 text-[12px] text-copper"
              >
                {metric}
              </span>
            ))}
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
  const productInitials: Record<string, string> = {
    "unmutenow.ai": "UN",
    "1tab.ai": "1T",
    "onepizza.io": "OP",
    "justheretolisten.io": "JL",
    EduPraxis: "EP",
    "Empires of the Near East": "EN",
  };

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
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-copper/30 bg-copper/10 font-serif text-lg text-copper">
                    {productInitials[product.name] ?? product.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-copper">
                      {product.tagline}
                    </div>
                    <h3 className="mt-3 font-serif text-xl text-ink">
                      {product.name}
                    </h3>
                  </div>
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink2">
                  {product.text}
                </p>
                <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
                  {product.bullets.slice(0, 3).map((item) => (
                    <li key={item} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap gap-3 text-sm">
                  {product.href ? (
                    <a
                      href={product.href}
                      className="inline-flex items-center gap-1.5 text-copper"
                    >
                      Website
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <span className="inline-flex rounded-md border border-hairline bg-surface2 px-3 py-1.5 text-[12px] font-medium text-muted">
                      {isDe ? "Portfolio-Projekt" : "Portfolio project"}
                    </span>
                  )}
                </div>
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

export function MiniCaseStudies({ locale }: { locale: Locale }) {
  const isDe = locale === "de";
  const cases = isDe
    ? [
        {
          icon: Stethoscope,
          title: "Allgemeinarzt in Deutschland",
          problem:
            "Telefon, Rezeptanfragen, Dokumentation und Patientenrückfragen erzeugen täglich unnötige Unterbrechungen.",
          solution:
            "ASDAR priorisiert Intake, Terminlogik, Vorlagen und automatisierte Patientenkommunikation.",
          result:
            "Weniger manuelle Rückfragen, klarere Abläufe und schneller sichtbare Entlastung für das Praxisteam.",
        },
        {
          icon: Car,
          title: "Autohaus in Deutschland",
          problem:
            "Leads, Probefahrten, Angebote, Finanzierung und Nachfass-E-Mails liegen oft über mehrere Tools verteilt.",
          solution:
            "Lead-Triage, Angebotsbausteine, Follow-ups und Statusupdates werden strukturiert und automatisierbar gemacht.",
          result:
            "Schnellere Reaktion auf Anfragen und konsistentere Kommunikation bis zum Verkauf.",
        },
        {
          icon: SprayCan,
          title: "Textilreinigung",
          problem:
            "Aufträge, Reklamationen, Abholzeiten und Kundenkommunikation laufen stark manuell.",
          solution:
            "Digitale Auftragsübersicht, Standardantworten, Statuslogik und einfache Automatisierungen für Wiederholfälle.",
          result:
            "Mehr Überblick im Tagesgeschäft und weniger Zeitverlust durch wiederkehrende Fragen.",
        },
      ]
    : [
        {
          icon: Stethoscope,
          title: "General practice in Germany",
          problem:
            "Calls, prescription requests, documentation, and patient questions interrupt the team every day.",
          solution:
            "ASDAR prioritizes intake, appointment logic, templates, and automated patient communication.",
          result:
            "Fewer manual follow-ups, clearer workflows, and faster relief for the practice team.",
        },
        {
          icon: Car,
          title: "Car dealership in Germany",
          problem:
            "Leads, test drives, offers, financing, and follow-up emails are spread across tools.",
          solution:
            "Lead triage, offer modules, follow-ups, and status updates are structured for automation.",
          result:
            "Faster responses to inquiries and more consistent communication through the sales process.",
        },
        {
          icon: SprayCan,
          title: "Dry cleaner",
          problem:
            "Orders, complaints, pickup windows, and customer communication are handled manually.",
          solution:
            "Digital order overview, standard replies, status logic, and simple automations for repeat cases.",
          result:
            "More operational clarity and less time lost to recurring questions.",
        },
      ];

  return (
    <Section className="border-t border-hairline">
      <Container>
        <Reveal>
          <Kicker>{isDe ? "Beispiele" : "Examples"}</Kicker>
          <h2 className="mt-5 max-w-3xl font-serif text-3xl font-normal text-ink md:text-[40px]">
            {isDe
              ? "So wird KI-Beratung konkret."
              : "This is how AI consulting becomes concrete."}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink2">
            {isDe
              ? "Nicht jede Branche braucht dieselbe Lösung. Der Startpunkt ist immer ein echter Prozess, der heute Zeit, Qualität oder Umsatz kostet."
              : "Not every industry needs the same solution. The starting point is always a real process that costs time, quality, or revenue today."}
          </p>
        </Reveal>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {cases.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={index * 0.05}>
                <article className="h-full rounded-xl border border-hairline bg-surface p-6 shadow-card">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-copper/10 text-copper">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-medium text-ink">
                    {item.title}
                  </h3>
                  <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink2">
                    <p>
                      <span className="font-medium text-ink">
                        {isDe ? "Problem:" : "Problem:"}
                      </span>{" "}
                      {item.problem}
                    </p>
                    <p>
                      <span className="font-medium text-ink">
                        {isDe ? "Ansatz:" : "Approach:"}
                      </span>{" "}
                      {item.solution}
                    </p>
                    <p>
                      <span className="font-medium text-ink">
                        {isDe ? "Ergebnis:" : "Result:"}
                      </span>{" "}
                      {item.result}
                    </p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
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
