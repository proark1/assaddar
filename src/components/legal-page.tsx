import { getDict, type Locale } from "@/content";
import { legal, type LegalKey } from "@/legal";
import { renderMarkdownToSafeHtml } from "@/lib/markdown";
import { Nav } from "./nav";
import { Footer } from "./footer";

export function LegalPage({
  locale,
  docKey,
}: {
  locale: Locale;
  docKey: LegalKey;
}) {
  const t = getDict(locale);
  const doc = legal[locale][docKey];
  const html = renderMarkdownToSafeHtml(doc.body);

  return (
    <>
      <Nav t={t.nav} locale={locale} subpage />

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
