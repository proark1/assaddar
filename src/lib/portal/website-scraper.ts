import sanitizeHtml from "sanitize-html";
import type { ProjectIntelligence } from "./types";

const USER_AGENT = "AssadDar-ASDAR-WebsiteIntelligence/1.0";
const DEFAULT_MAX_PAGES = 14;
const DEFAULT_MAX_DEPTH = 2;
const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_MAX_TEXT_CHARS = 4500;

export type ScrapedWebsitePage = {
  url: string;
  title: string;
  description: string;
  pageType: string;
  statusCode: number;
  depth: number;
  wordCount: number;
  textExcerpt: string;
  discoveredFrom?: string;
  links: string[];
  signals: string[];
  crawledAt: string;
  error?: string;
};

export type WebsiteCrawlIntelligence = Omit<
  ProjectIntelligence,
  "projectId" | "updatedAt"
> & {
  summary: string;
  sourcePages: string[];
  signals: string[];
};

export type WebsiteCrawlResult = {
  normalizedUrl: string;
  pages: ScrapedWebsitePage[];
  intelligence: WebsiteCrawlIntelligence;
  error?: string;
};

type RobotsRules = {
  disallow: string[];
  sitemaps: string[];
};

type QueueEntry = {
  url: string;
  depth: number;
  discoveredFrom?: string;
};

function intEnv(name: string, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(process.env[name] ?? "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function normalizeHost(host: string) {
  return host.toLowerCase().replace(/^www\./, "");
}

function stripTrackingParams(url: URL) {
  for (const key of [...url.searchParams.keys()]) {
    if (
      key.toLowerCase().startsWith("utm_") ||
      key.toLowerCase() === "fbclid" ||
      key.toLowerCase() === "gclid"
    ) {
      url.searchParams.delete(key);
    }
  }
}

export function normalizeWebsiteUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("WEBSITE_URL_REQUIRED");
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  const url = new URL(withProtocol);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("WEBSITE_URL_UNSUPPORTED");
  }
  url.hash = "";
  stripTrackingParams(url);
  if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/+$/, "");
  return url.toString();
}

function canonicalUrl(value: string, base?: string) {
  try {
    const url = new URL(value, base);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    url.hash = "";
    stripTrackingParams(url);
    if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/+$/, "");
    return url.toString();
  } catch {
    return "";
  }
}

function sameSite(url: string, root: URL) {
  try {
    const target = new URL(url);
    return normalizeHost(target.hostname) === normalizeHost(root.hostname);
  } catch {
    return false;
  }
}

function isLikelyDocument(url: string) {
  return !/\.(?:7z|avi|avif|css|csv|docx?|gif|gz|ico|jpe?g|js|json|mp3|mp4|pdf|png|pptx?|rar|svg|webm|webp|xlsx?|xml|zip)(?:[?#]|$)/i.test(
    url,
  );
}

function decodeHtml(value: string) {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    const key = String(entity).toLowerCase();
    if (key.startsWith("#x")) {
      const code = Number.parseInt(key.slice(2), 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    if (key.startsWith("#")) {
      const code = Number.parseInt(key.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return named[key] ?? match;
  });
}

function firstMatch(html: string, pattern: RegExp) {
  return decodeHtml(html.match(pattern)?.[1]?.trim() ?? "");
}

function cleanText(value: string) {
  return decodeHtml(value)
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim();
}

function extractMetaDescription(html: string) {
  const patterns = [
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i,
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:description["'][^>]*>/i,
  ];
  for (const pattern of patterns) {
    const value = firstMatch(html, pattern);
    if (value) return cleanText(value);
  }
  return "";
}

function extractHeadings(html: string) {
  const headings: string[] = [];
  const pattern = /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html))) {
    const text = cleanText(
      sanitizeHtml(match[1] ?? "", { allowedTags: [], allowedAttributes: {} }),
    );
    if (text && text.length < 180) headings.push(text);
  }
  return headings.slice(0, 12);
}

function extractLinks(html: string, pageUrl: string, root: URL) {
  const links = new Set<string>();
  const pattern = /<a\b[^>]*\shref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html))) {
    const raw = match[1] ?? match[2] ?? match[3] ?? "";
    if (/^(?:mailto|tel|sms|javascript):/i.test(raw)) continue;
    const normalized = canonicalUrl(raw, pageUrl);
    if (!normalized || !sameSite(normalized, root) || !isLikelyDocument(normalized)) {
      continue;
    }
    links.add(normalized);
  }
  return [...links];
}

