import type { Metadata } from "next";
import Link from "next/link";
import { PortalLoginForm } from "@/components/portal/login-form";
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
    title: getAuthCopy(safe).login.metaTitle,
    robots: { index: false, follow: false },
  };
}

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
  const query = await searchParams;
  const c = getAuthCopy(safe).login;
  const invalid = query.error === "invalid";
  const needsVerification = query.error === "verify";
  const configError = query.error === "config";
  const hasNotice =
    invalid ||
    needsVerification ||
    configError ||
    query.verify === "sent" ||
    query.verified === "1" ||
    query.reset === "1";

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

        {hasNotice && (
          <div className="mt-7 space-y-4">
            {invalid && (
              <p className="rounded-md border border-critical/30 bg-critical/10 px-3 py-2 text-sm text-critical">
                {c.notices.invalid}
              </p>
            )}
            {needsVerification && (
              <p className="rounded-md border border-critical/30 bg-critical/10 px-3 py-2 text-sm text-critical">
                {c.notices.verify}
              </p>
            )}
            {configError && (
              <p className="rounded-md border border-critical/30 bg-critical/10 px-3 py-2 text-sm text-critical">
                {c.notices.config}
              </p>
            )}
            {query.verify === "sent" && (
              <p className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
                {c.notices.verifySent}
              </p>
            )}
            {query.verified === "1" && (
              <p className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
                {c.notices.verified}
              </p>
            )}
            {query.reset === "1" && (
              <p className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
                {c.notices.reset}
              </p>
            )}
          </div>
        )}

        <PortalLoginForm locale={safe} next={query.next ?? ""} copy={c} />

        <p className="mt-6 text-sm text-ink2">
          {c.noAccount}{" "}
          <Link href={`/${safe}/register`} className="text-copper hover:underline">
            {c.registerLink}
          </Link>
        </p>
        <p className="mt-2 text-sm text-ink2">
          {c.forgotPrompt}{" "}
          <Link
            href={`/${safe}/forgot-password`}
            className="text-copper hover:underline"
          >
            {c.forgotLink}
          </Link>
        </p>
      </section>
    </main>
  );
}
