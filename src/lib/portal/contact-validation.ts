const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const LIMITS = {
  name: 120,
  email: 254,
  company: 160,
  message: 4000,
  leadContext: 2000,
} as const;

type ContactInput = {
  name: string;
  email: string;
  company: string;
  message: string;
  leadContext: string;
};

function clean(value: FormDataEntryValue | null) {
  return String(value || "").replace(/\0/g, "").trim();
}

function withinLimit(value: string, key: keyof typeof LIMITS) {
  return value.length <= LIMITS[key];
}

export function parseContactForm(formData: FormData):
  | { ok: true; input: ContactInput }
  | { ok: false } {
  const input = {
    name: clean(formData.get("name")),
    email: clean(formData.get("email")).toLowerCase(),
    company: clean(formData.get("company")),
    message: clean(formData.get("message")),
    leadContext: clean(formData.get("leadContext")),
  };

  if (
    !input.name ||
    !input.message ||
    !EMAIL_RE.test(input.email) ||
    !withinLimit(input.name, "name") ||
    !withinLimit(input.email, "email") ||
    !withinLimit(input.company, "company") ||
    !withinLimit(input.message, "message") ||
    !withinLimit(input.leadContext, "leadContext")
  ) {
    return { ok: false };
  }

  return { ok: true, input };
}
