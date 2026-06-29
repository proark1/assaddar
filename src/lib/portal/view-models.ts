import { cache } from "react";
import {
  buildConsultantGuidance,
  findSimilarProjectBundles,
} from "./ai";
import { buildAttentionItems } from "./automation";
import { buildAutomationOpportunities } from "./automation-rules";
import {
  buildAiProviderComparison,
  buildAdminCommandCenter,
  buildAdminNotificationCenter,
  buildAdminProjectActions,
  buildAutomationHistory,
  buildChangeRequests,
  buildClientAnalytics,
  buildConsultingCopilotBrief,
  buildConsultantCopyTemplates,
  buildConsultantWorkflow,
  buildCustomerNextActions,
  buildCustomerUpdateDraft,
  buildDecisionCenter,
  buildFileRequests,
  buildFileVersionGroups,
  buildLeadPipeline,
  buildMeetingModePlan,
  buildProjectCopilotPanel,
  buildProjectDiagnosis,
  buildProjectHealthScore,
  buildProjectKpiSnapshot,
  buildProjectTimeline,
  buildWorkflowSnapshots,
  latestOrBuildOfferRecommendation,
} from "./operations";
import { listProjectBundlesForUser, readStore } from "./store";
import {
  effectiveConsultingTemplates,
  matchConsultingTemplate,
} from "./templates";
import type { Locale } from "@/content";
import type { ProjectBundle, User } from "./types";

export type CustomerDashboardAction = {
  bundle: ProjectBundle;
  action: ReturnType<typeof buildCustomerNextActions>[number];
};

export type PortalDashboardViewModel = {
  bundles: ProjectBundle[];
  openInvoices: ProjectBundle["invoices"];
  customerOpenTasks: ProjectBundle["tasks"];
  customerNextActions: CustomerDashboardAction[];
  primaryCustomerAction?: CustomerDashboardAction;
  nextAppointment?: {
    bundle: ProjectBundle;
    update: ProjectBundle["updates"][number];
  };
  dashboardBundle?: ProjectBundle;
  openInvoiceTotal: number;
};

export type AdminDashboardQuery = {
  q?: string;
  status?: string;
  health?: string;
  template?: string;
};

export type AdminProjectCardViewModel = {
  bundle: ProjectBundle;
  nextBestAction?: ReturnType<typeof buildAdminProjectActions>[number];
  healthScore: ReturnType<typeof buildProjectHealthScore>;
};

export const getPortalDashboardViewModel = cache(
  async (user: User): Promise<PortalDashboardViewModel> => {
    const bundles = await listProjectBundlesForUser(user);
    const openInvoices = bundles.flatMap((bundle) =>
      bundle.invoices.filter((invoice) => invoice.status !== "paid"),
    );
    const visibleTasks = bundles.flatMap((bundle) =>
      bundle.tasks.filter((task) =>
        user.role === "admin" ? task.status !== "done" : task.visibleToCustomer,
      ),
    );
    const customerNextActions =
      user.role === "admin"
        ? []
        : bundles.flatMap((bundle) =>
            buildCustomerNextActions(bundle)
              .slice(0, 2)
              .map((action) => ({ bundle, action })),
          );
    const primaryCustomerAction = customerNextActions[0];
    const nextAppointment =
      user.role === "admin"
        ? undefined
        : bundles
            .flatMap((bundle) =>
              bundle.updates
                .filter(
                  (update) =>
                    update.visibility === "customer" &&
                    update.title.startsWith("Termin:"),
                )
                .map((update) => ({ bundle, update })),
            )
            .sort(
              (a, b) =>
                new Date(b.update.createdAt).getTime() -
                new Date(a.update.createdAt).getTime(),
            )[0];
    const customerOpenTasks = visibleTasks.filter(
      (task) => task.status !== "done",
    );
    const openInvoiceTotal = openInvoices.reduce(
      (sum, invoice) => sum + invoice.amountCents,
      0,
    );
    const dashboardBundle =
      user.role === "admin"
        ? undefined
        : (primaryCustomerAction?.bundle ?? bundles[0]);

    return {
      bundles,
      openInvoices,
      customerOpenTasks,
      customerNextActions,
      primaryCustomerAction,
      nextAppointment,
      dashboardBundle,
      openInvoiceTotal,
    };
  },
);

