import { promises as fs } from "fs";
import path from "path";
import { randomBytes, randomUUID } from "crypto";
import { hashPassword } from "./password";
import { isPostgresBackendEnabled } from "./config";
import {
  createPostgresRegisteredCustomer,
  createPostgresProjectForAdmin,
  type CreateProjectInput,
  type CreateRegisteredCustomerInput,
  bumpPostgresUserSessionVersion,
  findPostgresUserByEmail,
  findPostgresUserById,
  mutatePostgresStore,
  readPostgresCustomersWithProjectBundles,
  readPostgresProjectBundleForUser,
  readPostgresProjectBundlesForUser,
  readPostgresStore,
  writePostgresStore,
} from "./store-postgres";
import type {
  AsdarStage,
  PortalStore,
  Project,
  ProjectBundle,
  ProjectIntelligence,
  User,
} from "./types";

export type CustomerProjectBundles = {
  customer: User;
  projectBundles: ProjectBundle[];
};

export type CreateProjectForAdminInput = CreateProjectInput;
export type CreateRegisteredCustomerForAuthInput = CreateRegisteredCustomerInput;

const DATA_DIR = path.join(process.cwd(), ".portal-data");
const STORE_PATH = path.join(DATA_DIR, "store.json");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
let mutationQueue: Promise<void> = Promise.resolve();

function now() {
  return new Date().toISOString();
}

function bootstrapAdminPassword() {
  const configured = process.env.PORTAL_ADMIN_BOOTSTRAP_PASSWORD?.trim();
  if (configured && configured.length >= 12) return configured;
  return `${randomBytes(24).toString("base64url")}!7`;
}

export function id(prefix: string) {
  return `${prefix}_${randomUUID().replaceAll("-", "").slice(0, 16)}`;
}

function defaultIntelligence(projectId: string): ProjectIntelligence {
  return {
    projectId,
    companyContext: "",
    stakeholders: "",
    issues: "",
    goals: "",
    currentTools: "",
    dataSituation: "",
    constraints: "",
    opportunities: "",
    internalNotes: "",
    updatedAt: now(),
  };
}

