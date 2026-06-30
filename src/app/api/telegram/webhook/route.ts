import { NextResponse } from "next/server";
import { telegramBotConfig } from "@/lib/portal/config";
import { createManualCrmInteraction, sendCrmEmailDraft } from "@/lib/portal/crm";
import { mutateStore } from "@/lib/portal/store";

export const dynamic = "force-dynamic";

function path(data: unknown, keys: string[]): unknown {
  let current = data;
  for (const key of keys) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function numberText(value: unknown) {
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value;
  return "";
}

async function answerCallback(callbackQueryId: string, message: string) {
  const { token } = telegramBotConfig();
  if (!token || !callbackQueryId) return;
  await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text: message,
      show_alert: false,
    }),
  });
}

export async function POST(request: Request) {
  const { webhookSecret, adminChatId } = telegramBotConfig();
  if (
    webhookSecret &&
    request.headers.get("x-telegram-bot-api-secret-token") !== webhookSecret
  ) {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const update = await request.json();
  const callbackId = text(path(update, ["callback_query", "id"]));
  const callbackData = text(path(update, ["callback_query", "data"]));
  const chatId = numberText(path(update, ["callback_query", "message", "chat", "id"]));

  if (adminChatId && chatId && chatId !== adminChatId) {
    await answerCallback(callbackId, "Not allowed");
    return NextResponse.json({ ok: true, ignored: "chat" });
  }

  if (callbackData.startsWith("crm_send:")) {
    const draftId = callbackData.slice("crm_send:".length);
    const result = await mutateStore((store) => sendCrmEmailDraft(store, draftId));
    await answerCallback(
      callbackId,
      result.ok ? "Reply sent" : `Not sent: ${result.reason}`,
    );
    return NextResponse.json({ ok: true, action: "send", result });
  }

  if (callbackData.startsWith("crm_done:")) {
    const interactionId = callbackData.slice("crm_done:".length);
    await mutateStore((store) => {
      const interaction = store.crmInteractions.find(
        (entry) => entry.id === interactionId,
      );
      if (!interaction) return;
      interaction.handledAt = interaction.handledAt || new Date().toISOString();
      createManualCrmInteraction({
        store,
        channel: "note",
        contactId: interaction.contactId,
        subject: "CRM: Telegram erledigt",
        body: "Die Nachricht wurde ueber Telegram als erledigt markiert.",
      });
    });
    await answerCallback(callbackId, "Marked done");
    return NextResponse.json({ ok: true, action: "done" });
  }

  return NextResponse.json({ ok: true, ignored: "unsupported" });
}
