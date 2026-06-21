import { NextResponse } from "next/server";
import { getStripeWebhookClient } from "@/lib/portal/payments";
import { id, mutateStore } from "@/lib/portal/store";

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
        if (!invoice || invoice.status === "paid") return;

        invoice.status = "paid";
        const project = store.projects.find(
          (entry) => entry.id === invoice.projectId,
        );
        const admin = store.users.find((entry) => entry.role === "admin");
        if (!project || !admin) return;

        const now = new Date().toISOString();
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
      });
    }
  }

  return NextResponse.json({ received: true });
}
