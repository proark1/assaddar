import { NextResponse, type NextRequest } from "next/server";

function originFrom(value?: string | null) {
  if (!value) return "";
  try {
    return new URL(value).origin;
  } catch {
    return "";
  }
}

function contentSecurityPolicy() {
  const isDev = process.env.NODE_ENV !== "production";
  const widgetOrigin = originFrom(
    process.env.NEXT_PUBLIC_ASSADDAR_WIDGET_URL ??
      "https://assaddar-widget-production.up.railway.app/widget.js",
  );
  const apiOrigin = originFrom(
    process.env.NEXT_PUBLIC_ASSADDAR_API_URL ??
      "https://assaddar-api-production.up.railway.app",
  );
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    isDev ? "'unsafe-eval'" : "",
    widgetOrigin,
  ].filter(Boolean);
  const connectSrc = ["'self'", apiOrigin].filter(Boolean);

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${connectSrc.join(" ")}`,
    "frame-src https://cal.com",
    "media-src 'self' blob:",
    "manifest-src 'self'",
    isDev ? "" : "upgrade-insecure-requests",
  ]
    .filter(Boolean)
    .join("; ");
}

export function proxy(req: NextRequest) {
  let response: NextResponse;
  const accept = req.headers.get("accept-language")?.toLowerCase() ?? "";
  const locale = accept.startsWith("en") ? "en" : "de";
  // Rewrite (not redirect) so "/" returns 200 and serves the locale homepage.
  // Canonical/hreflang on the page point crawlers to the prefixed URLs.
  if (req.nextUrl.pathname === "/") {
    response = NextResponse.rewrite(new URL(`/${locale}`, req.url));
  } else {
    response = NextResponse.next();
  }

  response.headers.set("Content-Security-Policy", contentSecurityPolicy());
  return response;
}

export const config = {
  matcher: [
    {
      source:
        "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
