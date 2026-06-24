"use server";

import { Resend } from "resend";

export type ContactState = {
  status: "idle" | "ok" | "invalid" | "noconfig" | "error";
};

const EMAIL_RE = /.+@.+\..+/;

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot — bots fill hidden fields; drop silently.
  if (String(formData.get("company_url") || "")) return { status: "ok" };

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const company = String(formData.get("company") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const leadContext = String(formData.get("leadContext") || "").trim();
  const consent = formData.get("consent");

  if (!name || !message || !EMAIL_RE.test(email) || !consent) {
    return { status: "invalid" };
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) return { status: "noconfig" };

  try {
    const resend = new Resend(key);
    const lines = [
      `Name: ${name}`,
      `E-Mail: ${email}`,
      `Unternehmen: ${company || "—"}`,
    ];
    if (leadContext) lines.push("", leadContext);
    lines.push("", message);

    const result = await resend.emails.send({
      from: "ASSADDAR Website <onboarding@resend.dev>",
      to: ["assad.dar@gmail.com"],
      replyTo: email,
      subject: `Neue Anfrage über assad-dar.de — ${name}`,
      text: lines.join("\n"),
    });
    if (result.error) return { status: "error" };
    return { status: "ok" };
  } catch {
    return { status: "error" };
  }
}
