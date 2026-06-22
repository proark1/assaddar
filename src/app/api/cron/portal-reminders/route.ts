import { NextResponse } from "next/server";
import { applyPortalAutomationRules } from "@/lib/portal/automation-rules";
import { appUrl } from "@/lib/portal/config";
import { sendPortalEmail } from "@/lib/portal/email";
import { getProjectBundle, id, mutateStore } from "@/lib/portal/store";

export const dynamic = "force-dynamic";

type ReminderEmail = {
  to: string;
  subject: string;
  text: string;
};

function isPast(date?: string) {
  if (!date) return false;
  const due = new Date(`${date}T23:59:59`);
  return Number.isFinite(due.getTime()) && due.getTime() < Date.now();
}

function recentlyReminded({
  updates,
  projectId,
  title,
  withinHours,
}: {
  updates: { projectId: string; title: string; createdAt: string }[];
  projectId: string;
  title: string;
  withinHours: number;
}) {
  const cutoff = Date.now() - withinHours * 60 * 60 * 1000;
  return updates.some(
    (update) =>
      update.projectId === projectId &&
      update.title === title &&
      new Date(update.createdAt).getTime() >= cutoff,
  );
}

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret && process.env.NODE_ENV !== "production") return true;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const result = await mutateStore<{
    emails: ReminderEmail[];
    automation: ReturnType<typeof applyPortalAutomationRules> | null;
  }>((store) => {
    const admin = store.users.find((user) => user.role === "admin");
    if (!admin) return { emails: [], automation: null };

    const now = new Date().toISOString();
    const queued: ReminderEmail[] = [];

    for (const project of store.projects) {
      if (project.status === "completed") continue;
      const bundle = getProjectBundle(store, project.id);
      if (!bundle || bundle.customerUsers.length === 0) continue;

      const projectUrl = `${appUrl()}/de/portal/projects/${project.id}`;
      const hasIntake = store.updates.some(
        (update) =>
          update.projectId === project.id &&
          update.title.startsWith("Intake:"),
      );

      if (
        !hasIntake &&
        !recentlyReminded({
          updates: store.updates,
          projectId: project.id,
          title: "Erinnerung: Projektfragebogen",
          withinHours: 72,
        })
      ) {
        const body =
          "Bitte fuellen Sie den gefuehrten Projektfragebogen im Portal aus, damit Assad die Analyse vorbereiten kann.";
        store.updates.push({
          id: id("update"),
          projectId: project.id,
          title: "Erinnerung: Projektfragebogen",
          body,
          visibility: "customer",
          asdarStage: project.asdarStage,
          createdBy: admin.id,
          createdAt: now,
        });
        for (const customer of bundle.customerUsers) {
          queued.push({
            to: customer.email,
            subject: "Assad Dar Portal: Projektfragebogen",
            text: `${body}\n\nProjekt oeffnen: ${projectUrl}`,
          });
        }
      }

      for (const task of bundle.tasks) {
        const title = `Erinnerung: Aufgabe ${task.title}`;
        if (
          task.owner !== "customer" ||
          !task.visibleToCustomer ||
          task.status === "done" ||
          !isPast(task.dueDate) ||
          recentlyReminded({
            updates: store.updates,
            projectId: project.id,
            title,
            withinHours: 48,
          })
        ) {
          continue;
        }

        const body = `Bitte pruefen Sie die offene Aufgabe im Projektportal: ${task.title}`;
        store.updates.push({
          id: id("update"),
          projectId: project.id,
          title,
          body,
          visibility: "customer",
          asdarStage: project.asdarStage,
          createdBy: admin.id,
          createdAt: now,
        });
        for (const customer of bundle.customerUsers) {
          queued.push({
            to: customer.email,
            subject: "Assad Dar Portal: Aufgabe offen",
            text: `${body}\n\nProjekt oeffnen: ${projectUrl}`,
          });
        }
      }

      for (const invoice of bundle.invoices) {
        const title = `Erinnerung: Rechnung ${invoice.number}`;
        if (
          invoice.status === "paid" ||
          invoice.status === "draft" ||
          !isPast(invoice.dueDate) ||
          recentlyReminded({
            updates: store.updates,
            projectId: project.id,
            title,
            withinHours: 48,
          })
        ) {
          continue;
        }

        const body = `Bitte pruefen Sie die Rechnung ${invoice.number} im Projektportal.`;
        store.updates.push({
          id: id("update"),
          projectId: project.id,
          title,
          body,
          visibility: "customer",
          asdarStage: project.asdarStage,
          createdBy: admin.id,
          createdAt: now,
        });
        for (const customer of bundle.customerUsers) {
          queued.push({
            to: customer.email,
            subject: `Assad Dar Portal: Rechnung ${invoice.number}`,
            text: `${body}\n\nProjekt oeffnen: ${projectUrl}`,
          });
        }
      }
    }

    return {
      emails: queued,
      automation: applyPortalAutomationRules({ store, userId: admin.id }),
    };
  });

  await Promise.all(
    result.emails.map((email) =>
      sendPortalEmail({
        to: email.to,
        subject: email.subject,
        text: email.text,
      }),
    ),
  );

  return NextResponse.json({
    ok: true,
    reminders: result.emails.length,
    automation: result.automation,
  });
}
