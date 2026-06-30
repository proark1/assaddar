import Link from "next/link";
import { Menu, UserRound, X } from "lucide-react";
import type { Dict, Locale } from "@/content";
import { ThemeToggle } from "./theme-toggle";

export function Nav({
  t,
  locale,
  subpage = false,
}: {
  t: Dict["nav"];
  locale: Locale;
  /** On subpages, in-page hash anchors must route back to the home page first. */
  subpage?: boolean;
}) {
  const other: Locale = locale === "de" ? "en" : "de";

  // Home: keep "#section" as a same-page anchor for smooth scroll.
  // Subpage: rewrite "#section" -> "/<locale>#section" so it navigates home, then scrolls.
  const isAnchor = (href: string) => href.startsWith("#") && !subpage;
  const resolve = (href: string) =>
    href.startsWith("#") && subpage ? `/${locale}${href}` : href;

  const renderLink = (
    l: { label: string; href: string },
    className: string,
  ) =>
    isAnchor(l.href) ? (
      <a key={l.href} href={l.href} className={className}>
        {l.label}
      </a>
    ) : (
      <Link key={l.href} href={resolve(l.href)} className={className}>
        {l.label}
      </Link>
    );

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-6 md:px-10">
        <Link
          href={`/${locale}`}
          className="text-[15px] font-medium tracking-[0.22em] text-ink"
        >
          ASSADDAR<span className="text-copper">.</span>
        </Link>

        <nav className="hidden items-center gap-4 xl:flex">
          {t.links.map((l) =>
            renderLink(
              l,
              "text-[12px] text-ink2 transition-colors hover:text-ink",
            ),
          )}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 font-mono text-[11px] sm:flex">
            <span className="text-copper" aria-current="true">
              {locale.toUpperCase()}
            </span>
            <span className="text-strong">/</span>
            <Link
              href={`/${other}`}
              className="text-muted transition-colors hover:text-ink"
            >
              {other.toUpperCase()}
            </Link>
          </div>
          <ThemeToggle
            toDark={t.themeToDark}
            toLight={t.themeToLight}
            className="hidden sm:inline-flex"
          />
          <Link
            href={`/${locale}/login`}
            className="hidden items-center gap-1.5 rounded-lg border border-hairline px-3 py-2 text-[13px] font-medium text-ink2 transition-colors hover:border-copper hover:text-copper sm:inline-flex"
          >
            <UserRound className="h-3.5 w-3.5" />
            {t.portal}
          </Link>
          <Link
            href={`/${locale}/termin`}
            className="hidden rounded-lg bg-copper px-4 py-2 text-[13px] font-medium text-oncopper transition-colors hover:bg-copper-hi sm:inline-flex"
          >
            {t.cta}
          </Link>
          <details className="group xl:hidden">
            <summary
              aria-label={t.menu}
              className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-lg border border-hairline text-ink transition-colors hover:border-copper [&::-webkit-details-marker]:hidden"
            >
              <Menu className="h-5 w-5 group-open:hidden" />
              <X className="hidden h-5 w-5 group-open:block" />
            </summary>

            <div className="fixed inset-x-0 top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto border-y border-hairline bg-bg shadow-card xl:hidden">
              <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-1 px-6 py-4">
                {t.links.map((l) =>
                  renderLink(
                    l,
                    "rounded-md px-2 py-2.5 text-sm text-ink2 transition-colors hover:bg-surface hover:text-ink",
                  ),
                )}
                <Link
                  href={`/${locale}/login`}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg border border-hairline px-4 py-3 text-sm font-medium text-ink"
                >
                  <UserRound className="h-4 w-4" />
                  {t.portal}
                </Link>
                <Link
                  href={`/${locale}/termin`}
                  className="inline-flex items-center justify-center rounded-lg bg-copper px-4 py-3 text-sm font-medium text-oncopper"
                >
                  {t.cta}
                </Link>
                <div className="mt-2 flex items-center justify-between px-2">
                  <Link
                    href={`/${other}`}
                    className="py-2 font-mono text-[11px] text-muted transition-colors hover:text-ink"
                  >
                    {locale.toUpperCase()} / {other.toUpperCase()}
                  </Link>
                  <ThemeToggle toDark={t.themeToDark} toLight={t.themeToLight} />
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
