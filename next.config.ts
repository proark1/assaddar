import type { NextConfig } from "next";

function securityHeaders() {
  return [
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
