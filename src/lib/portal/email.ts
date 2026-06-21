import { Resend } from "resend";

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

  const resend = new Resend(key);
  const result = await resend.emails.send({
    from: "Assad Dar Portal <onboarding@resend.dev>",
    to: [to],
    subject,
    text,
  });

  return !result.error;
}
