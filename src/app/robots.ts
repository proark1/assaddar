import type { MetadataRoute } from "next";

const SITE = "https://assad-dar.de";

export default function robots(): MetadataRoute.Robots {
  // Non-production deploys (Vercel preview/staging) must never be indexed.
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
