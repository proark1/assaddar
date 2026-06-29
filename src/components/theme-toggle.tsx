"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({
  toDark,
  toLight,
  className = "inline-flex",
}: {
  toDark: string;
  toLight: string;
  className?: string;
}) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    // Read the live class rather than local state to stay in sync if the
    // theme was changed elsewhere (or set by the pre-paint init script).
    const next = !document.documentElement.classList.contains("dark");
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  };

  // Label depends on JS state (correct after mount); the icon is CSS-driven off
  // the `.dark` class so the right one paints on first frame — no hydration flash.
  const label = mounted && isDark ? toLight : toDark;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`h-10 w-10 items-center justify-center rounded-lg border border-hairline text-ink2 transition-colors hover:text-ink ${className}`}
    >
      <Sun className="hidden h-4 w-4 dark:block" />
      <Moon className="h-4 w-4 dark:hidden" />
    </button>
  );
}
