import Link from "next/link";
import { marked } from "marked";
import { getDict, type Locale } from "@/content";
import { legal, type LegalKey } from "@/legal";
import { Footer } from "./footer";
import { ThemeToggle } from "./theme-toggle";

export function LegalPage({
  locale,
  docKey,
}: {
  locale: Locale;
  docKey: LegalKey;
}) {
  const t = getDict(locale);
  const doc = legal[locale][docKey];
  const html = marked.parse(doc.body, {
    async: false,
    gfm: true,
    breaks: true,
  }) as string;
  const home = locale === "de" ? "Zur Startseite" : "Back to home";

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-hairline bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1120px] items-center justify-between px-6 md:px-10">
          <Link
            href={`/${locale}`}
            className="text-[15px] font-medium tracking-[0.22em] text-ink"
          >
            ASSADDAR<span className="text-copper">.</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}`}
              className="text-[13px] text-ink2 transition-colors hover:text-ink"
            >
              {home}
            </Link>
            <ThemeToggle toDark={t.nav.themeToDark} toLight={t.nav.themeToLight} />
          </div>
        </div>
      </header>

      <main id="main" className="outline-none">
        <article className="mx-auto w-full max-w-[760px] px-6 py-16 md:px-10 md:py-20">
          <h1 className="font-serif text-3xl font-normal leading-tight text-ink md:text-[40px]">
            {doc.title}
          </h1>
          <div
            className="prose prose-neutral mt-8 max-w-none dark:prose-invert prose-headings:font-serif prose-headings:font-normal prose-headings:text-ink prose-h2:mt-10 prose-h2:text-xl prose-p:text-ink2 prose-p:leading-relaxed prose-li:text-ink2 prose-strong:text-ink prose-a:text-copper prose-a:font-normal prose-a:break-words hover:prose-a:underline prose-li:marker:text-copper prose-hr:border-hairline"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>
      </main>

      <Footer t={t.footer} locale={locale} />
    </>
  );
}
