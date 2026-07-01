import { encryptSecret, decryptSecret } from "./secret-box";
import { mutateStore, readStore } from "./store";
import type {
  IntegrationSettingKey,
  PortalIntegrationSetting,
  PortalStore,
} from "./types";

export type IntegrationSettingDefinition = {
  key: IntegrationSettingKey;
  label: string;
  description: string;
  env: string[];
  group: "ai" | "email";
  kind: "secret" | "text";
  placeholder?: string;
};

export type IntegrationSettingStatus = IntegrationSettingDefinition & {
  configured: boolean;
  source: "saved" | "env" | "missing";
  hint: string;
  updatedAt?: string;
};

export const integrationSettingDefinitions: IntegrationSettingDefinition[] = [
  {
    key: "openai_api_key",
    label: "OpenAI API Key",
    description: "ChatGPT/OpenAI scans.",
    env: ["OPENAI_API_KEY"],
    group: "ai",
    kind: "secret",
  },
  {
    key: "openai_model",
    label: "OpenAI model",
    description: "Example: gpt-4.1 or gpt-4.1-mini.",
    env: ["OPENAI_MODEL"],
    group: "ai",
    kind: "text",
    placeholder: "gpt-4.1-mini",
  },
  {
    key: "anthropic_api_key",
    label: "Anthropic API Key",
    description: "Claude scans.",
    env: ["ANTHROPIC_API_KEY"],
    group: "ai",
    kind: "secret",
  },
  {
    key: "claude_model",
    label: "Claude model",
    description: "Example: claude-sonnet-4-5.",
    env: ["CLAUDE_MODEL", "ANTHROPIC_MODEL"],
    group: "ai",
    kind: "text",
    placeholder: "claude-sonnet-4-5",
  },
  {
    key: "gemini_api_key",
    label: "Gemini API Key",
    description: "Google Gemini scans and CRM drafting.",
    env: ["GEMINI_API_KEY"],
    group: "ai",
    kind: "secret",
  },
  {
    key: "gemini_model",
    label: "Gemini model",
    description: "Example: gemini-2.5-pro or gemini-2.5-flash.",
    env: ["GEMINI_MODEL"],
    group: "ai",
    kind: "text",
    placeholder: "gemini-2.5-pro",
  },
  {
    key: "grok_api_key",
    label: "Grok API Key",
    description: "xAI/Grok scans.",
    env: ["GROK_API_KEY"],
    group: "ai",
    kind: "secret",
  },
  {
    key: "grok_model",
    label: "Grok model",
    description: "Example: grok-4.",
    env: ["GROK_MODEL"],
    group: "ai",
    kind: "text",
    placeholder: "grok-4",
  },
  {
    key: "grok_api_base",
    label: "Grok API base",
    description: "Leave empty to use https://api.x.ai/v1.",
    env: ["GROK_API_BASE"],
    group: "ai",
    kind: "text",
    placeholder: "https://api.x.ai/v1",
  },
  {
    key: "resend_api_key",
    label: "Resend API Key",
    description: "Portal invites, reminders, CRM replies, and contact alerts.",
    env: ["RESEND_API_KEY"],
    group: "email",
    kind: "secret",
  },
  {
    key: "contact_from_email",
    label: "Contact from email",
    description: "Sender for portal and contact-form email.",
    env: ["CONTACT_FROM_EMAIL"],
    group: "email",
    kind: "text",
    placeholder: "Assad Dar <hello@assad-dar.de>",
  },
  {
    key: "crm_from_email",
    label: "CRM from email",
    description: "Optional sender for CRM replies. Falls back to contact sender.",
    env: ["CRM_FROM_EMAIL"],
    group: "email",
    kind: "text",
    placeholder: "Assad Dar CRM <crm@assad-dar.de>",
  },
  {
    key: "resend_webhook_secret",
    label: "Resend webhook secret",
    description: "Inbound email webhook verification.",
    env: ["RESEND_WEBHOOK_SECRET"],
    group: "email",
    kind: "secret",
  },
];

