import { posts } from "@/blog/posts";

// Shared brand style for every generated hero. English (image models follow it best).
export const HERO_BRAND_PALETTE =
  "Use only the ASSADDAR brand palette: warm cream background #f7f5f1, white/shell highlights #ffffff, " +
  "deep ink charcoal #16191e, muted grey #5f6671, restrained slate #3e5573, and one refined copper accent #a66e2f. ";

export const HERO_STYLE =
  "Strict ASSADDAR brand hero image. Abstract editorial illustration for a premium, senior AI- and process-consulting blog. " +
  "Wide website banner composition, safe for a 16:6 crop, with the main motif centered and lots of negative space. " +
  HERO_BRAND_PALETTE +
  "Clean geometric line-art, subtle connected nodes and flowing lines, soft depth, flat and modern. " +
  "Consistent restrained consulting aesthetic across every article; not stock-photo, not photorealistic, not cartoonish. " +
  "Absolutely no text, no words, no letters, no numbers, no logos, no UI, no people, no faces, " +
  "no literal robots, no sci-fi neon clichés. Understated and elegant.";

const SUBJECTS: Record<string, string> = {
  "ki-im-unternehmen-einfuehren":
    "a clear entry point — many scattered manual tasks converging into one calm, ordered path",
  "prozesse-mit-ki-automatisieren":
    "repetitive process loops being streamlined into a few smooth, automated flows",
  "asdar-method":
    "a five-step pipeline of connected nodes flowing left to right, each building on the previous",
  "ki-in-der-pflege":
    "gentle, steady care expressed through soft interlocking shapes and a calm pulse line, with documentation flowing effortlessly",
  "ki-im-autohandel":
    "a dealership funnel turning many incoming inquiries into fast, organized follow-ups",
  "ki-fuer-immobilienmakler":
    "abstract buildings as simple geometric blocks; property listings and inquiries organized into a clean responsive pipeline",
  "ki-fuer-reinigungsservices":
    "scheduling, shifts and routes for a service business arranged into tidy, ordered grids",
  "ki-und-datenschutz":
    "a protective shield over flowing data streams — a careful balance of openness and control",
  "ai-act-und-ki-kompetenz":
    "a balanced framework of rules and competence — abstract scales and structured guideline lines",
  "warum-ki-projekte-scheitern":
    "a tangled knot of process lines untangling into one clean, correct path",
  "ki-im-handwerk":
    "abstract craft tools and workshop order meeting subtle digital structure",
  "ki-fuer-arztpraxen":
    "a calm medical-practice rhythm — appointments and documents organized into a steady, gentle flow (abstract, no people)",
  "ki-in-der-steuerkanzlei":
    "documents and figures organized into precise, reconciled columns and ledgers (abstract, no readable text)",
  "ki-in-der-gastronomie":
    "restaurant operations — reservations, orders and shifts flowing in smooth, coordinated rhythm",
  "ki-im-ecommerce":
    "an online-shop funnel — catalog, recommendations and orders flowing efficiently",
  "ki-fuer-agenturen":
    "an agency studio — briefs turning into content and campaigns through an organized creative pipeline",
};

export function heroSubject(slug: string): string {
  const post = posts.find((p) => p.slug === slug);
  return (
    SUBJECTS[slug] ??
    (post
      ? `an abstract motif evoking the theme: ${post.title}`
      : "an abstract process-and-AI motif")
  );
}

/** A ready-to-edit default image prompt for an article's hero. */
export function defaultHeroPrompt(slug: string): string {
  return `Subject: ${heroSubject(slug)}.`;
}

export function buildHeroGenerationPrompt(slug: string, adminPrompt: string): string {
  const post = posts.find((p) => p.slug === slug);
  return [
    HERO_STYLE,
    post ? `Article title: ${post.title}.` : "",
    `Required subject: ${heroSubject(slug)}.`,
    adminPrompt.trim()
      ? `Additional direction from admin, while preserving the locked ASSADDAR style: ${adminPrompt.trim()}`
      : "",
    "Final output must feel like one coherent branded image system with the other ASSADDAR blog hero images.",
  ]
    .filter(Boolean)
    .join(" ");
}
