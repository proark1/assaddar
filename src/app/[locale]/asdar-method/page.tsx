import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Database,
  FileText,
  Gauge,
  Route,
  Search,
  Settings2,
  Sparkles,
  Timer,
  UsersRound,
  Workflow,
} from "lucide-react";
import { getDict, isLocale, locales, SITE_URL, type Locale } from "@/content";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { FinalCta } from "@/components/sections-server";

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
      ? "ASDAR Method — KI-Potenziale strukturiert finden | Assad Dar"
      : "ASDAR Method — find AI potential systematically | Assad Dar";

  return {
    title,
    description: t.method.sub,
    alternates: {
      canonical: `/${safe}/asdar-method`,
      languages: {
        de: "/de/asdar-method",
        en: "/en/asdar-method",
        "x-default": "/de/asdar-method",
      },
    },
    openGraph: {
      type: "website",
      title,
      description: t.method.sub,
      url: `/${safe}/asdar-method`,
    },
  };
}

export default async function AsdarMethodPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const t = getDict(safe);
  const isDe = safe === "de";

  const fitScenarios = isDe
    ? [
        {
          Icon: Timer,
          title: "Zu viel operative Reibung",
          text: "Teams verlieren Zeit durch manuelle Abstimmung, doppelte Eingaben, Medienbrüche oder unklare Zuständigkeiten.",
        },
        {
          Icon: Database,
          title: "Daten sind vorhanden, aber nicht nutzbar",
          text: "Informationen liegen in E-Mails, Tabellen, Fachsystemen oder PDFs, aber es fehlt eine klare Struktur für Automatisierung und KI.",
        },
        {
          Icon: UsersRound,
          title: "Kunden- oder Teamkommunikation skaliert nicht",
          text: "Anfragen, Statusupdates, Erinnerungen und Rückfragen binden zu viel Kapazität und passieren zu unregelmäßig.",
        },
        {
          Icon: Gauge,
          title: "KI soll starten, aber ohne Blindflug",
          text: "Es gibt viele Ideen, aber noch keine priorisierte Roadmap mit Aufwand, Risiko, Datenlage und messbarem Nutzen.",
        },
      ]
    : [
        {
          Icon: Timer,
          title: "Too much operational friction",
          text: "Teams lose time through manual coordination, duplicate entries, system gaps, or unclear responsibilities.",
        },
        {
          Icon: Database,
          title: "Data exists, but is not usable",
          text: "Information sits in emails, spreadsheets, business systems, or PDFs, but lacks structure for automation and AI.",
        },
        {
          Icon: UsersRound,
          title: "Client or team communication does not scale",
          text: "Requests, status updates, reminders, and follow-ups consume too much capacity and happen inconsistently.",
        },
        {
          Icon: Gauge,
          title: "AI should start without guesswork",
          text: "There are many ideas, but no prioritized roadmap based on effort, risk, data readiness, and measurable value.",
        },
      ];

  const intakeInputs = isDe
    ? [
        {
          Icon: ClipboardList,
          title: "Ist-Prozesse",
          text: "Welche Schritte laufen heute, wer ist beteiligt, welche Ausnahmen gibt es, und wo entstehen Wartezeiten?",
        },
        {
          Icon: FileText,
          title: "Dokumente und Vorlagen",
          text: "Angebote, Formulare, E-Mails, Checklisten, Rechnungen, Reports und wiederkehrende Textbausteine.",
        },
        {
          Icon: Settings2,
          title: "Systemlandschaft",
          text: "CRM, ERP, DATEV, Microsoft 365, Google Workspace, Fachsoftware, Shop, Kalender, Telefonie und Schnittstellen.",
        },
        {
          Icon: Gauge,
          title: "Ziele und Grenzen",
          text: "Zeitersparnis, Qualität, Geschwindigkeit, Umsatz, Compliance, Datenschutz, Budget und interne Akzeptanz.",
        },
      ]
    : [
        {
          Icon: ClipboardList,
          title: "Current processes",
          text: "Which steps run today, who is involved, what exceptions exist, and where do waiting times appear?",
        },
        {
          Icon: FileText,
          title: "Documents and templates",
          text: "Offers, forms, emails, checklists, invoices, reports, and recurring text modules.",
        },
        {
          Icon: Settings2,
          title: "System landscape",
          text: "CRM, ERP, accounting, Microsoft 365, Google Workspace, industry software, shop, calendar, telephony, and APIs.",
        },
        {
          Icon: Gauge,
          title: "Goals and constraints",
          text: "Time savings, quality, speed, revenue, compliance, data privacy, budget, and internal adoption.",
        },
      ];

  const phaseDetails = isDe
    ? [
        {
          work: [
            "Unternehmen, Angebot, Teamstruktur und wiederkehrende Arbeit sichtbar machen.",
            "Die wichtigsten Kundentypen, internen Rollen und Entscheidungspunkte erfassen.",
          ],
          questions: [
            "Womit verdient das Unternehmen Geld?",
            "Welche Arbeit wiederholt sich jede Woche?",
            "Wo entsteht Druck für Kunden oder Mitarbeiter?",
          ],
          deliverables: [
            "Unternehmensprofil",
            "Prozesslandkarte",
            "erste Engpass-Hypothesen",
          ],
        },
        {
          work: [
            "Prozesse, Dokumente, Datenquellen und Kommunikationskanäle systematisch scannen.",
            "Manuelle Arbeit, Wartezeit, Fehlerquellen und Automatisierungsmuster markieren.",
          ],
          questions: [
            "Wo werden Daten mehrfach eingegeben?",
            "Welche Informationen werden gesucht oder kopiert?",
            "Welche Aufgaben haengen an einzelnen Personen?",
          ],
          deliverables: [
            "Automatisierungsinventar",
            "Daten- und Tool-Übersicht",
            "Risiko- und Datenschutznotizen",
          ],
        },
        {
          work: [
            "Use Cases nach Nutzen, Aufwand, Datenreife, Risiko und Umsetzbarkeit bewerten.",
            "Quick Wins von komplexeren Architekturthemen trennen.",
          ],
          questions: [
            "Was bringt sofort messbaren Nutzen?",
            "Was blockiert spätere Automatisierung?",
            "Welche Lösung ist robust genug für den Alltag?",
          ],
          deliverables: [
            "priorisierte Use-Case-Liste",
            "ASDAR Score",
            "Startempfehlung",
          ],
        },
        {
          work: [
            "Zielbild, Umsetzungsschritte, Verantwortlichkeiten und technische Optionen ausarbeiten.",
            "Make-or-buy, Integrationen, Datenstruktur und Einführung realistisch planen.",
          ],
          questions: [
            "Welche Lösung muss gebaut, gekauft oder verbunden werden?",
            "Welche Daten müssen zuerst sauber sein?",
            "Wie wird der Prozess im Team eingeführt?",
          ],
          deliverables: [
            "Roadmap",
            "Lösungsdesign",
            "Pilotumfang mit nächsten Schritten",
          ],
        },
        {
          work: [
            "Ergebnisse in ein klares Beratungs- und Umsetzungsprogramm übersetzen.",
            "Messpunkte, Review-Rhythmus und Folgeautomatisierungen definieren.",
          ],
          questions: [
            "Wie messe ich Wirkung?",
            "Was wird nach dem Pilot standardisiert?",
            "Welche Entscheidungen braucht der Kunde jetzt?",
          ],
          deliverables: [
            "Management-Zusammenfassung",
            "Umsetzungsplan",
            "Entscheidungsvorlage",
          ],
        },
      ]
    : [
        {
          work: [
            "Make the business, offer, team structure, and recurring work visible.",
            "Capture the key client types, internal roles, and decision points.",
          ],
          questions: [
            "How does the company make money?",
            "Which work repeats every week?",
            "Where does pressure appear for clients or employees?",
          ],
          deliverables: [
            "company profile",
            "process map",
            "first bottleneck hypotheses",
          ],
        },
        {
          work: [
            "Systematically scan processes, documents, data sources, and communication channels.",
            "Mark manual work, waiting time, error sources, and automation patterns.",
          ],
          questions: [
            "Where is data entered more than once?",
            "Which information is searched for or copied?",
            "Which tasks depend on individual people?",
          ],
          deliverables: [
            "automation inventory",
            "data and tool overview",
            "risk and privacy notes",
          ],
        },
        {
          work: [
            "Score use cases by value, effort, data maturity, risk, and feasibility.",
            "Separate quick wins from more complex architecture topics.",
          ],
          questions: [
            "What creates measurable value immediately?",
            "What blocks later automation?",
            "Which solution is robust enough for daily work?",
          ],
          deliverables: [
            "prioritized use-case list",
            "ASDAR Score",
            "starting recommendation",
          ],
        },
        {
          work: [
            "Design the target state, implementation steps, ownership, and technical options.",
            "Plan make-or-buy, integrations, data structure, and adoption realistically.",
          ],
          questions: [
            "Which solution must be built, bought, or connected?",
            "Which data needs to be cleaned first?",
            "How will the process be adopted by the team?",
          ],
          deliverables: [
            "roadmap",
            "solution design",
            "pilot scope with next steps",
          ],
        },
        {
          work: [
            "Translate findings into a clear consulting and implementation program.",
            "Define metrics, review rhythm, and follow-up automations.",
          ],
          questions: [
            "How do I measure impact?",
            "What becomes standard after the pilot?",
            "Which decisions does the client need now?",
          ],
          deliverables: [
            "executive summary",
            "implementation plan",
            "decision memo",
          ],
        },
      ];

  const consultingFlow = isDe
    ? [
        {
          Icon: Search,
          title: "Vor dem Termin",
          text: "Der Kunde füllt einen kurzen Fragebogen aus. Vorhandene Dokumente, Tools und Ziele werden gesammelt, damit der Termin nicht bei null startet.",
        },
        {
          Icon: Workflow,
          title: "Im Termin",
          text: "Ich gehe mit Ihnen die ASDAR-Schritte geführt durch, markiere Engpässe live und halte offene Entscheidungen sofort fest.",
        },
        {
          Icon: Route,
          title: "Nach dem Termin",
          text: "Aus den Antworten entsteht eine strukturierte Beratungsgrundlage mit Quick Wins, Roadmap, Aufgaben und Kundenupdate.",
        },
      ]
    : [
        {
          Icon: Search,
          title: "Before the session",
          text: "The client completes a short questionnaire. Existing documents, tools, and goals are collected so the session does not start from zero.",
        },
        {
          Icon: Workflow,
          title: "During the session",
          text: "I guide you through the ASDAR steps, mark bottlenecks live, and capture open decisions immediately.",
        },
        {
          Icon: Route,
          title: "After the session",
          text: "The answers become a structured consulting basis with quick wins, roadmap, tasks, and a client update.",
        },
      ];

  const finalOutputs = isDe
    ? [
        "eine priorisierte KI- und Automatisierungs-Roadmap",
        "konkrete Prozessverbesserungen mit Aufwand und Nutzen",
        "Entscheidungsvorlagen für Tools, Integrationen und Datenstruktur",
        "Kundenupdates, Aufgaben und nächste Schritte für das Projektportal",
        "eine klare Grundlage für Pilot, Umsetzung oder laufende Beratung",
      ]
    : [
        "a prioritized AI and automation roadmap",
        "concrete process improvements with effort and value",
        "decision memos for tools, integrations, and data structure",
        "client updates, tasks, and next steps for the project portal",
        "a clear basis for a pilot, implementation, or ongoing consulting",
      ];

  const timeline = isDe
    ? [
        {
          label: "01",
          title: "Kickoff und Kontext",
          text: "Ziele, Rollen, Systeme, Risiken und Erwartungen festlegen.",
        },
        {
          label: "02",
          title: "Scan und Diagnose",
          text: "Prozesse, Daten, Dokumente und Kommunikation strukturiert analysieren.",
        },
        {
          label: "03",
          title: "Roadmap und Priorisierung",
          text: "Use Cases bewerten, Quick Wins wählen und Abhängigkeiten klären.",
        },
        {
          label: "04",
          title: "Pilot oder Umsetzung",
          text: "Lösung starten, Wirkung messen und nächste Automatisierung vorbereiten.",
        },
      ]
    : [
        {
          label: "01",
          title: "Kickoff and context",
          text: "Define goals, roles, systems, risks, and expectations.",
        },
        {
          label: "02",
          title: "Scan and diagnosis",
          text: "Analyze processes, data, documents, and communication in a structured way.",
        },
        {
          label: "03",
          title: "Roadmap and prioritization",
          text: "Score use cases, choose quick wins, and clarify dependencies.",
        },
        {
          label: "04",
          title: "Pilot or implementation",
          text: "Start the solution, measure impact, and prepare the next automation.",
        },
      ];

  const methodLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "ASDAR Method",
    description: t.method.sub,
    url: `${SITE_URL}/${safe}/asdar-method`,
    step: t.method.phases.map((phase, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: phase.title,
      text: `${phase.meaning} ${phaseDetails[index]?.deliverables.join(", ")}`,
    })),
  };

  return (
    <>
      <JsonLd data={methodLd} />
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
            <span className="text-ink2">{t.method.kicker}</span>
          </nav>

          <header className="mt-6 max-w-3xl">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-copper">
              {t.method.kicker} {t.method.by}
            </span>
            <h1 className="mt-5 font-serif text-3xl font-normal leading-[1.15] text-ink md:text-[46px]">
              {t.method.heading}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink2">
              {t.method.sub}
            </p>
          </header>

          <section className="mt-12 grid gap-5 md:grid-cols-3">
            {t.method.copy.map((copy, index) => (
              <div
                key={copy}
                className={`rounded-xl border p-6 shadow-card ${
                  index === 2
                    ? "border-copper bg-surface2"
                    : "border-hairline bg-surface"
                }`}
              >
                <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-copper">
                  {isDe ? `Prinzip ${index + 1}` : `Principle ${index + 1}`}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink2">{copy}</p>
              </div>
            ))}
          </section>

          <section className="mt-16">
            <div className="max-w-3xl">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-copper">
                {isDe ? "Einsatzbereich" : "Best fit"}
              </span>
              <h2 className="mt-3 font-serif text-2xl font-normal text-ink md:text-3xl">
                {isDe
                  ? "Wann die ASDAR Method passt"
                  : "When the ASDAR Method fits"}
              </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink2">
                  {isDe
                  ? "Die Methode ist für Unternehmen gedacht, die KI nicht als Experiment, sondern als echten Hebel für Prozesse, Service und Wachstum nutzen wollen."
                  : "The method is for companies that want to use AI as a real lever for process quality, service, and growth instead of treating it as an experiment."}
              </p>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {fitScenarios.map((item) => {
                const Icon = item.Icon;

                return (
                  <article
                    key={item.title}
                    className="rounded-xl border border-hairline bg-surface p-6 shadow-card"
                  >
                    <div className="flex items-start gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-copper/10 text-copper">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="text-base font-medium text-ink">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-ink2">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="mt-16 rounded-2xl border border-copper/30 bg-surface2 p-6 shadow-card md:p-8">
            <div className="grid gap-8 md:grid-cols-[0.9fr_1.4fr] md:items-start">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-copper">
                  {isDe ? "Input" : "Input"}
                </span>
                <h2 className="mt-3 font-serif text-2xl font-normal text-ink md:text-3xl">
                  {isDe
                    ? "Was ich dafür aufnehme"
                    : "What I collect first"}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-ink2">
                  {isDe
                    ? "ASDAR startet nicht mit einem Tool, sondern mit den realen Arbeitsabläufen. Dadurch wird klar, wo Automatisierung sinnvoll ist und wo vorher Struktur geschaffen werden muss."
                    : "ASDAR does not start with a tool. It starts with real workflows, making it clear where automation makes sense and where structure must come first."}
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {intakeInputs.map((item) => {
                  const Icon = item.Icon;

                  return (
                    <div key={item.title} className="border-t border-hairline pt-5">
                      <Icon className="h-5 w-5 text-copper" aria-hidden="true" />
                      <h3 className="mt-3 text-sm font-medium text-ink">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink2">
                        {item.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="mt-16">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="font-serif text-2xl font-normal text-ink md:text-3xl">
                  {isDe
                    ? "Die fünf Schritte der Methode"
                    : "The five method steps"}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink2">
                  {t.method.tagline}
                </p>
              </div>
              <Link
                href={`/${safe}/angebote`}
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-copper"
              >
                {isDe ? "Passendes Angebot ansehen" : "View matching service"}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="mt-8 grid gap-5">
              {t.method.phases.map((phase, index) => (
                <article
                  key={`${phase.letter}-${phase.title}`}
                  className="rounded-xl border border-hairline bg-surface p-6 shadow-card"
                >
                  <div className="grid gap-5 md:grid-cols-[96px_1fr_220px] md:items-start">
                    <div className="flex items-center gap-4 md:block">
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-copper/10 font-serif text-3xl text-copper">
                        {phase.letter}
                      </div>
                      <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted md:mt-3">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-ink">
                        {phase.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink2">
                        {phase.meaning}
                      </p>
                    </div>
                    <div className="border-t border-hairline pt-4 text-sm text-ink2 md:border-l md:border-t-0 md:pl-5 md:pt-0">
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-copper">
                        {isDe ? "Ergebnis" : "Result"}
                      </span>
                      <div className="mt-1">{phase.result}</div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-6 border-t border-hairline pt-6 md:grid-cols-3">
                    <div>
                      <h4 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-copper">
                        {isDe ? "Arbeit" : "Work"}
                      </h4>
                      <ul className="mt-3 space-y-2">
                        {phaseDetails[index].work.map((item) => (
                          <li
                            key={item}
                            className="flex gap-2 text-sm leading-relaxed text-ink2"
                          >
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-copper" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-copper">
                        {isDe ? "Leitfragen" : "Guiding questions"}
                      </h4>
                      <ul className="mt-3 space-y-2">
                        {phaseDetails[index].questions.map((item) => (
                          <li
                            key={item}
                            className="flex gap-2 text-sm leading-relaxed text-ink2"
                          >
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-copper" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-copper">
                        {isDe ? "Output" : "Output"}
                      </h4>
                      <ul className="mt-3 space-y-2">
                        {phaseDetails[index].deliverables.map((item) => (
                          <li
                            key={item}
                            className="flex gap-2 text-sm leading-relaxed text-ink2"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-16 grid gap-5 md:grid-cols-2">
            <div className="rounded-xl border border-hairline bg-surface p-6 shadow-card">
              <h2 className="font-serif text-2xl font-normal text-ink">
                {t.score.heading}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-ink2">
                {t.score.intro}
              </p>
              <Link
                href={`/${safe}#readiness-check`}
                className="group mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-copper"
              >
                {isDe
                  ? "ASDAR Potenzial-Check auf Home nutzen"
                  : "Use the ASDAR potential check on Home"}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="rounded-xl border border-copper/30 bg-surface2 p-6 shadow-card">
              <h2 className="font-serif text-2xl font-normal text-ink">
                {isDe ? "Was am Ende klar ist" : "What is clear at the end"}
              </h2>
              <ul className="mt-5 space-y-2">
                {(isDe
                  ? [
                      "Welche Prozesse wirklich Zeit, Qualität oder Umsatz kosten.",
                      "Welche Daten und Systeme zuerst strukturiert werden müssen.",
                      "Welche KI- und Automatisierungsfälle realistisch starten sollten.",
                    ]
                  : [
                      "Which processes really cost time, quality, or revenue.",
                      "Which data and systems need structure first.",
                      "Which AI and automation use cases should realistically start.",
                    ]
                ).map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-sm leading-relaxed text-ink2"
                  >
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-copper" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mt-16">
            <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-start">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-copper">
                  {isDe ? "Beratungsalltag" : "Consulting workflow"}
                </span>
                <h2 className="mt-3 font-serif text-2xl font-normal text-ink md:text-3xl">
                  {isDe
                    ? "Wie die Methode im Projekt genutzt wird"
                    : "How the method is used in a project"}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-ink2">
                  {isDe
                    ? "Die Methode dient nicht nur als Analyse. Sie strukturiert Vorbereitung, Kundentermin, Nachbereitung und die laufenden Updates im Projektportal."
                    : "The method is more than analysis. It structures preparation, client sessions, follow-up work, and ongoing updates in the project portal."}
                </p>
              </div>

              <div className="grid gap-5">
                {consultingFlow.map((item) => {
                  const Icon = item.Icon;

                  return (
                    <article
                      key={item.title}
                      className="flex gap-4 rounded-xl border border-hairline bg-surface p-6 shadow-card"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-copper/10 text-copper">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="text-base font-medium text-ink">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-ink2">
                          {item.text}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="mt-16 rounded-2xl border border-hairline bg-surface p-6 shadow-card md:p-8">
            <div className="grid gap-8 md:grid-cols-[0.9fr_1.2fr]">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-copper">
                  {isDe ? "Ergebnisse" : "Outputs"}
                </span>
                <h2 className="mt-3 font-serif text-2xl font-normal text-ink md:text-3xl">
                  {isDe ? "Konkrete Ergebnisse" : "Concrete outputs"}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-ink2">
                  {isDe
                    ? "Am Ende soll nicht nur klar sein, was theoretisch möglich ist. Der Kunde soll wissen, was als Nächstes entschieden, gebaut oder verbessert wird."
                    : "At the end, the client should not only know what is theoretically possible. They should know what needs to be decided, built, or improved next."}
                </p>
              </div>

              <ul className="grid gap-3">
                {finalOutputs.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 border-t border-hairline pt-3 text-sm leading-relaxed text-ink2"
                  >
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mt-16">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-copper">
                  {isDe ? "Ablauf" : "Flow"}
                </span>
                <h2 className="mt-3 font-serif text-2xl font-normal text-ink md:text-3xl">
                  {isDe ? "Typischer Ablauf" : "Typical flow"}
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-relaxed text-ink2">
                {isDe
                  ? "Je nach Projekt kann der Ablauf kompakt in wenigen Tagen oder als intensivere Beratung über mehrere Wochen laufen."
                  : "Depending on the project, the flow can run as a compact few-day diagnostic or as a deeper consulting engagement across several weeks."}
              </p>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-4">
              {timeline.map((item) => (
                <article
                  key={item.label}
                  className="rounded-xl border border-hairline bg-surface p-6 shadow-card"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-copper/10 font-mono text-[11px] text-copper">
                    {item.label}
                  </div>
                  <h3 className="mt-4 text-base font-medium text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink2">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <FinalCta t={t.finalCta} />
      </main>

      <Footer t={t.footer} locale={safe} />
    </>
  );
}
