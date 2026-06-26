import { Resend } from "resend";
import { contactFromEmail } from "./config";

export async function sendPortalEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const from = contactFromEmail();
  if (!from) return false;

  const resend = new Resend(key);
  const result = await resend.emails.send({
    from,
    to: [to],
    subject,
    text,
  });

  return !result.error;
}
