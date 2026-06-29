"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackAnalyticsEvent } from "@/lib/analytics";

function analyticsTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLElement>("[data-analytics-event]");
}

export function AnalyticsEvents() {
  const pathname = usePathname();

  useEffect(() => {
    trackAnalyticsEvent("page_view", { path: pathname });
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = analyticsTarget(event.target);
      const eventName = target?.dataset.analyticsEvent;
      if (!eventName) return;

      trackAnalyticsEvent(eventName, {
        label: target.dataset.analyticsLabel || target.textContent?.trim(),
        href:
          target instanceof HTMLAnchorElement
            ? target.href
            : target.getAttribute("href") || undefined,
        path: window.location.pathname,
      });
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
