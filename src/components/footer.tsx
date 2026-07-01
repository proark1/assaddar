import Link from "next/link";
import type { Dict, Locale } from "@/content";
import { AssaddarPlatformWidget } from "@/components/assaddar-platform-widget";

export function Footer({ t, locale }: { t: Dict["footer"]; locale: Locale }) {
  return (
    <>
      <footer className="border-t border-hairline">
        <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-6 py-12 md:flex-row md:items-start md:justify-between md:px-10">
          <div className="max-w-xs">
            <Link
              href={`/${locale}`}
              className="text-[15px] font-medium tracking-[0.22em] text-ink"
            >
              ASSADDAR<span className="text-copper">.</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {t.tagline}
            </p>
          </div>

          <div className="flex flex-wrap gap-x-12 gap-y-6 text-sm">
            <div className="flex flex-col gap-2">
              <a
                href={t.linkedinHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink2 transition-colors hover:text-ink"
              >
                {t.linkedin}
              </a>
              <a
                href="mailto:assad.dar@gmail.com"
                className="text-ink2 transition-colors hover:text-ink"
              >
                assad.dar@gmail.com
              </a>
            </div>
            <div className="flex flex-col gap-2">
              {t.legal.map((l) => (
                <Link
                  key={l.label}
                  href={`/${locale}${l.href}`}
                  className="text-ink2 transition-colors hover:text-ink"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-hairline">
          <div className="mx-auto w-full max-w-[1120px] px-6 py-5 text-xs text-muted md:px-10">
            {t.rights}
          </div>
        </div>
      </footer>
      <AssaddarPlatformWidget />
    </>
  );
}
