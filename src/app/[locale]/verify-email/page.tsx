import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { verifyEmailAction } from "@/app/actions/auth";
import { isLocale, type Locale } from "@/content";
import { getAuthCopy } from "@/lib/portal/auth-copy";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  return {
    title: getAuthCopy(safe).verify.metaTitle,
    robots: { index: false, follow: false },
  };
}

export default async function VerifyEmailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { locale } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const query = await searchParams;
  const c = getAuthCopy(safe).verify;

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
          {c.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink2">{c.intro}</p>

        {query.error === "token" && (
          <p className="mt-5 rounded-md border border-critical/30 bg-critical/10 px-3 py-2 text-sm text-critical">
            {c.token}
          </p>
        )}

        <form action={verifyEmailAction} className="mt-7">
          <input type="hidden" name="locale" value={safe} />
          <input type="hidden" name="token" value={query.token ?? ""} />
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-copper px-5 py-3 text-sm font-medium text-oncopper shadow-[0_2px_8px_rgba(166,110,47,0.25)] transition-colors hover:bg-copper-hi"
          >
            <CheckCircle2 className="h-4 w-4" />
            {c.submit}
          </button>
        </form>
      </section>
    </main>
  );
}
