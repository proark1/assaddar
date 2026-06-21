import { getSql } from "./database";
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
  User,
} from "./types";

type Row = Record<string, unknown>;

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

export async function readPostgresStore(): Promise<PortalStore> {
  const sql = getSql();
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
  };
}

export async function writePostgresStore(store: PortalStore) {
  const sql = getSql();

  await sql.begin(async (tx) => {
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
        insert into portal_project_files (id, project_id, name, description, storage_path, mime_type, size, visibility, uploaded_by, uploaded_at)
        values (${file.id}, ${file.projectId}, ${file.name}, ${file.description}, ${file.storagePath}, ${file.mimeType}, ${file.size}, ${file.visibility}, ${file.uploadedBy}, ${file.uploadedAt})
        on conflict (id) do update set
          name = excluded.name,
          description = excluded.description,
          storage_path = excluded.storage_path,
          mime_type = excluded.mime_type,
          size = excluded.size,
          visibility = excluded.visibility
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
  });
}
