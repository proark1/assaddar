import { getProjectBundle, id, mutateStore, readStore } from "./store";
import type { PortalStore, ProjectIntelligence } from "./types";
import {
  crawlWebsite,
  formatWebsiteIntelligenceReport,
  normalizeWebsiteUrl,
  type WebsiteCrawlIntelligence,
} from "./website-scraper";

type EnqueueWebsiteCrawlInput = {
  projectId: string;
  website: string;
  userId: string;
  applyToIntelligence: boolean;
  source?: string;
};

type ProcessQueueOptions = {
  limit?: number;
};

function appendNote(existing: string, title: string, body: string) {
  if (!body.trim()) return existing;
  return [existing, `${title}\n${body}`].filter(Boolean).join("\n\n");
}

function hostLabel(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "website";
  }
}

function addInternalAuditUpdate({
  store,
  projectId,
  userId,
  title,
  body,
}: {
  store: PortalStore;
  projectId: string;
  userId: string;
  title: string;
  body: string;
}) {
  const project = store.projects.find((entry) => entry.id === projectId);
  if (!project) return;
  store.updates.push({
    id: id("update"),
    projectId,
    title: `Audit: ${title}`,
    body,
    visibility: "internal",
    asdarStage: project.asdarStage,
    createdBy: userId,
    createdAt: new Date().toISOString(),
  });
}

function mergeWebsiteIntelligence(
  current: ProjectIntelligence,
  intelligence: WebsiteCrawlIntelligence,
): Omit<ProjectIntelligence, "projectId" | "updatedAt"> {
  return {
    companyContext: appendNote(
      current.companyContext,
      "Website Scan: Unternehmenskontext",
      intelligence.companyContext,
    ),
    stakeholders: current.stakeholders,
    issues: appendNote(
      current.issues,
      "Website Scan: Risiken und Luecken",
      intelligence.issues,
    ),
    goals: current.goals,
    currentTools: appendNote(
      current.currentTools,
      "Website Scan: digitale Signale",
      intelligence.currentTools,
    ),
    dataSituation: appendNote(
      current.dataSituation,
      "Website Scan: Quellen und Datenlage",
      intelligence.dataSituation,
    ),
    constraints: appendNote(
      current.constraints,
      "Website Scan: Validierung",
      intelligence.constraints,
    ),
    opportunities: appendNote(
      current.opportunities,
      "Website Scan: AI- und Digitalisierungshebel",
      intelligence.opportunities,
    ),
    internalNotes: appendNote(
      current.internalNotes,
      "Website Scan: interne Quellen",
      intelligence.internalNotes,
    ),
  };
}

function upsertMergedIntelligence(
  store: PortalStore,
  projectId: string,
  intelligence: WebsiteCrawlIntelligence,
) {
  const current = getProjectBundle(store, projectId)?.intelligence;
  if (!current) return;
  const existing = store.projectIntelligence.find(
    (entry) => entry.projectId === projectId,
  );
  const next = {
    projectId,
    ...mergeWebsiteIntelligence(current, intelligence),
    updatedAt: new Date().toISOString(),
  };
  if (existing) Object.assign(existing, next);
  else store.projectIntelligence.push(next);
}

export async function enqueueWebsiteCrawlRun({
  projectId,
  website,
  userId,
  applyToIntelligence,
  source = "manual",
}: EnqueueWebsiteCrawlInput) {
  const normalizedUrl = normalizeWebsiteUrl(website);
  return mutateStore((store) => {
    const bundle = getProjectBundle(store, projectId);
    if (!bundle) return null;
    const now = new Date().toISOString();
    const runId = id("crawl");
    const organization = store.organizations.find(
      (entry) => entry.id === bundle.organization.id,
    );
    if (organization) organization.website = normalizedUrl;

    store.websiteCrawlRuns.push({
      id: runId,
      projectId,
      websiteUrl: normalizedUrl,
      status: "queued",
      startedAt: now,
      pageCount: 0,
      summary: `Queued from ${source}.`,
      applyToIntelligence,
      createdBy: userId,
      createdAt: now,
    });

    addInternalAuditUpdate({
      store,
      projectId,
      userId,
      title: "Website Intelligence queued",
      body: `${normalizedUrl} wurde fuer den Hintergrund-Scan vorgemerkt.`,
    });

    return runId;
  });
}

