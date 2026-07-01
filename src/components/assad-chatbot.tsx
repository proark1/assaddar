"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  Bot,
  Loader2,
  MessageSquareText,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { askAssadChatbot } from "@/app/actions/chatbot";
import type { Locale } from "@/content";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

type ChatbotCopy = {
  title: string;
  status: string;
  intro: string;
  close: string;
  open: string;
  placeholder: string;
  send: string;
  typing: string;
  error: string;
  suggestionsTitle: string;
  suggestions: string[];
  firstMessage: string;
};

const PRIVATE_ROUTE_PARTS = new Set([
  "portal",
  "login",
  "register",
  "forgot-password",
  "reset-password",
  "verify-email",
  "invite",
]);

const COPY: Record<Locale, ChatbotCopy> = {
  de: {
    title: "Assad Assistant",
    status: "Online fuer kurze Orientierung",
    intro:
      "Frag nach KI, Automatisierung, ASDAR oder dem passenden ersten Schritt fuer dein Unternehmen.",
    close: "Chat schliessen",
    open: "Assad Assistant oeffnen",
    placeholder: "Kurze Frage eingeben...",
    send: "Nachricht senden",
    typing: "Assad schreibt",
    error:
      "Das hat gerade nicht geklappt. Bitte versuche es gleich noch einmal oder nutze die Terminseite.",
    suggestionsTitle: "Schnell starten",
    suggestions: [
      "Was ist ASDAR?",
      "Welcher KI Use Case passt zuerst?",
      "Was kostet ein Einstieg?",
    ],
    firstMessage:
      "Hallo, ich bin der Website-Assistent von Assad. Ich beantworte kurze Fragen zu KI, Automatisierung, ASDAR und Assads Beratungsangebot.",
  },
  en: {
    title: "Assad Assistant",
    status: "Online for quick orientation",
    intro:
      "Ask about AI, automation, ASDAR, or the right first step for your company.",
    close: "Close chat",
    open: "Open Assad Assistant",
    placeholder: "Type a short question...",
    send: "Send message",
    typing: "Assad is typing",
    error:
      "That did not work just now. Please try again in a moment or use the booking page.",
    suggestionsTitle: "Start quickly",
    suggestions: [
      "What is ASDAR?",
      "Which AI use case fits first?",
      "What does it cost to start?",
    ],
    firstMessage:
      "Hi, I am Assad's website assistant. I answer short questions about AI, automation, ASDAR, and Assad's consulting work.",
  },
};

function DotTyping() {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden="true">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:120ms]" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:240ms]" />
    </span>
  );
}

export function AssadChatbot({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const copy = COPY[locale];
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: copy.firstMessage,
    },
  ]);
  const [pending, startTransition] = useTransition();
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const hiddenOnThisRoute = useMemo(() => {
    const routeParts = pathname.split("/").filter(Boolean).slice(1);
    return routeParts.some((part) => PRIVATE_ROUTE_PARTS.has(part));
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, pending, open]);

  useEffect(() => {
    if (!open) return;

    const timeout = window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => window.clearTimeout(timeout);
  }, [open]);

  function sendMessage(message: string) {
    const next = message.trim();
    if (!next || pending) return;

    setValue("");
    setMessages((current) => [...current, { role: "user", content: next }]);
    startTransition(() => {
      void askAssadChatbot(next, locale)
        .then((reply) => {
          setMessages((current) => [
            ...current,
            { role: "assistant", content: reply },
          ]);
        })
        .catch(() => {
          setMessages((current) => [
            ...current,
            { role: "assistant", content: copy.error },
          ]);
        });
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(value);
  }

  if (hiddenOnThisRoute) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[70] flex max-w-[calc(100vw-32px)] flex-col items-end gap-3 sm:bottom-5 sm:right-5">
      {open && (
        <section
          aria-label={copy.title}
          className="flex h-[min(620px,calc(100vh-112px))] w-[calc(100vw-32px)] max-w-[420px] flex-col overflow-hidden rounded-lg border border-hairline bg-surface shadow-[0_24px_90px_-32px_rgba(22,25,30,0.62)]"
        >
          <header className="border-b border-hairline bg-bg/65 px-4 py-4 backdrop-blur sm:px-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-copper/25 bg-copper/12 text-copper shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                  <Bot className="h-5 w-5" />
                  <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-surface bg-success" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-sm font-semibold text-ink">
                      {copy.title}
                    </h2>
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-copper" />
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted">
                    {copy.status}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label={copy.close}
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink2 transition-colors hover:bg-surface2 hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-4 rounded-lg border border-hairline bg-surface px-3 py-2.5 text-[13px] leading-relaxed text-ink2">
              {copy.intro}
            </p>
          </header>

          <div
            ref={listRef}
            className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                <MessageSquareText className="h-3.5 w-3.5" />
                {copy.suggestionsTitle}
              </div>
              <div className="grid gap-2">
                {copy.suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    disabled={pending}
                    onClick={() => sendMessage(suggestion)}
                    className="rounded-lg border border-hairline bg-bg px-3 py-2 text-left text-[13px] leading-relaxed text-ink2 transition-colors hover:border-copper hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[84%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed shadow-[0_1px_0_rgba(22,25,30,0.04)] ${
                      message.role === "user"
                        ? "bg-copper text-oncopper"
                        : "border border-hairline bg-surface2 text-ink2"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {pending && (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-surface2 px-3.5 py-2.5 text-sm text-muted">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>{copy.typing}</span>
                    <DotTyping />
                  </div>
                </div>
              )}
            </div>
          </div>

          <form
            onSubmit={submit}
            className="border-t border-hairline bg-bg/70 p-3 backdrop-blur sm:p-4"
          >
            <div className="flex items-center gap-2 rounded-lg border border-hairline bg-surface p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] focus-within:border-copper">
              <input
                ref={inputRef}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={copy.placeholder}
                className="min-w-0 flex-1 bg-transparent px-2.5 py-2 text-sm text-ink outline-none placeholder:text-muted"
              />
              <button
                type="submit"
                disabled={pending || !value.trim()}
                aria-label={copy.send}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-copper text-oncopper transition-colors hover:bg-copper-hi disabled:cursor-not-allowed disabled:opacity-45"
              >
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      <button
        type="button"
        aria-label={copy.open}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="group relative inline-flex h-14 w-14 items-center justify-center rounded-full border border-copper/25 bg-copper text-oncopper shadow-[0_14px_38px_-16px_rgba(166,110,47,0.95)] transition-all hover:-translate-y-0.5 hover:bg-copper-hi focus-visible:rounded-full"
      >
        <Bot className="h-6 w-6 transition-transform group-hover:scale-105" />
        <span className="absolute right-1 top-1 h-3.5 w-3.5 rounded-full border-2 border-bg bg-success" />
      </button>
    </div>
  );
}
