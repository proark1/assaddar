export type UserRole = "admin" | "customer";

export type ProjectStatus =
  | "discovery"
  | "analysis"
  | "implementation"
  | "paused"
  | "completed";

export type AsdarStage =
  | "analyse"
  | "structure"
  | "digitize"
  | "automate"
  | "realize";

export type Visibility = "internal" | "customer";

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  emailVerifiedAt?: string;
  createdAt: string;
};

export type Organization = {
  id: string;
  name: string;
  industry: string;
  website?: string;
  createdAt: string;
};

export type ProjectMember = {
  id: string;
  projectId: string;
  userId: string;
  role: "client_owner" | "client_viewer";
  createdAt: string;
};

export type Project = {
  id: string;
  organizationId: string;
  name: string;
  summary: string;
  status: ProjectStatus;
  asdarStage: AsdarStage;
  health: "green" | "amber" | "red";
  nextStep: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectIntelligence = {
  projectId: string;
  companyContext: string;
  stakeholders: string;
  issues: string;
  goals: string;
  currentTools: string;
  dataSituation: string;
  constraints: string;
  opportunities: string;
  internalNotes: string;
  updatedAt: string;
};

export type ProjectUpdate = {
  id: string;
  projectId: string;
  title: string;
  body: string;
  visibility: Visibility;
  asdarStage: AsdarStage;
  createdBy: string;
  createdAt: string;
};

export type ProjectTask = {
  id: string;
  projectId: string;
  title: string;
  owner: "assad" | "customer";
  status: "todo" | "doing" | "done";
  dueDate?: string;
  visibleToCustomer: boolean;
  createdAt: string;
};

export type ProjectMilestone = {
  id: string;
  projectId: string;
  title: string;
  status: "planned" | "active" | "done";
  dueDate?: string;
  visibleToCustomer: boolean;
  createdAt: string;
};

export type ProjectFile = {
  id: string;
  projectId: string;
  name: string;
  description: string;
  storagePath: string;
  mimeType: string;
  size: number;
  visibility: Visibility;
  uploadedBy: string;
  uploadedAt: string;
};

export type Invoice = {
  id: string;
  projectId: string;
  number: string;
  description: string;
  amountCents: number;
  currency: "EUR" | "USD";
  status: "draft" | "sent" | "paid" | "overdue";
  issuedAt: string;
  dueDate?: string;
  paymentUrl?: string;
  createdAt: string;
};

export type AiInsight = {
  id: string;
  projectId: string;
  title: string;
  body: string;
  kind: "guidance" | "similar_project" | "risk" | "next_step";
  createdAt: string;
};

export type AuthToken = {
  id: string;
  userId: string;
  tokenHash: string;
  purpose: "email_verification" | "password_reset" | "project_invite";
  expiresAt: string;
  consumedAt?: string;
  createdAt: string;
};

export type PortalStore = {
  users: User[];
  organizations: Organization[];
  projects: Project[];
  projectMembers: ProjectMember[];
  projectIntelligence: ProjectIntelligence[];
  updates: ProjectUpdate[];
  tasks: ProjectTask[];
  milestones: ProjectMilestone[];
  files: ProjectFile[];
  invoices: Invoice[];
  aiInsights: AiInsight[];
  authTokens: AuthToken[];
};

export type ProjectBundle = {
  project: Project;
  organization: Organization;
  members: ProjectMember[];
  customerUsers: User[];
  intelligence: ProjectIntelligence;
  updates: ProjectUpdate[];
  tasks: ProjectTask[];
  milestones: ProjectMilestone[];
  files: ProjectFile[];
  invoices: Invoice[];
  aiInsights: AiInsight[];
};
