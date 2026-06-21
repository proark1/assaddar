"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";
import type { Locale } from "@/content";

const fieldClass =
  "w-full rounded-lg border border-hairline bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-copper";

export function PortalLoginForm({
  locale,
  next,
}: {
  locale: Locale;
  next: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);

    setPending(true);
    setError("");

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
        setError(result.message || "Login nicht moeglich. Bitte erneut versuchen.");
        setPending(false);
        return;
      }

      window.location.assign(result.redirectTo);
    } catch (cause) {
      setError(
        cause instanceof DOMException && cause.name === "AbortError"
          ? "Der Login dauert zu lange. Bitte Verbindung pruefen und erneut versuchen."
          : "Login konnte nicht abgeschlossen werden. Bitte erneut versuchen.",
      );
      setPending(false);
    } finally {
      window.clearTimeout(timeout);
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

      {error && (
        <p className="rounded-md border border-critical/30 bg-critical/10 px-3 py-2 text-sm text-critical">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-copper px-5 py-3 text-sm font-medium text-oncopper shadow-[0_2px_8px_rgba(166,110,47,0.25)] transition-colors hover:bg-copper-hi disabled:cursor-wait disabled:opacity-70"
      >
        <LogIn className="h-4 w-4" />
        {pending ? "Einloggen..." : "Einloggen"}
      </button>
    </form>
  );
}
