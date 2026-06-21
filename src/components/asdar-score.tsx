"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Dict } from "@/content";
import { Container, Kicker, Section } from "./ui";

export function AsdarScore({ t }: { t: Dict["score"] }) {
  const [scores, setScores] = useState<number[]>(t.areas.map(() => 10));

  const total = scores.reduce((a, b) => a + b, 0);
  const band = t.bands.find((b) => total <= b.max) ?? t.bands[t.bands.length - 1];

  return (
    <Section id="score" className="border-t border-hairline">
      <Container>
        <Kicker>{t.kicker}</Kicker>
        <h2 className="mt-5 font-serif text-3xl font-normal text-ink md:text-[40px]">
          {t.heading}
        </h2>
        <p className="mt-4 max-w-2xl text-base text-ink2">{t.intro}</p>

        <div className="mt-10 grid gap-8 rounded-2xl border border-hairline bg-surface p-6 shadow-card md:grid-cols-2 md:p-10">
          <div className="space-y-6">
            {t.areas.map((a, i) => (
              <div key={a.label}>
                <div className="mb-1 flex items-baseline justify-between gap-3">
                  <label className="text-sm font-medium text-ink">{a.label}</label>
                  <span className="font-mono text-sm text-copper">
                    {scores[i]}/20
                  </span>
                </div>
                <p className="mb-2 text-[12.5px] leading-snug text-muted">
                  {a.question}
                </p>
                <input
                  type="range"
                  min={0}
                  max={20}
                  step={1}
                  value={scores[i]}
                  aria-label={a.label}
                  aria-valuetext={`${scores[i]} / 20`}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setScores((prev) => prev.map((x, j) => (j === i ? v : x)));
                  }}
                />
              </div>
            ))}
            <p className="text-xs text-muted">{t.hint}</p>
          </div>

          <div
            aria-live="polite"
            className="flex flex-col justify-between gap-6 rounded-xl border border-copper/30 bg-surface2 p-6 md:p-8"
          >
            <div>
              <div className="text-[12px] text-muted">{t.resultLabel}</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-serif text-5xl text-copper md:text-6xl">
                  {total}
                </span>
                <span className="text-sm text-muted">{t.ofLabel}</span>
              </div>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-hairline">
                <div
                  className="h-full rounded-full bg-copper transition-all duration-300"
                  style={{ width: `${total}%` }}
                />
              </div>
              <p className="mt-4 text-base font-medium text-ink">{band.label}</p>
            </div>
            <a
              href={t.ctaHref}
              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-copper px-5 py-3 text-sm font-medium text-oncopper shadow-[0_2px_8px_rgba(166,110,47,0.25)] transition-all hover:-translate-y-0.5 hover:bg-copper-hi hover:shadow-[0_6px_18px_rgba(166,110,47,0.32)]"
            >
              {t.cta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </Container>
    </Section>
  );
}
