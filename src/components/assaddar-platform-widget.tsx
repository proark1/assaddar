"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

const WIDGET_URL =
  process.env.NEXT_PUBLIC_ASSADDAR_WIDGET_URL ??
  "https://assaddar-widget-production.up.railway.app/widget.js";
const API_URL =
  process.env.NEXT_PUBLIC_ASSADDAR_API_URL ??
  "https://assaddar-api-production.up.railway.app";
const ASSISTANT_ID =
  process.env.NEXT_PUBLIC_ASSADDAR_ASSISTANT_ID ??
  "asst_5965790b88cc480b836f5eca";

const PRIVATE_ROUTE_PARTS = new Set([
  "portal",
  "login",
  "register",
  "forgot-password",
  "reset-password",
  "verify-email",
  "invite",
]);

export function AssaddarPlatformWidget() {
  const pathname = usePathname();
  const routeParts = pathname.split("/").filter(Boolean).slice(1);
  const isPrivateRoute = routeParts.some((part) =>
    PRIVATE_ROUTE_PARTS.has(part),
  );

  if (isPrivateRoute) {
    return null;
  }

  return (
    <Script
      id="assaddar-platform-widget"
      src={WIDGET_URL}
      strategy="afterInteractive"
      data-assistant-id={ASSISTANT_ID}
      data-api-url={API_URL}
    />
  );
}
