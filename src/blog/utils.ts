import type { BlogPost } from "./posts";

/** Slugify German heading text into a stable anchor id. */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export type Section = { id: string; text: string; level: 2 | 3 };

/** Parse h2/h3 headings out of a markdown body, in document order, with unique ids. */
export function extractSections(body: string): Section[] {
  const sections: Section[] = [];
  const seen = new Map<string, number>();
  for (const raw of body.split("\n")) {
    const m = /^(#{2,3})\s+(.+?)\s*$/.exec(raw);
    if (!m) continue;
    const level = m[1].length as 2 | 3;
    const text = m[2].replace(/[*_`]/g, "").trim();
    let id = slugifyHeading(text);
    const n = seen.get(id) ?? 0;
    seen.set(id, n + 1);
    if (n > 0) id = `${id}-${n}`;
    sections.push({ id, text, level });
  }
  return sections;
}

/**
 * Inject the pre-computed section ids into rendered <h2>/<h3> tags, in order.
 * `cursor` is shared across body segments so ids stay aligned when the body is
 * split on figure markers.
 */
export function injectHeadingIds(
  html: string,
  sections: Section[],
  cursor: { i: number },
): string {
  return html.replace(
    /<(h[23])>([\s\S]*?)<\/\1>/g,
    (_m, tag: string, inner: string) => {
      const sec = sections[cursor.i++];
      return `<${tag}${sec ? ` id="${sec.id}"` : ""}>${inner}</${tag}>`;
    },
  );
}

/** Rough word count from a markdown body (for schema wordCount). */
export function wordCount(body: string): number {
  return body
    .replace(/\[\[figure:[\w-]+\]\]/g, " ")
    .replace(/[#>*_`]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

/**
 * Related-article scoring: +3 same category, +1 per shared keyword, newest first
 * as tiebreak. `relatedSlugs` (if set) are forced to the front.
 */
export function relatedPosts(
  current: BlogPost,
  all: BlogPost[],
  n = 3,
): BlogPost[] {
  const picked: BlogPost[] = [];
  for (const slug of current.relatedSlugs ?? []) {
    const p = all.find((x) => x.slug === slug);
    if (p && !picked.some((x) => x.slug === p.slug)) picked.push(p);
  }

  const kw = new Set(current.keywords);
  const scored = all
    .filter((p) => p.slug !== current.slug)
    .map((p) => {
      let score = p.category === current.category ? 3 : 0;
      for (const k of p.keywords) if (kw.has(k)) score += 1;
      return { p, score };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        new Date(b.p.date).getTime() - new Date(a.p.date).getTime(),
    );

  for (const { p } of scored) {
    if (picked.length >= n) break;
    if (!picked.some((x) => x.slug === p.slug)) picked.push(p);
  }
  return picked.slice(0, n);
}
