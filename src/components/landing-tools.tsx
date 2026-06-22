"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Calculator, Gauge, Sparkles } from "lucide-react";
import type { Locale } from "@/content";
import { Container, Kicker, Section } from "./ui";

type SliderRowProps = {
  id: string;
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
};

function SliderRow({
  id,
  label,
  description,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
}: SliderRowProps) {
  return (
    <div className="rounded-lg border border-hairline bg-bg p-4">
      <div className="mb-2 flex items-start justify-between gap-4">
        <div>
          <label htmlFor={id} className="text-sm font-medium text-ink">
            {label}
          </label>
          <p className="mt-1 text-[12px] leading-snug text-muted">
            {description}
          </p>
        </div>
        <span className="shrink-0 rounded-md bg-copper/10 px-2.5 py-1 font-mono text-[12px] text-copper">
          {value}
          {suffix}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

const content = {
  de: {
    kicker: "Schnelltest & Beispielrechnung",
    heading: "In 2 Minuten sehen, ob sich eine ASDAR Analyse lohnt.",
    intro:
      "Der Check macht das Problem greifbar: Wo steht Ihr Unternehmen heute, welche Phase passt als nächstes und was könnte konservativ an Zeit zurückkommen?",
    readinessTitle: "KI-Readiness Check",
    readinessIntro:
      "Schieben Sie die Regler nach Bauchgefühl. Das Ergebnis ist keine Diagnose, sondern ein guter Startpunkt für das Erstgespräch.",
    sliders: [
      {
        label: "Wiederholbare Prozesse",
        description: "Es gibt Aufgaben, die jede Woche ähnlich ablaufen.",
      },
      {
        label: "Daten & Dokumente",
        description: "Informationen sind auffindbar und nicht nur in E-Mails verteilt.",
      },
      {
        label: "Tool-Klarheit",
        description: "Die wichtigsten Systeme sind bekannt und sinnvoll nutzbar.",
      },
      {
        label: "Zeitdruck im Team",
        description: "Manuelle Arbeit blockiert sichtbar Kapazität.",
      },
      {
        label: "Umsetzungswille",
        description: "Entscheider sind bereit, einen pragmatischen Pilot zu testen.",
      },
    ],
    bands: [
      {
        label: "Erst Klarheit schaffen",
        phase: "Start mit Analysieren + Strukturieren",
        body: "Der größte Hebel liegt wahrscheinlich darin, Abläufe, Daten und Verantwortlichkeiten sauber sichtbar zu machen.",
      },
      {
        label: "Pilot vorbereiten",
        phase: "Start mit Strukturieren + Digitalisieren",
        body: "Es gibt genug Substanz für Quick Wins. Jetzt braucht es Priorisierung, Datenbasis und einen kleinen Testfall.",
      },
      {
        label: "Automatisierung starten",
        phase: "Start mit Automatisieren + Realisieren",
        body: "Die Grundlage wirkt belastbar. Jetzt lohnt sich ein konkreter Workflow-Pilot mit klaren Messpunkten.",
      },
    ],
    scoreLabel: "Readiness",
    cta: "Ergebnis besprechen",
    roiTitle: "ROI-Beispielrechner",
    roiIntro:
      "Eine konservative Beispielrechnung für wiederkehrende manuelle Arbeit. Die echte Bewertung passiert im Projekt mit echten Prozessdaten.",
    people: "Beteiligte Personen",
    hours: "Manuelle Stunden pro Person/Woche",
    rate: "Interner Stundensatz",
    automation: "Realistisch reduzierbarer Anteil",
    monthlyHours: "Stunden pro Monat frei",
    monthlyValue: "Wert pro Monat",
    annualValue: "Wert pro Jahr",
    disclaimer:
      "Beispielrechnung, keine Garantie. Sie hilft nur, ein Gespür für die Größenordnung zu bekommen.",
  },
  en: {
    kicker: "Quick check & example calculation",
    heading: "See in 2 minutes whether an ASDAR analysis is worth it.",
    intro:
      "The check makes the problem tangible: where does your company stand today, which phase fits next, and what time could conservatively come back?",
    readinessTitle: "AI Readiness Check",
    readinessIntro:
      "Move the sliders by intuition. The result is not a diagnosis, but a useful starting point for the first call.",
    sliders: [
      {
        label: "Repeatable processes",
        description: "There are tasks that run in a similar way every week.",
      },
      {
        label: "Data & documents",
        description: "Information is findable and not only scattered across emails.",
      },
      {
        label: "Tool clarity",
        description: "The key systems are known and usable.",
      },
      {
        label: "Capacity pressure",
        description: "Manual work visibly blocks the team.",
      },
      {
        label: "Willingness to execute",
        description: "Decision makers are ready to test a pragmatic pilot.",
      },
    ],
    bands: [
      {
        label: "Create clarity first",
        phase: "Start with Analyze + Structure",
        body: "The biggest lever is likely to make workflows, data, and responsibilities clearly visible first.",
      },
      {
        label: "Prepare a pilot",
        phase: "Start with Structure + Digitize",
        body: "There is enough substance for quick wins. Now it needs prioritization, data foundations, and a small test case.",
      },
      {
        label: "Start automation",
        phase: "Start with Automate + Realize",
        body: "The foundation looks solid. A concrete workflow pilot with clear measurements is likely worth it.",
      },
    ],
    scoreLabel: "Readiness",
    cta: "Discuss the result",
    roiTitle: "ROI example calculator",
    roiIntro:
      "A conservative example calculation for recurring manual work. The real assessment happens in the project with real process data.",
    people: "People involved",
    hours: "Manual hours per person/week",
    rate: "Internal hourly rate",
    automation: "Realistically reducible share",
    monthlyHours: "Hours freed per month",
    monthlyValue: "Value per month",
    annualValue: "Value per year",
    disclaimer:
      "Example calculation, not a guarantee. It only helps estimate the order of magnitude.",
  },
} as const;

export function ReadinessAndRoiTools({ locale }: { locale: Locale }) {
  const t = content[locale];
  const [readiness, setReadiness] = useState([13, 10, 9, 15, 12]);
  const [people, setPeople] = useState(8);
  const [manualHours, setManualHours] = useState(4);
  const [hourlyRate, setHourlyRate] = useState(45);
  const [automationRate, setAutomationRate] = useState(25);

  const readinessScore = readiness.reduce((sum, value) => sum + value, 0);
  const readinessBand =
    readinessScore < 45 ? t.bands[0] : readinessScore < 72 ? t.bands[1] : t.bands[2];

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-US"),
    [locale],
  );
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-US", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }),
    [locale],
  );

  const monthlySavedHours = Math.round(
    people * manualHours * 4.33 * (automationRate / 100),
  );
  const monthlyValue = Math.round(monthlySavedHours * hourlyRate);
  const annualValue = monthlyValue * 12;

  return (
    <Section id="readiness-check" className="border-t border-hairline">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.35fr] lg:items-start">
          <div>
            <Kicker>{t.kicker}</Kicker>
            <h2 className="mt-5 max-w-xl font-serif text-3xl font-normal leading-tight text-ink md:text-[40px]">
              {t.heading}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-ink2">
              {t.intro}
            </p>
            <a
              href={`/${locale}/termin`}
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-copper px-5 py-3 text-sm font-medium text-oncopper shadow-[0_2px_8px_rgba(166,110,47,0.25)] transition-all hover:-translate-y-0.5 hover:bg-copper-hi"
            >
              {t.cta}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <article className="rounded-xl border border-hairline bg-surface p-5 shadow-card md:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-copper/10 text-copper">
                  <Gauge className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-ink">
                    {t.readinessTitle}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {t.readinessIntro}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {t.sliders.map((slider, index) => (
                  <SliderRow
                    key={slider.label}
                    id={`readiness-${index}`}
                    label={slider.label}
                    description={slider.description}
                    min={0}
                    max={20}
                    value={readiness[index]}
                    onChange={(value) =>
                      setReadiness((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? value : item,
                        ),
                      )
                    }
                  />
                ))}
              </div>

              <div
                aria-live="polite"
                className="mt-5 rounded-lg border border-copper/30 bg-copper/10 p-4"
              >
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-copper">
                      {t.scoreLabel}
                    </div>
                    <div className="mt-1 font-serif text-4xl text-copper">
                      {readinessScore}
                    </div>
                  </div>
                  <div className="w-full max-w-[180px]">
                    <div className="h-2 overflow-hidden rounded-full bg-bg">
                      <div
                        className="h-full rounded-full bg-copper transition-all duration-300"
                        style={{ width: `${readinessScore}%` }}
                      />
                    </div>
                    <div className="mt-2 text-right text-[12px] text-muted">
                      / 100
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm font-medium text-ink">
                  {readinessBand.label}
                </p>
                <p className="mt-1 text-[12px] text-copper">
                  {readinessBand.phase}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink2">
                  {readinessBand.body}
                </p>
              </div>
            </article>

            <article className="rounded-xl border border-hairline bg-surface p-5 shadow-card md:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-copper/10 text-copper">
                  <Calculator className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-ink">{t.roiTitle}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {t.roiIntro}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <SliderRow
                  id="roi-people"
                  label={t.people}
                  description="1-40"
                  min={1}
                  max={40}
                  value={people}
                  onChange={setPeople}
                />
                <SliderRow
                  id="roi-hours"
                  label={t.hours}
                  description="1-20"
                  min={1}
                  max={20}
                  value={manualHours}
                  suffix="h"
                  onChange={setManualHours}
                />
                <SliderRow
                  id="roi-rate"
                  label={t.rate}
                  description="20-150 EUR"
                  min={20}
                  max={150}
                  step={5}
                  value={hourlyRate}
                  suffix=" EUR"
                  onChange={setHourlyRate}
                />
                <SliderRow
                  id="roi-automation"
                  label={t.automation}
                  description="5-60%"
                  min={5}
                  max={60}
                  step={5}
                  value={automationRate}
                  suffix="%"
                  onChange={setAutomationRate}
                />
              </div>

              <div className="mt-5 grid gap-3">
                {[
                  {
                    label: t.monthlyHours,
                    value: numberFormatter.format(monthlySavedHours),
                  },
                  {
                    label: t.monthlyValue,
                    value: currencyFormatter.format(monthlyValue),
                  },
                  {
                    label: t.annualValue,
                    value: currencyFormatter.format(annualValue),
                  },
                ].map((item, index) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-hairline bg-bg p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-muted">{item.label}</span>
                      <span className="font-serif text-2xl text-copper">
                        {item.value}
                      </span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-hairline">
                      <div
                        className="h-full rounded-full bg-copper"
                        style={{ width: `${Math.max(28, 100 - index * 18)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 flex gap-2 text-[12px] leading-relaxed text-muted">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-copper" />
                <span>{t.disclaimer}</span>
              </p>
            </article>
          </div>
        </div>
      </Container>
    </Section>
  );
}
