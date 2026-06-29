const MAX_EXTERNAL_AI_FIELD_LENGTH = 2200;

export function redactForExternalAi(value: string) {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/(?:\+?\d[\d\s()./-]{7,}\d)/g, "[redacted-phone]")
    .replace(/\b[A-Z]{2}\d{2}[A-Z0-9]{10,30}\b/g, "[redacted-iban]")
    .replace(/https?:\/\/[^\s)]+/gi, "[redacted-url]")
    .slice(0, MAX_EXTERNAL_AI_FIELD_LENGTH);
}

export function externalAiIdentifier(value: string, fallback = "Customer") {
  if (process.env.EXTERNAL_AI_SEND_IDENTIFIERS === "true") {
    return redactForExternalAi(value);
  }
  return fallback;
}
