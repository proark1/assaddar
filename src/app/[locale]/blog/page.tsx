import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getDict, SITE_URL } from "@/content";
import { posts } from "@/blog/posts";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

export const dynamicParams = false;

// The blog is German-only → only /de/blog is generated; /en/blog 404s.
export function generateStaticParams() {
  return [{ locale: "de" }];
}

export function generateMetadata(): Metadata {
  const t = getDict("de");
  const url = "/de/blog";
  return {
    title: "Blog — KI, Automatisierung & digitale Effizienz | Assad Dar",
    description: t.blog.intro,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "de_DE",
      title: "Blog — KI, Automatisierung & digitale Effizienz",
      description: t.blog.intro,
      url,
    },
  };
}

export default function BlogIndex() {
  const t = getDict("de");

  const categories: string[] = [];
  for (const p of posts) {
    if (!categories.includes(p.category)) categories.push(p.category);
  }

  const blogLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE_URL}/de/blog#blog`,
    name: "ASSADDAR Blog",
    description: t.blog.intro,
    url: `${SITE_URL}/de/blog`,
    inLanguage: "de-DE",
    author: { "@type": "Person", "@id": `${SITE_URL}/#assad-dar`, name: "Assad Dar" },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${SITE_URL}/de/blog/${p.slug}`,
      datePublished: p.date,
      dateModified: p.updatedAt ?? p.date,
    })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Start", item: `${SITE_URL}/de` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/de/blog` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <Nav t={t.nav} locale="de" subpage />

      <main id="main" className="outline-none">
        <div className="mx-auto w-full max-w-[1120px] px-6 py-16 md:px-10 md:py-20">
          <nav
            aria-label="Brotkrumen"
            className="flex flex-wrap items-center gap-1.5 text-[12px] text-muted"
          >
            <Link href="/de" className="transition-colors hover:text-ink">
              Start
            </Link>
            <span className="text-strong">/</span>
            <span className="text-ink2">Blog</span>
          </nav>

          <header className="mt-6 max-w-3xl">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-copper">
              {t.blog.kicker}
            </span>
            <h1 className="mt-4 font-serif text-3xl font-normal leading-[1.15] text-ink md:text-[44px]">
              {t.blog.heading}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink2">
              {t.blog.intro}
            </p>
          </header>

          {categories.map((category) => (
            <section key={category} className="mt-16">
              <h2 className="font-mono text-[12px] uppercase tracking-[0.16em] text-copper">
                {category}
              </h2>
              <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {posts
                  .filter((p) => p.category === category)
                  .map((p) => (
                    <Link
                      key={p.slug}
                      href={`/de/blog/${p.slug}`}
                      className="group flex h-full flex-col rounded-xl border border-hairline bg-surface p-6 shadow-card transition-colors hover:border-copper"
                    >
                      <h3 className="font-serif text-lg leading-snug text-ink">
                        {p.title}
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink2">
                        {p.teaser}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-muted">
                        {p.readingTimeMin} Min · {t.blog.readMore}
                        <ArrowRight className="h-3.5 w-3.5 text-copper transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer t={t.footer} locale="de" />
    </>
  );
}
