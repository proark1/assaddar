import {
  telegramBotConfig,
  whatsappBusinessConfig,
} from "./config";

export type NotificationResult = {
  status: "sent" | "skipped" | "failed";
  error?: string;
};

async function postJson(url: string, body: unknown, headers: HeadersInit = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Notification request failed with ${response.status}`);
  }
}

export async function sendTelegramAdminAlert({
  text,
  replyMarkup,
}: {
  text: string;
  replyMarkup?: unknown;
}): Promise<NotificationResult> {
  const { token, adminChatId } = telegramBotConfig();
  if (!token || !adminChatId) return { status: "skipped" };

  try {
    await postJson(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: adminChatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: replyMarkup,
    });
    return { status: "sent" };
  } catch (error) {
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "Telegram request failed",
    };
  }
}

export async function sendWhatsAppAdminAlert({
  text,
}: {
  text: string;
}): Promise<NotificationResult> {
  const { token, phoneNumberId, adminPhone } = whatsappBusinessConfig();
  if (!token || !phoneNumberId || !adminPhone) return { status: "skipped" };

  try {
    await postJson(
      `https://graph.facebook.com/v20.0/${encodeURIComponent(
        phoneNumberId,
      )}/messages`,
      {
        messaging_product: "whatsapp",
        to: adminPhone,
        type: "text",
        text: { preview_url: false, body: text },
      },
      { authorization: `Bearer ${token}` },
    );
    return { status: "sent" };
  } catch (error) {
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "WhatsApp request failed",
    };
  }
}
