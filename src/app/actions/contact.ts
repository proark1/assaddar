"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { contactFromEmail, contactToEmail } from "@/lib/portal/config";
import { parseContactForm } from "@/lib/portal/contact-validation";
import { ingestInboundEmail, notifyAdminAboutInteraction } from "@/lib/portal/crm";
import { checkRateLimit, clientIpFromHeaders } from "@/lib/portal/rate-limit";
import { rejectUntrustedOrigin } from "@/lib/portal/security";
import { id, mutateStore } from "@/lib/portal/store";

export type ContactState = {
  status: "idle" | "ok" | "invalid" | "rate" | "noconfig" | "error";
};

type WebsiteLeadInput = {
  name: string;
  email: string;
  company: string;
  message: string;
  leadContext: string;
};

async function createWebsiteLead(input: WebsiteLeadInput) {
  await mutateStore(async (store) => {
    const now = new Date().toISOString();
    const admin = store.users.find((user) => user.role === "admin");
    if (!admin) {
      throw new Error("Website lead capture requires a portal admin user.");
    }

    const orgId = id("org");
    const projectId = id("project");
    const leadId = id("lead");
    const companyName = input.company || input.name;
    const leadRecord = {
      id: leadId,
      name: input.name,
      email: input.email,
      company: companyName,
      message: input.message,
      leadContext: input.leadContext,
      source: "Website Kontaktformular",
      createdAt: now,
    };

    store.organizations.push({
      id: orgId,
      name: companyName,
      industry: "Website Lead",
      createdAt: now,
    });

    store.projects.push({
      id: projectId,
      organizationId: orgId,
      name: `Lead: ${companyName}`,
      summary: input.message.slice(0, 240),
      status: "discovery",
      asdarStage: "analyse",
      health: "amber",
      nextStep: "Lead prüfen, Erstgespräch vorbereiten und passende ASDAR Vorlage auswählen.",
      createdAt: now,
      updatedAt: now,
    });

    store.projectIntelligence.push({
      projectId,
      companyContext: input.leadContext || input.message,
      stakeholders: `${input.name} (${input.email})`,
      issues: input.message,
      goals: "Erstgespräch qualifizieren und Nutzenhypothese ableiten.",
      currentTools: "",
      dataSituation: "",
      constraints: "",
      opportunities: "ASDAR Readiness im Erstgespräch prüfen.",
      internalNotes: "Automatisch aus dem Website-Kontaktformular erstellt.",
      updatedAt: now,
    });

    store.tasks.push({
      id: id("task"),
      projectId,
      title: `Lead qualifizieren: ${companyName}`,
      owner: "assad",
      status: "todo",
      visibleToCustomer: false,
      createdAt: now,
    });

    store.updates.push({
      id: id("update"),
      projectId,
      title: "Lead: Website Anfrage",
      body: [
        `LEAD_RECORD:${JSON.stringify(leadRecord)}`,
        "",
        `Name: ${input.name}`,
        `E-Mail: ${input.email}`,
        `Unternehmen: ${companyName}`,
        "",
        input.leadContext,
        input.message,
      ]
        .filter(Boolean)
        .join("\n"),
      visibility: "internal",
      asdarStage: "analyse",
      createdBy: admin.id,
      createdAt: now,
    });

    const interaction = await ingestInboundEmail(store, {
      providerMessageId: leadId,
      from: `${input.name} <${input.email}>`,
      fromName: input.name,
      to: [contactToEmail()],
      subject: `Website Anfrage: ${companyName}`,
      text: [input.leadContext, input.message].filter(Boolean).join("\n\n"),
      createdAt: now,
      source: "Website Kontaktformular",
      channel: "website",
      provider: "website",
    });
    if (interaction) {
      await notifyAdminAboutInteraction(store, interaction, "de");
    }
  });
}

async function captureWebsiteLead(input: WebsiteLeadInput) {
  try {
    await createWebsiteLead(input);
  } catch (error) {
    console.error("Website lead capture failed", error);
  }
}

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot — bots fill hidden fields; drop silently.
  if (String(formData.get("company_url") || "")) return { status: "ok" };

  const consent = formData.get("consent");
  const parsed = parseContactForm(formData);

  if (!parsed.ok || !consent) {
    return { status: "invalid" };
  }
  const { name, email, company, message, leadContext } = parsed.input;

  const requestHeaders = await headers();
  if (rejectUntrustedOrigin(requestHeaders)) {
    return { status: "invalid" };
  }

  const rateLimit = await checkRateLimit(
    `contact:${clientIpFromHeaders(requestHeaders)}:${email}`,
    5,
    60 * 60 * 1000,
  );

  if (!rateLimit.allowed) {
    return { status: "rate" };
  }

  const leadInput = {
    name,
    email,
    company,
    message,
    leadContext,
  };
  await captureWebsiteLead(leadInput);

  const key = process.env.RESEND_API_KEY;
  if (!key) return { status: "noconfig" };
  const from = contactFromEmail();
  if (!from) return { status: "noconfig" };
  const to = contactToEmail();

  try {
    const resend = new Resend(key);
    const lines = [
      `Name: ${name}`,
      `E-Mail: ${email}`,
      `Unternehmen: ${company || "—"}`,
    ];
    if (leadContext) lines.push("", leadContext);
    lines.push("", message);

    const result = await resend.emails.send({
      from,
      to: [to],
      replyTo: email,
      subject: `Neue Anfrage über assad-dar.de — ${name}`,
      text: lines.join("\n"),
    });
    if (result.error) return { status: "error" };
    return { status: "ok" };
  } catch {
    return { status: "error" };
  }
}
