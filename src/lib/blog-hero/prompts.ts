import { posts } from "@/blog/posts";

// Shared brand style for every generated hero. English (image models follow it best).
export const HERO_STYLE =
  "Abstract editorial brand illustration for a premium, senior AI- and process-consulting blog. " +
  "Wide 16:9 banner composition. Calm, sophisticated, lots of negative space. " +
  "Muted warm paper-and-charcoal palette with a single refined copper accent (#a66e2f). " +
  "Clean geometric line-art, subtle connected nodes and flowing lines, soft depth, flat and modern. " +
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

/** A ready-to-edit default image prompt for an article's hero. */
export function defaultHeroPrompt(slug: string): string {
  const post = posts.find((p) => p.slug === slug);
  const subject =
    SUBJECTS[slug] ??
    (post
      ? `an abstract motif evoking the theme: ${post.title}`
      : "an abstract process-and-AI motif");
  return `${HERO_STYLE} Subject: ${subject}.`;
}
