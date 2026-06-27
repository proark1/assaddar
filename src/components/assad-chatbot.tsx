"use client";

import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { askAssadChatbot } from "@/app/actions/chatbot";
import type { Locale } from "@/content";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

export function AssadChatbot({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        locale === "de"
          ? "Hallo, ich bin Assad. Ich beantworte kurze Fragen zu KI, Automatisierung, ASDAR und Assads Beratungsangebot."
          : "Hi, I am Assad. I answer short questions about AI, automation, ASDAR, and Assad's consulting work.",
    },
  ]);
  const [pending, startTransition] = useTransition();
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, pending, open]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = value.trim();
    if (!next || pending) return;

    setValue("");
    setMessages((current) => [...current, { role: "user", content: next }]);
    startTransition(() => {
      void askAssadChatbot(next, locale).then((reply) => {
        setMessages((current) => [
          ...current,
          { role: "assistant", content: reply },
        ]);
      });
    });
  }

  return (
    <div className="fixed bottom-5 right-5 z-[70] flex flex-col items-end gap-3">
      {open && (
        <section className="w-[calc(100vw-40px)] max-w-[390px] overflow-hidden rounded-lg border border-hairline bg-surface shadow-[0_18px_70px_-30px_rgba(22,25,30,0.45)]">
          <header className="flex items-center justify-between border-b border-hairline px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-copper/10 text-copper">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-ink">Assad</div>
                <div className="text-[12px] text-muted">
                  {locale === "de" ? "Website-Assistent" : "Website assistant"}
                </div>
              </div>
            </div>
            <button
              type="button"
              aria-label={locale === "de" ? "Chat schließen" : "Close chat"}
              onClick={() => setOpen(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink2 transition-colors hover:bg-surface2 hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div
            ref={listRef}
            className="max-h-[380px] space-y-3 overflow-y-auto px-4 py-4"
          >
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[82%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-copper text-oncopper"
                      : "bg-surface2 text-ink2"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {pending && (
              <div className="w-fit rounded-lg bg-surface2 px-3 py-2 text-sm text-muted">
                {locale === "de" ? "Assad schreibt..." : "Assad is typing..."}
              </div>
            )}
          </div>

          <form onSubmit={submit} className="flex gap-2 border-t border-hairline p-3">
            <input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={
                locale === "de"
                  ? "Frage zu KI oder ASDAR..."
                  : "Ask about AI or ASDAR..."
              }
              className="min-w-0 flex-1 rounded-lg border border-hairline bg-bg px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus:border-copper"
            />
            <button
              type="submit"
              disabled={pending}
              aria-label={locale === "de" ? "Nachricht senden" : "Send message"}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-copper text-oncopper transition-colors hover:bg-copper-hi disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-12 items-center gap-2 rounded-full bg-copper px-5 py-3 text-sm font-medium text-oncopper shadow-[0_10px_30px_-12px_rgba(166,110,47,0.9)] transition-all hover:-translate-y-0.5 hover:bg-copper-hi"
      >
        <MessageCircle className="h-4 w-4" />
        Assad
      </button>
    </div>
  );
}
