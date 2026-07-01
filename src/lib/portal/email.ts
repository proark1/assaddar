import { Resend } from "resend";
import { resolveIntegrationValues } from "./integration-settings";

export async function sendPortalEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  const {
    resend_api_key: key,
    contact_from_email: from,
  } = await resolveIntegrationValues(["resend_api_key", "contact_from_email"]);
  if (!from) return false;
  if (!key) return false;

  const resend = new Resend(key);
  const result = await resend.emails.send({
    from,
    to: [to],
    subject,
    text,
  });

  return !result.error;
}