export async function processWebsiteCrawlRun(runId: string) {
  const sourceStore = await readStore();
  const sourceRun = sourceStore.websiteCrawlRuns.find((run) => run.id === runId);
  if (!sourceRun) return { status: "missing" as const, runId };
  if (sourceRun.status !== "queued" && sourceRun.status !== "running") {
    return { status: "skipped" as const, runId };
  }

  await mutateStore((store) => {
    const run = store.websiteCrawlRuns.find((entry) => entry.id === runId);
    if (!run || run.status === "completed") return;
    run.status = "running";
    run.startedAt = new Date().toISOString();
    run.error = undefined;
  });

  const startedAt = new Date().toISOString();
  let crawlResult: Awaited<ReturnType<typeof crawlWebsite>> | null = null;
  let crawlError = "";

  try {
    crawlResult = await crawlWebsite(sourceRun.websiteUrl);
    crawlError = crawlResult.error ?? "";
  } catch (error) {
    crawlError = error instanceof Error ? error.message : "Website crawl failed.";
  }

  const completed = Boolean(crawlResult && !crawlError);
  const normalizedUrl = crawlResult?.normalizedUrl || sourceRun.websiteUrl;
  const report = crawlResult
    ? formatWebsiteIntelligenceReport(crawlResult.intelligence)
    : `Website crawl failed for ${sourceRun.websiteUrl}.\n\n${crawlError}`;

  await mutateStore((store) => {
    const run = store.websiteCrawlRuns.find((entry) => entry.id === runId);
    if (!run) return;
    const now = new Date().toISOString();
    run.websiteUrl = normalizedUrl;
    run.status = completed ? "completed" : "failed";
    run.startedAt = run.startedAt || startedAt;
    run.completedAt = now;
    run.pageCount = crawlResult?.pages.length ?? 0;
    run.summary = crawlResult?.intelligence.summary ?? "";
    run.error = crawlError || undefined;

    store.websiteCrawlPages = store.websiteCrawlPages.filter(
      (page) => page.runId !== runId,
    );
    for (const page of crawlResult?.pages ?? []) {
      store.websiteCrawlPages.push({
        id: id("page"),
        runId,
        projectId: run.projectId,
        url: page.url,
        title: page.title,
        description: page.description,
        pageType: page.pageType,
        statusCode: page.statusCode,
        depth: page.depth,
        wordCount: page.wordCount,
        textExcerpt: page.textExcerpt,
        discoveredFrom: page.discoveredFrom,
        crawledAt: page.crawledAt,
        error: page.error,
      });
    }

    store.aiInsights.push({
      id: id("insight"),
      projectId: run.projectId,
      title: `Website Intelligence: ${hostLabel(normalizedUrl)} (${run.status})`,
      body: report,
      kind: completed ? "guidance" : "risk",
      createdAt: now,
    });

    if (crawlResult && run.applyToIntelligence) {
      upsertMergedIntelligence(store, run.projectId, crawlResult.intelligence);
    }

    addInternalAuditUpdate({
      store,
      projectId: run.projectId,
      userId: run.createdBy,
      title: "Website Intelligence processed",
      body: `${normalizedUrl} wurde verarbeitet. Status: ${run.status}. Seiten: ${
        crawlResult?.pages.length ?? 0
      }.`,
    });
  });

  return {
    status: completed ? ("completed" as const) : ("failed" as const),
    runId,
  };
}

export async function processWebsiteCrawlQueue(options: ProcessQueueOptions = {}) {
  const limit = Math.max(1, Math.min(options.limit ?? 2, 8));
  const store = await readStore();
  const queued = store.websiteCrawlRuns
    .filter((run) => run.status === "queued")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .slice(0, limit);
  const results = [];
  for (const run of queued) {
    results.push(await processWebsiteCrawlRun(run.id));
  }
  return {
    queued: queued.length,
    completed: results.filter((result) => result.status === "completed").length,
    failed: results.filter((result) => result.status === "failed").length,
    results,
  };
}