const definitionsByKey = new Map(
  integrationSettingDefinitions.map((definition) => [
    definition.key,
    definition,
  ]),
);

function envValue(definition: IntegrationSettingDefinition) {
  for (const key of definition.env) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return "";
}

function hintForValue(value: string, kind: IntegrationSettingDefinition["kind"]) {
  if (!value) return "";
  if (kind === "text") return value;
  if (value.length <= 4) return "set";
  return `...${value.slice(-4)}`;
}

function savedValue(setting?: PortalIntegrationSetting) {
  if (!setting?.encryptedValue) return "";
  return decryptSecret(setting.encryptedValue).trim();
}

function resolvedValuesFromSettings(
  integrationSettings: PortalIntegrationSetting[],
  keys: IntegrationSettingKey[],
) {
  const settings = new Map(
    (integrationSettings ?? []).map((setting) => [setting.key, setting]),
  );
  return Object.fromEntries(
    keys.map((key) => {
      const definition = definitionsByKey.get(key);
      const value = definition
        ? savedValue(settings.get(key)) || envValue(definition)
        : "";
      return [key, value];
    }),
  ) as Record<IntegrationSettingKey, string>;
}

export async function resolveIntegrationValue(key: IntegrationSettingKey) {
  const definition = definitionsByKey.get(key);
  if (!definition) return "";
  const store = await readStore();
  const setting = store.integrationSettings.find((entry) => entry.key === key);
  return savedValue(setting) || envValue(definition);
}

export async function resolveIntegrationValues(keys: IntegrationSettingKey[]) {
  const store = await readStore();
  return resolveIntegrationValuesFromStore(store, keys);
}

export function resolveIntegrationValuesFromStore(
  store: Pick<PortalStore, "integrationSettings">,
  keys: IntegrationSettingKey[],
) {
  return resolvedValuesFromSettings(store.integrationSettings ?? [], keys);
}

export async function listIntegrationSettingStatuses(): Promise<
  IntegrationSettingStatus[]
> {
  const store = await readStore();
  const settings = new Map(
    (store.integrationSettings ?? []).map((setting) => [setting.key, setting]),
  );

  return integrationSettingDefinitions.map((definition) => {
    const setting = settings.get(definition.key);
    const stored = savedValue(setting);
    const fallback = envValue(definition);
    const source = stored ? "saved" : fallback ? "env" : "missing";
    const value = stored || fallback;
    return {
      ...definition,
      configured: Boolean(value),
      source,
      hint:
        stored && setting?.valueHint
          ? setting.valueHint
          : hintForValue(value, definition.kind),
      updatedAt: stored ? setting?.updatedAt : undefined,
    };
  });
}

export async function saveIntegrationSettings({
  userId,
  values,
  clears,
}: {
  userId: string;
  values: Partial<Record<IntegrationSettingKey, string>>;
  clears: Set<IntegrationSettingKey>;
}) {
  const keys = new Set<IntegrationSettingKey>([
    ...Object.keys(values).filter((key): key is IntegrationSettingKey =>
      definitionsByKey.has(key as IntegrationSettingKey),
    ),
    ...clears,
  ]);

  await mutateStore((store) => {
    const now = new Date().toISOString();
    store.integrationSettings = store.integrationSettings ?? [];

    for (const key of keys) {
      const definition = definitionsByKey.get(key);
      if (!definition) continue;
      const existing = store.integrationSettings.find((entry) => entry.key === key);
      const rawValue = (values[key] ?? "").trim();
      const shouldClear = clears.has(key);
      const nextValue = shouldClear ? "" : rawValue;
      if (!shouldClear && !nextValue) continue;

      const next = {
        key,
        encryptedValue: nextValue ? encryptSecret(nextValue) : "",
        valueHint: hintForValue(nextValue, definition.kind),
        updatedBy: userId,
        updatedAt: now,
      };

      if (existing) Object.assign(existing, next);
      else store.integrationSettings.push(next);
    }
  });
}

export function integrationDefinitionForKey(key: IntegrationSettingKey) {
  return definitionsByKey.get(key);
}
