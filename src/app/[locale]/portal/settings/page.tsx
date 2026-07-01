import type { Metadata } from "next";
import Link from "next/link";
import { Bell, Bot, History, KeyRound, MailCheck, Send, ShieldCheck } from "lucide-react";
import { changePasswordAction } from "@/app/actions/auth";
import {
  saveIntegrationSettingsAction,
  updateNotificationPreferencesAction,
} from "@/app/actions/portal";
import { isLocale, type Locale } from "@/content";
import { requireUser } from "@/lib/portal/auth";
import {
  listIntegrationSettingStatuses,
  type IntegrationSettingStatus,
} from "@/lib/portal/integration-settings";
import { listProjectBundlesForUser } from "@/lib/portal/store";
import {
  buildUserNotificationHistory,
  buildUserNotificationPreferences,
} from "@/lib/portal/operations";
import { formatDate } from "@/lib/portal/format";
import {
  Badge,
  fieldClass,
  PortalCard,
  PortalSectionTitle,
  PortalShell,
} from "@/components/portal/chrome";
import { SubmitButton } from "@/components/portal/destructive-actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portal Settings | Assad Dar",
  robots: { index: false, follow: false },
};

function sourceLabel(source: IntegrationSettingStatus["source"]) {
  if (source === "saved") return "Settings";
  if (source === "env") return "Env";
  return "Missing";
}

function statusTone(status: IntegrationSettingStatus) {
  if (status.configured) return status.source === "saved" ? "green" : "copper";
  return "red";
}

