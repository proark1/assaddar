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
  sessionVersion: number;
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
  benefit?: "low" | "high";
  effort?: "low" | "high";
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
  category?:
    | "customer_upload"
    | "consultant_deliverable"
    | "proposal"
    | "project_brief"
    | "final_report"
    | "invoice"
    | "other";
  approvalStatus?: "not_required" | "pending" | "approved";
  approvedBy?: string;
  approvedAt?: string;
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
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  paidAt?: string;
  createdAt: string;
};

export type PaymentEvent = {
  id: string;
  provider: "stripe";
  type: string;
  entityId?: string;
  status: "processed" | "ignored";
  reason: string;
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

export type WebsiteCrawlStatus = "queued" | "running" | "completed" | "failed";

export type WebsiteCrawlRun = {
  id: string;
  projectId: string;
  websiteUrl: string;
  status: WebsiteCrawlStatus;
  startedAt: string;
  completedAt?: string;
  pageCount: number;
  summary: string;
  error?: string;
  applyToIntelligence: boolean;
  createdBy: string;
  createdAt: string;
};

export type WebsiteCrawlPage = {
  id: string;
  runId: string;
  projectId: string;
  url: string;
  title: string;
  description: string;
  pageType: string;
  statusCode: number;
  depth: number;
  wordCount: number;
  textExcerpt: string;
  discoveredFrom?: string;
  crawledAt: string;
  error?: string;
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

export type PortalTemplateOverride = {
  id: string;
  templateId: string;
  label: string;
  bestFor: string;
  kickoffGoal: string;
  summary: string;
  discoveryQuestions: string[];
  quickWins: string[];
  automationIdeas: string[];
  risks: string[];
  updatedBy: string;
  updatedAt: string;
};

export type RateLimitBucket = {
  key: string;
  count: number;
  resetAt: string;
  updatedAt: string;
};

export type CrmLifecycle =
  | "lead"
  | "prospect"
  | "customer"
  | "partner"
  | "archived";

export type CrmConsent = "unknown" | "transactional" | "marketing" | "unsubscribed";

export type CrmOpportunityStage =
  | "new_lead"
  | "qualified"
  | "discovery_scheduled"
  | "discovery_done"
  | "proposal_needed"
  | "proposal_sent"
  | "negotiation"
  | "won"
  | "lost"
  | "nurture";

export type CrmChannel =
  | "email"
  | "whatsapp"
  | "telegram"
  | "website"
  | "portal"
  | "phone"
  | "meeting"
  | "note";

export type CrmContact = {
  id: string;
  organizationId?: string;
  name: string;
  email?: string;
  phone?: string;
  telegramChatId?: string;
  whatsappPhone?: string;
  source: string;
  lifecycle: CrmLifecycle;
  consent: CrmConsent;
  tags: string[];
  lastContactedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type CrmOpportunity = {
  id: string;
  organizationId?: string;
  contactId?: string;
  title: string;
  stage: CrmOpportunityStage;
  valueCents?: number;
  currency: "EUR" | "USD";
  probability: number;
  expectedCloseDate?: string;
  source: string;
  nextStep: string;
  createdAt: string;
  updatedAt: string;
};

export type CrmInteraction = {
  id: string;
  contactId?: string;
  organizationId?: string;
  opportunityId?: string;
  projectId?: string;
  channel: CrmChannel;
  direction: "inbound" | "outbound" | "internal";
  subject: string;
  bodyPreview: string;
  body?: string;
  from: string;
  to: string[];
  provider: "resend" | "gmail" | "telegram" | "whatsapp" | "manual" | "website";
  providerMessageId?: string;
  urgency: "low" | "normal" | "high";
  classification: "lead" | "customer" | "support" | "billing" | "sales" | "other";
  sentiment?: "positive" | "neutral" | "negative";
  aiSummary?: string;
  createdAt: string;
  handledAt?: string;
};

export type CrmTask = {
  id: string;
  contactId?: string;
  opportunityId?: string;
  projectId?: string;
  title: string;
  status: "todo" | "doing" | "done";
  dueDate?: string;
  priority: "low" | "normal" | "high";
  source: string;
  createdAt: string;
  completedAt?: string;
};

export type CrmEmailDraft = {
  id: string;
  interactionId: string;
  contactId?: string;
  channel: "email" | "whatsapp" | "telegram";
  subject: string;
  body: string;
  tone: "direct" | "warm" | "follow_up";
  status: "draft" | "approved" | "sent" | "discarded";
  providerMessageId?: string;
  createdAt: string;
  sentAt?: string;
};

export type CrmNotificationEvent = {
  id: string;
  interactionId?: string;
  channel: "telegram" | "whatsapp";
  recipient: string;
  status: "sent" | "skipped" | "failed";
  summary: string;
  error?: string;
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
  paymentEvents: PaymentEvent[];
  aiInsights: AiInsight[];
  websiteCrawlRuns: WebsiteCrawlRun[];
  websiteCrawlPages: WebsiteCrawlPage[];
  authTokens: AuthToken[];
  templateOverrides: PortalTemplateOverride[];
  rateLimitBuckets: RateLimitBucket[];
  crmContacts: CrmContact[];
  crmOpportunities: CrmOpportunity[];
  crmInteractions: CrmInteraction[];
  crmTasks: CrmTask[];
  crmEmailDrafts: CrmEmailDraft[];
  crmNotificationEvents: CrmNotificationEvent[];
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
  websiteCrawlRuns: WebsiteCrawlRun[];
  websiteCrawlPages: WebsiteCrawlPage[];
};
