"use client";

import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Calculator,
  CheckCircle2,
  Gauge,
  Info,
  ListChecks,
  Sparkles,
  Target,
  Workflow,
} from "lucide-react";
import type { Locale } from "@/content";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { landingToolsContent } from "@/lib/landing-tools-content";
import { Container, Kicker, Section } from "./ui";

type RatingValue = 1 | 2 | 3 | 4 | 5;
type Step = 0 | 1 | 2;

type RatingArea = {
  label: string;
  description: string;
  lever: string;
  actions: readonly [string, string, string];
};

type IndustryPreset = {
  key: string;
  label: string;
  hint: string;
  focus: string;
  people: number;
  manualHours: number;
  hourlyRate: number;
  automationRate: number;
};

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

type RatingRowProps = {
  id: string;
  area: RatingArea;
  value: RatingValue | null;
  scale: readonly string[];
  unanswered: string;
  feedback?: string;
  onChange: (value: RatingValue) => void;
};

function RatingRow({
  id,
  area,
  value,
  scale,
  unanswered,
  feedback,
  onChange,
}: RatingRowProps) {
  return (
    <div className="rounded-lg border border-hairline bg-bg p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-sm font-medium text-ink">{area.label}</h4>
          <p className="mt-1 text-[12px] leading-snug text-muted">
            {area.description}
          </p>
        </div>
        <span className="shrink-0 rounded-md bg-copper/10 px-2.5 py-1 font-mono text-[12px] text-copper">
          {value ? scale[value - 1] : unanswered}
        </span>
      </div>

      <div
        className="mt-4 grid gap-1.5 sm:grid-cols-5"
        role="radiogroup"
        aria-label={area.label}
      >
        {scale.map((label, index) => {
          const option = (index + 1) as RatingValue;
          const selected = value === option;
          return (
            <button
              key={label}
              id={`${id}-${option}`}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option)}
              className={`min-h-11 rounded-md border px-2.5 py-2 text-center text-[12px] font-medium transition-all ${
                selected
                  ? "border-copper bg-copper text-oncopper shadow-[0_2px_8px_rgba(166,110,47,0.2)]"
                  : "border-hairline bg-surface text-ink2 hover:border-copper hover:text-ink"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {feedback && (
        <p className="mt-3 rounded-md border border-copper/20 bg-copper/10 px-3 py-2 text-[12px] leading-relaxed text-ink2">
          {feedback}
        </p>
      )}
    </div>
  );
}

function styleForScore(score: number | null) {
  if (score === null) {
    return {
      border: "border-hairline",
      bg: "bg-bg",
      tint: "bg-copper/10",
      text: "text-copper",
      bar: "bg-copper",
    };
  }
  if (score < 45) {
    return {
      border: "border-critical/35",
      bg: "bg-critical/10",
      tint: "bg-critical/10",
      text: "text-critical",
      bar: "bg-critical",
    };
  }
  if (score < 72) {
    return {
      border: "border-copper/35",
      bg: "bg-copper/10",
      tint: "bg-copper/10",
      text: "text-copper",
      bar: "bg-copper",
    };
  }
  return {
    border: "border-success/35",
    bg: "bg-success/10",
    tint: "bg-success/10",
    text: "text-success",
    bar: "bg-success",
  };
}

function encodeList(items: readonly string[]) {
  return items.join(" | ");
}

function encodeReadiness(values: Array<RatingValue | null>) {
  return values.map((value) => String(value ?? "")).join(",");
}

export function ReadinessAndRoiTools({ locale }: { locale: Locale }) {
  const t = landingToolsContent[locale];
  const [activeStep, setActiveStep] = useState<Step>(0);
  const [selectedIndustryKey, setSelectedIndustryKey] = useState<string | null>(
    null,
  );
  const [readiness, setReadiness] = useState<Array<RatingValue | null>>([
    null,
    null,
    null,
    null,
    null,
  ]);
  const [people, setPeople] = useState(8);
  const [manualHours, setManualHours] = useState(4);
  const [hourlyRate, setHourlyRate] = useState(45);
  const [automationRate, setAutomationRate] = useState(25);
  const [lastFeedbackIndex, setLastFeedbackIndex] = useState<number | null>(
    null,
  );
  const didTrackFirstInteraction = useRef(false);
  const didTrackCompletion = useRef(false);

  const selectedIndustry =
    t.industries.find((industry) => industry.key === selectedIndustryKey) ??
    t.industries[t.industries.length - 1];
  const answeredReadiness = readiness.filter(Boolean).length;
  const resultReady = answeredReadiness === t.areas.length;
  const readinessValues = readiness.map((value) => value ?? 1);
  const readinessScore = resultReady
    ? Math.round(
        readinessValues.reduce(
          (sum, value) => sum + ((value - 1) / 4) * 20,
          0,
        ),
      )
    : null;
  const readinessBand =
    readinessScore === null
      ? null
      : t.bands.find((band) => readinessScore <= band.max) ??
        t.bands[t.bands.length - 1];
  const bottleneckIndex = resultReady
    ? readinessValues.reduce(
        (lowestIndex, value, index) =>
          value < readinessValues[lowestIndex] ? index : lowestIndex,
        0,
      )
    : lastFeedbackIndex ?? 0;
  const bottleneckArea = t.areas[bottleneckIndex];
  const scoreStyles = styleForScore(readinessScore);
  const progressPercent = resultReady
    ? readinessScore
    : Math.round((answeredReadiness / t.areas.length) * 100);
  const remainingAnswers = t.areas.length - answeredReadiness;

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
  const firstLever =
    selectedIndustry.key === "other"
      ? bottleneckArea.lever
      : `${selectedIndustry.focus}: ${bottleneckArea.lever}`;

  const ctaHref =
    resultReady && readinessBand
      ? `/${locale}/termin?${new URLSearchParams({
          source: "asdar-check",
          score: String(readinessScore),
          band: readinessBand.label,
          phase: readinessBand.phase,
          bandBody: readinessBand.body,
          nextStep: readinessBand.nextStep,
          industryKey: selectedIndustry.key,
          industry: selectedIndustry.label,
          industryFocus: selectedIndustry.focus,
          readiness: encodeReadiness(readiness),
          bottleneckIndex: String(bottleneckIndex),
          bottleneck: bottleneckArea.label,
          lever: firstLever,
          actions: encodeList(bottleneckArea.actions),
          people: String(people),
          manualHours: String(manualHours),
          hourlyRate: String(hourlyRate),
          automationRate: String(automationRate),
          monthlyHours: String(monthlySavedHours),
          monthlyValue: String(monthlyValue),
          annualValue: String(annualValue),
        }).toString()}`
      : "#readiness-check";

  const roiOutputs = [
    { label: t.monthlyHours, value: numberFormatter.format(monthlySavedHours) },
    { label: t.monthlyValue, value: currencyFormatter.format(monthlyValue) },
    { label: t.annualValue, value: currencyFormatter.format(annualValue) },
  ];

  const updateReadiness = (index: number, value: RatingValue) => {
    setReadiness((current) => {
      const next = current.map((item, itemIndex) =>
        itemIndex === index ? value : item,
      );
      const answered = next.filter(Boolean).length;
      setLastFeedbackIndex(index);

      if (!didTrackFirstInteraction.current) {
        didTrackFirstInteraction.current = true;
        trackAnalyticsEvent("readiness_interaction", {
          locale,
          area: t.areas[index].label,
        });
      }

      if (!didTrackCompletion.current && answered === t.areas.length) {
        didTrackCompletion.current = true;
        const score = Math.round(
          next
            .map((item) => item ?? 1)
            .reduce((sum, item) => sum + ((item - 1) / 4) * 20, 0),
        );
        trackAnalyticsEvent("readiness_complete", {
          score,
          locale,
        });
      }

      return next;
    });
  };

  const selectIndustry = (industry: IndustryPreset) => {
    setSelectedIndustryKey(industry.key);
    setPeople(industry.people);
    setManualHours(industry.manualHours);
    setHourlyRate(industry.hourlyRate);
    setAutomationRate(industry.automationRate);
    setActiveStep(1);
    trackAnalyticsEvent("readiness_industry_select", {
      locale,
      industry: industry.label,
    });
  };

  const feedbackForValue = (value: RatingValue) => {
    if (value <= 2) return t.feedback.low;
    if (value === 3) return t.feedback.mid;
    return t.feedback.high;
  };

  const lastFeedback =
    lastFeedbackIndex === null || readiness[lastFeedbackIndex] === null
      ? undefined
      : `${t.feedback.prefix}: ${t.areas[lastFeedbackIndex].label}. ${feedbackForValue(
          readiness[lastFeedbackIndex],
        )}`;

  const canOpenStep = (step: Step) =>
    step === 0 ||
    (step === 1 && selectedIndustryKey !== null) ||
    (step === 2 && resultReady);

  const renderStepper = () => (
    <div className="mt-8 grid gap-2 sm:grid-cols-3">
      {t.steps.map((label, index) => {
        const step = index as Step;
        const active = activeStep === step;
        const complete =
          (step === 0 && selectedIndustryKey !== null) ||
          (step === 1 && resultReady);
        const enabled = canOpenStep(step);

        return (
          <button
            key={label}
            type="button"
            disabled={!enabled}
            onClick={() => enabled && setActiveStep(step)}
            className={`flex min-h-12 items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
              active
                ? "border-copper bg-copper/10 text-ink"
                : complete
                  ? "border-success/35 bg-success/10 text-ink"
                  : "border-hairline bg-surface text-muted"
            } ${enabled ? "hover:border-copper" : "cursor-not-allowed opacity-60"}`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] ${
                complete
                  ? "bg-success text-bg"
                  : active
                    ? "bg-copper text-oncopper"
                    : "bg-bg text-muted"
              }`}
            >
              {complete ? <CheckCircle2 className="h-3.5 w-3.5" /> : index + 1}
            </span>
            <span className="text-sm font-medium">{label}</span>
          </button>
        );
      })}
    </div>
  );

  const renderMobileProgress = () => (
    <div className="sticky top-16 z-30 mt-8 lg:hidden">
      <div className={`rounded-lg border bg-surface px-4 py-3 shadow-card ${scoreStyles.border}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex shrink-0 items-baseline gap-1.5">
            <span className={`font-serif text-3xl leading-none ${scoreStyles.text}`}>
              {readinessScore ?? answeredReadiness}
            </span>
            <span className="text-[11px] text-muted">
              {readinessScore === null ? `/ ${t.areas.length}` : "/ 100"}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-bg">
              <div
                className={`h-full rounded-full transition-all duration-300 ${scoreStyles.bar}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-1.5 truncate text-right text-[12px] font-medium text-ink">
              {readinessBand?.label ??
                t.revealHint.replace("{count}", String(remainingAnswers))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfileStep = () => (
    <div className="rounded-xl border border-hairline bg-surface p-5 shadow-card md:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-copper/10 text-copper">
          <Workflow className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-medium text-ink">{t.profileTitle}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {t.profileHint}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {t.industries.map((industry) => {
          const selected = selectedIndustryKey === industry.key;
          return (
            <button
              key={industry.key}
              type="button"
              onClick={() => selectIndustry(industry)}
              className={`min-h-32 rounded-lg border p-4 text-left transition-all ${
                selected
                  ? "border-copper bg-copper/10 shadow-card"
                  : "border-hairline bg-bg hover:border-copper"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-medium text-ink">{industry.label}</h4>
                {selected && <CheckCircle2 className="h-4 w-4 text-copper" />}
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-muted">
                {industry.hint}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderReadinessStep = () => (
    <div className="rounded-xl border border-hairline bg-surface p-5 shadow-card md:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-copper/10 text-copper">
          <Gauge className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-medium text-ink">{t.readinessTitle}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {t.readinessHint}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-copper/20 bg-copper/10 p-4">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-copper">
          {t.selectedProfile}
        </div>
        <p className="mt-1 text-sm font-medium text-ink">
          {selectedIndustry.label}
        </p>
        <p className="mt-1 text-[12px] leading-relaxed text-muted">
          {selectedIndustry.focus}
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {t.areas.map((area, index) => (
          <RatingRow
            key={area.label}
            id={`asdar-potential-${index}`}
            area={area}
            scale={t.scale}
            unanswered={t.unanswered}
            value={readiness[index]}
            feedback={
              lastFeedbackIndex === index && readiness[index]
                ? feedbackForValue(readiness[index])
                : undefined
            }
            onChange={(value) => updateReadiness(index, value)}
          />
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] text-muted">
          {answeredReadiness}/{t.areas.length} {t.answered}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setActiveStep(0)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-hairline px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-copper"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.back}
          </button>
          <button
            type="button"
            disabled={!resultReady}
            onClick={() => setActiveStep(2)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t.next}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderValueStep = () => (
    <div className="space-y-5">
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
            suffix=" h"
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
            description="5-60 %"
            min={5}
            max={60}
            step={5}
            value={automationRate}
            suffix=" %"
            onChange={setAutomationRate}
          />
        </div>

        <details className="mt-5 rounded-lg border border-hairline bg-bg p-4">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
            <Info className="h-4 w-4 text-copper" />
            {t.assumptionsTitle}
          </summary>
          <p className="mt-3 text-[12px] leading-relaxed text-muted">
            {t.assumptionsBody}
          </p>
        </details>
      </div>

      <button
        type="button"
        onClick={() => setActiveStep(1)}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-hairline px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-copper"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.editAnswers}
      </button>
    </div>
  );

  const renderResultCard = () => (
    <div className="lg:sticky lg:top-20">
      <div className={`space-y-4 rounded-xl border bg-surface p-5 shadow-card md:p-6 ${scoreStyles.border}`}>
        <div className={`rounded-lg border p-5 ${scoreStyles.border} ${scoreStyles.bg}`}>
          <div className="flex items-center gap-3">
            <Target className={`h-5 w-5 ${scoreStyles.text}`} />
            <div className={`font-mono text-[11px] uppercase tracking-[0.14em] ${scoreStyles.text}`}>
              {resultReady ? t.resultTitle : t.lockedTitle}
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div>
              <div className={`font-serif text-5xl leading-none ${scoreStyles.text}`}>
                {readinessScore ?? answeredReadiness}
              </div>
              <div className="mt-1 text-[12px] text-muted">
                {readinessScore === null ? `/ ${t.areas.length}` : "/ 100"}
              </div>
            </div>
            <div className="w-full max-w-[190px]">
              <div className="h-2 overflow-hidden rounded-full bg-bg">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${scoreStyles.bar}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {readinessBand ? (
            <>
              <h3 className="mt-5 text-base font-medium text-ink">
                {readinessBand.label}
              </h3>
              <p className={`mt-1 text-[12px] ${scoreStyles.text}`}>
                {readinessBand.phase}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink2">
                {readinessBand.body}
              </p>
            </>
          ) : (
            <p className="mt-5 text-sm leading-relaxed text-ink2">
              {t.lockedBody}
            </p>
          )}
        </div>

        {lastFeedback && !resultReady && (
          <div className="rounded-lg border border-copper/20 bg-copper/10 p-4 text-sm leading-relaxed text-ink2">
            {lastFeedback}
          </div>
        )}

        {resultReady && readinessBand && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-hairline bg-bg p-4">
                <div className="flex items-center gap-2 text-[12px] text-muted">
                  <BarChart3 className={`h-4 w-4 ${scoreStyles.text}`} />
                  {t.bottleneck}
                </div>
                <p className="mt-2 text-sm font-medium text-ink">
                  {bottleneckArea.label}
                </p>
              </div>
              <div className="rounded-lg border border-hairline bg-bg p-4">
                <div className="flex items-center gap-2 text-[12px] text-muted">
                  <Sparkles className={`h-4 w-4 ${scoreStyles.text}`} />
                  {t.nextStep}
                </div>
                <p className="mt-2 text-sm font-medium text-ink">
                  {readinessBand.nextStep}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-hairline bg-bg p-4">
              <div className="flex items-center gap-2 text-[12px] text-muted">
                <Workflow className={`h-4 w-4 ${scoreStyles.text}`} />
                {t.firstLever}
              </div>
              <p className="mt-2 text-sm font-medium leading-relaxed text-ink">
                {firstLever}
              </p>
            </div>

            <div className="rounded-lg border border-hairline bg-bg p-4">
              <div className="flex items-center gap-2 text-[12px] text-muted">
                <ListChecks className={`h-4 w-4 ${scoreStyles.text}`} />
                {t.nextActions}
              </div>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink2">
                {bottleneckArea.actions.map((action) => (
                  <li key={action} className="flex gap-2">
                    <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${scoreStyles.text}`} />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {roiOutputs.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-hairline bg-bg p-4"
                >
                  <div className="text-[12px] text-muted">{item.label}</div>
                  <div className={`mt-2 font-serif text-2xl ${scoreStyles.text}`}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            <a
              href={ctaHref}
              data-analytics-event="readiness_cta_click"
              data-analytics-label={readinessBand.label}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-copper px-5 py-3 text-sm font-medium text-oncopper shadow-[0_2px_8px_rgba(166,110,47,0.25)] transition-all hover:-translate-y-0.5 hover:bg-copper-hi"
            >
              {t.cta}
              <ArrowRight className="h-4 w-4" />
            </a>
          </>
        )}
      </div>
    </div>
  );

  const renderActiveStep = () => {
    if (activeStep === 0) return renderProfileStep();
    if (activeStep === 1) return renderReadinessStep();
    return renderValueStep();
  };

  return (
    <Section
      id="readiness-check"
      className="border-t border-hairline bg-surface2 pb-32 lg:pb-28"
    >
      <Container>
        <div className="max-w-2xl">
          <Kicker>{t.kicker}</Kicker>
          <h2 className="mt-5 font-serif text-3xl font-normal leading-tight text-ink md:text-[40px]">
            {t.heading}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink2">{t.intro}</p>
        </div>

        {renderStepper()}
        {renderMobileProgress()}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          {renderActiveStep()}
          {renderResultCard()}
        </div>

        <p className="mt-6 flex items-start gap-2 text-[12px] leading-relaxed text-muted">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-copper" />
          <span>{t.disclaimer}</span>
        </p>
      </Container>

      {resultReady && readinessBand && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-surface/95 px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(22,25,30,0.35)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-[520px] items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className={`font-serif text-2xl leading-none ${scoreStyles.text}`}>
                {readinessScore}
                <span className="ml-1 font-sans text-[11px] text-muted">/100</span>
              </div>
              <div className="mt-1 truncate text-[12px] font-medium text-ink">
                {readinessBand.label}
              </div>
            </div>
            <a
              href={ctaHref}
              data-analytics-event="readiness_mobile_cta_click"
              data-analytics-label={readinessBand.label}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper"
            >
              {t.mobileCta}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </Section>
  );
}
