import type { ProjectBundle } from "./types";
import { crawlWebsite, normalizeWebsiteUrl } from "./website-scraper";

type PublicResearchInput = {
  bundle: ProjectBundle;
  topic: string;
  processContext: string;
  competitorUrls: string[];
};

function cleanLines(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean);
}

function bulletList(values: string[]) {
  return values.length ? values.map((value) => `- ${value}`).join("\n") : "- None";
}

function firstSentences(value: string, max = 2) {
  return value
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, max)
    .join(" ");
}

function unique(values: string[]) {
  return [...new Set(cleanLines(values))];
}

export async function buildPublicResearchReport({
  bundle,
  topic,
  processContext,
  competitorUrls,
}: PublicResearchInput) {
  const normalizedUrls = unique(competitorUrls)
    .slice(0, 4)
    .map((url) => {
      try {
        return normalizeWebsiteUrl(url);
      } catch {
        return "";
      }
    })
    .filter(Boolean);

  const competitorFindings = [];
  for (const url of normalizedUrls) {
    try {
      const crawl = await crawlWebsite(url);
      competitorFindings.push({
        url: crawl.normalizedUrl,
        ok: !crawl.error,
        summary: crawl.intelligence.summary,
        signals: crawl.intelligence.signals,
        opportunities: crawl.intelligence.opportunities,
        sourcePages: crawl.intelligence.sourcePages.slice(0, 5),
        error: crawl.error,
      });
    } catch (error) {
      competitorFindings.push({
        url,
        ok: false,
        summary: "",
        signals: [],
        opportunities: "",
        sourcePages: [],
        error: error instanceof Error ? error.message : "Research crawl failed.",
      });
    }
  }

  const competitorSignals = unique(
    competitorFindings.flatMap((finding) => finding.signals),
  );
  const sourcePages = competitorFindings.flatMap((finding) => finding.sourcePages);
  const processHypotheses = [
    processContext
      ? `Process notes from admin: ${processContext}`
      : "No process notes were provided; validate workflow assumptions in the next call.",
    bundle.intelligence.issues
      ? `Known project friction: ${firstSentences(bundle.intelligence.issues)}`
      : "",
    bundle.intelligence.currentTools
      ? `Known tools: ${firstSentences(bundle.intelligence.currentTools)}`
      : "",
    competitorSignals.length
      ? `Market-visible signals to compare: ${competitorSignals.join(", ")}.`
      : "Competitor crawls did not reveal strong digital workflow signals.",
  ].filter(Boolean);

  const opportunities = [
    "Compare the client's website and intake against competitor lead capture, booking, content, and portal signals.",
    "Map one core process from request to delivery and identify where customer-facing evidence contradicts internal workflow reality.",
    competitorSignals.includes("appointment booking")
      ? "Benchmark appointment booking and qualification flows before redesigning the client's intake."
      : "Assess whether a clearer booking or qualification path would reduce manual back-and-forth.",
    competitorSignals.includes("content marketing")
      ? "Turn reusable knowledge into guided sales, onboarding, and support assets."
      : "Check whether missing public knowledge content is a sales enablement gap.",
    "Use this research as hypothesis input, not final strategy, until validated with the client.",
  ];

  return [
    "Research scope:",
    `Project: ${bundle.project.name}`,
    `Topic: ${topic || "Competitor and process research"}`,
    `Industry: ${bundle.organization.industry}`,
    "",
    "Competitor evidence:",
    ...(competitorFindings.length
      ? competitorFindings.flatMap((finding) => [
          `- ${finding.url}`,
          `  Status: ${finding.ok ? "ok" : "failed"}`,
          finding.summary ? `  Summary: ${finding.summary}` : "",
          finding.signals.length
            ? `  Signals: ${finding.signals.join(", ")}`
            : "",
          finding.error ? `  Error: ${finding.error}` : "",
        ])
      : ["- No competitor URLs provided."]),
    "",
    "Process hypotheses:",
    bulletList(processHypotheses),
    "",
    "AI and digital transformation angles:",
    bulletList(opportunities),
    "",
    "Source pages:",
    bulletList(sourcePages),
  ]
    .filter((line) => line !== "")
    .join("\n");
}
