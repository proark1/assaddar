"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { Dict } from "@/content";
import { Container, Kicker, Section } from "./ui";

export function Faq({ t }: { t: Dict["faq"] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section className="border-t border-hairline">
      <Container>
        <Kicker>{t.kicker}</Kicker>
        <h2 className="mt-5 font-serif text-3xl font-normal text-ink md:text-[40px]">
          {t.heading}
        </h2>
        <div className="mt-10 divide-y divide-hairline border-y border-hairline">
          {t.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  id={`faq-btn-${i}`}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-base font-medium text-ink">{item.q}</span>
                  {isOpen ? (
                    <Minus className="h-4 w-4 shrink-0 text-copper" />
                  ) : (
                    <Plus className="h-4 w-4 shrink-0 text-muted" />
                  )}
                </button>
                {isOpen && (
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-btn-${i}`}
                  >
                    <p className="max-w-2xl pb-6 text-sm leading-relaxed text-ink2">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
