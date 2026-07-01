import { resolveIntegrationValues } from "./integration-settings";

export type ExternalAiProvider = "openai" | "gemini" | "grok" | "claude";

export const externalAiProviders: Array<{
  id: ExternalAiProvider;
  label: string;
}> = [
  { id: "openai", label: "OpenAI / ChatGPT" },
  { id: "claude", label: "Claude" },
  { id: "gemini", label: "Gemini" },
  { id: "grok", label: "Grok" },
];

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

const DEFAULT_TIMEOUT_MS = 20_000;

async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

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

function claudeText(value: unknown): string {
  const data = value as {
    content?: Array<{ type?: string; text?: string }>;
  };
  return (
    data.content
      ?.filter((part) => part.type === "text" || part.text)
      .map((part) => part.text ?? "")
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
  const { openai_api_key: key, openai_model: model } =
    await resolveIntegrationValues(["openai_api_key", "openai_model"]);
  if (!key || !model) return null;

  const response = await fetchWithTimeout("https://api.openai.com/v1/responses", {
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
  const { gemini_api_key: key, gemini_model: model } =
    await resolveIntegrationValues(["gemini_api_key", "gemini_model"]);
  if (!key || !model) return null;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:generateContent?key=${encodeURIComponent(key)}`;
  const response = await fetchWithTimeout(endpoint, {
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
  const {
    grok_api_key: key,
    grok_model: model,
    grok_api_base: configuredBase,
  } = await resolveIntegrationValues([
    "grok_api_key",
    "grok_model",
    "grok_api_base",
  ]);
  const base = configuredBase || "https://api.x.ai/v1";
  if (!key || !model) return null;

  const response = await fetchWithTimeout(
    `${base.replace(/\/$/, "")}/chat/completions`,
    {
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
    },
  );
  const data = await parseJson(response);
  if (!response.ok) throw new Error("Grok request failed");

  return firstChoiceText(data);
}

async function callClaude({ system, prompt }: Omit<AiRequest, "provider">) {
  const { anthropic_api_key: key, claude_model: model } =
    await resolveIntegrationValues(["anthropic_api_key", "claude_model"]);
  if (!key || !model) return null;

  const response = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "x-api-key": key,
    },
    body: JSON.stringify({
      model,
      max_tokens: 1200,
      system,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await parseJson(response);
  if (!response.ok) throw new Error("Claude request failed");

  return claudeText(data);
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
          : request.provider === "claude"
            ? await callClaude(request)
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
