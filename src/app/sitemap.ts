import type { MetadataRoute } from "next";

const SITE = "https://assaddar.com";
const LAST_MODIFIED = new Date("2026-06-21");

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = { de: `${SITE}/de`, en: `${SITE}/en` };
  return [
    {
      url: `${SITE}/de`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages },
    },
    {
      url: `${SITE}/en`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: { languages },
    },
  ];
}
