import type { NextConfig } from "next";

function originFrom(value?: string) {
  if (!value) return "";
  try {
    return new URL(value).origin;
  } catch {
    return "";
  }
}

function contentSecurityPolicy() {
  const isDev = process.env.NODE_ENV !== "production";
  const widgetOrigin = originFrom(process.env.NEXT_PUBLIC_ASSADDAR_WIDGET_URL);
  const apiOrigin = originFrom(process.env.NEXT_PUBLIC_ASSADDAR_API_URL);
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

function securityHeaders() {
  return [
    { key: "Content-Security-Policy", value: contentSecurityPolicy() },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=()",
    },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-DNS-Prefetch-Control", value: "on" },
    ...(process.env.NODE_ENV === "production"
      ? [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ]
      : []),
  ];
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: import.meta.dirname,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    const headers = securityHeaders();
    // Belt-and-suspenders with robots.ts: hard-noindex every non-prod deploy.
    if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
      return [
        {
          source: "/:path*",
          headers: [
            ...headers,
            { key: "X-Robots-Tag", value: "noindex, nofollow" },
          ],
        },
      ];
    }
    return [{ source: "/:path*", headers }];
  },
};

export default nextConfig;
