import { ImageResponse } from "next/og";
import { getDict, isLocale, type Locale } from "@/content";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Assad Dar — AI process analysis for SMBs";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safe: Locale = isLocale(locale) ? locale : "de";
  const t = getDict(safe);

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
            fontSize: 28,
            letterSpacing: 6,
            color: "#f4f2ee",
            fontWeight: 600,
          }}
        >
          ASSADDAR
          <span style={{ color: "#e0a458" }}>.</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#e0a458",
              marginBottom: 24,
            }}
          >
            {t.hero.kicker}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 60,
              lineHeight: 1.15,
              color: "#f4f2ee",
              maxWidth: 1000,
            }}
          >
            {t.hero.line1}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 26,
            color: "#a7aeb8",
          }}
        >
          {t.hero.line2}
        </div>
      </div>
    ),
    { ...size },
  );
}
