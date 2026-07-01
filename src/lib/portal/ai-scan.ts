import type { ProjectBundle } from "./types";
import {
  requestExternalAiInsight,
  type ExternalAiProvider,
} from "./ai-providers";
import { externalAiIdentifier, redactForExternalAi } from "./privacy";
import { matchConsultingTemplate } from "./templates";

type Provider = ExternalAiProvider;

export function buildExternalAiScanPrompt(bundle: ProjectBundle) {
  const template = matchConsultingTemplate(bundle.organization.industry);
  const latestWebsiteRun = bundle.websiteCrawlRuns[0];
  const latestWebsitePages = latestWebsiteRun
    ? bundle.websiteCrawlPages
        .filter((page) => page.runId === latestWebsiteRun.id)
        .slice(0, 6)
    : [];
  const websiteEvidence = latestWebsiteRun
    ? [
        `Website scan status: ${latestWebsiteRun.status}`,
        `Website scan summary: ${redactForExternalAi(latestWebsiteRun.summary)}`,
        `Website pages: ${latestWebsitePages
          .map((page) =>
            redactForExternalAi(
              `${page.pageType}: ${page.title || page.url} - ${
                page.description || page.textExcerpt.slice(0, 180)
              }`,
            ),
          )
          .join(" | ")}`,
      ].join("\n")
    : "Website scan: not available";
  const researchEvidence =
    bundle.aiInsights.find((insight) => insight.title.startsWith("Research Scan:"))
      ?.body ?? "Research scan: not available";
  const templatePrompt = [
    `Industry playbook: ${template.label}`,
    `Best for: ${template.bestFor}`,
    `Kickoff goal: ${template.kickoffGoal}`,
    `Quick wins: ${template.quickWins.join("; ")}`,
    `Automation ideas: ${template.automationIdeas.join("; ")}`,
    `Risks: ${template.risks.join("; ")}`,
    `Meeting moves: ${template.meetingMoves.join("; ")}`,
    `Current project: ${externalAiIdentifier(bundle.project.name, "Project")} / ${externalAiIdentifier(bundle.organization.name)}`,
  ].join("\n");

  return [
    `Company: ${externalAiIdentifier(bundle.organization.name)}`,
    `Industry: ${redactForExternalAi(bundle.organization.industry)}`,
    `ASDAR stage: ${bundle.project.asdarStage}`,
    `Context: ${redactForExternalAi(bundle.intelligence.companyContext)}`,
    `Issues: ${redactForExternalAi(bundle.intelligence.issues)}`,
    `Goals: ${redactForExternalAi(bundle.intelligence.goals)}`,
    `Tools: ${redactForExternalAi(bundle.intelligence.currentTools)}`,
    `Data situation: ${redactForExternalAi(bundle.intelligence.dataSituation)}`,
    `Constraints: ${redactForExternalAi(bundle.intelligence.constraints)}`,
    `Opportunities: ${redactForExternalAi(bundle.intelligence.opportunities)}`,
    `Website evidence: ${websiteEvidence}`,
    `Research evidence: ${redactForExternalAi(researchEvidence)}`,
    "",
    templatePrompt,
    "",
    "Return concise consulting ideas for Assad as the consultant. Do not write a customer-facing strategy.",
    "Use exactly these section headings:",
    "Summary:",
    "Automation ideas:",
    "Risks:",
    "Next questions:",
    "Next actions:",
    "Use short bullet points under each heading. Do not use a table.",
  ].join("\n");
}

export async function runExternalAiScan(bundle: ProjectBundle, providers: Provider[]) {
  const system =
    "You support Assad Dar, an AI and digitalization consultant using the ASDAR Method. Be specific, pragmatic, and concise. Do not invent facts beyond the project context.";
  const prompt = buildExternalAiScanPrompt(bundle);

  return Promise.all(
    providers.map((provider) =>
      requestExternalAiInsight({ provider, system, prompt }),
    ),
  );
}
