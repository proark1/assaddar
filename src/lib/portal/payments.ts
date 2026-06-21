import Stripe from "stripe";
import { appUrl } from "./config";
import type { Invoice } from "./types";

let stripe: Stripe | null = null;

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  stripe ??= new Stripe(key);
  return stripe;
}

export async function createInvoiceCheckoutUrl({
  invoice,
  locale,
}: {
  invoice: Invoice;
  locale: string;
}) {
  const client = getStripe();
  if (!client || invoice.paymentUrl || invoice.status === "draft") {
    return invoice.paymentUrl;
  }

  const session = await client.checkout.sessions.create({
    mode: "payment",
    client_reference_id: invoice.id,
    metadata: {
      invoiceId: invoice.id,
      projectId: invoice.projectId,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: invoice.currency.toLowerCase(),
          unit_amount: invoice.amountCents,
          product_data: {
            name: invoice.number,
            description: invoice.description || "Assad Dar Consulting",
          },
        },
      },
    ],
    success_url: `${appUrl()}/${locale}/portal?payment=success`,
    cancel_url: `${appUrl()}/${locale}/portal?payment=cancelled`,
  });

  return session.url || invoice.paymentUrl;
}

export function getStripeWebhookClient() {
  const client = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!client || !secret) return null;
  return { client, secret };
}
