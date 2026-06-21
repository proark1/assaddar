import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogIn } from "lucide-react";
import { getCurrentUser } from "@/lib/portal/auth";
import { fieldClass } from "@/components/portal/chrome";
import { isLocale, type Locale } from "@/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portal Login | Assad Dar",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    error?: string;
    next?: string;
    reset?: string;
    verified?: string;
    verify?: string;
  }>;
}) {
  const { locale } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const current = await getCurrentUser();
  if (current) redirect(`/${safe}/portal`);

  const query = await searchParams;
  const invalid = query.error === "invalid";
  const needsVerification = query.error === "verify";
  const rateLimited = query.error === "rate";

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-5 py-12">
      <section className="w-full max-w-[430px] rounded-lg border border-hairline bg-surface p-6 shadow-card md:p-8">
        <Link
          href={`/${safe}`}
          className="font-mono text-[12px] uppercase tracking-[0.18em] text-copper"
        >
          ASSADDAR.
        </Link>
        <h1 className="mt-6 font-serif text-3xl font-normal text-ink">
          Kundenportal Login
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink2">
          Melden Sie sich an, um Projektstatus, Dateien, Aufgaben und Rechnungen
          zu sehen.
        </p>

        <form action="/api/portal/login" method="post" className="mt-7 space-y-4">
          <input type="hidden" name="locale" value={safe} />
          <input type="hidden" name="next" value={query.next ?? ""} />
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm text-ink2">
              E-Mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm text-ink2">
              Passwort
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={fieldClass}
            />
          </div>

          {invalid && (
            <p className="rounded-md border border-critical/30 bg-critical/10 px-3 py-2 text-sm text-critical">
              Login nicht möglich. Bitte prüfen Sie E-Mail und Passwort.
            </p>
          )}
          {needsVerification && (
            <p className="rounded-md border border-critical/30 bg-critical/10 px-3 py-2 text-sm text-critical">
              Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.
            </p>
          )}
          {rateLimited && (
            <p className="rounded-md border border-critical/30 bg-critical/10 px-3 py-2 text-sm text-critical">
              Zu viele Login-Versuche. Bitte versuchen Sie es in einigen Minuten
              erneut.
            </p>
          )}
          {query.verify === "sent" && (
            <p className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
              Bitte prüfen Sie Ihr Postfach und bestätigen Sie Ihre E-Mail.
            </p>
          )}
          {query.verified === "1" && (
            <p className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
              E-Mail bestätigt. Sie können sich jetzt anmelden.
            </p>
          )}
          {query.reset === "1" && (
            <p className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
              Passwort geändert. Sie können sich jetzt anmelden.
            </p>
          )}

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-copper px-5 py-3 text-sm font-medium text-oncopper shadow-[0_2px_8px_rgba(166,110,47,0.25)] transition-colors hover:bg-copper-hi"
          >
            <LogIn className="h-4 w-4" />
            Einloggen
          </button>
        </form>

        <p className="mt-6 text-sm text-ink2">
          Noch kein Konto?{" "}
          <Link href={`/${safe}/register`} className="text-copper hover:underline">
            Registrieren
          </Link>
        </p>
        <p className="mt-2 text-sm text-ink2">
          Passwort vergessen?{" "}
          <Link
            href={`/${safe}/forgot-password`}
            className="text-copper hover:underline"
          >
            Zurücksetzen
          </Link>
        </p>
      </section>
    </main>
  );
}
