import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getDict, SITE_URL } from "@/content";
import { posts, type BlogPost } from "@/blog/posts";
import {
  getBlogHeroMap,
  type BlogHeroRecord,
} from "@/lib/blog-hero/store";
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

function BlogPostVisual({
  post,
  hero,
  priority = false,
}: {
  post: BlogPost;
  hero?: BlogHeroRecord;
  priority?: boolean;
}) {
  if (hero) {
    return (
      <Image
        src={`/api/blog/hero/${post.slug}?v=${encodeURIComponent(hero.generatedAt)}`}
        alt={hero.alt || post.title}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        priority={priority}
        unoptimized
      />
    );
  }

  if (post.heroImage) {
    return (
      <Image
        src={post.heroImage.src}
        alt={post.heroImage.alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        priority={priority}
      />
    );
  }

  return (
    <div className="absolute inset-0 bg-surface2">
      <svg
        viewBox="0 0 1200 675"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <path
          d="M0 310 C 220 310 260 510 480 510 C 700 510 740 300 980 300 C 1100 300 1140 480 1200 480"
          fill="none"
          strokeWidth="2"
          className="stroke-slate opacity-50"
        />
        <path
          d="M0 485 C 200 485 240 215 440 215 C 640 215 680 450 880 450 C 1040 450 1090 225 1200 225"
          fill="none"
          strokeWidth="2"
          className="stroke-copper"
        />
        <circle cx="440" cy="215" r="7" strokeWidth="2" className="fill-bg stroke-copper" />
        <circle cx="880" cy="450" r="7" strokeWidth="2" className="fill-bg stroke-copper" />
        <circle cx="1090" cy="225" r="6" className="fill-copper" />
        <circle cx="480" cy="510" r="6" strokeWidth="2" className="fill-bg stroke-slate" />
      </svg>
      <div className="absolute left-5 top-5 font-mono text-[11px] uppercase tracking-[0.16em] text-copper">
        {post.category}
      </div>
      <div className="absolute bottom-5 right-5 text-[12px] font-medium tracking-[0.2em] text-strong">
        ASSADDAR<span className="text-copper">.</span>
      </div>
    </div>
  );
}

export default async function BlogIndex() {
  const t = getDict("de");
  const heroMap = await getBlogHeroMap();
  const featured = posts[0];
  const remainingPosts = posts.slice(1);

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
            <div className="mt-7 flex flex-wrap gap-2">
              {categories.map((category) => (
                <span
                  key={category}
                  className="rounded-md border border-hairline bg-surface px-3 py-1.5 text-[12px] text-ink2"
                >
                  {category}
                </span>
              ))}
            </div>
          </header>

          {featured && (
            <section className="mt-12">
              <Link
                href={`/de/blog/${featured.slug}`}
                className="group grid overflow-hidden rounded-xl border border-hairline bg-surface shadow-card transition-colors hover:border-copper lg:grid-cols-[1.15fr_0.85fr]"
              >
                <div className="relative aspect-[16/9] overflow-hidden lg:aspect-auto lg:min-h-[360px]">
                  <BlogPostVisual
                    post={featured}
                    hero={heroMap[featured.slug]}
                    priority
                  />
                </div>
                <div className="flex flex-col p-6 md:p-8">
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-copper">
                    {featured.category}
                  </span>
                  <h2 className="mt-4 font-serif text-2xl font-normal leading-tight text-ink md:text-3xl">
                    {featured.title}
                  </h2>
                  <p className="mt-4 flex-1 text-base leading-relaxed text-ink2">
                    {featured.teaser}
                  </p>
                  <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-5">
                    <span className="text-[12px] text-muted">
                      {featured.readingTimeMin} Min Lesezeit
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-copper">
                      {t.blog.readMore}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </section>
          )}

          <section className="mt-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-normal text-ink md:text-3xl">
                  Alle Artikel
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Praxisnahe Beiträge zu KI, Automatisierung, Prozessen und Branchen.
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {remainingPosts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/de/blog/${p.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border border-hairline bg-surface shadow-card transition-colors hover:border-copper"
                >
                  <div className="relative aspect-[16/9] overflow-hidden border-b border-hairline">
                    <BlogPostVisual post={p} hero={heroMap[p.slug]} />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-copper">
                      {p.category}
                    </span>
                    <h3 className="mt-3 font-serif text-lg leading-snug text-ink">
                      {p.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink2">
                      {p.teaser}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-muted">
                      {p.readingTimeMin} Min · {t.blog.readMore}
                      <ArrowRight className="h-3.5 w-3.5 text-copper transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer t={t.footer} locale="de" />
    </>
  );
}