function visibleText(html: string) {
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ");
  return cleanText(
    sanitizeHtml(cleaned, { allowedTags: [], allowedAttributes: {} }),
  );
}

function classifyPage(url: string, title: string, headings: string[]) {
  const haystack = `${new URL(url).pathname} ${title} ${headings.join(" ")}`.toLowerCase();
  if (new URL(url).pathname === "/" || haystack.includes("home")) return "home";
  if (/(about|ueber|uber|team|company|unternehmen)/.test(haystack)) return "about";
  if (/(service|leistung|angebot|solution|loesung|lösung|produkt|product)/.test(haystack)) {
    return "services";
  }
  if (/(case|referenz|kunde|success|portfolio|projekt)/.test(haystack)) {
    return "case_study";
  }
  if (/(price|pricing|preise|paket|plan)/.test(haystack)) return "pricing";
  if (/(blog|news|insight|artikel|resource|wissen)/.test(haystack)) return "content";
  if (/(faq|fragen|help|hilfe|support)/.test(haystack)) return "faq";
  if (/(contact|kontakt|termin|booking|demo)/.test(haystack)) return "contact";
  if (/(career|karriere|jobs|stellen)/.test(haystack)) return "careers";
  if (/(privacy|datenschutz|impressum|legal|terms|agb)/.test(haystack)) return "legal";
  return "page";
}

function detectSignals(url: string, html: string, text: string) {
  const haystack = `${url}\n${html}\n${text}`.toLowerCase();
  const signals = [
    [/contact|kontakt|formular|form\b/, "contact form or contact workflow"],
    [/calendly|cal\.com|booking|termin|schedule/, "appointment booking"],
    [/newsletter|subscribe|abonnieren/, "newsletter or lead nurturing"],
    [/login|portal|dashboard|konto|account/, "login or customer portal"],
    [/shop|cart|checkout|warenkorb|stripe|paypal/, "ecommerce or payment flow"],
    [/blog|news|artikel|insight|resource/, "content marketing"],
    [/download|whitepaper|pdf|brochure|broschuere|broschüre/, "downloadable assets"],
    [/api|integration|webhook|zapier|make\.com/, "integration/API signal"],
    [/datenschutz|privacy|gdpr|dsgvo/, "privacy/GDPR surface"],
    [/career|karriere|jobs|stellen/, "recruiting process"],
  ] as const;
  return signals
    .filter(([pattern]) => pattern.test(haystack))
    .map(([, label]) => label);
}

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      headers: {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.5",
        "user-agent": USER_AGENT,
      },
      redirect: "follow",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function readRobots(root: URL, timeoutMs: number): Promise<RobotsRules> {
  try {
    const robotsUrl = new URL("/robots.txt", root);
    const response = await fetchWithTimeout(robotsUrl.toString(), timeoutMs);
    if (!response.ok) return { disallow: [], sitemaps: [] };
    const text = await response.text();
    const disallow: string[] = [];
    const sitemaps: string[] = [];
    let applies = false;
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.replace(/#.*/, "").trim();
      if (!line) continue;
      const [keyRaw, ...valueParts] = line.split(":");
      const key = keyRaw?.trim().toLowerCase();
      const value = valueParts.join(":").trim();
      if (key === "user-agent") {
        const agent = value.toLowerCase();
        applies = agent === "*" || agent.includes("assaddar");
      } else if (key === "disallow" && applies && value) {
        disallow.push(value);
      } else if (key === "sitemap" && value) {
        sitemaps.push(value);
      }
    }
    return { disallow, sitemaps };
  } catch {
    return { disallow: [], sitemaps: [] };
  }
}

function allowedByRobots(url: string, root: URL, rules: RobotsRules) {
  if (!sameSite(url, root)) return false;
  const target = new URL(url);
  return !rules.disallow.some((path) => {
    if (path === "/") return true;
    return path && target.pathname.startsWith(path);
  });
}

