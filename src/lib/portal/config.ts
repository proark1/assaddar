export type PortalDataBackend = "local" | "postgres";
export type PortalFileStorage = "local" | "supabase";

export function portalDataBackend(): PortalDataBackend {
  return process.env.PORTAL_DATA_BACKEND === "postgres" ? "postgres" : "local";
}

export function databaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
}

export function appUrl() {
  return process.env.APP_URL || "http://localhost:3000";
}

export function requireEmailVerification() {
  return process.env.AUTH_REQUIRE_EMAIL_VERIFICATION === "true";
}

export function contactFromEmail() {
  return process.env.CONTACT_FROM_EMAIL || "";
}

export function portalFileStorage(): PortalFileStorage {
  return process.env.PORTAL_FILE_STORAGE === "supabase" ? "supabase" : "local";
}

export function supabaseStorageConfig() {
  return {
    url: process.env.SUPABASE_URL || "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    bucket: process.env.SUPABASE_STORAGE_BUCKET || "portal-files",
  };
}

export function isPostgresBackendEnabled() {
  return portalDataBackend() === "postgres" && Boolean(databaseUrl());
}

export function requireProductionSecret(name: string, value?: string) {
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`${name} must be configured in production.`);
  }
  return value || "";
}

export function portalProductionConfigErrors() {
  if (process.env.NODE_ENV !== "production") return [];

  const errors: string[] = [];
  const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  const storage = supabaseStorageConfig();

  if (!authSecret) errors.push("AUTH_SECRET must be configured.");
  if (portalDataBackend() !== "postgres") {
    errors.push("PORTAL_DATA_BACKEND must be postgres.");
  }
  if (!databaseUrl()) errors.push("DATABASE_URL or POSTGRES_URL must be configured.");
  if (portalFileStorage() !== "supabase") {
    errors.push("PORTAL_FILE_STORAGE must be supabase.");
  }
  if (!storage.url) errors.push("SUPABASE_URL must be configured.");
  if (!storage.serviceRoleKey) {
    errors.push("SUPABASE_SERVICE_ROLE_KEY must be configured.");
  }
  if (!storage.bucket) errors.push("SUPABASE_STORAGE_BUCKET must be configured.");
  if (!process.env.RESEND_API_KEY) errors.push("RESEND_API_KEY must be configured.");
  if (!contactFromEmail()) errors.push("CONTACT_FROM_EMAIL must be configured.");

  return errors;
}

export function assertPortalProductionReady() {
  const errors = portalProductionConfigErrors();
  if (errors.length > 0) {
    throw new Error(`Portal production configuration is incomplete: ${errors.join(" ")}`);
  }
}
