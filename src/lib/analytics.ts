type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (
      command: "event" | "config",
      eventName: string,
      payload?: Record<string, unknown>,
    ) => void;
  }
}

export function trackAnalyticsEvent(
  eventName: string,
  payload: AnalyticsPayload = {},
) {
  if (typeof window === "undefined" || !eventName) return;

  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  );

  window.dataLayer?.push({ event: eventName, ...cleanPayload });
  window.gtag?.("event", eventName, cleanPayload);
  window.dispatchEvent(
    new CustomEvent("assaddar:analytics", {
      detail: { event: eventName, ...cleanPayload },
    }),
  );
}
