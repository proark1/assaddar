import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getDict, SITE_URL } from "@/content";
import { getPost, posts } from "@/blog/posts";
import { Footer } from "@/components/footer";
import { ThemeToggle } from "@/components/theme-toggle";

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
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      locale: "de_DE",
      title: post.metaTitle,
      description: post.metaDescription,
      url,
      publishedTime: post.date,
    },
  };
}

export default async function BlogArticle({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const t = getDict("de");
  const html = marked.parse(post.body, { async: false }) as string;
  const dateLabel = new Date(post.date).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription,
    inLanguage: "de",
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: "Assad Dar",
      url: "https://linkedin.com/in/assaddar",
    },
    publisher: { "@type": "Person", name: "Assad Dar" },
    mainEntityOfPage: `${SITE_URL}/de/blog/${post.slug}`,
    keywords: post.keywords.join(", "),
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <header className="sticky top-0 z-50 border-b border-hairline bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1120px] items-center justify-between px-6 md:px-10">
          <Link
            href="/de"
            className="text-[15px] font-medium tracking-[0.22em] text-ink"
          >
            ASSADDAR<span className="text-copper">.</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/de#blog"
              className="inline-flex items-center gap-1.5 text-[13px] text-ink2 transition-colors hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" />
              Alle Artikel
            </Link>
            <ThemeToggle toDark={t.nav.themeToDark} toLight={t.nav.themeToLight} />
          </div>
        </div>
      </header>

      <main id="main" className="outline-none">
        <article className="mx-auto w-full max-w-[760px] px-6 py-16 md:px-10 md:py-20">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-copper">
            {post.category}
          </span>
          <h1 className="mt-4 font-serif text-3xl font-normal leading-[1.15] text-ink md:text-[44px]">
            {post.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted">
            <span>{dateLabel}</span>
            <span className="text-strong">·</span>
            <span>{post.readingTimeMin} Min Lesezeit</span>
            <span className="text-strong">·</span>
            <span>Assad Dar</span>
          </div>

          <div
            className="prose prose-neutral mt-10 max-w-none dark:prose-invert prose-headings:font-serif prose-headings:font-normal prose-headings:text-ink prose-h2:mt-12 prose-h2:text-2xl prose-h3:text-lg prose-p:text-ink2 prose-p:leading-relaxed prose-li:text-ink2 prose-strong:text-ink prose-a:text-copper prose-a:font-normal prose-a:no-underline hover:prose-a:underline prose-li:marker:text-copper"
            dangerouslySetInnerHTML={{ __html: html }}
          />

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
              href="/de#kontakt"
              className="group mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-copper px-5 py-3 text-sm font-medium text-oncopper shadow-[0_2px_8px_rgba(166,110,47,0.25)] transition-all hover:-translate-y-0.5 hover:bg-copper-hi"
            >
              {t.finalCta.cta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </article>
      </main>

      <Footer t={t.footer} locale="de" />
    </>
  );
}
