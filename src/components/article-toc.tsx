"use client";

import { useEffect, useState } from "react";
import type { Section } from "@/blog/utils";

/**
 * Table of contents built from the article's h2/h3 sections.
 * `variant="rail"` = sticky desktop sidebar with scroll-spy.
 * `variant="inline"` = collapsible <details> for mobile.
 */
export function ArticleToc({
  sections,
  variant,
}: {
  sections: Section[];
  variant: "rail" | "inline";
}) {
  const [active, setActive] = useState("");

  useEffect(() => {
    if (variant !== "rail") return;
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          );
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections, variant]);

  if (sections.length < 2) return null;

  const list = (
    <ul className="space-y-1">
      {sections.map((s) => (
        <li key={s.id}>
          <a
            href={`#${s.id}`}
            className={`block border-l-2 py-1 text-[13px] leading-snug transition-colors ${
              s.level === 3 ? "pl-6" : "pl-3"
            } ${
              active === s.id
                ? "border-copper text-copper"
                : "border-hairline text-muted hover:border-strong hover:text-ink"
            }`}
          >
            {s.text}
          </a>
        </li>
      ))}
    </ul>
  );

  if (variant === "inline") {
    return (
      <details className="mb-10 rounded-xl border border-hairline bg-surface2 p-4 lg:hidden">
        <summary className="cursor-pointer select-none font-mono text-[11px] uppercase tracking-[0.14em] text-copper">
          Inhalt
        </summary>
        <div className="mt-4">{list}</div>
      </details>
    );
  }

  return (
    <nav
      aria-label="Inhaltsverzeichnis"
      className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto lg:block"
    >
      <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        Inhalt
      </div>
      {list}
    </nav>
  );
}
