import type { ProjectBundle } from "./types";
import { requestExternalAiInsight } from "./ai-providers";
import { externalAiIdentifier, redactForExternalAi } from "./privacy";
import { matchConsultingTemplate } from "./templates";

type Provider = "openai" | "gemini" | "grok";

export function buildExternalAiScanPrompt(bundle: ProjectBundle) {
  const template = matchConsultingTemplate(bundle.organization.industry);
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
