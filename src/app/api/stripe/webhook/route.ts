import { NextResponse } from "next/server";
import { getStripeWebhookClient } from "@/lib/portal/payments";
import { mutateStore } from "@/lib/portal/store";

export const dynamic = "force-dynamic";

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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const invoiceId =
      session.metadata?.invoiceId || session.client_reference_id || "";

    if (invoiceId) {
      await mutateStore((store) => {
        const invoice = store.invoices.find((entry) => entry.id === invoiceId);
        if (invoice) invoice.status = "paid";
      });
    }
  }

  return NextResponse.json({ received: true });
}
