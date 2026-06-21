import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BlogPost } from "@/blog/posts";

/** "Weiterlesen" — related articles, keeps readers in the content. */
export function RelatedArticles({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) return null;
  return (
    <section className="mt-16 border-t border-hairline pt-10">
      <h2 className="font-serif text-2xl font-normal text-ink">Weiterlesen</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <Link
            key={p.slug}
            href={`/de/blog/${p.slug}`}
            className="group flex h-full flex-col rounded-xl border border-hairline bg-surface p-5 shadow-card transition-colors hover:border-copper"
          >
            <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-copper">
              {p.category}
            </span>
            <h3 className="mt-2 font-serif text-base leading-snug text-ink">
              {p.title}
            </h3>
            <span className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-muted">
              {p.readingTimeMin} Min
              <ArrowRight className="h-3.5 w-3.5 text-copper transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
