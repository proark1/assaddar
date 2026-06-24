import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  BriefcaseBusiness,
  Clock3,
  FileText,
  FolderKanban,
  Images,
  LayoutDashboard,
  LogOut,
  PencilLine,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { Locale } from "@/content";
import { logoutAction } from "@/app/actions/auth";
import type { User } from "@/lib/portal/types";

export const fieldClass =
  "w-full rounded-lg border border-hairline bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-copper";

export const textareaClass = `${fieldClass} min-h-28 resize-y`;

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "green" | "amber" | "red" | "copper";
}) {
  const tones = {
    neutral: "border-hairline bg-surface2 text-ink2",
    green: "border-success/30 bg-success/10 text-success",
    amber: "border-copper/30 bg-copper/10 text-copper",
    red: "border-critical/30 bg-critical/10 text-critical",
    copper: "border-copper/30 bg-copper/10 text-copper",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-1 text-[12px] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function PortalCard({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`rounded-lg border border-hairline bg-surface p-5 shadow-card ${className}`}
    >
      {children}
    </section>
  );
}

export function PortalSectionTitle({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      {eyebrow && (
        <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-copper">
          {eyebrow}
        </div>
      )}
      <h2 className="mt-1 text-lg font-medium text-ink">{title}</h2>
      {children && <p className="mt-2 text-sm leading-relaxed text-ink2">{children}</p>}
    </div>
  );
}

export function PortalShell({
  user,
  locale,
  title,
  eyebrow,
  backHref,
  activeNav,
  actions,
  children,
}: {
  user: User;
  locale: Locale;
  title: string;
  eyebrow: string;
  backHref?: string;
  activeNav?:
    | "website"
    | "dashboard"
    | "admin"
    | "today"
    | "pipeline"
    | "drafts"
    | "customers"
    | "templates"
    | "blog"
    | "settings";
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const navClass = (key: NonNullable<typeof activeNav>) =>
    `inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors ${
      activeNav === key
        ? "bg-copper/10 text-copper"
        : "text-ink2 hover:text-ink"
    }`;
  const mobileNavClass = (key: NonNullable<typeof activeNav>) =>
    `shrink-0 rounded-lg border px-3 py-2 ${
      activeNav === key
        ? "border-copper bg-copper/10 text-copper"
        : "border-hairline text-ink2"
    }`;

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-hairline bg-surface/85 backdrop-blur">
        <div className="mx-auto flex min-h-16 w-full max-w-[1240px] items-center justify-between gap-4 px-5 py-3 md:px-8">
          <Link
            href={`/${locale}/portal`}
            className="inline-flex items-center gap-2 text-sm font-medium text-ink"
          >
            <BriefcaseBusiness className="h-4 w-4 text-copper" />
            Assad Dar Portal
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-ink2 md:flex">
            <Link href={`/${locale}`} className={navClass("website")}>
              Website
            </Link>
            <Link href={`/${locale}/portal`} className={navClass("dashboard")}>
              Dashboard
            </Link>
            {user.role === "admin" && (
              <>
                <Link
                  href={`/${locale}/portal/admin`}
                  className={navClass("admin")}
                >
                  Cockpit
                </Link>
                <Link
                  href={`/${locale}/portal/admin/today`}
                  className={navClass("today")}
                >
                  <Clock3 className="h-3.5 w-3.5" />
                  Heute
                </Link>
                <Link
                  href={`/${locale}/portal/admin/pipeline`}
                  className={navClass("pipeline")}
                >
                  <FolderKanban className="h-3.5 w-3.5" />
                  Pipeline
                </Link>
                <Link
                  href={`/${locale}/portal/admin/drafts`}
                  className={navClass("drafts")}
                >
                  <PencilLine className="h-3.5 w-3.5" />
                  Drafts
                </Link>
                <Link
                  href={`/${locale}/portal/admin/customers`}
                  className={navClass("customers")}
                >
                  <Users className="h-3.5 w-3.5" />
                  Kunden
                </Link>
                <Link
                  href={`/${locale}/portal/admin/templates`}
                  className={navClass("templates")}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Templates
                </Link>
                <Link
                  href={`/${locale}/portal/admin/blog`}
                  className={navClass("blog")}
                >
                  <Images className="h-3.5 w-3.5" />
                  Blog
                </Link>
              </>
            )}
            <Link
              href={`/${locale}/portal/settings`}
              className={navClass("settings")}
            >
              Settings
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium text-ink">{user.name}</div>
              <div className="text-[12px] text-muted">{user.email}</div>
            </div>
            <form action={logoutAction}>
              <input type="hidden" name="locale" value={locale} />
              <Link
                href={`/${locale}/portal/settings`}
                aria-label="Settings"
                className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-hairline text-ink2 transition-colors hover:border-copper hover:text-copper md:hidden"
              >
                <Settings className="h-4 w-4" />
              </Link>
              <button
                type="submit"
                aria-label="Logout"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-hairline text-ink2 transition-colors hover:border-copper hover:text-copper"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="border-b border-hairline bg-surface md:hidden">
        <nav
          className="mx-auto flex w-full max-w-[1240px] gap-2 overflow-x-auto px-5 py-3 text-sm text-ink2"
          aria-label="Mobile Portal Navigation"
        >
          <Link
            href={`/${locale}`}
            className={mobileNavClass("website")}
          >
            Website
          </Link>
          <Link
            href={`/${locale}/portal`}
            className={mobileNavClass("dashboard")}
          >
            Dashboard
          </Link>
          {user.role === "admin" && (
            <>
              <Link
                href={`/${locale}/portal/admin`}
                className={mobileNavClass("admin")}
              >
                Cockpit
              </Link>
              <Link
                href={`/${locale}/portal/admin/today`}
                className={mobileNavClass("today")}
              >
                Heute
              </Link>
              <Link
                href={`/${locale}/portal/admin/pipeline`}
                className={mobileNavClass("pipeline")}
              >
                Pipeline
              </Link>
              <Link
                href={`/${locale}/portal/admin/drafts`}
                className={mobileNavClass("drafts")}
              >
                Drafts
              </Link>
              <Link
                href={`/${locale}/portal/admin/customers`}
                className={mobileNavClass("customers")}
              >
                Kunden
              </Link>
            </>
          )}
          <Link
            href={`/${locale}/portal/settings`}
            className={mobileNavClass("settings")}
          >
            Settings
          </Link>
        </nav>
      </div>

      <main className="mx-auto w-full max-w-[1240px] px-5 py-8 md:px-8 md:py-10">
        {backHref && (
          <Link
            href={backHref}
            className="mb-6 inline-flex items-center gap-2 text-sm text-ink2 transition-colors hover:text-copper"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </Link>
        )}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-copper">
              {user.role === "admin" ? (
                <ShieldCheck className="h-3.5 w-3.5" />
              ) : (
                <LayoutDashboard className="h-3.5 w-3.5" />
              )}
              {eyebrow}
            </div>
            <h1 className="mt-3 max-w-3xl font-serif text-3xl font-normal leading-tight text-ink md:text-[42px]">
              {title}
            </h1>
          </div>
          {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
        </div>
        {children}
      </main>
    </div>
  );
}

export function EmptyState({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-strong bg-surface2 p-8 text-center">
      <FileText className="mx-auto h-8 w-8 text-copper" />
      <h2 className="mt-4 text-lg font-medium text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-ink2">
        {children}
      </p>
    </div>
  );
}
