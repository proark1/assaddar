import type { Metadata } from "next";
import Link from "next/link";
import { Inbox, Workflow } from "lucide-react";
import { updateCrmOpportunityStageAction } from "@/app/actions/portal";
import { isLocale, type Locale } from "@/content";
import { requireAdmin } from "@/lib/portal/auth";
import { readStore } from "@/lib/portal/store";
import { formatDate } from "@/lib/portal/format";
import type { CrmOpportunityStage } from "@/lib/portal/types";
import {
  Badge,
  EmptyState,
  PortalCard,
  PortalSectionTitle,
  PortalShell,
  fieldClass,
} from "@/components/portal/chrome";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CRM Chancen | Assad Dar Portal",
  robots: { index: false, follow: false },
};

const stages: Array<{ id: CrmOpportunityStage; label: string }> = [
  { id: "new_lead", label: "New Lead" },
  { id: "qualified", label: "Qualified" },
  { id: "discovery_scheduled", label: "Discovery Scheduled" },
  { id: "discovery_done", label: "Discovery Done" },
  { id: "proposal_needed", label: "Proposal Needed" },
  { id: "proposal_sent", label: "Proposal Sent" },
  { id: "negotiation", label: "Negotiation" },
  { id: "nurture", label: "Nurture" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
];

function formatMoney(value?: number, currency = "EUR") {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format((value ?? 0) / 100);
}

export default async function AdminCrmOpportunitiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const user = await requireAdmin(safe);
  const store = await readStore();
  const contactsById = new Map(store.crmContacts.map((contact) => [contact.id, contact]));
  const orgsById = new Map(store.organizations.map((org) => [org.id, org]));
  const open = store.crmOpportunities.filter(
    (opportunity) => !["won", "lost"].includes(opportunity.stage),
  );
  const weighted = open.reduce(
    (sum, opportunity) =>
      sum + ((opportunity.valueCents ?? 0) * opportunity.probability) / 100,
    0,
  );

  return (
    <PortalShell
      user={user}
      locale={safe}
      eyebrow="Admin CRM"
      title="Chancen Pipeline"
      activeNav="communications"
      backHref={`/${safe}/portal/admin/communications`}
      actions={
        <Link
          href={`/${safe}/portal/admin/communications`}
          className="inline-flex items-center gap-2 rounded-lg border border-hairline px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper"
        >
          <Inbox className="h-4 w-4" />
          Inbox
        </Link>
      }
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <PortalCard>
          <Workflow className="h-4 w-4 text-copper" />
          <div className="mt-3 text-2xl font-medium text-ink">{open.length}</div>
          <div className="text-sm text-muted">offene Chancen</div>
        </PortalCard>
        <PortalCard>
          <div className="text-2xl font-medium text-ink">
            {formatMoney(open.reduce((sum, item) => sum + (item.valueCents ?? 0), 0))}
          </div>
          <div className="mt-1 text-sm text-muted">Pipeline Wert</div>
        </PortalCard>
        <PortalCard>
          <div className="text-2xl font-medium text-ink">
            {formatMoney(weighted)}
          </div>
          <div className="mt-1 text-sm text-muted">gewichtet</div>
        </PortalCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        {stages.map((stage) => {
          const opportunities = store.crmOpportunities.filter(
            (opportunity) => opportunity.stage === stage.id,
          );
          return (
            <PortalCard key={stage.id} className="min-h-80">
              <div className="flex items-start justify-between gap-3">
                <PortalSectionTitle eyebrow="Stage" title={stage.label} />
                <Badge tone={opportunities.length ? "copper" : "neutral"}>
                  {opportunities.length}
                </Badge>
              </div>

              <div className="mt-5 space-y-3">
                {opportunities.map((opportunity) => {
                  const contact = opportunity.contactId
                    ? contactsById.get(opportunity.contactId)
                    : undefined;
                  const org = opportunity.organizationId
                    ? orgsById.get(opportunity.organizationId)
                    : undefined;
                  return (
                    <form
                      key={opportunity.id}
                      action={updateCrmOpportunityStageAction}
                      className="rounded-lg border border-hairline bg-bg p-4"
                    >
                      <input type="hidden" name="locale" value={safe} />
                      <input type="hidden" name="opportunityId" value={opportunity.id} />
                      <input
                        type="hidden"
                        name="returnTo"
                        value={`/${safe}/portal/admin/crm/opportunities`}
                      />
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-ink">
                            {opportunity.title}
                          </div>
                          <div className="mt-1 text-[12px] text-muted">
                            {contact?.name || org?.name || opportunity.source}
                          </div>
                        </div>
                        <Badge tone={opportunity.probability >= 60 ? "green" : "amber"}>
                          {opportunity.probability}%
                        </Badge>
                      </div>
                      <p className="mt-3 line-clamp-3 text-[12px] leading-relaxed text-ink2">
                        {opportunity.nextStep || "Naechsten Schritt klaeren."}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge>{formatMoney(opportunity.valueCents, opportunity.currency)}</Badge>
                        <Badge>
                          {opportunity.expectedCloseDate
                            ? opportunity.expectedCloseDate
                            : formatDate(opportunity.updatedAt)}
                        </Badge>
                      </div>
                      <select
                        name="stage"
                        defaultValue={opportunity.stage}
                        className={`${fieldClass} mt-3`}
                      >
                        {stages.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                      <button className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-2 text-[12px] font-medium text-ink transition-colors hover:border-copper hover:text-copper">
                        Stage speichern
                      </button>
                    </form>
                  );
                })}
                {opportunities.length === 0 && (
                  <EmptyState title="Leer">
                    Keine Chancen in dieser Stage.
                  </EmptyState>
                )}
              </div>
            </PortalCard>
          );
        })}
      </div>
    </PortalShell>
  );
}