async function sitemapCandidates(root: URL, rules: RobotsRules, timeoutMs: number) {
  const sitemapUrls = rules.sitemaps.length
    ? rules.sitemaps
    : [new URL("/sitemap.xml", root).toString()];
  const urls = new Set<string>();
  for (const sitemapUrl of sitemapUrls.slice(0, 3)) {
    try {
      const normalizedSitemap = canonicalUrl(sitemapUrl, root.toString());
      if (!normalizedSitemap || !sameSite(normalizedSitemap, root)) continue;
      const response = await fetchWithTimeout(normalizedSitemap, timeoutMs);
      if (!response.ok) continue;
      const xml = await response.text();
      for (const match of xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)) {
        const normalized = canonicalUrl(decodeHtml(match[1] ?? ""), root.toString());
        if (normalized && sameSite(normalized, root) && isLikelyDocument(normalized)) {
          urls.add(normalized);
        }
      }
    } catch {
      // Sitemap discovery is an accelerator, not a hard dependency.
    }
  }
  return [...urls];
}

function priority(url: string) {
  const path = new URL(url).pathname.toLowerCase();
  if (path === "/") return 0;
  if (/(about|ueber|uber|service|leistung|angebot|solution|produkt|contact|kontakt)/.test(path)) {
    return 1;
  }
  if (/(case|referenz|pricing|preise|faq|blog|resource)/.test(path)) return 2;
  if (/(privacy|datenschutz|impressum|legal|terms|agb)/.test(path)) return 4;
  return 3;
}

function enqueue(
  queue: QueueEntry[],
  seen: Set<string>,
  entry: QueueEntry,
  root: URL,
  robots: RobotsRules,
  maxDepth: number,
) {
  if (entry.depth > maxDepth) return;
  if (seen.has(entry.url)) return;
  if (!sameSite(entry.url, root)) return;
  if (!isLikelyDocument(entry.url)) return;
  if (!allowedByRobots(entry.url, root, robots)) return;
  seen.add(entry.url);
  queue.push(entry);
  queue.sort((a, b) => priority(a.url) - priority(b.url) || a.depth - b.depth);
}

