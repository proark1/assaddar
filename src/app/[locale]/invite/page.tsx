import type { Metadata } from "next";
import Link from "next/link";
import { UserCheck } from "lucide-react";
import { acceptInviteAction } from "@/app/actions/auth";
import { fieldClass } from "@/components/portal/chrome";
import { isLocale, type Locale } from "@/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portal Einladung | Assad Dar",
  robots: { index: false, follow: false },
};

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { locale } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const query = await searchParams;

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
          Portal Einladung annehmen
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink2">
          Legen Sie ein Passwort fest. Danach werden Sie direkt in Ihr
          Projektportal weitergeleitet.
        </p>

        {query.error === "token" && (
          <p className="mt-5 rounded-md border border-critical/30 bg-critical/10 px-3 py-2 text-sm text-critical">
            Der Einladungslink ist ungültig oder abgelaufen.
          </p>
        )}
        {query.error === "invalid" && (
          <p className="mt-5 rounded-md border border-critical/30 bg-critical/10 px-3 py-2 text-sm text-critical">
            Bitte geben Sie ein gültiges Passwort ein und bestätigen Sie es
            identisch.
          </p>
        )}

        <form action={acceptInviteAction} className="mt-7 space-y-4">
          <input type="hidden" name="locale" value={safe} />
          <input type="hidden" name="token" value={query.token ?? ""} />
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm text-ink2">
              Passwort
            </label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={8}
              required
              autoComplete="new-password"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="confirm" className="mb-1.5 block text-sm text-ink2">
              Passwort bestätigen
            </label>
            <input
              id="confirm"
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
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-copper px-5 py-3 text-sm font-medium text-oncopper shadow-[0_2px_8px_rgba(166,110,47,0.25)] transition-colors hover:bg-copper-hi"
          >
            <UserCheck className="h-4 w-4" />
            Einladung annehmen
          </button>
        </form>
      </section>
    </main>
  );
}