function buildSeedStore(): PortalStore {
  const createdAt = now();
  const adminId = "user_admin_assad";
  const customerId = "user_demo_customer";
  const orgId = "org_demo_mittelstand";
  const projectId = "project_demo_asdar";

  return {
    users: [
      {
        id: adminId,
        name: "Assad Dar",
        email: "admin@assad-dar.de",
        passwordHash: hashPassword(bootstrapAdminPassword()),
        role: "admin",
        emailVerifiedAt: createdAt,
        sessionVersion: 0,
        createdAt,
      },
      {
        id: customerId,
        name: "Demo Kunde",
        email: "kunde@example.com",
        passwordHash: hashPassword("kunde1234"),
        role: "customer",
        emailVerifiedAt: createdAt,
        sessionVersion: 0,
        createdAt,
      },
    ],
    organizations: [
      {
        id: orgId,
        name: "Muster GmbH",
        industry: "B2B Services",
        website: "https://example.com",
        createdAt,
      },
    ],
    projects: [
      {
        id: projectId,
        organizationId: orgId,
        name: "ASDAR Prozess- und KI-Analyse",
        summary:
          "Analyse manueller Angebots-, E-Mail- und Reporting-Prozesse mit Fokus auf konkrete Automatisierungshebel.",
        status: "analysis",
        asdarStage: "analyse",
        health: "green",
        nextStep:
          "Interviewnotizen verdichten und erste Quick-Win-Automationen priorisieren.",
        createdAt,
        updatedAt: createdAt,
      },
    ],
    projectMembers: [
      {
        id: "member_demo_customer",
        projectId,
        userId: customerId,
        role: "client_owner",
        createdAt,
      },
    ],
    projectIntelligence: [
      {
        projectId,
        companyContext:
          "Wachsendes Dienstleistungsunternehmen mit vielen wiederkehrenden Kundenanfragen und manueller Angebotsarbeit.",
        stakeholders:
          "Geschäftsführung, Vertrieb, Backoffice und ein externer IT-Dienstleister.",
        issues:
          "Angebote werden aus alten Dokumenten kopiert. Kundendaten liegen verteilt in E-Mail, Excel und CRM. Reporting entsteht wöchentlich manuell.",
        goals:
          "Zeit in Vertrieb und Backoffice reduzieren, Datenqualität verbessern und eine klare KI-Roadmap erhalten.",
        currentTools: "Microsoft 365, Excel, Outlook, CRM, DATEV",
        dataSituation:
          "Viele nutzbare Daten vorhanden, aber verteilt und kaum standardisiert.",
        constraints:
          "DSGVO, wenig interne IT-Kapazität, Akzeptanz im Team muss aktiv begleitet werden.",
        opportunities:
          "Angebotsentwürfe, E-Mail-Triage, Wissensassistent und automatisches Wochenreporting.",
        internalNotes:
          "Guter Fit für schnelle sichtbare Ergebnisse. Nicht mit Tool-Auswahl starten, sondern erst Daten- und Prozessstruktur klären.",
        updatedAt: createdAt,
      },
    ],
    updates: [
      {
        id: "update_demo_1",
        projectId,
        title: "Kickoff und Prozessaufnahme abgeschlossen",
        body:
          "Die ersten Kernprozesse wurden aufgenommen. Der Fokus liegt jetzt auf Angebotsarbeit, E-Mail-Verteilung und Reporting, weil dort die größten Zeitverluste sichtbar sind.",
        visibility: "customer",
        asdarStage: "analyse",
        createdBy: adminId,
        createdAt,
      },
      {
        id: "update_demo_2",
        projectId,
        title: "Interne Hypothese: Quick Wins im Vertrieb",
        body:
          "Die Angebotsprozesse wirken standardisierbar. Nächster Schritt ist die Trennung von Vorlagen, Preislogik und Freigabewegen.",
        visibility: "internal",
        asdarStage: "structure",
        createdBy: adminId,
        createdAt,
      },
    ],
    tasks: [
      {
        id: "task_demo_1",
        projectId,
        title: "Beispielangebote und Preislogik bereitstellen",
        owner: "customer",
        status: "todo",
        dueDate: "2026-07-03",
        visibleToCustomer: true,
        createdAt,
      },
      {
        id: "task_demo_2",
        projectId,
        title: "ASDAR Analysebogen auswerten",
        owner: "assad",
        status: "doing",
        dueDate: "2026-06-28",
        visibleToCustomer: true,
        createdAt,
      },
    ],
    milestones: [
      {
        id: "milestone_demo_1",
        projectId,
        title: "Ist-Zustand dokumentiert",
        status: "active",
        dueDate: "2026-06-30",
        visibleToCustomer: true,
        createdAt,
      },
      {
        id: "milestone_demo_2",
        projectId,
        title: "Automatisierungs-Roadmap freigegeben",
        status: "planned",
        dueDate: "2026-07-15",
        visibleToCustomer: true,
        createdAt,
      },
    ],
    files: [],
    invoices: [
      {
        id: "invoice_demo_1",
        projectId,
        number: "AD-2026-001",
        description: "ASDAR Analysepaket",
        amountCents: 290000,
        currency: "EUR",
        status: "sent",
        issuedAt: "2026-06-21",
        dueDate: "2026-07-05",
        paymentUrl: "",
        createdAt,
      },
    ],
    aiInsights: [],
    authTokens: [],
    templateOverrides: [],
    rateLimitBuckets: [],
  };
}

function normalizeStore(store: PortalStore): PortalStore {
  return {
    ...store,
    users: (store.users ?? []).map((user) => ({
      ...user,
      sessionVersion: user.sessionVersion ?? 0,
    })),
    organizations: store.organizations ?? [],
    projects: store.projects ?? [],
    projectMembers: store.projectMembers ?? [],
    projectIntelligence: store.projectIntelligence ?? [],
    updates: store.updates ?? [],
    tasks: store.tasks ?? [],
    milestones: store.milestones ?? [],
    files: store.files ?? [],
    invoices: store.invoices ?? [],
    aiInsights: store.aiInsights ?? [],
    authTokens: store.authTokens ?? [],
    templateOverrides: store.templateOverrides ?? [],
    rateLimitBuckets: store.rateLimitBuckets ?? [],
  };
}

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  try {
    await fs.access(STORE_PATH);
  } catch {
    await fs.writeFile(
      STORE_PATH,
      JSON.stringify(buildSeedStore(), null, 2),
      "utf8",
    );
  }
}

export async function readStore(): Promise<PortalStore> {
  if (isPostgresBackendEnabled()) {
    return readPostgresStore();
  }

  await ensureStore();
  const raw = await fs.readFile(STORE_PATH, "utf8");
  return normalizeStore(JSON.parse(raw) as PortalStore);
}

