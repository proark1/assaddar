export type GeneratedImage = {
  bytes: Buffer;
  contentType: string;
  width: number;
  height: number;
  provider: string;
};

// Landscape; rendered inside a 16:6 hero band via object-cover.
const SIZE = "1536x1024";

/**
 * Generate a blog hero image from a prompt via the OpenAI Images API
 * (gpt-image-1 by default). Returns raw PNG bytes.
 * Requires OPENAI_API_KEY; model overridable via OPENAI_IMAGE_MODEL.
 */
export async function generateHeroImage(prompt: string): Promise<GeneratedImage> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }
  const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ model, prompt, size: SIZE, n: 1 }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Image generation failed (${response.status}): ${detail.slice(0, 200)}`,
    );
  }

  const data = (await response.json()) as {
    data?: Array<{ b64_json?: string; url?: string }>;
  };
  const first = data.data?.[0];

  let bytes: Buffer;
  if (first?.b64_json) {
    bytes = Buffer.from(first.b64_json, "base64");
  } else if (first?.url) {
    const img = await fetch(first.url);
    bytes = Buffer.from(await img.arrayBuffer());
  } else {
    throw new Error("Image generation returned no image data.");
  }

  const [width, height] = SIZE.split("x").map(Number);
  return { bytes, contentType: "image/png", width, height, provider: "openai" };
}
