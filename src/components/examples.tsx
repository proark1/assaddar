"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Clock,
  FileSearch,
  FileText,
  Inbox,
  Languages,
  ReceiptText,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Dict } from "@/content";
import { Container, Kicker, Section } from "./ui";

const ICONS: Record<string, LucideIcon> = {
  FileText,
  ReceiptText,
  Inbox,
  BarChart3,
  BookOpen,
  FileSearch,
  Users,
  Languages,
};

export function AiExamples({ t }: { t: Dict["examples"] }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const ex = t.items[active];

  return (
    <Section id="praxis" className="border-t border-hairline">
      <Container>
        <Kicker>{t.kicker}</Kicker>
        <h2 className="mt-5 max-w-3xl font-serif text-3xl font-normal text-ink md:text-[40px]">
          {t.heading}
        </h2>
        <p className="mt-4 max-w-2xl text-base text-ink2">{t.intro}</p>

        <div className="mt-12 grid gap-6 md:grid-cols-[280px_1fr]">
          <div>
            <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted md:hidden">
              {t.labels.select}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:flex-col md:gap-1.5 md:overflow-visible md:pb-0">
              {t.items.map((item, i) => {
                const Icon = ICONS[item.icon] ?? FileText;
                const isActive = i === active;
                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-pressed={isActive}
                    className={`flex shrink-0 items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors md:w-full ${
                      isActive
                        ? "border-copper bg-surface2 text-ink"
                        : "border-hairline bg-surface text-ink2 hover:border-strong hover:text-ink"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? "text-copper" : "text-muted"
                      }`}
                    />
                    <span className="whitespace-nowrap md:whitespace-normal">
                      {item.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div aria-live="polite">
            <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-xl border border-hairline bg-surface p-6 shadow-card md:p-8"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="rounded-lg border border-hairline bg-surface2 p-5">
                  <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                    {t.labels.before}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink2">
                    {ex.before}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-critical/10 px-2.5 py-1 text-[13px] text-critical">
                    <Clock className="h-3.5 w-3.5" />
                    {ex.beforeTime}
                  </div>
                </div>

                <div className="rounded-lg border border-copper/40 bg-surface2 p-5">
                  <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-copper">
                    {t.labels.after}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink">
                    {ex.after}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-success/10 px-2.5 py-1 text-[13px] text-success">
                    <Clock className="h-3.5 w-3.5" />
                    {ex.afterTime}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4 border-t border-hairline pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">
                    {t.labels.tools}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ex.tools.map((tool) => (
                      <span
                        key={tool}
                        className="rounded-md border border-hairline bg-surface2 px-2.5 py-1 text-[12px] text-ink2"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-lg bg-copper/10 px-4 py-2.5">
                  <ArrowRight className="h-4 w-4 shrink-0 text-copper" />
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-copper">
                      {t.labels.saves}
                    </div>
                    <div className="text-sm font-medium text-ink">{ex.saves}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          </div>
        </div>
      </Container>
    </Section>
  );
}
