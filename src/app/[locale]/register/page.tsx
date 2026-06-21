import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UserPlus } from "lucide-react";
import { registerAction } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/portal/auth";
import { fieldClass } from "@/components/portal/chrome";
import { isLocale, type Locale } from "@/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portal Registrierung | Assad Dar",
  robots: { index: false, follow: false },
};

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const current = await getCurrentUser();
  if (current) redirect(`/${safe}/portal`);

  const query = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-5 py-12">
      <section className="w-full max-w-[460px] rounded-lg border border-hairline bg-surface p-6 shadow-card md:p-8">
        <Link
          href={`/${safe}`}
          className="font-mono text-[12px] uppercase tracking-[0.18em] text-copper"
        >
          ASSADDAR.
        </Link>
        <h1 className="mt-6 font-serif text-3xl font-normal text-ink">
          Kundenkonto erstellen
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink2">
          Nach der Registrierung kann Assad Ihr Konto einem oder mehreren
          Projekten zuordnen.
        </p>

        <form action={registerAction} className="mt-7 space-y-4">
          <input type="hidden" name="locale" value={safe} />
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm text-ink2">
              Name
            </label>
            <input
              id="name"
              name="name"
              required
              autoComplete="name"
              className={fieldClass}
            />
          </div>
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
              minLength={8}
              autoComplete="new-password"
              className={fieldClass}
            />
            <p className="mt-1.5 text-[12px] text-muted">
              Mindestens 8 Zeichen.
            </p>
          </div>

          {query.error === "invalid" && (
            <p className="rounded-md border border-critical/30 bg-critical/10 px-3 py-2 text-sm text-critical">
              Bitte füllen Sie Name, E-Mail und Passwort korrekt aus.
            </p>
          )}
          {query.error === "exists" && (
            <p className="rounded-md border border-critical/30 bg-critical/10 px-3 py-2 text-sm text-critical">
              Für diese E-Mail existiert bereits ein Konto.
            </p>
          )}

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-copper px-5 py-3 text-sm font-medium text-oncopper shadow-[0_2px_8px_rgba(166,110,47,0.25)] transition-colors hover:bg-copper-hi"
          >
            <UserPlus className="h-4 w-4" />
            Konto erstellen
          </button>
        </form>

        <p className="mt-6 text-sm text-ink2">
          Schon registriert?{" "}
          <Link href={`/${safe}/login`} className="text-copper hover:underline">
            Einloggen
          </Link>
        </p>
      </section>
    </main>
  );
}