export default async function PortalSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { locale } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const user = await requireUser(safe);
  const query = await searchParams;
  const bundles = await listProjectBundlesForUser(user);
  const notificationPreferences = buildUserNotificationPreferences(
    user.id,
    bundles,
  );
  const notificationHistory = buildUserNotificationHistory(user, bundles).slice(
    0,
    12,
  );
  const integrationStatuses =
    user.role === "admin" ? await listIntegrationSettingStatuses() : [];
  const aiIntegrationStatuses = integrationStatuses.filter(
    (status) => status.group === "ai",
  );
  const emailIntegrationStatuses = integrationStatuses.filter(
    (status) => status.group === "email",
  );
  const preferenceItems = [
    {
      key: "projectUpdates",
      label: "Projektupdates",
      body: "Wenn Assad ein sichtbares Statusupdate veröffentlicht.",
    },
    {
      key: "tasks",
      label: "Aufgaben",
      body: "Wenn eine neue kundensichtbare Aufgabe entsteht.",
    },
    {
      key: "files",
      label: "Dateien",
      body: "Wenn neue freigegebene Dateien bereitgestellt werden.",
    },
    {
      key: "invoices",
      label: "Rechnungen",
      body: "Wenn eine Rechnung bereitsteht oder sich Zahlungsstatus ändert.",
    },
    {
      key: "reminders",
      label: "Reminder",
      body: "Wenn Assad aktiv an offene Punkte erinnert.",
    },
    {
      key: "appointments",
      label: "Termine",
      body: "Wenn ein neuer Projekttermin im Portal sichtbar ist.",
    },
    {
      key: "weeklySummary",
      label: "Wochenzusammenfassung",
      body: "Geplante kompakte Zusammenfassung über Fortschritt und offene Punkte.",
    },
  ] as const;

  return (
    <PortalShell
      user={user}
      locale={safe}
      eyebrow="Account"
      title="Portal settings"
      activeNav="settings"
      backHref={`/${safe}/portal`}
    >
      {query.saved === "notifications" && (
        <p className="mb-6 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          Benachrichtigungseinstellungen wurden gespeichert.
        </p>
      )}
      {query.saved === "integrations" && (
        <p className="mb-6 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          Integrations settings were saved.
        </p>
      )}
      {query.error === "notifications" && (
        <p className="mb-6 rounded-md border border-critical/30 bg-critical/10 px-3 py-2 text-sm text-critical">
          Einstellungen können erst gespeichert werden, wenn ein Projekt
          zugeordnet ist.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <PortalCard>
          <PortalSectionTitle eyebrow="Profil" title="Account details" />
          <div className="mt-5 space-y-4">
            <div className="rounded-lg border border-hairline bg-bg p-4">
              <div className="text-sm text-muted">Name</div>
              <div className="mt-1 font-medium text-ink">{user.name}</div>
            </div>
            <div className="rounded-lg border border-hairline bg-bg p-4">
              <div className="text-sm text-muted">E-Mail</div>
              <div className="mt-1 font-medium text-ink">{user.email}</div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-success/30 bg-success/10 p-4 text-sm leading-relaxed text-ink2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <p>
                Dieses Konto ist als {user.role === "admin" ? "Admin" : "Kunde"} im
                Assad Dar Portal aktiv. Rollen werden aktuell durch Assad
                administriert.
              </p>
            </div>
          </div>
        </PortalCard>

        <PortalCard>
          <PortalSectionTitle eyebrow="Security" title="Passwort ändern">
            Nutzen Sie diese Funktion direkt nach der ersten Anmeldung und
            danach regelmäßig.
          </PortalSectionTitle>

          {query.saved === "password" && (
            <p className="mt-4 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
              Passwort wurde geändert.
            </p>
          )}
          {query.error === "password" && (
            <p className="mt-4 rounded-md border border-critical/30 bg-critical/10 px-3 py-2 text-sm text-critical">
              Das neue Passwort muss mindestens 8 Zeichen haben und identisch
              bestätigt werden.
            </p>
          )}
          {query.error === "current" && (
            <p className="mt-4 rounded-md border border-critical/30 bg-critical/10 px-3 py-2 text-sm text-critical">
              Das aktuelle Passwort stimmt nicht.
            </p>
          )}

          <form action={changePasswordAction} className="mt-5 space-y-4">
            <input type="hidden" name="locale" value={safe} />
            <div>
              <label className="mb-1.5 block text-sm text-ink2">
                Aktuelles Passwort
              </label>
              <input
                name="currentPassword"
                type="password"
                required
                autoComplete="current-password"
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-ink2">
                Neues Passwort
              </label>
              <input
                name="password"
                type="password"
                minLength={8}
                required
                autoComplete="new-password"
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-ink2">
                Neues Passwort bestätigen
              </label>
              <input
                name="confirm"
                type="password"
                minLength={8}
                required
                autoComplete="new-password"
                className={fieldClass}
              />
            </div>
            <SubmitButton
              pendingLabel={
                <>
                  <KeyRound className="h-4 w-4" />
                  Wird gespeichert...
                </>
              }
              className="inline-flex items-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi disabled:cursor-wait disabled:opacity-70"
            >
              <KeyRound className="h-4 w-4" />
              Passwort speichern
            </SubmitButton>
          </form>
        </PortalCard>
      </div>

      {user.role === "admin" && (
        <PortalCard className="mt-6">
          <PortalSectionTitle
            eyebrow="Admin"
            title="AI and API settings"
          >
            Store provider keys and sender settings for the portal. Saved values
            are encrypted server-side; environment variables remain the fallback.
          </PortalSectionTitle>

          <form action={saveIntegrationSettingsAction} className="mt-5 space-y-6">
            <input type="hidden" name="locale" value={safe} />

            {[
              {
                key: "ai",
                title: "AI engines",
                icon: Bot,
                items: aiIntegrationStatuses,
              },
              {
                key: "email",
                title: "Email delivery",
                icon: Send,
                items: emailIntegrationStatuses,
              },
            ].map((group) => {
              const Icon = group.icon;
              return (
                <div key={group.key} className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-ink">
                    <Icon className="h-4 w-4 text-copper" />
                    {group.title}
                  </div>
                  <div className="grid gap-3 lg:grid-cols-2">
                    {group.items.map((setting) => (
                      <div
                        key={setting.key}
                        className="rounded-lg border border-hairline bg-bg p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <label
                              htmlFor={setting.key}
                              className="block text-sm font-medium text-ink"
                            >
                              {setting.label}
                            </label>
                            <p className="mt-1 text-[12px] leading-relaxed text-muted">
                              {setting.description}
                            </p>
                          </div>
                          <Badge tone={statusTone(setting)}>
                            {sourceLabel(setting.source)}
                          </Badge>
                        </div>

                        <input
                          id={setting.key}
                          name={setting.key}
                          type={setting.kind === "secret" ? "password" : "text"}
                          autoComplete="off"
                          placeholder={
                            setting.hint
                              ? `${sourceLabel(setting.source)}: ${setting.hint}`
                              : setting.placeholder || "Enter value"
                          }
                          className="mt-3 w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-copper"
                        />

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[12px] text-muted">
                          <span>
                            {setting.updatedAt
                              ? `Updated ${formatDate(setting.updatedAt)}`
                              : setting.env.join(", ")}
                          </span>
                          <label className="inline-flex items-center gap-2">
                            <input
                              name={`clear_${setting.key}`}
                              type="checkbox"
                              disabled={setting.source !== "saved"}
                              className="h-4 w-4 accent-[var(--color-copper)] disabled:opacity-40"
                            />
                            Clear saved value
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <SubmitButton
              pendingLabel={
                <>
                  <KeyRound className="h-4 w-4" />
                  Saving...
                </>
              }
              className="inline-flex items-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi disabled:cursor-wait disabled:opacity-70"
            >
              <KeyRound className="h-4 w-4" />
              Save integrations
            </SubmitButton>
          </form>
        </PortalCard>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <PortalCard>
          <PortalSectionTitle
            eyebrow="Benachrichtigungen"
            title="E-Mail-Präferenzen"
          >
            Steuern Sie, welche Projekt-E-Mails automatisch an dieses Konto
            gesendet werden. Im Portal bleiben alle Informationen sichtbar.
          </PortalSectionTitle>
          <form
            action={updateNotificationPreferencesAction}
            className="mt-5 space-y-3"
          >
            <input type="hidden" name="locale" value={safe} />
            {preferenceItems.map((item) => (
              <label
                key={item.key}
                className="flex items-start gap-3 rounded-lg border border-hairline bg-bg p-3"
              >
                <input
                  name={item.key}
                  type="checkbox"
                  defaultChecked={notificationPreferences[item.key]}
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-copper)]"
                />
                <span>
                  <span className="block text-sm font-medium text-ink">
                    {item.label}
                  </span>
                  <span className="mt-1 block text-[12px] leading-relaxed text-muted">
                    {item.body}
                  </span>
                </span>
              </label>
            ))}
            <SubmitButton
              pendingLabel={
                <>
                  <MailCheck className="h-4 w-4" />
                  Wird gespeichert...
                </>
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi disabled:cursor-wait disabled:opacity-70"
            >
              <MailCheck className="h-4 w-4" />
              Benachrichtigungen speichern
            </SubmitButton>
          </form>
        </PortalCard>

        <PortalCard>
          <PortalSectionTitle
            eyebrow="Historie"
            title="Letzte Portal-Benachrichtigungen"
          >
            Ein nachvollziehbarer Verlauf aus Updates, Erinnerungen, Aufgaben,
            Dateien, Terminen und Rechnungen.
          </PortalSectionTitle>
          <div className="mt-5 space-y-3">
            {notificationHistory.map((item) => (
              <Link
                key={`${item.kind}-${item.id}`}
                href={`/${safe}/portal/${
                  user.role === "admin" ? "admin/projects" : "projects"
                }/${item.projectId}`}
                className="flex gap-3 rounded-lg border border-hairline bg-bg p-3 transition-colors hover:border-copper"
              >
                {item.kind === "reminder" ? (
                  <Bell className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
                ) : (
                  <History className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
                )}
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <Badge
                      tone={
                        item.tone === "red"
                          ? "red"
                          : item.tone === "green"
                            ? "green"
                            : item.tone === "amber"
                              ? "amber"
                              : "copper"
                      }
                    >
                      {item.kind}
                    </Badge>
                    <span className="text-[12px] text-muted">
                      {formatDate(item.date)}
                    </span>
                  </span>
                  <span className="mt-2 block text-sm font-medium text-ink">
                    {item.title}
                  </span>
                  <span className="mt-1 block line-clamp-2 text-[12px] leading-relaxed text-muted">
                    {item.projectName} · {item.body}
                  </span>
                </span>
              </Link>
            ))}
            {notificationHistory.length === 0 && (
              <p className="text-sm text-muted">
                Noch keine Portal-Benachrichtigungen vorhanden.
              </p>
            )}
          </div>
        </PortalCard>
      </div>
    </PortalShell>
  );
}
