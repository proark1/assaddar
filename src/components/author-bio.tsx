import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Author credibility card (E-E-A-T), shown near the end of each article. */
export function AuthorBio() {
  return (
    <aside className="mt-16 flex flex-col gap-5 rounded-2xl border border-hairline bg-surface2 p-6 shadow-card sm:flex-row sm:items-start md:p-8">
      <div
        aria-hidden="true"
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-copper font-serif text-xl text-oncopper"
      >
        AD
      </div>
      <div>
        <div className="text-base font-medium text-ink">Assad Dar</div>
        <div className="mt-0.5 text-[13px] text-copper">
          Digital- &amp; KI-Transformationsberater
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink2">
          19 Jahre Transformation in der globalen Pharma (u.&nbsp;a. Bayer,
          Bionorica) und zwei selbst aufgebaute Unternehmen. Heute hilft Assad
          Unternehmen, KI und Automatisierung dort einzusetzen, wo sie messbar
          etwas bringen — Prozess vor Tool.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
          <Link
            href="/de/ueber-mich"
            className="group inline-flex items-center gap-1.5 font-medium text-copper"
          >
            Mehr über mich
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="https://linkedin.com/in/assaddar"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted transition-colors hover:text-ink"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </aside>
  );
}
