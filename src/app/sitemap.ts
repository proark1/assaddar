import type { MetadataRoute } from "next";
import { posts } from "@/blog/posts";

const SITE = "https://assad-dar.de";
const LAST_MODIFIED = new Date("2026-06-22");

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = { de: `${SITE}/de`, en: `${SITE}/en` };

  const blog: MetadataRoute.Sitemap = [
    {
      url: `${SITE}/de/blog`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...posts.map((p) => ({
      url: `${SITE}/de/blog/${p.slug}`,
      lastModified: new Date(p.updatedAt ?? p.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  const detailPages: MetadataRoute.Sitemap = [
    "asdar-method",
    "angebote",
    "branchen",
    "meine-produkte",
  ].flatMap((slug) => [
    {
      url: `${SITE}/de/${slug}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.8,
      alternates: {
        languages: {
          de: `${SITE}/de/${slug}`,
          en: `${SITE}/en/${slug}`,
        },
      },
    },
    {
      url: `${SITE}/en/${slug}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      alternates: {
        languages: {
          de: `${SITE}/de/${slug}`,
          en: `${SITE}/en/${slug}`,
        },
      },
    },
  ]);

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
    {
      url: `${SITE}/de/ueber-mich`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: {
          de: `${SITE}/de/ueber-mich`,
          en: `${SITE}/en/ueber-mich`,
        },
      },
    },
    {
      url: `${SITE}/en/ueber-mich`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: {
          de: `${SITE}/de/ueber-mich`,
          en: `${SITE}/en/ueber-mich`,
        },
      },
    },
    ...detailPages,
    ...blog,
  ];
}
