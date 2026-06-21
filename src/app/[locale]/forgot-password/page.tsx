import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { requestPasswordResetAction } from "@/app/actions/auth";
import { fieldClass } from "@/components/portal/chrome";
import { isLocale, type Locale } from "@/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Passwort zurücksetzen | Assad Dar",
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ sent?: string }>;
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
          Passwort zurücksetzen
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink2">
          Wenn ein Konto existiert, senden wir einen Link zum Zurücksetzen.
        </p>

        {query.sent === "1" ? (
          <div className="mt-7 rounded-md border border-success/30 bg-success/10 px-3 py-3 text-sm leading-relaxed text-success">
            Bitte prüfen Sie Ihr Postfach. Der Link ist 60 Minuten gültig.
          </div>
        ) : (
          <form action={requestPasswordResetAction} className="mt-7 space-y-4">
            <input type="hidden" name="locale" value={safe} />
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
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-copper px-5 py-3 text-sm font-medium text-oncopper shadow-[0_2px_8px_rgba(166,110,47,0.25)] transition-colors hover:bg-copper-hi"
            >
              <Mail className="h-4 w-4" />
              Link senden
            </button>
          </form>
        )}

        <p className="mt-6 text-sm text-ink2">
          Zurück zum{" "}
          <Link href={`/${safe}/login`} className="text-copper hover:underline">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
