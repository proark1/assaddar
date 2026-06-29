"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Calculator,
  Gauge,
  Sparkles,
  Target,
} from "lucide-react";
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
  valueLabel?: string;
  ariaValueText?: string;
  minLabel?: string;
  maxLabel?: string;
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
  valueLabel,
  ariaValueText,
  minLabel,
  maxLabel,
  onChange,
}: SliderRowProps) {
  return (
    <div className="rounded-lg border border-hairline bg-bg p-4">
      <div className="mb-2.5 flex items-start justify-between gap-4">
        <div>
          <label htmlFor={id} className="text-sm font-medium text-ink">
            {label}
          </label>
          <p className="mt-1 text-[12px] leading-snug text-muted">
            {description}
          </p>
        </div>
        <span className="shrink-0 rounded-md bg-copper/10 px-2.5 py-1 font-mono text-[12px] text-copper">
          {valueLabel ?? `${value}${suffix}`}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={ariaValueText}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      {(minLabel || maxLabel) && (
        <div className="mt-1.5 flex justify-between font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}

const content = {
  de: {
    kicker: "ASDAR Potenzial-Check",
    heading: "Finden Sie in 2 Minuten den ersten sinnvollen Automatisierungshebel.",
    intro:
      "Ein Check statt drei Tools: Reifegrad, Engpass, grober Zeitwert und der nächste Beratungsschritt auf einen Blick.",
    scale: ["Gar nicht", "Kaum", "Teilweise", "Überwiegend", "Voll"],
    sliders: [
      {
        label: "Prozessklarheit",
        description: "Die wichtigsten Abläufe sind bekannt und wiederholbar.",
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
        label: "Umsetzungskapazität",
        description: "Es gibt Zeit und eine verantwortliche Person für einen Pilot.",
      },
      {
        label: "Umsetzungswille",
        description: "Entscheider sind bereit, einen pragmatischen Pilot zu testen.",
      },
    ],
    bands: [
      {
        max: 44,
        label: "Erst Klarheit schaffen",
        phase: "Analysieren + Strukturieren",
        body: "Der größte Hebel liegt wahrscheinlich darin, Abläufe, Daten und Verantwortlichkeiten sauber sichtbar zu machen.",
        nextStep: "90 Minuten Prozessaufnahme und ASDAR Baseline.",
      },
      {
        max: 71,
        label: "Pilot vorbereiten",
        phase: "Strukturieren + Digitalisieren",
        body: "Es gibt genug Substanz für Quick Wins. Jetzt braucht es Priorisierung, Datenbasis und einen kleinen Testfall.",
        nextStep: "Use-Case-Auswahl, Aufwand/Nutzen-Matrix und Pilotplan.",
      },
      {
        max: 100,
        label: "Automatisierung starten",
        phase: "Automatisieren + Realisieren",
        body: "Die Grundlage wirkt belastbar. Jetzt lohnt sich ein konkreter Workflow-Pilot mit klaren Messpunkten.",
        nextStep: "Automatisierungs-Sprint mit Zielmetriken und Portal-Status.",
      },
    ],
    inputsTitle: "1. Lage einschätzen",
    sliderHint: "Bewerten Sie jeden Bereich von 1 (gar nicht) bis 5 (voll) — nach Bauchgefühl.",
    valueTitle: "2. Zeitwert grob rechnen",
    valueHint: "Grobe Schätzung aus typischen Werten — an Ihr Team anpassbar.",
    resultTitle: "Live-Ergebnis",
    bottleneck: "Größter Engpass",
    nextStep: "Nächster Schritt",
    people: "Beteiligte Personen",
    hours: "Manuelle Stunden pro Person/Woche",
    rate: "Interner Stundensatz",
    automation: "Realistisch reduzierbarer Anteil",
    monthlyHours: "Stunden pro Monat frei",
    monthlyValue: "Wert pro Monat",
    annualValue: "Wert pro Jahr",
    cta: "ASDAR Analyse anfragen",
    disclaimer:
      "Beispielrechnung, keine Garantie. Die echte Bewertung passiert mit echten Prozessdaten im Projekt.",
  },
  en: {
    kicker: "ASDAR potential check",
    heading: "Find the first useful automation lever in 2 minutes.",
    intro:
      "One check instead of three tools: readiness, bottleneck, rough time value, and the next consulting step in one view.",
    scale: ["Not yet", "Barely", "Partly", "Mostly", "Fully"],
    sliders: [
      {
        label: "Process clarity",
        description: "The key workflows are known and repeatable.",
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
        label: "Capacity to pilot",
        description: "There is time and an owner to run a small pilot, not just firefighting.",
      },
      {
        label: "Willingness to execute",
        description: "Decision makers are ready to test a pragmatic pilot.",
      },
    ],
    bands: [
      {
        max: 44,
        label: "Create clarity first",
        phase: "Analyze + Structure",
        body: "The biggest lever is likely to make workflows, data, and responsibilities clearly visible first.",
        nextStep: "90-minute process intake and ASDAR baseline.",
      },
      {
        max: 71,
        label: "Prepare a pilot",
        phase: "Structure + Digitize",
        body: "There is enough substance for quick wins. Now it needs prioritization, data foundations, and a small test case.",
        nextStep: "Use-case selection, effort/value matrix, and pilot plan.",
      },
      {
        max: 100,
        label: "Start automation",
        phase: "Automate + Realize",
        body: "The foundation looks solid. A concrete workflow pilot with clear measurements is likely worth it.",
        nextStep: "Automation sprint with target metrics and portal status.",
      },
    ],
    inputsTitle: "1. Estimate your current state",
    sliderHint: "Rate each area from 1 (not yet) to 5 (fully) — by intuition.",
    valueTitle: "2. Estimate time value",
    valueHint: "A rough estimate from typical inputs — adjust to your team.",
    resultTitle: "Live result",
    bottleneck: "Biggest bottleneck",
    nextStep: "Next step",
    people: "People involved",
    hours: "Manual hours per person/week",
    rate: "Internal hourly rate",
    automation: "Realistically reducible share",
    monthlyHours: "Hours freed per month",
    monthlyValue: "Value per month",
    annualValue: "Value per year",
    cta: "Request an ASDAR analysis",
    disclaimer:
      "Example calculation, not a guarantee. The real assessment happens with real process data in the project.",
  },
} as const;

export function ReadinessAndRoiTools({ locale }: { locale: Locale }) {
  const t = content[locale];
  const [readiness, setReadiness] = useState([3, 3, 3, 3, 3]);
  const [people, setPeople] = useState(8);
  const [manualHours, setManualHours] = useState(4);
  const [hourlyRate, setHourlyRate] = useState(45);
  const [automationRate, setAutomationRate] = useState(25);

  // Each dimension is rated 1–5; normalise to a 0–100 readiness score so the
  // result still reads as "/100" (the booking funnel displays it that way).
  const readinessScore = Math.round(
    readiness.reduce((sum, value) => sum + ((value - 1) / 4) * 20, 0),
  );
  const readinessBand =
    t.bands.find((band) => readinessScore <= band.max) ?? t.bands[t.bands.length - 1];
  // All five dimensions now point the same way (higher = more ready), so the
  // lowest one is genuinely the weakest link.
  const bottleneckIndex = readiness.reduce(
    (lowestIndex, value, index) =>
      value < readiness[lowestIndex] ? index : lowestIndex,
    0,
  );

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
  const ctaHref = `/${locale}/termin?source=asdar-check&score=${readinessScore}&band=${encodeURIComponent(
    readinessBand.label,
  )}&bottleneck=${encodeURIComponent(
    t.sliders[bottleneckIndex].label,
  )}&monthlyHours=${monthlySavedHours}&monthlyValue=${monthlyValue}&annualValue=${annualValue}`;

  const roiOutputs = [
    { label: t.monthlyHours, value: numberFormatter.format(monthlySavedHours) },
    { label: t.monthlyValue, value: currencyFormatter.format(monthlyValue) },
    { label: t.annualValue, value: currencyFormatter.format(annualValue) },
  ];

  return (
    <Section id="readiness-check" className="border-t border-hairline bg-surface2">
      <Container>
        <div className="max-w-2xl">
          <Kicker>{t.kicker}</Kicker>
          <h2 className="mt-5 font-serif text-3xl font-normal leading-tight text-ink md:text-[40px]">
            {t.heading}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink2">{t.intro}</p>
        </div>

        {/* Live score pinned under the header on mobile so it stays visible
            while the sliders below it are being adjusted. */}
        <div className="sticky top-16 z-30 mt-8 lg:hidden">
          <div className="flex items-center gap-4 rounded-lg border border-copper/40 bg-surface px-4 py-3 shadow-card">
            <div className="flex shrink-0 items-baseline gap-1.5">
              <span className="font-serif text-3xl leading-none text-copper">
                {readinessScore}
              </span>
              <span className="text-[11px] text-muted">/ 100</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="h-1.5 overflow-hidden rounded-full bg-bg">
                <div
                  className="h-full rounded-full bg-copper transition-all duration-300"
                  style={{ width: `${readinessScore}%` }}
                />
              </div>
              <div className="mt-1.5 truncate text-right text-[12px] font-medium text-ink">
                {readinessBand.label}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start">
          {/* Inputs */}
          <div className="space-y-5">
            <div className="rounded-xl border border-hairline bg-surface p-5 shadow-card md:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-copper/10 text-copper">
                  <Gauge className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-ink">{t.inputsTitle}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {t.sliderHint}
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {t.sliders.map((slider, index) => (
                  <SliderRow
                    key={slider.label}
                    id={`asdar-potential-${index}`}
                    label={slider.label}
                    description={slider.description}
                    min={1}
                    max={5}
                    value={readiness[index]}
                    valueLabel={t.scale[readiness[index] - 1]}
                    ariaValueText={`${t.scale[readiness[index] - 1]} (${readiness[index]}/5)`}
                    minLabel={t.scale[0]}
                    maxLabel={t.scale[4]}
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
            </div>

            <div className="rounded-xl border border-hairline bg-surface p-5 shadow-card md:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-copper/10 text-copper">
                  <Calculator className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-ink">{t.valueTitle}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {t.valueHint}
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <SliderRow
                  id="roi-people"
                  label={t.people}
                  description="1–40"
                  min={1}
                  max={40}
                  value={people}
                  onChange={setPeople}
                />
                <SliderRow
                  id="roi-hours"
                  label={t.hours}
                  description="1–20"
                  min={1}
                  max={20}
                  value={manualHours}
                  suffix=" h"
                  onChange={setManualHours}
                />
                <SliderRow
                  id="roi-rate"
                  label={t.rate}
                  description="20–150 €"
                  min={20}
                  max={150}
                  step={5}
                  value={hourlyRate}
                  suffix=" €"
                  onChange={setHourlyRate}
                />
                <SliderRow
                  id="roi-automation"
                  label={t.automation}
                  description="5–60 %"
                  min={5}
                  max={60}
                  step={5}
                  value={automationRate}
                  suffix=" %"
                  onChange={setAutomationRate}
                />
              </div>
            </div>
          </div>

          {/* Result — sticky beside the inputs on desktop, after them on mobile */}
          <div className="lg:sticky lg:top-20">
            <div className="space-y-4 rounded-xl border border-copper/30 bg-surface p-5 shadow-card md:p-6">
              <div
                aria-live="polite"
                className="rounded-lg border border-copper/30 bg-copper/10 p-5"
              >
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-copper" />
                  <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-copper">
                    {t.resultTitle}
                  </div>
                </div>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div>
                    <div className="font-serif text-5xl leading-none text-copper">
                      {readinessScore}
                    </div>
                    <div className="mt-1 text-[12px] text-muted">/ 100</div>
                  </div>
                  <div className="w-full max-w-[190px]">
                    <div className="h-2 overflow-hidden rounded-full bg-bg">
                      <div
                        className="h-full rounded-full bg-copper transition-all duration-300"
                        style={{ width: `${readinessScore}%` }}
                      />
                    </div>
                  </div>
                </div>
                <h3 className="mt-5 text-base font-medium text-ink">
                  {readinessBand.label}
                </h3>
                <p className="mt-1 text-[12px] text-copper">{readinessBand.phase}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink2">
                  {readinessBand.body}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-hairline bg-bg p-4">
                  <div className="flex items-center gap-2 text-[12px] text-muted">
                    <BarChart3 className="h-4 w-4 text-copper" />
                    {t.bottleneck}
                  </div>
                  <p className="mt-2 text-sm font-medium text-ink">
                    {t.sliders[bottleneckIndex].label}
                  </p>
                </div>
                <div className="rounded-lg border border-hairline bg-bg p-4">
                  <div className="flex items-center gap-2 text-[12px] text-muted">
                    <Sparkles className="h-4 w-4 text-copper" />
                    {t.nextStep}
                  </div>
                  <p className="mt-2 text-sm font-medium text-ink">
                    {readinessBand.nextStep}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {roiOutputs.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-hairline bg-bg p-4"
                  >
                    <div className="text-[12px] text-muted">{item.label}</div>
                    <div className="mt-2 font-serif text-2xl text-copper">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              <a
                href={ctaHref}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-copper px-5 py-3 text-sm font-medium text-oncopper shadow-[0_2px_8px_rgba(166,110,47,0.25)] transition-all hover:-translate-y-0.5 hover:bg-copper-hi"
              >
                {t.cta}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <p className="mt-6 flex items-start gap-2 text-[12px] leading-relaxed text-muted">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-copper" />
          <span>{t.disclaimer}</span>
        </p>
      </Container>
    </Section>
  );
}