export const getAdminProjectViewModel = cache(
  async (user: User, projectId: string) => {
    const [bundles, portalStore] = await Promise.all([
      listProjectBundlesForUser(user),
      readStore(),
    ]);
    const consultingTemplates = effectiveConsultingTemplates(
      portalStore.templateOverrides,
    );
    const bundle = bundles.find((entry) => entry.project.id === projectId);
    if (!bundle) return null;

    const matchedTemplate = matchConsultingTemplate(bundle.organization.industry);
    const template =
      consultingTemplates.find((entry) => entry.id === matchedTemplate.id) ??
      matchedTemplate;

    return {
      bundles,
      consultingTemplates,
      bundle,
      guidance: buildConsultantGuidance(bundle),
      diagnosis: buildProjectDiagnosis(bundle),
      healthScore: buildProjectHealthScore(bundle),
      kpiSnapshot: buildProjectKpiSnapshot(bundle),
      adminActions: buildAdminProjectActions(bundle),
      copilotBrief: buildConsultingCopilotBrief(bundle),
      meetingMode: buildMeetingModePlan(bundle),
      consultantWorkflow: buildConsultantWorkflow(bundle),
      consultantCopyTemplates: buildConsultantCopyTemplates(bundle),
      customerUpdateDraft: buildCustomerUpdateDraft(bundle),
      aiComparison: buildAiProviderComparison(bundle),
      projectTimeline: buildProjectTimeline(bundle),
      automationHistory: buildAutomationHistory(bundle),
      fileGroups: buildFileVersionGroups(bundle),
      decisions: buildDecisionCenter(bundle),
      changeRequests: buildChangeRequests(bundle),
      fileRequests: buildFileRequests(bundle),
      workflowSnapshots: buildWorkflowSnapshots(bundle),
      clientAnalytics: buildClientAnalytics(bundle),
      projectCopilot: buildProjectCopilotPanel(bundle),
      offerRecommendation: latestOrBuildOfferRecommendation(bundle),
      similar: findSimilarProjectBundles(bundles, bundle),
      template,
    };
  },
);

export const getAdminDashboardViewModel = cache(
  async (user: User, locale: Locale, query: AdminDashboardQuery) => {
    const projectQuery = query.q?.trim().toLowerCase() ?? "";
    const statusFilter = query.status ?? "all";
    const healthFilter = query.health ?? "all";
    const [allBundles, portalStore] = await Promise.all([
      listProjectBundlesForUser(user),
      readStore(),
    ]);
    const consultingTemplates = effectiveConsultingTemplates(
      portalStore.templateOverrides,
    );
    const selectedTemplateId =
      consultingTemplates.some((template) => template.id === query.template)
        ? query.template
        : "";
    const bundles = allBundles.filter((bundle) => {
      const matchesQuery =
        !projectQuery ||
        [
          bundle.project.name,
          bundle.project.summary,
          bundle.organization.name,
          bundle.organization.industry,
        ]
          .join(" ")
          .toLowerCase()
          .includes(projectQuery);
      const matchesStatus =
        statusFilter === "all" || bundle.project.status === statusFilter;
      const matchesHealth =
        healthFilter === "all" || bundle.project.health === healthFilter;

      return matchesQuery && matchesStatus && matchesHealth;
    });
    const projectCards = bundles.map((bundle) => ({
      bundle,
      nextBestAction: buildAdminProjectActions(bundle)[0],
      healthScore: buildProjectHealthScore(bundle),
    }));
    const latestActivity = allBundles
      .flatMap((bundle) =>
        buildProjectTimeline(bundle)
          .slice(0, 4)
          .map((item) => ({
            ...item,
            organizationName: bundle.organization.name,
          })),
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);
    const commands = [
      {
        label: "Automationen ausführen",
        href: `/${locale}/portal/admin#automation`,
        group: "Workflow",
        keywords: "automation next best action task reminder draft",
      },
      {
        label: "Heute öffnen",
        href: `/${locale}/portal/admin/today`,
        group: "Workflow",
        keywords: "today inbox action queue notification",
      },
      {
        label: "Pipeline öffnen",
        href: `/${locale}/portal/admin/pipeline`,
        group: "Workflow",
        keywords: "kanban status projekt flow",
      },
      {
        label: "Draft Review öffnen",
        href: `/${locale}/portal/admin/drafts`,
        group: "Workflow",
        keywords: "updates kommunikation meeting proposal",
      },
      {
        label: "Kunden verwalten",
        href: `/${locale}/portal/admin/customers`,
        group: "Admin",
        keywords: "kunden account login zugriff",
      },
      {
        label: "Templates bearbeiten",
        href: `/${locale}/portal/admin/templates`,
        group: "Admin",
        keywords: "branchen playbook industry",
      },
      ...allBundles.map((bundle) => ({
        label: `${bundle.organization.name} öffnen`,
        href: `/${locale}/portal/admin/projects/${bundle.project.id}`,
        group: "Projekt",
        keywords: [
          bundle.project.name,
          bundle.organization.industry,
          bundle.project.status,
          bundle.project.asdarStage,
        ].join(" "),
      })),
    ];

    return {
      allBundles,
      attentionItems: allBundles.flatMap(buildAttentionItems),
      automationOpportunities: buildAutomationOpportunities(allBundles),
      commandCenter: buildAdminCommandCenter(allBundles),
      commands,
      consultingTemplates,
      healthFilter,
      latestActivity,
      leadPipeline: buildLeadPipeline(allBundles),
      notifications: buildAdminNotificationCenter(allBundles),
      projectCards,
      projectQuery,
      selectedTemplateId,
      statusFilter,
    };
  },
);
