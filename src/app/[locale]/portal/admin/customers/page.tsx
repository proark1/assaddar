import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Mail,
  ShieldCheck,
  Users,
} from "lucide-react";
import { isLocale, type Locale } from "@/content";
import { requireAdmin } from "@/lib/portal/auth";
import { listCustomersWithProjectBundles } from "@/lib/portal/store";
import { formatDate, formatStatus } from "@/lib/portal/format";
import {
  Badge,
  PortalCard,
  PortalSectionTitle,
  PortalShell,
} from "@/components/portal/chrome";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kunden | Assad Dar Portal",
  robots: { index: false, follow: false },
};

export default async function AdminCustomersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const user = await requireAdmin(safe);
  const customers = await listCustomersWithProjectBundles();
  const assignedCount = customers.filter(
    (entry) => entry.projectBundles.length > 0,
  ).length;

  return (
    <PortalShell
      user={user}
      locale={safe}
      eyebrow="Admin"
      title="Kunden"
      backHref={`/${safe}/portal/admin`}
      actions={
        <Link
          href={`/${safe}/portal/admin`}
          className="inline-flex items-center gap-2 rounded-lg border border-hairline px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper"
        >
          <BriefcaseBusiness className="h-4 w-4" />
          Projekte
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
        <PortalCard>
          <PortalSectionTitle eyebrow="CRM" title="Kundenübersicht">
            Alle registrierten Kundenkonten und die Projekte, auf die sie
            Zugriff haben.
          </PortalSectionTitle>
          <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-lg border border-hairline bg-bg p-4">
              <div className="text-2xl font-medium text-ink">
                {customers.length}
              </div>
              <div className="mt-1 text-sm text-muted">Kundenkonten</div>
            </div>
            <div className="rounded-lg border border-hairline bg-bg p-4">
              <div className="text-2xl font-medium text-ink">
                {assignedCount}
              </div>
              <div className="mt-1 text-sm text-muted">Mit Projektzugriff</div>
            </div>
            <div className="rounded-lg border border-hairline bg-bg p-4">
              <div className="text-2xl font-medium text-ink">
                {
                  customers.filter((entry) => entry.customer.emailVerifiedAt)
                    .length
                }
              </div>
              <div className="mt-1 text-sm text-muted">Verifiziert</div>
            </div>
          </div>
        </PortalCard>

        <div className="space-y-4">
          {customers.map(({ customer, projectBundles }) => (
            <PortalCard key={customer.id}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Users className="h-4 w-4 text-copper" />
                    <h2 className="text-lg font-medium text-ink">
                      {customer.name}
                    </h2>
                    <Badge tone={customer.emailVerifiedAt ? "green" : "amber"}>
                      {customer.emailVerifiedAt ? "Verifiziert" : "Offen"}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      {customer.email}
                    </span>
                    <span>
                      Erstellt: {formatDate(customer.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-ink2">
                  <ShieldCheck className="h-4 w-4 text-copper" />
                  {projectBundles.length === 1
                    ? "1 Projekt"
                    : `${projectBundles.length} Projekte`}
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {projectBundles.map((bundle) => (
                  <Link
                    key={bundle.project.id}
                    href={`/${safe}/portal/admin/projects/${bundle.project.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-bg p-3 transition-colors hover:border-copper"
                  >
                    <div>
                      <div className="text-sm font-medium text-ink">
                        {bundle.project.name}
                      </div>
                      <div className="mt-1 text-[12px] text-muted">
                        {bundle.organization.name} ·{" "}
                        {formatStatus(bundle.project.status)}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-copper" />
                  </Link>
                ))}
                {projectBundles.length === 0 && (
                  <p className="rounded-lg border border-dashed border-strong bg-surface2 p-4 text-sm text-muted">
                    Noch kein Projekt zugeordnet. Die Zuordnung erfolgt im
                    jeweiligen Projekt unter Zugriff verwalten.
                  </p>
                )}
              </div>
            </PortalCard>
          ))}
          {customers.length === 0 && (
            <PortalCard>
              <p className="text-sm text-muted">
                Noch keine Kundenkonten vorhanden.
              </p>
            </PortalCard>
          )}
        </div>
      </div>
    </PortalShell>
  );
}
