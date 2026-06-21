import { isLocale, type Locale } from "@/content";
import { posts } from "@/blog/posts";
import { requireAdmin } from "@/lib/portal/auth";
import { getBlogHeroMap } from "@/lib/blog-hero/store";
import { defaultHeroPrompt } from "@/lib/blog-hero/prompts";
import {
  generateBlogHeroAction,
  deleteBlogHeroAction,
} from "@/app/actions/blog-hero";
import {
  Badge,
  PortalCard,
  PortalSectionTitle,
  PortalShell,
  textareaClass,
} from "@/components/portal/chrome";

export const dynamic = "force-dynamic";

export default async function BlogHeroAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ generated?: string; removed?: string; error?: string }>;
}) {
  const { locale } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const user = await requireAdmin(safe);
  const query = await searchParams;
  const heroes = await getBlogHeroMap();

  return (
    <PortalShell
      user={user}
      locale={safe}
      eyebrow="Admin"
      title="Blog Hero-Bilder"
      backHref={`/${safe}/portal/admin`}
    >
      {query.generated && (
        <div className="mb-6 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          Hero-Bild für „{query.generated}" generiert und veröffentlicht.
        </div>
      )}
      {query.removed && (
        <div className="mb-6 rounded-lg border border-copper/30 bg-copper/10 px-4 py-3 text-sm text-copper">
          Hero-Bild für „{query.removed}" entfernt — der Artikel nutzt wieder den SVG-Hero.
        </div>
      )}
      {query.error && (
        <div className="mb-6 rounded-lg border border-critical/30 bg-critical/10 px-4 py-3 text-sm text-critical">
          {query.error === "input"
            ? "Bitte einen aussagekräftigen Prompt eingeben."
            : `Generierung fehlgeschlagen: ${query.error}`}
        </div>
      )}

      <PortalCard className="mb-8">
        <PortalSectionTitle eyebrow="So funktioniert's" title="KI-Hero-Bilder pro Artikel">
          Prompt prüfen oder anpassen, dann „Generieren". Das Bild wird über die
          OpenAI-Bild-API erzeugt, gespeichert und sofort auf der Artikelseite
          ausgespielt. Ohne generiertes Bild zeigt der Artikel den gebrandeten
          SVG-Hero. Benötigt einen gesetzten <code>OPENAI_API_KEY</code>.
        </PortalSectionTitle>
      </PortalCard>

      <div className="grid gap-5 lg:grid-cols-2">
        {posts.map((post) => {
          const existing = heroes[post.slug];
          const promptValue = existing?.prompt ?? defaultHeroPrompt(post.slug);
          return (
            <PortalCard key={post.slug}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge tone="copper">{post.category}</Badge>
                  <h3 className="mt-2 font-serif text-lg text-ink">{post.title}</h3>
                </div>
                {existing && <Badge tone="green">Aktiv</Badge>}
              </div>

              {existing && (
                <div className="mt-4 overflow-hidden rounded-lg border border-hairline">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/blog/hero/${post.slug}?v=${encodeURIComponent(existing.generatedAt)}`}
                    alt={existing.alt}
                    className="aspect-[16/6] w-full object-cover"
                  />
                </div>
              )}

              <form action={generateBlogHeroAction} className="mt-4 space-y-3">
                <input type="hidden" name="slug" value={post.slug} />
                <label className="block">
                  <span className="mb-1.5 block font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">
                    Bild-Prompt
                  </span>
                  <textarea
                    name="prompt"
                    defaultValue={promptValue}
                    className={textareaClass}
                  />
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
                  >
                    {existing ? "Neu generieren" : "Generieren"}
                  </button>
                  {existing && (
                    <span className="text-[12px] text-muted">
                      Zuletzt: {new Date(existing.generatedAt).toLocaleString("de-DE")}
                    </span>
                  )}
                </div>
              </form>

              {existing && (
                <form action={deleteBlogHeroAction} className="mt-3">
                  <input type="hidden" name="slug" value={post.slug} />
                  <button
                    type="submit"
                    className="text-[12px] text-muted underline-offset-2 transition-colors hover:text-critical hover:underline"
                  >
                    Hero-Bild entfernen
                  </button>
                </form>
              )}
            </PortalCard>
          );
        })}
      </div>
    </PortalShell>
  );
}
