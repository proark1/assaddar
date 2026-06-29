"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { submitContact, type ContactState } from "@/app/actions/contact";
import type { Dict, Locale } from "@/content";

const INITIAL: ContactState = { status: "idle" };

export function ContactForm({
  t,
  email,
  locale,
  leadContext = "",
}: {
  t: Dict["termin"];
  email: string;
  locale: Locale;
  leadContext?: string;
}) {
  const [state, action, pending] = useActionState(submitContact, INITIAL);

  if (state.status === "ok") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-success/40 bg-success/10 p-6">
        <Check className="mt-0.5 h-5 w-5 shrink-0 text-success" />
        <p className="text-sm leading-relaxed text-ink">{t.success}</p>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-hairline bg-bg px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-copper";

  return (
    <form action={action} className="space-y-4">
      {leadContext && (
        <div className="rounded-lg border border-copper/30 bg-copper/10 p-4 text-sm leading-relaxed text-ink2">
          <div className="font-medium text-ink">
            {locale === "de" ? "ASDAR Check Ergebnis" : "ASDAR check result"}
          </div>
          <p className="mt-2 whitespace-pre-line text-[12px] text-muted">
            {leadContext}
          </p>
          <input type="hidden" name="leadContext" value={leadContext} />
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className="mb-1.5 block text-sm text-ink2">
            {t.name}
          </label>
          <input id="cf-name" name="name" required className={inputCls} />
        </div>
        <div>
          <label htmlFor="cf-email" className="mb-1.5 block text-sm text-ink2">
            {t.email}
          </label>
          <input
            id="cf-email"
            name="email"
            type="email"
            required
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label htmlFor="cf-company" className="mb-1.5 block text-sm text-ink2">
          {t.company}
        </label>
        <input id="cf-company" name="company" className={inputCls} />
      </div>

      <div>
        <label htmlFor="cf-message" className="mb-1.5 block text-sm text-ink2">
          {t.message}
        </label>
        <textarea
          id="cf-message"
          name="message"
          required
          rows={5}
          className={`${inputCls} resize-y`}
        />
      </div>

      {/* honeypot */}
      <input
        type="text"
        name="company_url"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <label className="flex items-start gap-2.5 text-[13px] leading-relaxed text-ink2">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-copper)]"
        />
        <span>
          {t.consent}{" "}
          <Link
            href={`/${locale}/datenschutz`}
            className="text-copper hover:underline"
          >
            {t.privacyLink}
          </Link>
        </span>
      </label>
      <p className="text-[12px] leading-relaxed text-muted">{t.privacyNote}</p>

      {state.status === "invalid" && (
        <p className="text-[13px] text-critical">{t.validation}</p>
      )}
      {state.status === "rate" && (
        <p className="text-[13px] text-critical">{t.rateLimit}</p>
      )}
      {(state.status === "noconfig" || state.status === "error") && (
        <p className="text-[13px] text-ink2">
          {t.errorTitle} — {t.fallback}{" "}
          <a
            href={`mailto:${email}`}
            className="text-copper hover:underline"
          >
            {email}
          </a>
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-lg bg-copper px-5 py-3 text-sm font-medium text-oncopper shadow-[0_2px_8px_rgba(166,110,47,0.25)] transition-all hover:-translate-y-0.5 hover:bg-copper-hi disabled:opacity-60"
      >
        {pending ? t.sending : t.submit}
      </button>
    </form>
  );
}
