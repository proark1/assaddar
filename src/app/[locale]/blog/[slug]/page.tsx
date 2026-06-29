import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { ArrowRight, CalendarDays, Check, Gauge } from "lucide-react";
import { getDict, SITE_URL } from "@/content";
import { getPost, posts } from "@/blog/posts";
import { enrich } from "@/blog/enrich";
import { getBlogHero } from "@/lib/blog-hero/store";
import { sanitizeRenderedHtml } from "@/lib/markdown";
import {
  extractSections,
  injectHeadingIds,
  relatedPosts,
  wordCount,
} from "@/blog/utils";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ReadingProgress } from "@/components/reading-progress";
import { ArticleToc } from "@/components/article-toc";
import { AuthorBio } from "@/components/author-bio";
import { RelatedArticles } from "@/components/related-articles";
import { BlogFigure, BlogHero, type FigureSpec } from "@/components/blog-figures";
import { JsonLd } from "@/components/json-ld";

export const dynamicParams = false;

// Blog articles are German-only.
export function generateStaticParams() {
  return posts.map((p) => ({ locale: "de", slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const url = `/de/blog/${post.slug}`;
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    keywords: post.keywords,
    authors: [{ name: "Assad Dar", url: `${SITE_URL}/de/ueber-mich` }],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      locale: "de_DE",
      title: post.metaTitle,
      description: post.metaDescription,
      url,
      publishedTime: post.date,
      modifiedTime: post.updatedAt ?? post.date,
      authors: ["Assad Dar"],
      section: post.category,
      tags: post.keywords,
    },
  };
}

const PROSE_CLASS =
  "prose prose-neutral max-w-none dark:prose-invert " +
  "prose-headings:font-serif prose-headings:font-normal prose-headings:text-ink " +
  "prose-h2:mt-12 prose-h2:text-2xl prose-h2:scroll-mt-24 " +
  "prose-h3:text-lg prose-h3:scroll-mt-24 " +
  "prose-p:text-[17px] prose-p:text-ink2 prose-p:leading-[1.75] " +
  "prose-li:text-[17px] prose-li:text-ink2 prose-li:leading-[1.7] prose-li:marker:text-copper " +
  "prose-strong:text-ink prose-strong:font-medium " +
  "prose-a:text-copper prose-a:font-normal prose-a:no-underline hover:prose-a:underline " +
  "prose-blockquote:border-copper prose-blockquote:not-italic prose-blockquote:font-normal prose-blockquote:text-ink " +
  "prose-table:text-[15px] prose-th:text-ink prose-th:border-hairline prose-td:text-ink2 prose-td:border-hairline " +
  "prose-hr:border-hairline prose-figure:my-8";

export default async function BlogArticle({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const t = getDict("de");
  const generatedHero = await getBlogHero(post.slug);

  // Render body to HTML with heading ids, then inject enrichment figures after their target heading.
  const sections = extractSections(post.body);
  const enrichment = enrich[post.slug];
  const keyTakeaways = enrichment?.keyTakeaways;

  const figByHeadingId: Record<string, FigureSpec> = {};
  for (const f of enrichment?.figures ?? []) {
    const sec = sections.find((s) => s.text.includes(f.afterHeadingIncludes));
    if (sec && !(sec.id in figByHeadingId)) figByHeadingId[sec.id] = f.spec;
  }

  let fullHtml = injectHeadingIds(
    marked.parse(post.body, { async: false }) as string,
    sections,
    { i: 0 },
  );
  for (const id of Object.keys(figByHeadingId)) {
    fullHtml = fullHtml.replace(
      new RegExp(`(<(h[23]) id="${id}">[\\s\\S]*?</\\2>)`),
      `$1<!--FIG:${id}-->`,
    );
  }
  const segments = fullHtml.split(/<!--FIG:([\w-]+)-->/);

  const related = relatedPosts(post, posts, 3);
  const words = wordCount(post.body);
  const published = post.date;
  const modified = post.updatedAt ?? post.date;
  const dateLabel = new Date(published).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const articleUrl = `${SITE_URL}/de/blog/${post.slug}`;
  const personId = `${SITE_URL}/#assad-dar`;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${articleUrl}#article`,
    headline: post.title,
    description: post.metaDescription,
    inLanguage: "de-DE",
    datePublished: published,
    dateModified: modified,
    wordCount: words,
    articleSection: post.category,
    keywords: post.keywords.join(", "),
    mainEntityOfPage: articleUrl,
    image: `${articleUrl}/opengraph-image`,
    author: {
      "@type": "Person",
      "@id": personId,
      name: "Assad Dar",
      url: `${SITE_URL}/de/ueber-mich`,
      jobTitle: "Digital- & KI-Transformationsberater",
      sameAs: ["https://linkedin.com/in/assaddar"],
    },
    publisher: { "@type": "Person", "@id": personId, name: "Assad Dar" },
    isPartOf: {
      "@type": "Blog",
      "@id": `${SITE_URL}/de/blog#blog`,
      name: "ASSADDAR Blog",
    },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Start", item: `${SITE_URL}/de` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/de/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: articleUrl },
    ],
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <JsonLd data={articleLd} />
      <JsonLd data={breadcrumbLd} />
      {post.faq.length > 0 && <JsonLd data={faqLd} />}

      <ReadingProgress />
      <Nav t={t.nav} locale="de" subpage />

      <main id="main" className="outline-none">
        <div className="mx-auto w-full max-w-[1120px] px-6 py-12 md:px-10 md:py-16">
          {/* Breadcrumb */}
          <nav
            aria-label="Brotkrumen"
            className="flex flex-wrap items-center gap-1.5 text-[12px] text-muted"
          >
            <Link href="/de" className="transition-colors hover:text-ink">
              Start
            </Link>
            <span className="text-strong">/</span>
            <Link href="/de/blog" className="transition-colors hover:text-ink">
              Blog
            </Link>
            <span className="text-strong">/</span>
            <span className="text-ink2">{post.category}</span>
          </nav>

          {/* Header */}
          <header className="mt-6 max-w-[760px]">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-copper">
              {post.category}
            </span>
            <h1 className="mt-3 font-serif text-3xl font-normal leading-[1.12] text-ink md:text-[44px]">
              {post.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink2">
              {post.teaser}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-muted">
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-copper font-serif text-[11px] text-oncopper"
                >
                  AD
                </span>
                <Link
                  href="/de/ueber-mich"
                  className="text-ink2 transition-colors hover:text-ink"
                >
                  Assad Dar
                </Link>
              </span>
              <span className="text-strong">·</span>
              <time dateTime={published}>{dateLabel}</time>
              <span className="text-strong">·</span>
              <span>{post.readingTimeMin} Min Lesezeit</span>
            </div>
          </header>

          {/* Hero */}
          <div className="mt-8 max-w-[760px]">
            {generatedHero ? (
              <figure className="overflow-hidden rounded-2xl border border-hairline">
                <div className="relative aspect-[16/6] w-full">
                  <Image
                    src={`/api/blog/hero/${post.slug}?v=${encodeURIComponent(generatedHero.generatedAt)}`}
                    alt={generatedHero.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 760px"
                    className="object-cover"
                    priority
                    unoptimized
                  />
                </div>
                {generatedHero.caption && (
                  <figcaption className="mt-2 text-center text-[12px] text-muted">
                    {generatedHero.caption}
                  </figcaption>
                )}
              </figure>
            ) : post.heroImage ? (
              <figure className="overflow-hidden rounded-2xl border border-hairline">
                <Image
                  src={post.heroImage.src}
                  alt={post.heroImage.alt}
                  width={post.heroImage.width}
                  height={post.heroImage.height}
                  className="h-auto w-full"
                  priority
                />
                {post.heroImage.caption && (
                  <figcaption className="mt-2 text-center text-[12px] text-muted">
                    {post.heroImage.caption}
                  </figcaption>
                )}
              </figure>
            ) : (
              <BlogHero category={post.category} />
            )}
          </div>

          {/* Body + sticky TOC */}
          <div className="mt-12 lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-12">
            <article className="min-w-0 max-w-[760px]">
              <ArticleToc sections={sections} variant="inline" />

              {keyTakeaways && keyTakeaways.length > 0 && (
                <div className="mb-10 rounded-2xl border border-copper/30 bg-surface2 p-6 md:p-7">
                  <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-copper">
                    Das Wichtigste in Kürze
                  </div>
                  <ul className="mt-4 space-y-2.5">
                    {keyTakeaways.map((k, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-[15px] leading-relaxed text-ink2"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
                        <span>{k}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mb-10 grid gap-4 md:grid-cols-2">
                <Link
                  href="/de#readiness-check"
                  className="group rounded-2xl border border-copper/30 bg-copper/10 p-5 transition-colors hover:border-copper"
                >
                  <Gauge className="h-5 w-5 text-copper" />
                  <h2 className="mt-3 text-base font-medium text-ink">
                    ASDAR Potenzial-Check starten
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink2">
                    Prüfen Sie in wenigen Minuten, ob Ihr Prozess reif für KI
                    und Automatisierung ist.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-copper">
                    Check starten
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
                <Link
                  href="/de/termin"
                  className="group rounded-2xl border border-hairline bg-surface p-5 shadow-card transition-colors hover:border-copper"
                >
                  <CalendarDays className="h-5 w-5 text-copper" />
                  <h2 className="mt-3 text-base font-medium text-ink">
                    Prozess kurz einordnen lassen
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink2">
                    30 Minuten reichen oft, um den ersten realistischen
                    KI-Hebel zu erkennen.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-copper">
                    Erstgespräch buchen
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </div>

              <div className={PROSE_CLASS}>
                {segments.map((seg, idx) =>
                  idx % 2 === 1 ? (
                    figByHeadingId[seg] ? (
                      <div key={idx} className="not-prose my-10">
                        <BlogFigure spec={figByHeadingId[seg]} />
                      </div>
                    ) : null
                  ) : seg ? (
                    <div
                      key={idx}
                      dangerouslySetInnerHTML={{
                        __html: sanitizeRenderedHtml(seg),
                      }}
                    />
                  ) : null,
                )}
              </div>

              <AuthorBio />

              <RelatedArticles posts={related} />

              {post.faq.length > 0 && (
                <section className="mt-16 border-t border-hairline pt-10">
                  <h2 className="font-serif text-2xl font-normal text-ink">
                    Häufige Fragen
                  </h2>
                  <dl className="mt-6 space-y-6">
                    {post.faq.map((f, i) => (
                      <div key={i}>
                        <dt className="text-base font-medium text-ink">{f.q}</dt>
                        <dd className="mt-2 text-sm leading-relaxed text-ink2">
                          {f.a}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}

              <div className="mt-16 rounded-2xl border border-copper/30 bg-surface2 p-8 text-center shadow-card md:p-10">
                <h2 className="font-serif text-2xl font-normal text-ink">
                  {t.finalCta.heading}
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink2">
                  {t.finalCta.sub}
                </p>
                <Link
                  href="/de/termin"
                  className="group mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-copper px-5 py-3 text-sm font-medium text-oncopper shadow-[0_2px_8px_rgba(166,110,47,0.25)] transition-all hover:-translate-y-0.5 hover:bg-copper-hi"
                >
                  {t.finalCta.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </article>

            <aside className="hidden lg:block">
              <ArticleToc sections={sections} variant="rail" />
              <div className="mt-6 rounded-2xl border border-copper/30 bg-copper/10 p-5">
                <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-copper">
                  Nächster Schritt
                </div>
                <h2 className="mt-2 text-base font-medium text-ink">
                  Welcher Prozess lohnt sich?
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink2">
                  Nutzen Sie den ASDAR Potenzial-Check oder buchen Sie direkt
                  ein kurzes Gespräch.
                </p>
                <div className="mt-4 grid gap-2">
                  <Link
                    href="/de#readiness-check"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-copper px-3 py-2 text-[12px] font-medium text-oncopper transition-colors hover:bg-copper-hi"
                  >
                    Check starten
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href="/de/termin"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-hairline px-3 py-2 text-[12px] font-medium text-ink transition-colors hover:border-copper hover:text-copper"
                  >
                    Erstgespräch
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer t={t.footer} locale="de" />
    </>
  );
}
