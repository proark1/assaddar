import { randomUUID } from "crypto";
import type PG from "postgres";
import { getSql } from "./database";
import type { ConsultingTemplate } from "./templates";
import type {
  AiInsight,
  AuthToken,
  Invoice,
  Organization,
  PortalStore,
  Project,
  ProjectBundle,
  ProjectFile,
  ProjectIntelligence,
  ProjectMember,
  ProjectMilestone,
  ProjectTask,
  ProjectUpdate,
  PortalTemplateOverride,
  RateLimitBucket,
  User,
} from "./types";

type Row = Record<string, unknown>;

/** The pooled postgres.js client. */
type Db = ReturnType<typeof getSql>;
/** Common base shared by the pooled client and a transaction handle. */
type SqlLike = PG.ISql;

/**
 * Stable key for the cluster-wide advisory lock that serializes whole-store
 * mutations. Any constant works; it just has to be the same everywhere.
 */
const STORE_LOCK_KEY = 728_413;

export type CreateProjectInput = {
  userId: string;
  company: string;
  industry: string;
  projectName: string;
  summary: string;
  customerEmail: string;
  template?: ConsultingTemplate;
};

export type CreateRegisteredCustomerInput = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  emailVerifiedAt?: string;
  createdAt: string;
  authToken?: AuthToken;
};

function id(prefix: string) {
  return `${prefix}_${randomUUID().replaceAll("-", "").slice(0, 16)}`;
}

function value(value: unknown) {
  return value == null ? "" : String(value);
}

function iso(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  return value ? String(value) : new Date().toISOString();
}

