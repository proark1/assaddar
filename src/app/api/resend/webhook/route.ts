import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import {
  ingestInboundEmail,
  normalizeEmail,
  notifyAdminAboutInteraction,
} from "@/lib/portal/crm";
import { inboundEmailDomain } from "@/lib/portal/config";
import { resolveIntegrationValue } from "@/lib/portal/integration-settings";
import { mutateStore } from "@/lib/portal/store";

export const dynamic = "force-dynamic";

function getPath(data: unknown, path: string[]): unknown {
  let current = data;
  for (const key of path) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function stringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const entry = item as Record<string, unknown>;
          return stringValue(entry.email) || stringValue(entry.address);
        }
        return "";
      })
      .filter(Boolean);
  }
  if (typeof value === "string") return [value].filter(Boolean);
  return [];
}

function decodeSecret(secret: string) {
  const raw = secret.startsWith("whsec_") ? secret.slice("whsec_".length) : secret;
  try {
    return Buffer.from(raw, "base64");
  } catch {
    return Buffer.from(secret);
  }
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function verifySvixSignature({
  body,
  headers,
  secret,
}: {
  body: string;
  headers: Headers;
  secret: string;
}) {
  if (!secret) return process.env.NODE_ENV !== "production";

  const auth = headers.get("authorization");
  if (auth && safeEqual(auth, `Bearer ${secret}`)) return true;

  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signature = headers.get("svix-signature");
  if (!id || !timestamp || !signature) return false;

  const signedPayload = `${id}.${timestamp}.${body}`;
  const digest = createHmac("sha256", decodeSecret(secret))
    .update(signedPayload)
    .digest("base64");

  return signature
    .split(" ")
    .flatMap((part) => part.split(","))
    .some((part) => part === `v1,${digest}` || part === digest);
}

function parseResendEmailEvent(payload: unknown) {
  const type =
    stringValue(getPath(payload, ["type"])) ||
    stringValue(getPath(payload, ["event"]));
  const data = getPath(payload, ["data"]) ?? payload;
  const providerMessageId =
    stringValue(getPath(data, ["email_id"])) ||
    stringValue(getPath(data, ["id"])) ||
    stringValue(getPath(data, ["message_id"]));
  const from =
    stringValue(getPath(data, ["from"])) ||
    stringValue(getPath(data, ["from", "email"])) ||
    stringValue(getPath(data, ["from", "address"]));
  const fromName =
    stringValue(getPath(data, ["from_name"])) ||
    stringValue(getPath(data, ["from", "name"]));
  const toValues = stringList(getPath(data, ["to"]));
  const to = toValues.length
    ? toValues
    : stringList(getPath(data, ["recipients"]));
  const subject = stringValue(getPath(data, ["subject"]));
  const text =
    stringValue(getPath(data, ["text"])) ||
    stringValue(getPath(data, ["text_body"]));
  const html =
    stringValue(getPath(data, ["html"])) ||
    stringValue(getPath(data, ["html_body"]));
  const createdAt =
    stringValue(getPath(data, ["created_at"])) ||
    stringValue(getPath(data, ["createdAt"]));

  return {
    type,
    providerMessageId,
    from,
    fromName,
    to,
    subject,
    text,
    html,
    createdAt,
  };
}

function hasInboundRecipient(recipients: string[]) {
  const domain = inboundEmailDomain();
  return recipients.some((recipient) =>
    normalizeEmail(recipient).endsWith(`@${domain}`),
  );
}

export async function POST(request: Request) {
  const body = await request.text();
  const secret = await resolveIntegrationValue("resend_webhook_secret");

  if (!verifySvixSignature({ body, headers: request.headers, secret })) {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  const event = parseResendEmailEvent(payload);
  if (event.type && event.type !== "email.received") {
    return NextResponse.json({ received: true, ignored: event.type });
  }
  if (!event.from) {
    return new NextResponse("Missing sender", { status: 400 });
  }
  if (!hasInboundRecipient(event.to)) {
    return NextResponse.json({
      received: true,
      ignored: "recipient",
      domain: inboundEmailDomain(),
    });
  }

  const result = await mutateStore(async (store) => {
    const interaction = await ingestInboundEmail(
      store,
      {
        providerMessageId: event.providerMessageId,
        from: event.from,
        fromName: event.fromName,
        to: event.to,
        subject: event.subject || "(ohne Betreff)",
        text: event.text,
        html: event.html,
        createdAt: event.createdAt || undefined,
        source: "Resend inbound",
      },
    );
    if (!interaction) {
      return { saved: false, duplicate: true };
    }
    const notifications = await notifyAdminAboutInteraction(
      store,
      interaction,
      "de",
    );
    return {
      saved: true,
      interactionId: interaction.id,
      notifications: notifications.map((event) => ({
        channel: event.channel,
        status: event.status,
      })),
    };
  });

  return NextResponse.json({ received: true, ...result });
}
