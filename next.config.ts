import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: import.meta.dirname,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    // Belt-and-suspenders with robots.ts: hard-noindex every non-prod deploy.
    if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
      return [
        {
          source: "/:path*",
          headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
