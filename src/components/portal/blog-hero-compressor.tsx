"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const RECOMMENDED_IMAGE_SIZE = 350 * 1024;

function formatBytes(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0 KB";
  if (value >= 1024 * 1024) {
    return `${(value / 1024 / 1024).toLocaleString("de-DE", {
      maximumFractionDigits: 2,
    })} MB`;
  }
  return `${Math.max(1, Math.round(value / 1024)).toLocaleString("de-DE")} KB`;
}

function blobFromCanvas(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

type BlogHeroCompressorProps = {
  slug: string;
  imageUrl: string;
  currentSize: number;
  alreadyCompressed?: boolean;
};

export function BlogHeroCompressor({
  slug,
  imageUrl,
  currentSize,
  alreadyCompressed = false,
}: BlogHeroCompressorProps) {
  const router = useRouter();
  const [compressed, setCompressed] = useState<{
    blob: Blob;
    url: string;
    mimeType: string;
    width: number;
    height: number;
  } | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const savings = compressed
    ? currentSize > 0
      ? Math.round(((currentSize - compressed.blob.size) / currentSize) * 100)
      : 0
    : 0;

  const compressImage = useCallback(async () => {
    setError("");
    setStatus("");
    setIsCompressing(true);
    if (compressed?.url) URL.revokeObjectURL(compressed.url);
    setCompressed(null);

    try {
      const response = await fetch(imageUrl, { cache: "no-store" });
      if (!response.ok) throw new Error("Bild konnte nicht geladen werden.");
      const originalBlob = await response.blob();
      const bitmap = await createImageBitmap(originalBlob);
      const maxWidth = 1600;
      const scale = Math.min(1, maxWidth / bitmap.width);
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas ist im Browser nicht verfügbar.");
      context.drawImage(bitmap, 0, 0, width, height);
      bitmap.close();

      const webp = await blobFromCanvas(canvas, "image/webp", 0.78);
      const jpeg = await blobFromCanvas(canvas, "image/jpeg", 0.82);
      const candidates = [webp, jpeg].filter((entry): entry is Blob =>
        Boolean(entry),
      );
      const best = candidates.sort((a, b) => a.size - b.size)[0];
      if (!best) throw new Error("Komprimierung fehlgeschlagen.");

      setCompressed({
        blob: best,
        url: URL.createObjectURL(best),
        mimeType: best.type || "image/webp",
        width,
        height,
      });
      setStatus("Komprimierte Version bereit. Bitte speichern, wenn sie passt.");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Komprimierung fehlgeschlagen.",
      );
    } finally {
      setIsCompressing(false);
    }
  }, [compressed?.url, imageUrl]);

  function saveCompressed() {
    if (!compressed) return;
    setError("");
    setStatus("");
    setIsSaving(true);
    void (async () => {
      try {
        const form = new FormData();
        form.set(
          "file",
          compressed.blob,
          `${slug}.${compressed.mimeType.includes("jpeg") ? "jpg" : "webp"}`,
        );
        form.set("mimeType", compressed.mimeType);
        form.set("width", String(compressed.width));
        form.set("height", String(compressed.height));
        const response = await fetch(`/api/blog/hero/${encodeURIComponent(slug)}`, {
          method: "POST",
          body: form,
        });
        const result = (await response.json().catch(() => null)) as
          | { ok?: boolean; message?: string }
          | null;
        if (!response.ok || !result?.ok) {
          throw new Error(result?.message || "Speichern fehlgeschlagen.");
        }
        setStatus("Komprimiertes Bild gespeichert.");
        router.refresh();
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Speichern fehlgeschlagen.",
        );
      } finally {
        setIsSaving(false);
      }
    })();
  }

  useEffect(() => {
    function handleCompressAll() {
      if (!isCompressing && !isSaving) {
        void compressImage();
      }
    }

    window.addEventListener("blog-heroes:compress-all", handleCompressAll);
    return () => {
      window.removeEventListener("blog-heroes:compress-all", handleCompressAll);
    };
  }, [compressImage, isCompressing, isSaving]);

  const isOverRecommendedSize = currentSize > RECOMMENDED_IMAGE_SIZE;

  return (
    <div className="mt-4 rounded-lg border border-hairline bg-bg p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">
            Bildgröße
          </div>
          <div className="mt-1 text-sm text-ink">
            Aktuell: <span className="font-medium">{formatBytes(currentSize)}</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-2 text-[12px]">
            <span
              className={`rounded-md border px-2 py-1 ${
                isOverRecommendedSize
                  ? "border-copper/30 bg-copper/10 text-copper"
                  : "border-success/25 bg-success/10 text-success"
              }`}
            >
              Empfehlung: max. {formatBytes(RECOMMENDED_IMAGE_SIZE)}
            </span>
            {alreadyCompressed && (
              <span className="rounded-md border border-success/25 bg-success/10 px-2 py-1 text-success">
                Komprimiert gespeichert
              </span>
            )}
          </div>
          {compressed && (
            <div className="mt-1 text-sm text-ink">
              Nach Komprimierung:{" "}
              <span className="font-medium">{formatBytes(compressed.blob.size)}</span>
              <span
                className={`ml-2 text-[12px] ${
                  savings > 0 ? "text-success" : "text-critical"
                }`}
              >
                {savings > 0 ? `${savings}% kleiner` : "nicht kleiner"}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={compressImage}
            disabled={isCompressing || isSaving}
            className="inline-flex items-center justify-center rounded-lg border border-hairline px-3 py-2 text-[12px] font-medium text-ink transition-colors hover:border-copper hover:text-copper disabled:cursor-wait disabled:opacity-60"
          >
            {isCompressing ? "Komprimiere..." : "Komprimieren"}
          </button>
          {compressed && (
            <button
              type="button"
              onClick={saveCompressed}
              disabled={isSaving}
              className="inline-flex items-center justify-center rounded-lg bg-copper px-3 py-2 text-[12px] font-medium text-oncopper transition-colors hover:bg-copper-hi disabled:cursor-wait disabled:opacity-60"
            >
              {isSaving ? "Speichert..." : "Speichern"}
            </button>
          )}
        </div>
      </div>
      {compressed && (
        <div className="mt-3 overflow-hidden rounded-lg border border-hairline">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={compressed.url}
            alt=""
            className="aspect-[16/6] w-full object-cover"
          />
        </div>
      )}
      {status && (
        <p className="mt-3 text-[12px] leading-relaxed text-success">{status}</p>
      )}
      {error && (
        <p className="mt-3 text-[12px] leading-relaxed text-critical">{error}</p>
      )}
    </div>
  );
}

export function BlogHeroBulkCompressor({ count }: { count: number }) {
  const [isRunning, setIsRunning] = useState(false);

  function compressAll() {
    setIsRunning(true);
    window.dispatchEvent(new CustomEvent("blog-heroes:compress-all"));
    window.setTimeout(() => setIsRunning(false), 1200);
  }

  return (
    <button
      type="button"
      onClick={compressAll}
      disabled={isRunning || count === 0}
      className="inline-flex items-center justify-center rounded-lg border border-hairline px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper disabled:cursor-wait disabled:opacity-60"
    >
      {isRunning ? "Bilder werden geprüft..." : `Alle Bilder komprimieren (${count})`}
    </button>
  );
}
