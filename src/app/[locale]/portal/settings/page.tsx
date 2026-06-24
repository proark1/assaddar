import type { Metadata } from "next";
import { KeyRound, ShieldCheck } from "lucide-react";
import { changePasswordAction } from "@/app/actions/auth";
import { isLocale, type Locale } from "@/content";
import { requireUser } from "@/lib/portal/auth";
import {
  fieldClass,
  PortalCard,
  PortalSectionTitle,
  PortalShell,
} from "@/components/portal/chrome";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portal Settings | Assad Dar",
  robots: { index: false, follow: false },
};

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

  return (
    <PortalShell
      user={user}
      locale={safe}
      eyebrow="Account"
      title="Portal settings"
      activeNav="settings"
      backHref={`/${safe}/portal`}
    >
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
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi"
            >
              <KeyRound className="h-4 w-4" />
              Passwort speichern
            </button>
          </form>
        </PortalCard>
      </div>
    </PortalShell>
  );
}
