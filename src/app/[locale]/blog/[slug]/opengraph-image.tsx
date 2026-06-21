import { ImageResponse } from "next/og";
import { getPost, posts } from "@/blog/posts";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ASSADDAR Blog";

// German-only blog → generate OG images for the de articles.
export function generateStaticParams() {
  return posts.map((p) => ({ locale: "de", slug: p.slug }));
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  const title = post?.title ?? "ASSADDAR Blog";
  const category = post?.category ?? "Blog";
  const minutes = post?.readingTimeMin;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0b0d10",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 28,
              letterSpacing: 6,
              color: "#f4f2ee",
              fontWeight: 600,
            }}
          >
            ASSADDAR
            <span style={{ color: "#e0a458" }}>.</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 20,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#e0a458",
            }}
          >
            {category}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: title.length > 72 ? 52 : 62,
            lineHeight: 1.12,
            color: "#f4f2ee",
            maxWidth: 1040,
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 24,
            color: "#a7aeb8",
          }}
        >
          <span style={{ display: "flex" }}>assad-dar.de</span>
          {minutes ? (
            <>
              <span style={{ display: "flex", color: "#39414c" }}>·</span>
              <span style={{ display: "flex" }}>{minutes} Min Lesezeit</span>
            </>
          ) : null}
        </div>
      </div>
    ),
    { ...size },
  );
}
