"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";

export type AdminCommand = {
  label: string;
  href: string;
  group: string;
  keywords?: string;
};

export function AdminCommandPalette({
  commands,
}: {
  commands: AdminCommand[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 25);
    return () => window.clearTimeout(timer);
  }, [open]);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return commands.slice(0, 10);
    return commands
      .filter((command) =>
        [command.label, command.group, command.keywords]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(value),
      )
      .slice(0, 10);
  }, [commands, query]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-hairline px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-copper hover:text-copper"
      >
        <Search className="h-4 w-4" />
        Suche
        <span className="rounded-md border border-hairline px-1.5 py-0.5 font-mono text-[10px] text-muted">
          Cmd K
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-ink/35 px-4 py-16 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="mx-auto max-w-2xl rounded-lg border border-hairline bg-surface shadow-card">
            <div className="flex items-center gap-3 border-b border-hairline px-4 py-3">
              <Search className="h-4 w-4 text-copper" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Projekt, Aktion oder Bereich suchen..."
                className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Suche schließen"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-hairline text-ink2 transition-colors hover:border-copper hover:text-copper"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filtered.map((command) => (
                <Link
                  key={`${command.group}-${command.href}-${command.label}`}
                  href={command.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-copper/10"
                >
                  <span>
                    <span className="block text-sm font-medium text-ink">
                      {command.label}
                    </span>
                    <span className="mt-0.5 block text-[12px] text-muted">
                      {command.group}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-copper" />
                </Link>
              ))}
              {filtered.length === 0 && (
                <div className="px-3 py-8 text-center text-sm text-muted">
                  Keine passende Aktion gefunden.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