export async function writeStore(store: PortalStore) {
  if (isPostgresBackendEnabled()) {
    await writePostgresStore(store);
    return;
  }

  await ensureStore();
  const tmp = `${STORE_PATH}.${process.pid}.${randomUUID()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(store, null, 2), "utf8");
  await fs.rename(tmp, STORE_PATH);
}

export async function mutateStore<T>(
  mutator: (store: PortalStore) => T | Promise<T>,
): Promise<T> {
  // Postgres: serialize the read-modify-write cluster-wide via an advisory lock
  // so concurrent serverless instances can't lose each other's updates.
  if (isPostgresBackendEnabled()) {
    return mutatePostgresStore(mutator);
  }

  // JSON file backend (local/dev): a single process owns the file, so an
  // in-process queue is enough to serialize writes.
  const run = async () => {
    const store = await readStore();
    const result = await mutator(store);
    await writeStore(store);
    return result;
  };

  const result = mutationQueue.then(run, run);
  mutationQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

export function findUserByEmail(store: PortalStore, email: string) {
  const normalized = email.trim().toLowerCase();
  return store.users.find((user) => user.email.toLowerCase() === normalized);
}

export async function findUserByIdForSession(
  userId: string,
): Promise<User | null> {
  if (isPostgresBackendEnabled()) {
    return findPostgresUserById(userId);
  }

  const store = await readStore();
  return store.users.find((user) => user.id === userId) ?? null;
}

export async function findUserByEmailForLogin(
  email: string,
): Promise<User | null> {
  const normalized = email.trim().toLowerCase();
  if (isPostgresBackendEnabled()) {
    return findPostgresUserByEmail(normalized);
  }

  const store = await readStore();
  return findUserByEmail(store, normalized) ?? null;
}

export async function bumpUserSessionVersion(userId: string) {
  if (isPostgresBackendEnabled()) {
    await bumpPostgresUserSessionVersion(userId);
    return;
  }

  await mutateStore((store) => {
    const user = store.users.find((entry) => entry.id === userId);
    if (user) user.sessionVersion = (user.sessionVersion ?? 0) + 1;
  });
}

export function getProjectAccess(
  store: PortalStore,
  userId: string,
  projectId: string,
) {
  const user = store.users.find((entry) => entry.id === userId);
  if (!user) return false;
  if (user.role === "admin") return true;
  return store.projectMembers.some(
    (member) => member.projectId === projectId && member.userId === userId,
  );
}

export function listProjectsForUser(store: PortalStore, userId: string) {
  const user = store.users.find((entry) => entry.id === userId);
  if (!user) return [];
  if (user.role === "admin") return store.projects;

  const projectIds = new Set(
    store.projectMembers
      .filter((member) => member.userId === userId)
      .map((member) => member.projectId),
  );
  return store.projects.filter((project) => projectIds.has(project.id));
}

export function getProjectBundle(
  store: PortalStore,
  projectId: string,
): ProjectBundle | null {
  const project = store.projects.find((entry) => entry.id === projectId);
  if (!project) return null;

  const organization = store.organizations.find(
    (entry) => entry.id === project.organizationId,
  );
  if (!organization) return null;

  const members = store.projectMembers.filter(
    (member) => member.projectId === projectId,
  );
  const customerUsers = members
    .map((member) => store.users.find((user) => user.id === member.userId))
    .filter((user): user is NonNullable<typeof user> => Boolean(user));

  return {
    project,
    organization,
    members,
    customerUsers,
    intelligence:
      store.projectIntelligence.find((entry) => entry.projectId === projectId) ??
      defaultIntelligence(projectId),
    updates: store.updates
      .filter((entry) => entry.projectId === projectId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    tasks: store.tasks
      .filter((entry) => entry.projectId === projectId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    milestones: store.milestones
      .filter((entry) => entry.projectId === projectId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    files: store.files
      .filter((entry) => entry.projectId === projectId)
      .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)),
    invoices: store.invoices
      .filter((entry) => entry.projectId === projectId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    aiInsights: store.aiInsights
      .filter((entry) => entry.projectId === projectId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  };
}

export async function listProjectBundlesForUser(
  user: User,
): Promise<ProjectBundle[]> {
  if (isPostgresBackendEnabled()) {
    return readPostgresProjectBundlesForUser(user);
  }

  const store = await readStore();
  return listProjectsForUser(store, user.id)
    .map((project) => getProjectBundle(store, project.id))
    .filter((bundle): bundle is ProjectBundle => Boolean(bundle));
}

export async function getProjectBundleForUser(
  user: User,
  projectId: string,
): Promise<ProjectBundle | null> {
  if (isPostgresBackendEnabled()) {
    return readPostgresProjectBundleForUser(user, projectId);
  }

  const store = await readStore();
  if (!getProjectAccess(store, user.id, projectId)) return null;
  return getProjectBundle(store, projectId);
}

export async function listCustomersWithProjectBundles(): Promise<
  CustomerProjectBundles[]
> {
  if (isPostgresBackendEnabled()) {
    return readPostgresCustomersWithProjectBundles();
  }

  const store = await readStore();
  return store.users
    .filter((entry) => entry.role === "customer")
    .map((customer) => {
      const projectBundles = store.projectMembers
        .filter((member) => member.userId === customer.id)
        .map((member) => getProjectBundle(store, member.projectId))
        .filter((bundle): bundle is ProjectBundle => Boolean(bundle));

      return { customer, projectBundles };
    })
    .sort((a, b) => a.customer.name.localeCompare(b.customer.name));
}

export async function createRegisteredCustomerForAuth(
  input: CreateRegisteredCustomerForAuthInput,
) {
  if (isPostgresBackendEnabled()) {
    return createPostgresRegisteredCustomer(input);
  }

  return mutateStore((store) => {
    const existing = findUserByEmail(store, input.email);
    if (existing) return null;

    store.users.push({
      id: input.id,
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
      role: "customer",
      emailVerifiedAt: input.emailVerifiedAt,
      sessionVersion: 0,
      createdAt: input.createdAt,
    });

    if (input.authToken) {
      store.authTokens.push(input.authToken);
    }

    return { userId: input.id };
  });
}

export async function createProjectForAdmin(
  input: CreateProjectForAdminInput,
): Promise<string> {
  if (isPostgresBackendEnabled()) {
    return createPostgresProjectForAdmin(input);
  }

  return mutateStore((store) => {
    const createdAt = now();
    const orgId = id("org");
    const nextProjectId = id("project");

    store.organizations.push({
      id: orgId,
      name: input.company,
      industry: input.industry,
      createdAt,
    });

    store.projects.push({
      id: nextProjectId,
      organizationId: orgId,
      name: input.projectName,
      summary: input.summary,
      status: "discovery",
      asdarStage: "analyse",
      health: "green",
      nextStep:
        input.template?.kickoffGoal ||
        "Kickoff vorbereiten und Intake vervollstaendigen.",
      createdAt,
      updatedAt: createdAt,
    });

    store.projectIntelligence.push({
      projectId: nextProjectId,
      companyContext: input.template?.intake.companyContext ?? "",
      stakeholders: input.template?.intake.stakeholders ?? "",
      issues: input.template?.intake.issues ?? "",
      goals: input.template?.intake.goals ?? "",
      currentTools: input.template?.intake.currentTools ?? "",
      dataSituation: input.template?.intake.dataSituation ?? "",
      constraints: input.template?.intake.constraints ?? "",
      opportunities: input.template?.intake.opportunities ?? "",
      internalNotes: input.template?.intake.internalNotes ?? "",
      updatedAt: createdAt,
    });

    if (input.customerEmail) {
      const customer = findUserByEmail(store, input.customerEmail);
      if (customer && customer.role === "customer") {
        store.projectMembers.push({
          id: id("member"),
          projectId: nextProjectId,
          userId: customer.id,
          role: "client_owner",
          createdAt,
        });
      }
    }

    if (input.template) {
      for (const task of input.template.seedTasks) {
        store.tasks.push({
          id: id("task"),
          projectId: nextProjectId,
          title: task.title,
          owner: task.owner,
          status: "todo",
          visibleToCustomer: task.visibleToCustomer,
          createdAt,
        });
      }

      for (const milestone of input.template.seedMilestones) {
        store.milestones.push({
          id: id("milestone"),
          projectId: nextProjectId,
          title: milestone.title,
          status: "planned",
          visibleToCustomer: milestone.visibleToCustomer,
          createdAt,
        });
      }

      store.updates.push({
        id: id("update"),
        projectId: nextProjectId,
        title: input.template.customerKickoffUpdate.title,
        body: input.template.customerKickoffUpdate.body,
        visibility: "customer",
        asdarStage: "analyse",
        createdBy: input.userId,
        createdAt,
      });
    }

    store.updates.push({
      id: id("update"),
      projectId: nextProjectId,
      title: "Audit: Projekt erstellt",
      body: `Projekt "${input.projectName}" fuer ${input.company} wurde angelegt.`,
      visibility: "internal",
      asdarStage: "analyse",
      createdBy: input.userId,
      createdAt,
    });

    return nextProjectId;
  });
}

export function upsertIntelligence(
  store: PortalStore,
  projectId: string,
  data: Omit<ProjectIntelligence, "projectId" | "updatedAt">,
) {
  const existing = store.projectIntelligence.find(
    (entry) => entry.projectId === projectId,
  );
  const next = { projectId, ...data, updatedAt: now() };

  if (existing) {
    Object.assign(existing, next);
  } else {
    store.projectIntelligence.push(next);
  }
}

export function updateProjectStage(project: Project, asdarStage: AsdarStage) {
  project.asdarStage = asdarStage;
  project.updatedAt = now();
}
