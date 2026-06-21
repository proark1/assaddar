export type ExternalAiProvider = "openai" | "gemini" | "grok";

export type ExternalAiResult = {
  provider: ExternalAiProvider;
  status: "ok" | "not_configured" | "error";
  text: string;
};

type AiRequest = {
  provider: ExternalAiProvider;
  system: string;
  prompt: string;
};

function plainText(value: unknown): string {
  if (typeof value === "string") return value;
  return "";
}

function firstChoiceText(value: unknown): string {
  const data = value as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? "";
}

function geminiText(value: unknown): string {
  const data = value as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };
  return (
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("\n")
      .trim() ?? ""
  );
}

async function parseJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function callOpenAi({ system, prompt }: Omit<AiRequest, "provider">) {
  const key = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;
  if (!key || !model) return null;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions: system,
      input: prompt,
    }),
  });
  const data = await parseJson(response);
  if (!response.ok) throw new Error("OpenAI request failed");

  return plainText((data as { output_text?: unknown })?.output_text);
}

async function callGemini({ system, prompt }: Omit<AiRequest, "provider">) {
  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL;
  if (!key || !model) return null;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:generateContent?key=${encodeURIComponent(key)}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    }),
  });
  const data = await parseJson(response);
  if (!response.ok) throw new Error("Gemini request failed");

  return geminiText(data);
}

async function callGrok({ system, prompt }: Omit<AiRequest, "provider">) {
  const key = process.env.GROK_API_KEY;
  const model = process.env.GROK_MODEL;
  const base = process.env.GROK_API_BASE || "https://api.x.ai/v1";
  if (!key || !model) return null;

  const response = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    }),
  });
  const data = await parseJson(response);
  if (!response.ok) throw new Error("Grok request failed");

  return firstChoiceText(data);
}

export async function requestExternalAiInsight(
  request: AiRequest,
): Promise<ExternalAiResult> {
  try {
    const text =
      request.provider === "openai"
        ? await callOpenAi(request)
        : request.provider === "gemini"
          ? await callGemini(request)
          : await callGrok(request);

    if (!text) {
      return {
        provider: request.provider,
        status: "not_configured",
        text: "Provider key/model is not configured.",
      };
    }

    return { provider: request.provider, status: "ok", text };
  } catch {
    return {
      provider: request.provider,
      status: "error",
      text: "Provider request failed.",
    };
  }
}
