"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const textareaClass =
  "w-full min-h-28 resize-y rounded-lg border border-hairline bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-copper";

type ExistingHero = {
  alt: string;
  generatedAt: string;
};

type GenerateResult =
  | {
      ok: true;
      generatedAt: string;
      imageUrl: string;
      provider: string;
    }
  | {
      ok: false;
      message?: string;
    };

async function readJsonResult(response: Response): Promise<GenerateResult> {
  try {
    return (await response.json()) as GenerateResult;
  } catch {
    return {
      ok: false,
      message: `Server antwortete nicht mit JSON (${response.status}).`,
    };
  }
}

function resultMessage(result: GenerateResult) {
  return result.ok ? "" : result.message || "";
}

export function BlogHeroGenerator({
  slug,
  title,
  category,
  initialPrompt,
  existing,
}: {
  slug: string;
  title: string;
  category: string;
  initialPrompt: string;
  existing?: ExistingHero;
}) {
  const router = useRouter();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [imageUrl, setImageUrl] = useState(
    existing
      ? `/api/blog/hero/${slug}?v=${encodeURIComponent(existing.generatedAt)}`
      : "",
  );
  const [generatedAt, setGeneratedAt] = useState(existing?.generatedAt ?? "");
  const [pending, setPending] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function generate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || removing) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 70_000);

    setPending(true);
    setMessage("Bild wird generiert. Das kann bis zu einer Minute dauern.");
    setError("");

    try {
      const response = await fetch(`/api/blog/hero/${slug}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        signal: controller.signal,
        body: JSON.stringify({ prompt }),
      });
      const result = await readJsonResult(response);

      if (!response.ok || !result.ok) {
        throw new Error(
          resultMessage(result) ||
            "Bildgenerierung fehlgeschlagen. Bitte erneut versuchen.",
        );
      }

      setImageUrl(result.imageUrl);
      setGeneratedAt(result.generatedAt);
      setMessage(`Hero-Bild generiert und veroeffentlicht (${result.provider}).`);
      router.refresh();
    } catch (cause) {
      setMessage("");
      setError(
        cause instanceof DOMException && cause.name === "AbortError"
          ? "Die Generierung dauert zu lange. Bitte spaeter erneut versuchen."
          : cause instanceof Error
            ? cause.message
            : "Bildgenerierung fehlgeschlagen. Bitte erneut versuchen.",
      );
    } finally {
      window.clearTimeout(timeout);
      setPending(false);
    }
  }

  async function remove() {
    if (!imageUrl || pending || removing) return;

    setRemoving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/blog/hero/${slug}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const result = await readJsonResult(response);

      if (!response.ok || !result.ok) {
        throw new Error(
          resultMessage(result) || "Hero-Bild konnte nicht entfernt werden.",
        );
      }

      setImageUrl("");
      setGeneratedAt("");
      setMessage("Hero-Bild entfernt. Der Artikel nutzt wieder den SVG-Hero.");
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Hero-Bild konnte nicht entfernt werden.",
      );
    } finally {
      setRemoving(false);
    }
  }

  return (
    <section className="rounded-lg border border-hairline bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="inline-flex items-center rounded-md border border-copper/30 bg-copper/10 px-2 py-1 text-[12px] text-copper">
            {category}
          </span>
          <h3 className="mt-2 font-serif text-lg text-ink">{title}</h3>
        </div>
        {imageUrl && (
          <span className="inline-flex items-center rounded-md border border-success/30 bg-success/10 px-2 py-1 text-[12px] text-success">
            Aktiv
          </span>
        )}
      </div>

      {imageUrl && (
        <div className="mt-4 overflow-hidden rounded-lg border border-hairline">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={existing?.alt ?? `Illustration zum Artikel: ${title}`}
            className="aspect-[16/6] w-full object-cover"
          />
        </div>
      )}

      <form onSubmit={generate} className="mt-4 space-y-3">
        <label className="block">
          <span className="mb-1.5 block font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">
            Bild-Prompt
          </span>
          <textarea
            name="prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            className={textareaClass}
          />
        </label>

        {message && (
          <p
            role="status"
            className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
          >
            {message}
          </p>
        )}
        {error && (
          <p className="rounded-md border border-critical/30 bg-critical/10 px-3 py-2 text-sm text-critical">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending || removing}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi disabled:cursor-wait disabled:opacity-70"
          >
            {pending ? "Generiere..." : imageUrl ? "Neu generieren" : "Generieren"}
          </button>
          {generatedAt && (
            <span className="text-[12px] text-muted">
              Zuletzt: {new Date(generatedAt).toLocaleString("de-DE")}
            </span>
          )}
        </div>
      </form>

      {imageUrl && (
        <button
          type="button"
          disabled={pending || removing}
          onClick={remove}
          className="mt-3 text-[12px] text-muted underline-offset-2 transition-colors hover:text-critical hover:underline disabled:cursor-wait disabled:opacity-70"
        >
          {removing ? "Entferne..." : "Hero-Bild entfernen"}
        </button>
      )}
    </section>
  );
}
