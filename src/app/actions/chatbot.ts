"use server";

import { isLocale, type Locale } from "@/content";

function safeLocale(value: string): Locale {
  return isLocale(value) ? value : "de";
}

export async function askAssadChatbot(message: string, localeValue: string) {
  const locale = safeLocale(localeValue);
  const input = message.trim().toLowerCase().slice(0, 800);

  if (!input) {
    return locale === "de"
      ? "Wobei kann ich helfen?"
      : "How can I help?";
  }

  const isEnglish = locale === "en";
  const mentionsPrice = /preis|kosten|price|cost|budget|invoice|rechnung/.test(
    input,
  );
  const mentionsAsdar = /asdar|method|methode|analyse|struktur|digital|automat/.test(
    input,
  );
  const mentionsAi = /ki|ai|automation|automatisierung|gpt|chatbot|digital/.test(
    input,
  );
  const mentionsBooking = /termin|call|meeting|kontakt|contact|book|buchen/.test(
    input,
  );

  if (mentionsPrice) {
    return isEnglish
      ? "Assad can usually start with a focused ASDAR analysis and then define the next implementation step. Exact pricing depends on company context, scope, and urgency. The best next step is a short call so Assad can understand your situation without giving you a generic package."
      : "Assad startet typischerweise mit einer fokussierten ASDAR Analyse und leitet daraus den nächsten Umsetzungsschritt ab. Der genaue Preis hängt von Unternehmen, Umfang und Dringlichkeit ab. Am sinnvollsten ist ein kurzes Gespräch, damit kein generisches Paket entsteht.";
  }

  if (mentionsAsdar) {
    return isEnglish
      ? "ASDAR means Analyze, Structure, Digitize, Automate, Realize. It keeps AI consulting practical: first understand the work, then simplify it, then build the digital and automation layer. I can explain the method, but the full strategy belongs in a project with Assad."
      : "ASDAR bedeutet Analysieren, Strukturieren, Digitalisieren, Automatisieren, Realisieren. Dadurch bleibt KI-Beratung praktisch: erst Arbeit verstehen, dann vereinfachen, dann digital und automatisiert umsetzen. Ich kann die Methode erklären, aber die vollständige Strategie gehört in ein Projekt mit Assad.";
  }

  if (mentionsAi) {
    return isEnglish
      ? "A good first AI use case is usually repetitive, rule-heavy, and easy to check: email triage, quote drafts, reporting, document search, or invoice preparation. Assad helps identify where AI saves real time instead of adding another tool."
      : "Ein guter erster KI-Use-Case ist meist wiederkehrend, regelhaft und gut prüfbar: E-Mail-Triage, Angebotsentwürfe, Reporting, Dokumentensuche oder Rechnungsvorbereitung. Assad hilft herauszufinden, wo KI wirklich Zeit spart statt nur ein weiteres Tool einzuführen.";
  }

  if (mentionsBooking) {
    return isEnglish
      ? "You can request a first conversation through the booking/contact page. Share your company, current process issues, tools, and what you want to improve. Assad can then judge whether an ASDAR analysis is the right starting point."
      : "Du kannst über die Termin-/Kontaktseite ein Erstgespräch anfragen. Hilfreich sind Unternehmen, aktuelle Prozessprobleme, genutzte Tools und das gewünschte Ziel. Assad kann dann einschätzen, ob eine ASDAR Analyse der richtige Start ist.";
  }

  return isEnglish
    ? "I am Assad, the website assistant for Assad Dar. I can answer questions about AI consulting, digitalization, automation, the ASDAR Method, and how a project with Assad works. I will give useful orientation, but not a full company strategy here."
    : "Ich bin Assad, der Website-Assistent von Assad Dar. Ich beantworte Fragen zu KI-Beratung, Digitalisierung, Automatisierung, der ASDAR Method und wie ein Projekt mit Assad abläuft. Ich gebe Orientierung, aber hier keine vollständige Unternehmensstrategie.";
}