function optionalIso(value: unknown) {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function dateOnly(value: unknown): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function number(value: unknown) {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function boolean(value: unknown) {
  return value === true || value === "true";
}

function toUser(row: Row): User {
  return {
    id: value(row.id),
    name: value(row.name),
    email: value(row.email),
    passwordHash: value(row.password_hash),
    role: value(row.role) === "admin" ? "admin" : "customer",
    emailVerifiedAt: optionalIso(row.email_verified_at),
    createdAt: iso(row.created_at),
  };
}

function toOrganization(row: Row): Organization {
  return {
    id: value(row.id),
    name: value(row.name),
    industry: value(row.industry),
    website: value(row.website) || undefined,
    createdAt: iso(row.created_at),
  };
}

function toProject(row: Row): Project {
  return {
    id: value(row.id),
    organizationId: value(row.organization_id),
    name: value(row.name),
    summary: value(row.summary),
    status:
      value(row.status) === "analysis"
        ? "analysis"
        : value(row.status) === "implementation"
          ? "implementation"
          : value(row.status) === "paused"
            ? "paused"
            : value(row.status) === "completed"
              ? "completed"
              : "discovery",
    asdarStage:
      value(row.asdar_stage) === "structure"
        ? "structure"
        : value(row.asdar_stage) === "digitize"
          ? "digitize"
          : value(row.asdar_stage) === "automate"
            ? "automate"
            : value(row.asdar_stage) === "realize"
              ? "realize"
              : "analyse",
    health:
      value(row.health) === "red"
        ? "red"
        : value(row.health) === "amber"
          ? "amber"
          : "green",
    nextStep: value(row.next_step),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

function toProjectMember(row: Row): ProjectMember {
  return {
    id: value(row.id),
    projectId: value(row.project_id),
    userId: value(row.user_id),
    role: value(row.role) === "client_viewer" ? "client_viewer" : "client_owner",
    createdAt: iso(row.created_at),
  };
}

function toProjectIntelligence(row: Row): ProjectIntelligence {
  return {
    projectId: value(row.project_id),
    companyContext: value(row.company_context),
    stakeholders: value(row.stakeholders),
    issues: value(row.issues),
    goals: value(row.goals),
    currentTools: value(row.current_tools),
    dataSituation: value(row.data_situation),
    constraints: value(row.constraints),
    opportunities: value(row.opportunities),
    internalNotes: value(row.internal_notes),
    updatedAt: iso(row.updated_at),
  };
}

function emptyProjectIntelligence(projectId: string): ProjectIntelligence {
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
    updatedAt: new Date().toISOString(),
  };
}

function toProjectUpdate(row: Row): ProjectUpdate {
  return {
    id: value(row.id),
    projectId: value(row.project_id),
    title: value(row.title),
    body: value(row.body),
    visibility: value(row.visibility) === "customer" ? "customer" : "internal",
    asdarStage:
      value(row.asdar_stage) === "structure"
        ? "structure"
        : value(row.asdar_stage) === "digitize"
          ? "digitize"
          : value(row.asdar_stage) === "automate"
            ? "automate"
            : value(row.asdar_stage) === "realize"
              ? "realize"
              : "analyse",
    createdBy: value(row.created_by),
    createdAt: iso(row.created_at),
  };
}

function toProjectTask(row: Row): ProjectTask {
  return {
    id: value(row.id),
    projectId: value(row.project_id),
    title: value(row.title),
    owner: value(row.owner) === "customer" ? "customer" : "assad",
    status:
      value(row.status) === "done"
        ? "done"
        : value(row.status) === "doing"
          ? "doing"
          : "todo",
    dueDate: dateOnly(row.due_date),
    visibleToCustomer: boolean(row.visible_to_customer),
    createdAt: iso(row.created_at),
  };
}

function toProjectMilestone(row: Row): ProjectMilestone {
  return {
    id: value(row.id),
    projectId: value(row.project_id),
    title: value(row.title),
    status:
      value(row.status) === "done"
        ? "done"
        : value(row.status) === "active"
          ? "active"
          : "planned",
    dueDate: dateOnly(row.due_date),
    visibleToCustomer: boolean(row.visible_to_customer),
    createdAt: iso(row.created_at),
  };
}

function toProjectFile(row: Row): ProjectFile {
  return {
    id: value(row.id),
    projectId: value(row.project_id),
    name: value(row.name),
    description: value(row.description),
    storagePath: value(row.storage_path),
    mimeType: value(row.mime_type),
    size: number(row.size),
    visibility: value(row.visibility) === "customer" ? "customer" : "internal",
    category:
      value(row.category) === "customer_upload"
        ? "customer_upload"
        : value(row.category) === "consultant_deliverable"
          ? "consultant_deliverable"
          : value(row.category) === "proposal"
            ? "proposal"
            : value(row.category) === "project_brief"
              ? "project_brief"
              : value(row.category) === "final_report"
                ? "final_report"
                : value(row.category) === "invoice"
                  ? "invoice"
                  : value(row.category)
                    ? "other"
                    : undefined,
    approvalStatus:
      value(row.approval_status) === "pending"
        ? "pending"
        : value(row.approval_status) === "approved"
          ? "approved"
          : value(row.approval_status)
            ? "not_required"
            : undefined,
    approvedBy: value(row.approved_by) || undefined,
    approvedAt: optionalIso(row.approved_at),
    uploadedBy: value(row.uploaded_by),
    uploadedAt: iso(row.uploaded_at),
  };
}

function toInvoice(row: Row): Invoice {
  return {
    id: value(row.id),
    projectId: value(row.project_id),
    number: value(row.number),
    description: value(row.description),
    amountCents: number(row.amount_cents),
    currency: value(row.currency) === "USD" ? "USD" : "EUR",
    status:
      value(row.status) === "paid"
        ? "paid"
        : value(row.status) === "overdue"
          ? "overdue"
          : value(row.status) === "draft"
            ? "draft"
            : "sent",
    issuedAt: dateOnly(row.issued_at) ?? new Date().toISOString().slice(0, 10),
    dueDate: dateOnly(row.due_date),
    paymentUrl: value(row.payment_url) || undefined,
    createdAt: iso(row.created_at),
  };
}

function toAiInsight(row: Row): AiInsight {
  return {
    id: value(row.id),
    projectId: value(row.project_id),
    title: value(row.title),
    body: value(row.body),
    kind:
      value(row.kind) === "similar_project"
        ? "similar_project"
        : value(row.kind) === "risk"
          ? "risk"
          : value(row.kind) === "next_step"
            ? "next_step"
            : "guidance",
    createdAt: iso(row.created_at),
  };
}

function stringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
  } catch {
    return value
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function toTemplateOverride(row: Row): PortalTemplateOverride {
  return {
    id: value(row.id),
    templateId: value(row.template_id),
    label: value(row.label),
    bestFor: value(row.best_for),
    kickoffGoal: value(row.kickoff_goal),
    summary: value(row.summary),
    discoveryQuestions: stringList(row.discovery_questions),
    quickWins: stringList(row.quick_wins),
    automationIdeas: stringList(row.automation_ideas),
    risks: stringList(row.risks),
    updatedBy: value(row.updated_by),
    updatedAt: iso(row.updated_at),
  };
}

function toRateLimitBucket(row: Row): RateLimitBucket {
  return {
    key: value(row.key),
    count: number(row.count),
    resetAt: iso(row.reset_at),
    updatedAt: iso(row.updated_at),
  };
}

function groupByProjectId<T extends { projectId: string }>(items: T[]) {
  const grouped = new Map<string, T[]>();
  for (const item of items) {
    const existing = grouped.get(item.projectId) ?? [];
    existing.push(item);
    grouped.set(item.projectId, existing);
  }
  return grouped;
}

export async function findPostgresUserByEmail(email: string) {
  const sql = getSql();
  const rows = await sql`
    select id, name, email, password_hash, role, email_verified_at, created_at
    from portal_users
    where lower(email) = lower(${email})
    limit 1
  `;
  const row = (rows as Row[])[0];
  return row ? toUser(row) : null;
}

export async function findPostgresUserById(userId: string) {
  const sql = getSql();
  const rows = await sql`
    select id, name, email, password_hash, role, email_verified_at, created_at
    from portal_users
    where id = ${userId}
    limit 1
  `;
  const row = (rows as Row[])[0];
  return row ? toUser(row) : null;
}

export async function createPostgresRegisteredCustomer({
  id: userId,
  name,
  email,
  passwordHash,
  emailVerifiedAt,
  createdAt,
  authToken,
}: CreateRegisteredCustomerInput) {
  const sql = getSql();

  return sql.begin(async (tx) => {
    const existing = await tx`
      select id
      from portal_users
      where lower(email) = lower(${email})
      limit 1
    `;

    if ((existing as Row[]).length > 0) return null;

    await tx`
      insert into portal_users (
        id, name, email, password_hash, role, email_verified_at, created_at
      )
      values (
        ${userId}, ${name}, ${email}, ${passwordHash}, 'customer',
        ${emailVerifiedAt ?? null}, ${createdAt}
      )
    `;

    if (authToken) {
      await tx`
        insert into portal_auth_tokens (
          id, user_id, token_hash, purpose, expires_at, consumed_at, created_at
        )
        values (
          ${authToken.id}, ${authToken.userId}, ${authToken.tokenHash},
          ${authToken.purpose}, ${authToken.expiresAt},
          ${authToken.consumedAt ?? null}, ${authToken.createdAt}
        )
      `;
    }

    return { userId };
  });
}

export async function checkPostgresRateLimit(
  key: string,
  limit: number,
  windowMs: number,
) {
  const sql = getSql();
  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  const nextResetAt = new Date(now + windowMs).toISOString();

  const rows = await sql`
    insert into portal_rate_limits (key, count, reset_at, updated_at)
    values (${key}, 1, ${nextResetAt}, ${nowIso})
    on conflict (key) do update set
      count = case
        when portal_rate_limits.reset_at <= ${nowIso} then 1
        else portal_rate_limits.count + 1
      end,
      reset_at = case
        when portal_rate_limits.reset_at <= ${nowIso} then ${nextResetAt}
        else portal_rate_limits.reset_at
      end,
      updated_at = ${nowIso}
    returning count, reset_at
  `;

  const row = (rows as Row[])[0];
  const count = number(row?.count);
  const resetAt = new Date(iso(row?.reset_at)).getTime();

  return {
    allowed: count <= limit,
    retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)),
    remaining: Math.max(0, limit - count),
  };
}

async function readPostgresProjectBundles(
  projects: Project[],
): Promise<ProjectBundle[]> {
  const sql = getSql();
  const projectIds = projects.map((project) => project.id);
  if (projectIds.length === 0) return [];

  const organizationIds = [
    ...new Set(projects.map((project) => project.organizationId)),
  ];
  const [
    organizationRows,
    memberRows,
    intelligenceRows,
    updateRows,
    taskRows,
    milestoneRows,
    fileRows,
    invoiceRows,
    aiInsightRows,
  ] = await Promise.all([
    sql`select * from portal_organizations where id in ${sql(organizationIds)}`,
    sql`select * from portal_project_members where project_id in ${sql(projectIds)} order by created_at asc`,
    sql`select * from portal_project_intelligence where project_id in ${sql(projectIds)} order by updated_at desc`,
    sql`select * from portal_project_updates where project_id in ${sql(projectIds)} order by created_at desc`,
    sql`select * from portal_project_tasks where project_id in ${sql(projectIds)} order by created_at asc`,
    sql`select * from portal_project_milestones where project_id in ${sql(projectIds)} order by created_at asc`,
    sql`select * from portal_project_files where project_id in ${sql(projectIds)} order by uploaded_at desc`,
    sql`select * from portal_invoices where project_id in ${sql(projectIds)} order by created_at desc`,
    sql`select * from portal_ai_insights where project_id in ${sql(projectIds)} order by created_at desc`,
  ]);

  const organizations = new Map(
    (organizationRows as Row[]).map((row) => {
      const organization = toOrganization(row);
      return [organization.id, organization];
    }),
  );
  const members = (memberRows as Row[]).map(toProjectMember);
  const memberUserIds = [...new Set(members.map((member) => member.userId))];
  const userRows =
    memberUserIds.length > 0
      ? await sql`select id, name, email, password_hash, role, email_verified_at, created_at from portal_users where id in ${sql(memberUserIds)}`
      : [];
  const users = new Map(
    (userRows as Row[]).map((row) => {
      const memberUser = toUser(row);
      return [memberUser.id, memberUser];
    }),
  );
  const intelligence = new Map(
    (intelligenceRows as Row[]).map((row) => {
      const item = toProjectIntelligence(row);
      return [item.projectId, item];
    }),
  );
  const membersByProject = groupByProjectId(members);
  const updatesByProject = groupByProjectId(
    (updateRows as Row[]).map(toProjectUpdate),
  );
  const tasksByProject = groupByProjectId((taskRows as Row[]).map(toProjectTask));
  const milestonesByProject = groupByProjectId(
    (milestoneRows as Row[]).map(toProjectMilestone),
  );
  const filesByProject = groupByProjectId((fileRows as Row[]).map(toProjectFile));
  const invoicesByProject = groupByProjectId(
    (invoiceRows as Row[]).map(toInvoice),
  );
  const aiInsightsByProject = groupByProjectId(
    (aiInsightRows as Row[]).map(toAiInsight),
  );

  return projects.flatMap((project) => {
    const organization = organizations.get(project.organizationId);
    if (!organization) return [];

    const projectMembers = membersByProject.get(project.id) ?? [];
    const customerUsers = projectMembers
      .map((member) => users.get(member.userId))
      .filter((entry): entry is User => Boolean(entry));

    return [
      {
        project,
        organization,
        members: projectMembers,
        customerUsers,
        intelligence:
          intelligence.get(project.id) ?? emptyProjectIntelligence(project.id),
        updates: updatesByProject.get(project.id) ?? [],
        tasks: tasksByProject.get(project.id) ?? [],
        milestones: milestonesByProject.get(project.id) ?? [],
        files: filesByProject.get(project.id) ?? [],
        invoices: invoicesByProject.get(project.id) ?? [],
        aiInsights: aiInsightsByProject.get(project.id) ?? [],
      },
    ];
  });
}

export async function readPostgresProjectBundlesForUser(
  user: User,
): Promise<ProjectBundle[]> {
  const sql = getSql();
  const projectRows =
    user.role === "admin"
      ? await sql`select * from portal_projects order by created_at asc`
      : await sql`
          select p.*
          from portal_projects p
          inner join portal_project_members pm on pm.project_id = p.id
          where pm.user_id = ${user.id}
          order by p.created_at asc
        `;
  return readPostgresProjectBundles((projectRows as Row[]).map(toProject));
}

export async function readPostgresProjectBundleForUser(
  user: User,
  projectId: string,
): Promise<ProjectBundle | null> {
  const sql = getSql();
  const projectRows =
    user.role === "admin"
      ? await sql`select * from portal_projects where id = ${projectId} limit 1`
      : await sql`
          select p.*
          from portal_projects p
          inner join portal_project_members pm on pm.project_id = p.id
          where p.id = ${projectId} and pm.user_id = ${user.id}
          limit 1
        `;
  const bundles = await readPostgresProjectBundles(
    (projectRows as Row[]).map(toProject),
  );
  return bundles[0] ?? null;
}

export async function readPostgresCustomersWithProjectBundles(): Promise<
  Array<{ customer: User; projectBundles: ProjectBundle[] }>
> {
  const sql = getSql();
  const customerRows = await sql`
    select id, name, email, password_hash, role, email_verified_at, created_at
    from portal_users
    where role = 'customer'
    order by name asc
  `;
  const customers = (customerRows as Row[]).map(toUser);
  const bundles = await readPostgresProjectBundlesForUser({
    id: "__admin_all_projects__",
    name: "Admin",
    email: "",
    passwordHash: "",
    role: "admin",
    createdAt: new Date().toISOString(),
  });

  return customers.map((customer) => ({
    customer,
    projectBundles: bundles.filter((bundle) =>
      bundle.members.some((member) => member.userId === customer.id),
    ),
  }));
}

export async function createPostgresProjectForAdmin({
  userId,
  company,
  industry,
  projectName,
  summary,
  customerEmail,
  template,
}: CreateProjectInput) {
  const sql = getSql();
  const createdAt = new Date().toISOString();
  const orgId = id("org");
  const projectId = id("project");

  await sql.begin(async (tx) => {
    await tx`
      insert into portal_organizations (id, name, industry, created_at)
      values (${orgId}, ${company}, ${industry}, ${createdAt})
    `;

    await tx`
      insert into portal_projects (
        id, organization_id, name, summary, status, asdar_stage,
        health, next_step, created_at, updated_at
      )
      values (
        ${projectId}, ${orgId}, ${projectName}, ${summary}, 'discovery',
        'analyse', 'green',
        ${template?.kickoffGoal || "Kickoff vorbereiten und Intake vervollstaendigen."},
        ${createdAt}, ${createdAt}
      )
    `;

    await tx`
      insert into portal_project_intelligence (
        project_id, company_context, stakeholders, issues, goals,
        current_tools, data_situation, constraints, opportunities,
        internal_notes, updated_at
      )
      values (
        ${projectId},
        ${template?.intake.companyContext ?? ""},
        ${template?.intake.stakeholders ?? ""},
        ${template?.intake.issues ?? ""},
        ${template?.intake.goals ?? ""},
        ${template?.intake.currentTools ?? ""},
        ${template?.intake.dataSituation ?? ""},
        ${template?.intake.constraints ?? ""},
        ${template?.intake.opportunities ?? ""},
        ${template?.intake.internalNotes ?? ""},
        ${createdAt}
      )
    `;

    if (customerEmail) {
      const rows = await tx`
        select id, name, email, password_hash, role, email_verified_at, created_at
        from portal_users
        where lower(email) = lower(${customerEmail})
        limit 1
      `;
      const customer = (rows as Row[])[0] ? toUser((rows as Row[])[0]) : null;
      if (customer?.role === "customer") {
        await tx`
          insert into portal_project_members (id, project_id, user_id, role, created_at)
          values (${id("member")}, ${projectId}, ${customer.id}, 'client_owner', ${createdAt})
          on conflict (project_id, user_id) do update set role = excluded.role
        `;
      }
    }

    if (template) {
      for (const task of template.seedTasks) {
        await tx`
          insert into portal_project_tasks (
            id, project_id, title, owner, status, visible_to_customer, created_at
          )
          values (
            ${id("task")}, ${projectId}, ${task.title}, ${task.owner},
            'todo', ${task.visibleToCustomer}, ${createdAt}
          )
        `;
      }

      for (const milestone of template.seedMilestones) {
        await tx`
          insert into portal_project_milestones (
            id, project_id, title, status, visible_to_customer, created_at
          )
          values (
            ${id("milestone")}, ${projectId}, ${milestone.title},
            'planned', ${milestone.visibleToCustomer}, ${createdAt}
          )
        `;
      }

      await tx`
        insert into portal_project_updates (
          id, project_id, title, body, visibility, asdar_stage, created_by, created_at
        )
        values (
          ${id("update")}, ${projectId}, ${template.customerKickoffUpdate.title},
          ${template.customerKickoffUpdate.body}, 'customer', 'analyse',
          ${userId}, ${createdAt}
        )
      `;
    }

    await tx`
      insert into portal_project_updates (
        id, project_id, title, body, visibility, asdar_stage, created_by, created_at
      )
      values (
        ${id("update")}, ${projectId}, 'Audit: Projekt erstellt',
        ${`Projekt "${projectName}" fuer ${company} wurde angelegt.`},
        'internal', 'analyse', ${userId}, ${createdAt}
      )
    `;
  });

  return projectId;
}

export async function readPostgresStore(
  sql: SqlLike = getSql(),
): Promise<PortalStore> {
  const [
    users,
    organizations,
    projects,
    projectMembers,
    intelligence,
    updates,
    tasks,
    milestones,
    files,
    invoices,
    aiInsights,
    authTokens,
    templateOverrides,
    rateLimitBuckets,
  ] = await Promise.all([
    sql`select * from portal_users order by created_at asc`,
    sql`select * from portal_organizations order by created_at asc`,
    sql`select * from portal_projects order by created_at asc`,
    sql`select * from portal_project_members order by created_at asc`,
    sql`select * from portal_project_intelligence order by updated_at desc`,
    sql`select * from portal_project_updates order by created_at desc`,
    sql`select * from portal_project_tasks order by created_at asc`,
    sql`select * from portal_project_milestones order by created_at asc`,
    sql`select * from portal_project_files order by uploaded_at desc`,
    sql`select * from portal_invoices order by created_at desc`,
    sql`select * from portal_ai_insights order by created_at desc`,
    sql`select * from portal_auth_tokens order by created_at desc`,
    sql`select * from portal_template_overrides order by updated_at desc`,
    sql`select * from portal_rate_limits order by updated_at desc`,
  ]);

  return {
    users: (users as Row[]).map(toUser),
    organizations: (organizations as Row[]).map(
      (row): Organization => ({
        id: value(row.id),
        name: value(row.name),
        industry: value(row.industry),
        website: value(row.website) || undefined,
        createdAt: iso(row.created_at),
      }),
    ),
    projects: (projects as Row[]).map(
      (row): Project => ({
        id: value(row.id),
        organizationId: value(row.organization_id),
        name: value(row.name),
        summary: value(row.summary),
        status:
          value(row.status) === "analysis"
            ? "analysis"
            : value(row.status) === "implementation"
              ? "implementation"
              : value(row.status) === "paused"
                ? "paused"
                : value(row.status) === "completed"
                  ? "completed"
                  : "discovery",
        asdarStage:
          value(row.asdar_stage) === "structure"
            ? "structure"
            : value(row.asdar_stage) === "digitize"
              ? "digitize"
              : value(row.asdar_stage) === "automate"
                ? "automate"
                : value(row.asdar_stage) === "realize"
                  ? "realize"
                  : "analyse",
        health:
          value(row.health) === "red"
            ? "red"
            : value(row.health) === "amber"
              ? "amber"
              : "green",
        nextStep: value(row.next_step),
        createdAt: iso(row.created_at),
        updatedAt: iso(row.updated_at),
      }),
    ),
    projectMembers: (projectMembers as Row[]).map(
      (row): ProjectMember => ({
        id: value(row.id),
        projectId: value(row.project_id),
        userId: value(row.user_id),
        role: value(row.role) === "client_viewer" ? "client_viewer" : "client_owner",
        createdAt: iso(row.created_at),
      }),
    ),
    projectIntelligence: (intelligence as Row[]).map(
      (row): ProjectIntelligence => ({
        projectId: value(row.project_id),
        companyContext: value(row.company_context),
        stakeholders: value(row.stakeholders),
        issues: value(row.issues),
        goals: value(row.goals),
        currentTools: value(row.current_tools),
        dataSituation: value(row.data_situation),
        constraints: value(row.constraints),
        opportunities: value(row.opportunities),
        internalNotes: value(row.internal_notes),
        updatedAt: iso(row.updated_at),
      }),
    ),
    updates: (updates as Row[]).map(
      (row): ProjectUpdate => ({
        id: value(row.id),
        projectId: value(row.project_id),
        title: value(row.title),
        body: value(row.body),
        visibility: value(row.visibility) === "customer" ? "customer" : "internal",
        asdarStage:
          value(row.asdar_stage) === "structure"
            ? "structure"
            : value(row.asdar_stage) === "digitize"
              ? "digitize"
              : value(row.asdar_stage) === "automate"
                ? "automate"
                : value(row.asdar_stage) === "realize"
                  ? "realize"
                  : "analyse",
        createdBy: value(row.created_by),
        createdAt: iso(row.created_at),
      }),
    ),
    tasks: (tasks as Row[]).map(
      (row): ProjectTask => ({
        id: value(row.id),
        projectId: value(row.project_id),
        title: value(row.title),
        owner: value(row.owner) === "customer" ? "customer" : "assad",
        status:
          value(row.status) === "done"
            ? "done"
            : value(row.status) === "doing"
              ? "doing"
              : "todo",
        dueDate: dateOnly(row.due_date),
        visibleToCustomer: boolean(row.visible_to_customer),
        createdAt: iso(row.created_at),
      }),
    ),
    milestones: (milestones as Row[]).map(
      (row): ProjectMilestone => ({
        id: value(row.id),
        projectId: value(row.project_id),
        title: value(row.title),
        status:
          value(row.status) === "done"
            ? "done"
            : value(row.status) === "active"
              ? "active"
              : "planned",
        dueDate: dateOnly(row.due_date),
        visibleToCustomer: boolean(row.visible_to_customer),
        createdAt: iso(row.created_at),
      }),
    ),
    files: (files as Row[]).map(
      (row): ProjectFile => ({
        id: value(row.id),
        projectId: value(row.project_id),
        name: value(row.name),
        description: value(row.description),
        storagePath: value(row.storage_path),
        mimeType: value(row.mime_type),
        size: number(row.size),
        visibility: value(row.visibility) === "customer" ? "customer" : "internal",
        category:
          value(row.category) === "customer_upload"
            ? "customer_upload"
            : value(row.category) === "consultant_deliverable"
              ? "consultant_deliverable"
              : value(row.category) === "proposal"
                ? "proposal"
                : value(row.category) === "project_brief"
                  ? "project_brief"
                  : value(row.category) === "final_report"
                    ? "final_report"
                    : value(row.category) === "invoice"
                      ? "invoice"
                      : value(row.category)
                        ? "other"
                        : undefined,
        approvalStatus:
          value(row.approval_status) === "pending"
            ? "pending"
            : value(row.approval_status) === "approved"
              ? "approved"
              : value(row.approval_status)
                ? "not_required"
                : undefined,
        approvedBy: value(row.approved_by) || undefined,
        approvedAt: optionalIso(row.approved_at),
        uploadedBy: value(row.uploaded_by),
        uploadedAt: iso(row.uploaded_at),
      }),
    ),
    invoices: (invoices as Row[]).map(
      (row): Invoice => ({
        id: value(row.id),
        projectId: value(row.project_id),
        number: value(row.number),
        description: value(row.description),
        amountCents: number(row.amount_cents),
        currency: value(row.currency) === "USD" ? "USD" : "EUR",
        status:
          value(row.status) === "paid"
            ? "paid"
            : value(row.status) === "overdue"
              ? "overdue"
              : value(row.status) === "draft"
                ? "draft"
                : "sent",
        issuedAt: dateOnly(row.issued_at) ?? new Date().toISOString().slice(0, 10),
        dueDate: dateOnly(row.due_date),
        paymentUrl: value(row.payment_url) || undefined,
        createdAt: iso(row.created_at),
      }),
    ),
    aiInsights: (aiInsights as Row[]).map(
      (row): AiInsight => ({
        id: value(row.id),
        projectId: value(row.project_id),
        title: value(row.title),
        body: value(row.body),
        kind:
          value(row.kind) === "similar_project"
            ? "similar_project"
            : value(row.kind) === "risk"
              ? "risk"
              : value(row.kind) === "next_step"
                ? "next_step"
                : "guidance",
        createdAt: iso(row.created_at),
      }),
    ),
    authTokens: (authTokens as Row[]).map(
      (row): AuthToken => ({
        id: value(row.id),
        userId: value(row.user_id),
        tokenHash: value(row.token_hash),
        purpose:
          value(row.purpose) === "password_reset"
            ? "password_reset"
            : value(row.purpose) === "project_invite"
              ? "project_invite"
              : "email_verification",
        expiresAt: iso(row.expires_at),
        consumedAt: optionalIso(row.consumed_at),
        createdAt: iso(row.created_at),
      }),
    ),
    templateOverrides: (templateOverrides as Row[]).map(toTemplateOverride),
    rateLimitBuckets: (rateLimitBuckets as Row[]).map(toRateLimitBucket),
  };
}

async function writeStoreRows(tx: SqlLike, store: PortalStore) {
  {
    for (const user of store.users) {
      await tx`
        insert into portal_users (id, name, email, password_hash, role, email_verified_at, created_at)
        values (${user.id}, ${user.name}, ${user.email}, ${user.passwordHash}, ${user.role}, ${user.emailVerifiedAt ?? null}, ${user.createdAt})
        on conflict (id) do update set
          name = excluded.name,
          email = excluded.email,
          password_hash = excluded.password_hash,
          role = excluded.role,
          email_verified_at = excluded.email_verified_at
      `;
    }

    for (const organization of store.organizations) {
      await tx`
        insert into portal_organizations (id, name, industry, website, created_at)
        values (${organization.id}, ${organization.name}, ${organization.industry}, ${organization.website ?? null}, ${organization.createdAt})
        on conflict (id) do update set
          name = excluded.name,
          industry = excluded.industry,
          website = excluded.website
      `;
    }

    for (const project of store.projects) {
      await tx`
        insert into portal_projects (id, organization_id, name, summary, status, asdar_stage, health, next_step, created_at, updated_at)
        values (${project.id}, ${project.organizationId}, ${project.name}, ${project.summary}, ${project.status}, ${project.asdarStage}, ${project.health}, ${project.nextStep}, ${project.createdAt}, ${project.updatedAt})
        on conflict (id) do update set
          organization_id = excluded.organization_id,
          name = excluded.name,
          summary = excluded.summary,
          status = excluded.status,
          asdar_stage = excluded.asdar_stage,
          health = excluded.health,
          next_step = excluded.next_step,
          updated_at = excluded.updated_at
      `;
    }

    for (const member of store.projectMembers) {
      await tx`
        insert into portal_project_members (id, project_id, user_id, role, created_at)
        values (${member.id}, ${member.projectId}, ${member.userId}, ${member.role}, ${member.createdAt})
        on conflict (project_id, user_id) do update set role = excluded.role
      `;
    }

    for (const intelligence of store.projectIntelligence) {
      await tx`
        insert into portal_project_intelligence (
          project_id, company_context, stakeholders, issues, goals,
          current_tools, data_situation, constraints, opportunities,
          internal_notes, updated_at
        )
        values (
          ${intelligence.projectId}, ${intelligence.companyContext}, ${intelligence.stakeholders},
          ${intelligence.issues}, ${intelligence.goals}, ${intelligence.currentTools},
          ${intelligence.dataSituation}, ${intelligence.constraints}, ${intelligence.opportunities},
          ${intelligence.internalNotes}, ${intelligence.updatedAt}
        )
        on conflict (project_id) do update set
          company_context = excluded.company_context,
          stakeholders = excluded.stakeholders,
          issues = excluded.issues,
          goals = excluded.goals,
          current_tools = excluded.current_tools,
          data_situation = excluded.data_situation,
          constraints = excluded.constraints,
          opportunities = excluded.opportunities,
          internal_notes = excluded.internal_notes,
          updated_at = excluded.updated_at
      `;
    }

    for (const update of store.updates) {
      await tx`
        insert into portal_project_updates (id, project_id, title, body, visibility, asdar_stage, created_by, created_at)
        values (${update.id}, ${update.projectId}, ${update.title}, ${update.body}, ${update.visibility}, ${update.asdarStage}, ${update.createdBy}, ${update.createdAt})
        on conflict (id) do update set
          title = excluded.title,
          body = excluded.body,
          visibility = excluded.visibility,
          asdar_stage = excluded.asdar_stage
      `;
    }

    for (const task of store.tasks) {
      await tx`
        insert into portal_project_tasks (id, project_id, title, owner, status, due_date, visible_to_customer, created_at)
        values (${task.id}, ${task.projectId}, ${task.title}, ${task.owner}, ${task.status}, ${task.dueDate ?? null}, ${task.visibleToCustomer}, ${task.createdAt})
        on conflict (id) do update set
          title = excluded.title,
          owner = excluded.owner,
          status = excluded.status,
          due_date = excluded.due_date,
          visible_to_customer = excluded.visible_to_customer
      `;
    }

    for (const milestone of store.milestones) {
      await tx`
        insert into portal_project_milestones (id, project_id, title, status, due_date, visible_to_customer, created_at)
        values (${milestone.id}, ${milestone.projectId}, ${milestone.title}, ${milestone.status}, ${milestone.dueDate ?? null}, ${milestone.visibleToCustomer}, ${milestone.createdAt})
        on conflict (id) do update set
          title = excluded.title,
          status = excluded.status,
          due_date = excluded.due_date,
          visible_to_customer = excluded.visible_to_customer
      `;
    }

    for (const file of store.files) {
      await tx`
        insert into portal_project_files (
          id, project_id, name, description, storage_path, mime_type, size,
          visibility, category, approval_status, approved_by, approved_at,
          uploaded_by, uploaded_at
        )
        values (
          ${file.id}, ${file.projectId}, ${file.name}, ${file.description},
          ${file.storagePath}, ${file.mimeType}, ${file.size}, ${file.visibility},
          ${file.category ?? null}, ${file.approvalStatus ?? null},
          ${file.approvedBy ?? null}, ${file.approvedAt ?? null},
          ${file.uploadedBy}, ${file.uploadedAt}
        )
        on conflict (id) do update set
          name = excluded.name,
          description = excluded.description,
          storage_path = excluded.storage_path,
          mime_type = excluded.mime_type,
          size = excluded.size,
          visibility = excluded.visibility,
          category = excluded.category,
          approval_status = excluded.approval_status,
          approved_by = excluded.approved_by,
          approved_at = excluded.approved_at
      `;
    }

    for (const invoice of store.invoices) {
      await tx`
        insert into portal_invoices (id, project_id, number, description, amount_cents, currency, status, issued_at, due_date, payment_url, created_at)
        values (${invoice.id}, ${invoice.projectId}, ${invoice.number}, ${invoice.description}, ${invoice.amountCents}, ${invoice.currency}, ${invoice.status}, ${invoice.issuedAt}, ${invoice.dueDate ?? null}, ${invoice.paymentUrl ?? null}, ${invoice.createdAt})
        on conflict (id) do update set
          number = excluded.number,
          description = excluded.description,
          amount_cents = excluded.amount_cents,
          currency = excluded.currency,
          status = excluded.status,
          issued_at = excluded.issued_at,
          due_date = excluded.due_date,
          payment_url = excluded.payment_url
      `;
    }

    for (const insight of store.aiInsights) {
      await tx`
        insert into portal_ai_insights (id, project_id, title, body, kind, created_at)
        values (${insight.id}, ${insight.projectId}, ${insight.title}, ${insight.body}, ${insight.kind}, ${insight.createdAt})
        on conflict (id) do update set
          title = excluded.title,
          body = excluded.body,
          kind = excluded.kind
      `;
    }

    for (const token of store.authTokens) {
      await tx`
        insert into portal_auth_tokens (id, user_id, token_hash, purpose, expires_at, consumed_at, created_at)
        values (${token.id}, ${token.userId}, ${token.tokenHash}, ${token.purpose}, ${token.expiresAt}, ${token.consumedAt ?? null}, ${token.createdAt})
        on conflict (id) do update set
          token_hash = excluded.token_hash,
          expires_at = excluded.expires_at,
          consumed_at = excluded.consumed_at
      `;
    }

    for (const template of store.templateOverrides ?? []) {
      await tx`
        insert into portal_template_overrides (
          id, template_id, label, best_for, kickoff_goal, summary,
          discovery_questions, quick_wins, automation_ideas, risks,
          updated_by, updated_at
        )
        values (
          ${template.id}, ${template.templateId}, ${template.label},
          ${template.bestFor}, ${template.kickoffGoal}, ${template.summary},
          ${JSON.stringify(template.discoveryQuestions)},
          ${JSON.stringify(template.quickWins)},
          ${JSON.stringify(template.automationIdeas)},
          ${JSON.stringify(template.risks)},
          ${template.updatedBy}, ${template.updatedAt}
        )
        on conflict (template_id) do update set
          label = excluded.label,
          best_for = excluded.best_for,
          kickoff_goal = excluded.kickoff_goal,
          summary = excluded.summary,
          discovery_questions = excluded.discovery_questions,
          quick_wins = excluded.quick_wins,
          automation_ideas = excluded.automation_ideas,
          risks = excluded.risks,
          updated_by = excluded.updated_by,
          updated_at = excluded.updated_at
      `;
    }

    for (const bucket of store.rateLimitBuckets ?? []) {
      await tx`
        insert into portal_rate_limits (key, count, reset_at, updated_at)
        values (${bucket.key}, ${bucket.count}, ${bucket.resetAt}, ${bucket.updatedAt})
        on conflict (key) do update set
          count = excluded.count,
          reset_at = excluded.reset_at,
          updated_at = excluded.updated_at
      `;
    }
  }
}

export async function writePostgresStore(
  store: PortalStore,
  sql: Db = getSql(),
) {
  await sql.begin(async (tx) => {
    await writeStoreRows(tx, store);
  });
}

/**
 * Atomic read-modify-write for the whole store on Postgres.
 *
 * The read-all / mutate / write-all pattern is only safe if no other request
 * interleaves between the read and the write — otherwise the later write-all
 * clobbers the earlier one (lost update). An in-process queue can't guarantee
 * that across serverless instances, so we serialize cluster-wide with a
 * transaction-scoped advisory lock: a second mutation blocks on the lock until
 * the first commits, then reads the already-committed state. The lock releases
 * automatically on commit or rollback, so an error can't leak it.
 */
export async function mutatePostgresStore<T>(
  mutator: (store: PortalStore) => T | Promise<T>,
): Promise<T> {
  const sql = getSql();
  const result = await sql.begin(async (tx) => {
    await tx`select pg_advisory_xact_lock(${STORE_LOCK_KEY})`;
    const store = await readPostgresStore(tx);
    const mutated = await mutator(store);
    // Write the rows directly on this same locked transaction so the
    // read and the write commit as one atomic unit.
    await writeStoreRows(tx, store);
    return mutated;
  });
  return result as T;
}
