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
