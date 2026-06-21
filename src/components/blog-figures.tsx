import { Check, X } from "lucide-react";

/**
 * Theme-aware inline figures for blog articles. All use design tokens
 * (copper / slate / ink / surface) so they recolor automatically in dark mode
 * and add no image assets / no layout shift. Rendered data-driven via
 * <BlogFigure spec={...}/> so article enrichment stays pure data.
 */

function Figure({
  label,
  caption,
  children,
}: {
  label: string;
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <figure
      role="img"
      aria-label={label}
      className="not-prose rounded-2xl border border-hairline bg-surface2 p-6 md:p-8"
    >
      {children}
      {caption && (
        <figcaption className="mt-6 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

const ASDAR_PHASES = [
  { letter: "A", title: "Analysieren", meaning: "Prozesse, Aufwand und Daten aufnehmen.", result: "Klarheit" },
  { letter: "S", title: "Strukturieren", meaning: "Abläufe ordnen, Doppelarbeit sichtbar machen.", result: "Ordnung" },
  { letter: "D", title: "Digitalisieren", meaning: "Manuelles in saubere digitale Abläufe überführen.", result: "Basis" },
  { letter: "A", title: "Automatisieren", meaning: "Regeln, Schnittstellen und KI gezielt einsetzen.", result: "Hebel" },
  { letter: "R", title: "Realisieren", meaning: "Umsetzen, messen, im Betrieb verankern.", result: "Wirkung" },
];

export function AsdarPipeline() {
  return (
    <Figure
      label="Die fünf Phasen der ASDAR Method: Analysieren, Strukturieren, Digitalisieren, Automatisieren, Realisieren."
      caption="ASDAR Method — Prozess vor Tool, in fünf Phasen"
    >
      <div className="relative">
        <div className="absolute left-[8%] right-[8%] top-6 hidden h-px bg-copper/40 lg:block" aria-hidden="true" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          {ASDAR_PHASES.map((ph, i) => (
            <div key={i} className="relative">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-copper bg-bg font-serif text-xl text-copper">
                {ph.letter}
              </div>
              <div className="text-[15px] font-medium text-ink">{ph.title}</div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{ph.meaning}</p>
              <div className="mt-2.5 inline-flex rounded-md bg-copper/10 px-2 py-0.5 text-[11.5px] text-copper">
                {ph.result}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Figure>
  );
}

type BeforeAfterItem = { title: string; before: string; after: string; saves?: string };

export function BeforeAfter({ items, caption }: { items: BeforeAfterItem[]; caption?: string }) {
  return (
    <Figure label={`Vorher-Nachher-Vergleich: ${items.map((i) => i.title).join(", ")}`} caption={caption}>
      <div className="space-y-5">
        {items.map((it, i) => (
          <div key={i} className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
            <div className="rounded-xl border border-hairline bg-bg p-4">
              <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">Heute</div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink2">{it.before}</p>
            </div>
            <div className="flex items-center justify-center text-copper" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-5 w-5 rotate-90 sm:rotate-0" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="rounded-xl border border-copper/40 bg-copper/5 p-4">
              <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-copper">Mit KI</div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink">{it.after}</p>
              {it.saves && <div className="mt-2 text-[12px] font-medium text-copper">{it.saves}</div>}
            </div>
          </div>
        ))}
      </div>
    </Figure>
  );
}

type Step = { title: string; text: string };

export function NumberedSteps({ steps, caption }: { steps: Step[]; caption?: string }) {
  return (
    <Figure label={`Schritte: ${steps.map((s) => s.title).join(", ")}`} caption={caption}>
      <ol className="space-y-5">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[1.5px] border-copper font-serif text-sm text-copper">
              {i + 1}
            </span>
            <div className="pt-0.5">
              <div className="text-[15px] font-medium text-ink">{s.title}</div>
              <p className="mt-1 text-[13.5px] leading-relaxed text-ink2">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </Figure>
  );
}

type CheckItem = { text: string; ok: boolean };

export function Checklist({ items, title, caption }: { items: CheckItem[]; title?: string; caption?: string }) {
  return (
    <Figure label={title ?? "Checkliste"} caption={caption}>
      {title && <div className="mb-4 text-[15px] font-medium text-ink">{title}</div>}
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-3 rounded-lg border border-hairline bg-bg p-3">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                it.ok ? "bg-success/15 text-success" : "bg-critical/15 text-critical"
              }`}
              aria-hidden="true"
            >
              {it.ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
            </span>
            <span className="text-[13.5px] leading-relaxed text-ink2">{it.text}</span>
          </li>
        ))}
      </ul>
    </Figure>
  );
}

type UseCase = { title: string; text: string };

export function UseCaseGrid({ items, caption }: { items: UseCase[]; caption?: string }) {
  return (
    <Figure label={`Anwendungsfälle: ${items.map((i) => i.title).join(", ")}`} caption={caption}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <div key={i} className="rounded-xl border border-hairline bg-bg p-4">
            <div className="mb-3 h-1 w-8 rounded-full bg-copper" aria-hidden="true" />
            <div className="text-[14.5px] font-medium text-ink">{it.title}</div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink2">{it.text}</p>
          </div>
        ))}
      </div>
    </Figure>
  );
}

type Axis = { label: string; value: number };

export function ScoreRadar({ axes, caption }: { axes: Axis[]; caption?: string }) {
  const cx = 130;
  const cy = 120;
  const r = 92;
  const n = axes.length;
  const pt = (i: number, radius: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [cx + radius * Math.cos(a), cy + radius * Math.sin(a)] as const;
  };
  const ring = (frac: number) =>
    axes.map((_, i) => pt(i, r * frac).join(",")).join(" ");
  const valuePoly = axes
    .map((ax, i) => pt(i, r * Math.max(0, Math.min(1, ax.value / 100))).join(","))
    .join(" ");

  return (
    <Figure label={`Reifegrad-Radar: ${axes.map((a) => `${a.label} ${a.value}`).join(", ")}`} caption={caption}>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center sm:gap-10">
        <svg viewBox="0 0 260 240" className="h-[210px] w-[260px] shrink-0" aria-hidden="true">
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <polygon key={f} points={ring(f)} fill="none" strokeWidth="1" className="stroke-hairline" />
          ))}
          {axes.map((_, i) => {
            const [x, y] = pt(i, r);
            return <line key={i} x1={cx} y1={cy} x2={x} y2={y} strokeWidth="1" className="stroke-hairline" />;
          })}
          <polygon points={valuePoly} className="fill-copper/20 stroke-copper" strokeWidth="2" />
          {axes.map((ax, i) => {
            const [x, y] = pt(i, r * Math.max(0, Math.min(1, ax.value / 100)));
            return <circle key={i} cx={x} cy={y} r="3" className="fill-copper" />;
          })}
        </svg>
        <ul className="grid w-full max-w-[220px] gap-2">
          {axes.map((ax, i) => (
            <li key={i} className="flex items-center justify-between gap-3 text-[13px]">
              <span className="text-ink2">{ax.label}</span>
              <span className="font-mono text-copper">{ax.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </Figure>
  );
}

type Stat = { value: string; label: string };

export function StatCallout({ stats, caption }: { stats: Stat[]; caption?: string }) {
  return (
    <Figure label={`Kennzahlen: ${stats.map((s) => `${s.value} ${s.label}`).join(", ")}`} caption={caption}>
      <div className="grid gap-6 sm:grid-cols-3">
        {stats.map((s, i) => (
          <div key={i}>
            <div className="font-serif text-3xl text-copper md:text-4xl">{s.value}</div>
            <div className="mt-1 text-[12.5px] leading-relaxed text-muted">{s.label}</div>
          </div>
        ))}
      </div>
    </Figure>
  );
}

/** Branded SVG hero band. Used when an article has no raster `heroImage`. */
export function BlogHero({ category }: { category: string }) {
  return (
    <div className="relative aspect-[16/6] w-full overflow-hidden rounded-2xl border border-hairline bg-surface2">
      <svg
        viewBox="0 0 1200 450"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <path
          d="M0 210 C 220 210 260 360 480 360 C 700 360 740 220 980 220 C 1100 220 1140 320 1200 320"
          fill="none"
          strokeWidth="2"
          className="stroke-slate opacity-50"
        />
        <path
          d="M0 330 C 200 330 240 170 440 170 C 640 170 680 300 880 300 C 1040 300 1090 150 1200 150"
          fill="none"
          strokeWidth="2"
          className="stroke-copper"
        />
        <circle cx="440" cy="170" r="6" strokeWidth="2" className="fill-bg stroke-copper" />
        <circle cx="880" cy="300" r="6" strokeWidth="2" className="fill-bg stroke-copper" />
        <circle cx="1090" cy="151" r="5" className="fill-copper" />
        <circle cx="480" cy="360" r="5" strokeWidth="2" className="fill-bg stroke-slate" />
        <circle cx="980" cy="220" r="5" strokeWidth="2" className="fill-bg stroke-slate" />
        <g className="fill-copper opacity-30">
          <circle cx="120" cy="110" r="2.5" />
          <circle cx="300" cy="80" r="2.5" />
          <circle cx="720" cy="120" r="2.5" />
          <circle cx="1040" cy="380" r="2.5" />
          <circle cx="640" cy="410" r="2.5" />
        </g>
      </svg>
      <div className="absolute left-6 top-5 font-mono text-[11px] uppercase tracking-[0.18em] text-copper md:left-8 md:top-7">
        {category}
      </div>
      <div className="absolute bottom-5 right-6 text-[13px] font-medium tracking-[0.22em] text-strong md:bottom-7 md:right-8">
        ASSADDAR<span className="text-copper">.</span>
      </div>
    </div>
  );
}

/** Discriminated figure spec — pure data lives in src/blog/enrich.ts. */
export type FigureSpec =
  | { type: "asdarPipeline" }
  | { type: "beforeAfter"; items: BeforeAfterItem[]; caption?: string }
  | { type: "numberedSteps"; steps: Step[]; caption?: string }
  | { type: "checklist"; items: CheckItem[]; title?: string; caption?: string }
  | { type: "useCaseGrid"; items: UseCase[]; caption?: string }
  | { type: "scoreRadar"; axes: Axis[]; caption?: string }
  | { type: "statCallout"; stats: Stat[]; caption?: string };

export function BlogFigure({ spec }: { spec: FigureSpec }) {
  switch (spec.type) {
    case "asdarPipeline":
      return <AsdarPipeline />;
    case "beforeAfter":
      return <BeforeAfter items={spec.items} caption={spec.caption} />;
    case "numberedSteps":
      return <NumberedSteps steps={spec.steps} caption={spec.caption} />;
    case "checklist":
      return <Checklist items={spec.items} title={spec.title} caption={spec.caption} />;
    case "useCaseGrid":
      return <UseCaseGrid items={spec.items} caption={spec.caption} />;
    case "scoreRadar":
      return <ScoreRadar axes={spec.axes} caption={spec.caption} />;
    case "statCallout":
      return <StatCallout stats={spec.stats} caption={spec.caption} />;
  }
}
