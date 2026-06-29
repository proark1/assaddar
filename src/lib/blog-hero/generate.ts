export type GeneratedImage = {
  bytes: Buffer;
  contentType: string;
  width: number;
  height: number;
  provider: string;
};

type Provider = "gemini" | "openai";

const DEFAULT_TIMEOUT_MS = 45_000;
const DEFAULT_MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/** Default provider is Gemini; set BLOG_IMAGE_PROVIDER=openai to switch. */
function selectedProvider(): Provider {
  return process.env.BLOG_IMAGE_PROVIDER === "openai" ? "openai" : "gemini";
}

function timeoutMs() {
  const value = Number(process.env.BLOG_IMAGE_TIMEOUT_MS);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_TIMEOUT_MS;
}

function maxImageBytes() {
  const value = Number(process.env.BLOG_IMAGE_MAX_BYTES);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_MAX_IMAGE_BYTES;
}

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs());
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function cappedResponseBuffer(response: Response, maxBytes = maxImageBytes()) {
  if (!response.body) return Buffer.from(await response.arrayBuffer());

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new Error(`Generated image exceeded ${maxBytes} bytes.`);
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

function detectImageMime(bytes: Buffer) {
  if (bytes.length >= 24 && bytes[0] === 0x89 && bytes[1] === 0x50) {
    return "image/png";
  }
  if (bytes.length > 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return "";
}

function validatedImage(
  bytes: Buffer,
  contentType: string,
  provider: Provider,
): GeneratedImage {
  if (bytes.length > maxImageBytes()) {
    throw new Error(`Generated image exceeded ${maxImageBytes()} bytes.`);
  }

  const detectedMime = detectImageMime(bytes);
  if (!detectedMime) throw new Error("Generated image was not PNG, JPEG, or WebP.");
  if (contentType && !contentType.startsWith("image/")) {
    throw new Error(`Generated image returned invalid content type: ${contentType}`);
  }

  const size = detectImageSize(bytes);
  return {
    bytes,
    contentType: detectedMime,
    width: size.width || 1536,
    height: size.height || 1024,
    provider,
  };
}

/** Read width/height from raw PNG/JPEG bytes (best-effort; 0 if unknown). */
function detectImageSize(bytes: Buffer): { width: number; height: number } {
  if (bytes.length >= 24 && bytes[0] === 0x89 && bytes[1] === 0x50) {
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  if (bytes.length > 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let off = 2;
    while (off + 9 < bytes.length) {
      if (bytes[off] !== 0xff) {
        off += 1;
        continue;
      }
      const marker = bytes[off + 1];
      if (
        marker >= 0xc0 &&
        marker <= 0xcf &&
        marker !== 0xc4 &&
        marker !== 0xc8 &&
        marker !== 0xcc
      ) {
        return {
          height: bytes.readUInt16BE(off + 5),
          width: bytes.readUInt16BE(off + 7),
        };
      }
      off += 2 + bytes.readUInt16BE(off + 2);
    }
  }
  return { width: 0, height: 0 };
}

type GeminiPart = {
  inlineData?: { data?: string; mimeType?: string };
  inline_data?: { data?: string; mime_type?: string };
};

function extractGeminiImage(data: unknown): GeneratedImage | null {
  const parts =
    ((data ?? {}) as { candidates?: Array<{ content?: { parts?: GeminiPart[] } }> })
      .candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    const inline = part.inlineData ?? part.inline_data;
    if (inline?.data) {
      const bytes = Buffer.from(inline.data, "base64");
      return validatedImage(
        bytes,
        part.inlineData?.mimeType ?? part.inline_data?.mime_type ?? "image/png",
        "gemini",
      );
    }
  }
  return null;
}

async function generateWithGemini(prompt: string): Promise<GeneratedImage> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured.");
  const model = process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image";

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:generateContent?key=${encodeURIComponent(key)}`;
  const contents = [{ role: "user", parts: [{ text: prompt }] }];

  // Try the rich config (proper 16:9 hero); fall back to a minimal request if
  // the model/version rejects responseFormat, so a generation still succeeds.
  const bodies = [
    {
      contents,
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
        responseFormat: { image: { aspectRatio: "16:9", imageSize: "2K" } },
      },
    },
    {
      contents,
      generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
    },
  ];

  let lastError = "unknown error";
  for (const body of bodies) {
    const response = await fetchWithTimeout(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      lastError = `${response.status}: ${(await response.text().catch(() => "")).slice(0, 200)}`;
      continue;
    }
    const image = extractGeminiImage(await response.json());
    if (image) return image;
    lastError = "response contained no image data";
  }
  throw new Error(`Gemini image failed (${lastError})`);
}

async function generateWithOpenAI(prompt: string): Promise<GeneratedImage> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not configured.");
  const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";

  const response = await fetchWithTimeout("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ model, prompt, size: "1536x1024", n: 1 }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `OpenAI image failed (${response.status}): ${detail.slice(0, 200)}`,
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
    const download = await fetchWithTimeout(first.url);
    if (!download.ok) {
      throw new Error(`OpenAI image URL fetch failed (${download.status}).`);
    }
    bytes = await cappedResponseBuffer(download);
  } else {
    throw new Error("OpenAI returned no image data.");
  }

  return validatedImage(bytes, "image/png", "openai");
}

/**
 * Generate a blog hero image from a prompt.
 * Default provider: Gemini 3.1 Flash Image (GEMINI_API_KEY).
 * Set BLOG_IMAGE_PROVIDER=openai to use OpenAI gpt-image-1 instead.
 */
export async function generateHeroImage(prompt: string): Promise<GeneratedImage> {
  return selectedProvider() === "openai"
    ? generateWithOpenAI(prompt)
    : generateWithGemini(prompt);
}
