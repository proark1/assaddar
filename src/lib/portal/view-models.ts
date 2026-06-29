import { cache } from "react";
import {
  buildConsultantGuidance,
  findSimilarProjectBundles,
} from "./ai";
import {
  buildAiProviderComparison,
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
