"use client";

import dynamic from "next/dynamic";
import type { Locale } from "@/content";

const DynamicReadinessAndRoiTools = dynamic(
  () =>
    import("./landing-tools").then((module) => module.ReadinessAndRoiTools),
  {
    ssr: false,
    loading: () => (
      <section
        id="readiness-check"
        aria-hidden="true"
        className="border-t border-hairline bg-surface2 py-20 md:py-28"
      >
        <div className="mx-auto w-full max-w-[1120px] px-6 md:px-10">
          <div className="h-3 w-32 rounded-full bg-copper/20" />
          <div className="mt-5 h-10 max-w-xl rounded-lg bg-hairline/60" />
          <div className="mt-4 h-5 max-w-2xl rounded-full bg-hairline/50" />
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="min-h-80 rounded-xl border border-hairline bg-surface shadow-card" />
            <div className="min-h-80 rounded-xl border border-hairline bg-surface shadow-card" />
          </div>
        </div>
      </section>
    ),
  },
);

export function ReadinessAndRoiToolsLoader({
  locale,
}: {
  locale: Locale;
}) {
  return <DynamicReadinessAndRoiTools locale={locale} />;
}