async function scrapePage(
  entry: QueueEntry,
  root: URL,
  timeoutMs: number,
  maxTextChars: number,
): Promise<ScrapedWebsitePage> {
  const crawledAt = new Date().toISOString();
  try {
    const response = await fetchWithTimeout(entry.url, timeoutMs);
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("xml")) {
      return {
        url: entry.url,
        title: "",
        description: "",
        pageType: "asset",
        statusCode: response.status,
        depth: entry.depth,
        wordCount: 0,
        textExcerpt: "",
        discoveredFrom: entry.discoveredFrom,
        links: [],
        signals: [],
        crawledAt,
        error: "Unsupported content type.",
      };
    }

    const html = await response.text();
    const title = cleanText(firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i));
    const description = extractMetaDescription(html);
    const headings = extractHeadings(html);
    const text = visibleText(html);
    const links = extractLinks(html, response.url || entry.url, root);
    const pageType = classifyPage(response.url || entry.url, title, headings);
    const textExcerpt = text.slice(0, maxTextChars);
    const wordCount = textExcerpt
      .split(/\s+/)
      .map((word) => word.trim())
      .filter(Boolean).length;

    return {
      url: canonicalUrl(response.url || entry.url) || entry.url,
      title,
      description,
      pageType,
      statusCode: response.status,
      depth: entry.depth,
      wordCount,
      textExcerpt,
      discoveredFrom: entry.discoveredFrom,
      links,
      signals: detectSignals(entry.url, html, text),
      crawledAt,
      error: response.ok ? undefined : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      url: entry.url,
      title: "",
      description: "",
      pageType: "error",
      statusCode: 0,
      depth: entry.depth,
      wordCount: 0,
      textExcerpt: "",
      discoveredFrom: entry.discoveredFrom,
      links: [],
      signals: [],
      crawledAt,
      error: error instanceof Error ? error.message : "Request failed.",
    };
  }
}

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function keywordTopics(pages: ScrapedWebsitePage[]) {
  const stopwords = new Set([
    "about",
    "alle",
    "and",
    "auf",
    "aus",
    "bei",
    "das",
    "der",
    "die",
    "for",
    "from",
    "mit",
    "not",
    "oder",
    "our",
    "the",
    "und",
    "von",
    "with",
    "your",
    "you",
  ]);
  const counts = new Map<string, number>();
  for (const page of pages) {
    const source = `${page.title} ${page.description} ${page.textExcerpt.slice(0, 1200)}`;
    for (const word of source.toLowerCase().match(/[a-z0-9äöüß-]{5,}/gi) ?? []) {
      if (stopwords.has(word)) continue;
      counts.set(word, (counts.get(word) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

function pageLines(pages: ScrapedWebsitePage[], type: string, fallbackTypes: string[] = []) {
  const selected = pages.filter(
    (page) => page.pageType === type || fallbackTypes.includes(page.pageType),
  );
  return selected
    .slice(0, 4)
    .map((page) =>
      [page.title, page.description || page.textExcerpt.slice(0, 220)]
        .filter(Boolean)
        .join(": "),
    )
    .filter(Boolean);
}

export function buildWebsiteIntelligence(
  websiteUrl: string,
  pages: ScrapedWebsitePage[],
): WebsiteCrawlIntelligence {
  const successful = pages.filter((page) => page.statusCode >= 200 && page.statusCode < 400);
  const home = successful.find((page) => page.pageType === "home") ?? successful[0];
  const services = pageLines(successful, "services", ["page"]);
  const about = pageLines(successful, "about");
  const cases = pageLines(successful, "case_study");
  const content = pageLines(successful, "content", ["faq"]);
  const signals = unique(successful.flatMap((page) => page.signals));
  const topics = keywordTopics(successful);
  const sourcePages = successful.slice(0, 8).map((page) => page.url);
  const missing = [
    successful.some((page) => page.pageType === "contact") ? "" : "contact path not clearly found",
    successful.some((page) => page.pageType === "pricing") ? "" : "pricing/package information not clearly found",
    signals.some((signal) => signal.includes("portal")) ? "" : "no visible customer portal signal",
    signals.some((signal) => signal.includes("appointment")) ? "" : "no visible appointment booking signal",
  ].filter(Boolean);

  const companyContext = [
    `Website scan for ${websiteUrl}`,
    home?.title ? `Positioning: ${home.title}` : "",
    home?.description ? `Meta description: ${home.description}` : "",
    about.length ? `About/company evidence: ${about.join(" | ")}` : "",
    topics.length ? `Visible topics: ${topics.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const currentTools = [
    signals.length ? `Visible digital signals: ${signals.join(", ")}.` : "",
    successful.some((page) => page.pageType === "legal")
      ? "Legal/privacy pages are present and should be reviewed for consent/data-process fit."
      : "No legal/privacy page was found in the crawl window.",
  ]
    .filter(Boolean)
    .join("\n");

  const dataSituation = [
    `Public website pages crawled: ${successful.length}/${pages.length}.`,
    sourcePages.length ? `Source pages: ${sourcePages.join(", ")}` : "",
    content.length ? `Reusable content/knowledge base candidates: ${content.join(" | ")}` : "",
    cases.length ? `Proof/case-study signals: ${cases.join(" | ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const issues = [
    missing.length ? `Potential website/process gaps: ${missing.join(", ")}.` : "",
    pages.some((page) => page.error)
      ? "Some pages returned errors or unsupported content; crawl results should be reviewed before final diagnosis."
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const opportunities = [
    "Use the public website as the first business-intelligence source for ASDAR analysis.",
    services.length
      ? "Turn visible service/product pages into structured offer, FAQ, and lead-qualification flows."
      : "Ask the client to clarify services/products because the crawl found limited service detail.",
    signals.includes("contact form or contact workflow")
      ? "Automate inquiry triage, qualification, routing, and follow-up from the website contact path."
      : "Create a clearer lead-capture path before deeper automation.",
    content.length
      ? "Convert existing content into a customer-facing assistant, sales enablement snippets, and onboarding knowledge."
      : "Build a small knowledge/content base before deploying customer-facing AI.",
    "Compare the website evidence with interview notes before proposing tools or automations.",
  ].join("\n");

  const internalNotes = [
    "Website intelligence is public-source evidence, not a complete process audit.",
    `Crawled page types: ${unique(successful.map((page) => page.pageType)).join(", ") || "none"}.`,
    services.length ? `Service evidence: ${services.join(" | ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const summary = [
    `Website scan completed for ${websiteUrl}.`,
    `Pages crawled: ${successful.length}/${pages.length}.`,
    home?.title ? `Primary positioning: ${home.title}.` : "",
    signals.length ? `Signals: ${signals.join(", ")}.` : "No strong digital workflow signals found in the crawl window.",
    missing.length ? `Review: ${missing.join(", ")}.` : "Core public website paths look discoverable.",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    companyContext,
    stakeholders: "",
    issues,
    goals: "",
    currentTools,
    dataSituation,
    constraints:
      "Validate website-derived assumptions with the client. Keep personal data and customer-specific details out of external AI prompts unless explicitly approved.",
    opportunities,
    internalNotes,
    summary,
    sourcePages,
    signals,
  };
}

export function formatWebsiteIntelligenceReport(
  intelligence: WebsiteCrawlIntelligence,
) {
  return [
    "Summary:",
    intelligence.summary,
    "",
    "Business context:",
    intelligence.companyContext || "- No strong context extracted.",
    "",
    "Digital signals:",
    intelligence.currentTools || "- No visible tools/signals extracted.",
    "",
    "Data situation:",
    intelligence.dataSituation || "- No source pages captured.",
    "",
    "Risks and gaps:",
    intelligence.issues || "- No obvious website gaps from this crawl.",
    "",
    "AI and digital transformation opportunities:",
    intelligence.opportunities,
    "",
    "Source pages:",
    ...(intelligence.sourcePages.length
      ? intelligence.sourcePages.map((url) => `- ${url}`)
      : ["- None"]),
  ].join("\n");
}

export async function crawlWebsite(inputUrl: string): Promise<WebsiteCrawlResult> {
  const normalizedUrl = normalizeWebsiteUrl(inputUrl);
  const root = new URL(normalizedUrl);
  const maxPages = intEnv("WEBSITE_CRAWL_MAX_PAGES", DEFAULT_MAX_PAGES, 1, 40);
  const maxDepth = intEnv("WEBSITE_CRAWL_MAX_DEPTH", DEFAULT_MAX_DEPTH, 0, 4);
  const timeoutMs = intEnv("WEBSITE_CRAWL_TIMEOUT_MS", DEFAULT_TIMEOUT_MS, 1000, 20000);
  const maxTextChars = intEnv(
    "WEBSITE_CRAWL_MAX_TEXT_CHARS",
    DEFAULT_MAX_TEXT_CHARS,
    800,
    12000,
  );
  const robots = await readRobots(root, timeoutMs);
  const sitemapUrls = await sitemapCandidates(root, robots, timeoutMs);
  const seen = new Set<string>();
  const queue: QueueEntry[] = [];
  const pages: ScrapedWebsitePage[] = [];

  enqueue(queue, seen, { url: normalizedUrl, depth: 0 }, root, robots, maxDepth);
  for (const url of sitemapUrls) {
    enqueue(queue, seen, { url, depth: 1 }, root, robots, maxDepth);
  }

  while (queue.length > 0 && pages.length < maxPages) {
    const entry = queue.shift();
    if (!entry) break;
    const page = await scrapePage(entry, root, timeoutMs, maxTextChars);
    pages.push(page);
    if (page.error || page.depth >= maxDepth) continue;
    for (const link of page.links) {
      enqueue(
        queue,
        seen,
        { url: link, depth: page.depth + 1, discoveredFrom: page.url },
        root,
        robots,
        maxDepth,
      );
    }
  }

  const intelligence = buildWebsiteIntelligence(normalizedUrl, pages);
  const successful = pages.filter((page) => page.statusCode >= 200 && page.statusCode < 400);
  return {
    normalizedUrl,
    pages,
    intelligence,
    error:
      successful.length === 0
        ? "No crawlable HTML pages were discovered for this website."
        : undefined,
  };
}
