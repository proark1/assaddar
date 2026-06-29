"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";
import type { Locale } from "@/content";
import type { AuthCopy } from "@/lib/portal/auth-copy";
import { trackAnalyticsEvent } from "@/lib/analytics";

const fieldClass =
  "w-full rounded-lg border border-hairline bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-copper";

export function PortalLoginForm({
  locale,
  next,
  copy,
}: {
  locale: Locale;
  next: string;
  copy: AuthCopy["login"];
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [redirectTo, setRedirectTo] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const controller = new AbortController();
    const requestTimeout = window.setTimeout(() => controller.abort(), 15000);

    setPending(true);
    setError("");
    setRedirectTo("");

    try {
      const response = await fetch("/api/portal/login-json", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        signal: controller.signal,
        body: JSON.stringify({
          locale,
          next,
          email: String(formData.get("email") || ""),
          password: String(formData.get("password") || ""),
        }),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        message?: string;
        redirectTo?: string;
      };

      if (!response.ok || !result.ok || !result.redirectTo) {
        setError(result.message || copy.genericError);
        trackAnalyticsEvent("login_error", {
          status: response.status,
          locale,
        });
        setPending(false);
        return;
      }

      const redirectTarget = result.redirectTo;
      setRedirectTo(redirectTarget);
      trackAnalyticsEvent("login_success", { locale });
      window.setTimeout(() => window.location.assign(redirectTarget), 0);
      window.setTimeout(() => setPending(false), 5000);
    } catch (cause) {
      trackAnalyticsEvent("login_error", {
        status:
          cause instanceof DOMException && cause.name === "AbortError"
            ? "timeout"
            : "network",
        locale,
      });
      setError(
        cause instanceof DOMException && cause.name === "AbortError"
          ? copy.timeoutError
          : copy.failError,
      );
      setPending(false);
    } finally {
      window.clearTimeout(requestTimeout);
    }
  }

  return (
    <form
      action="/api/portal/login"
      method="post"
      onSubmit={submit}
      className="mt-7 space-y-4"
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm text-ink2">
          {copy.emailLabel}
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
          {copy.passwordLabel}
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

      {error && (
        <p className="rounded-md border border-critical/30 bg-critical/10 px-3 py-2 text-sm text-critical">
          {error}
        </p>
      )}

      {redirectTo && (
        <p
          role="status"
          className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
        >
          {copy.successPrefix}{" "}
          <a href={redirectTo} className="font-medium underline underline-offset-4">
            {copy.openPortal}
          </a>
        </p>
      )}

      <button
        type="submit"
        disabled={pending || Boolean(redirectTo)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-copper px-5 py-3 text-sm font-medium text-oncopper shadow-[0_2px_8px_rgba(166,110,47,0.25)] transition-colors hover:bg-copper-hi disabled:cursor-wait disabled:opacity-70"
      >
        <LogIn className="h-4 w-4" />
        {redirectTo ? copy.opening : pending ? copy.submitting : copy.submit}
      </button>
    </form>
  );
}
