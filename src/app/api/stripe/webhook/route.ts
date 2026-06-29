import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeWebhookClient } from "@/lib/portal/payments";
import { id, mutateStore } from "@/lib/portal/store";

export const dynamic = "force-dynamic";

function paymentIntentId(value: unknown) {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "object" && "id" in value) {
    const idValue = (value as { id?: unknown }).id;
    return typeof idValue === "string" ? idValue : undefined;
  }
  return undefined;
}

export async function POST(request: Request) {
  const webhook = getStripeWebhookClient();
  if (!webhook) {
    return new NextResponse("Stripe webhook not configured", { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new NextResponse("Missing signature", { status: 400 });
  }

  const body = await request.text();

  let event;
  try {
    event = webhook.client.webhooks.constructEvent(
      body,
      signature,
      webhook.secret,
    );
  } catch {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  await mutateStore((store) => {
    if (store.paymentEvents.some((entry) => entry.id === event.id)) return;

    const session = event.data.object as Stripe.Checkout.Session;
    const invoiceId =
      event.type === "checkout.session.completed"
        ? session.metadata?.invoiceId || session.client_reference_id || ""
        : "";
    const now = new Date().toISOString();
    let status: "processed" | "ignored" = "ignored";
    let reason = "unsupported event";

    if (event.type === "checkout.session.completed") {
      const invoice = store.invoices.find((entry) => entry.id === invoiceId);
      const amount = Number(session.amount_total);
      const currency = String(session.currency || "").toUpperCase();

      if (!invoice) {
        reason = "invoice not found";
      } else if (invoice.status === "paid") {
        reason = "invoice already paid";
      } else if (session.payment_status && session.payment_status !== "paid") {
        reason = `payment status ${session.payment_status}`;
      } else if (amount !== invoice.amountCents || currency !== invoice.currency) {
        reason = "amount or currency mismatch";
      } else {
        invoice.status = "paid";
        invoice.stripeSessionId = session.id;
        invoice.stripePaymentIntentId = paymentIntentId(session.payment_intent);
        invoice.paidAt = now;
        status = "processed";
        reason = "invoice marked paid";

        const project = store.projects.find(
          (entry) => entry.id === invoice.projectId,
        );
        const admin = store.users.find((entry) => entry.role === "admin");
        if (project && admin) {
          store.updates.push({
            id: id("update"),
            projectId: invoice.projectId,
            title: "Zahlung: Rechnung bezahlt",
            body: `Rechnung ${invoice.number} wurde per Stripe als bezahlt markiert.`,
            visibility: "customer",
            asdarStage: project.asdarStage,
            createdBy: admin.id,
            createdAt: now,
          });
          store.updates.push({
            id: id("update"),
            projectId: invoice.projectId,
            title: "Audit: Zahlung synchronisiert",
            body: `Stripe hat Rechnung ${invoice.number} als bezahlt gemeldet.`,
            visibility: "internal",
            asdarStage: project.asdarStage,
            createdBy: admin.id,
            createdAt: now,
          });
        }
      }
    }

    store.paymentEvents.push({
      id: event.id,
      provider: "stripe",
      type: event.type,
      entityId: invoiceId || undefined,
      status,
      reason,
      createdAt: now,
    });
  });

  return NextResponse.json({ received: true });
}
