const required = [
  ["AUTH_SECRET", process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET],
  ["APP_URL", process.env.APP_URL],
  ["PORTAL_DATA_BACKEND=postgres", process.env.PORTAL_DATA_BACKEND === "postgres"],
  ["DATABASE_URL or POSTGRES_URL", process.env.DATABASE_URL || process.env.POSTGRES_URL],
  ["PORTAL_FILE_STORAGE=supabase", process.env.PORTAL_FILE_STORAGE === "supabase"],
  ["SUPABASE_URL", process.env.SUPABASE_URL],
  ["SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY],
  ["SUPABASE_STORAGE_BUCKET", process.env.SUPABASE_STORAGE_BUCKET],
  ["RESEND_API_KEY", process.env.RESEND_API_KEY],
  ["CONTACT_FROM_EMAIL", process.env.CONTACT_FROM_EMAIL],
  ["CRON_SECRET", process.env.CRON_SECRET],
];

const recommended = [
  ["STRIPE_SECRET_KEY", process.env.STRIPE_SECRET_KEY],
  ["STRIPE_WEBHOOK_SECRET", process.env.STRIPE_WEBHOOK_SECRET],
];

const failures = required
  .filter(([, value]) => !value)
  .map(([name]) => name);
const warnings = recommended
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (process.env.APP_URL && !process.env.APP_URL.startsWith("https://")) {
  failures.push("APP_URL must use https:// in production");
}

if (process.env.AUTH_SECRET && process.env.AUTH_SECRET.length < 32) {
  failures.push("AUTH_SECRET should be at least 32 characters");
}

for (const name of ["PORTAL_MAX_UPLOAD_BYTES", "BLOG_HERO_MAX_UPLOAD_BYTES"]) {
  if (!process.env[name]) continue;
  const value = Number(process.env[name]);
  if (!Number.isFinite(value) || value <= 0) {
    failures.push(`${name} must be a positive byte count`);
  }
}

if (failures.length > 0) {
  console.error("Portal production check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

if (warnings.length > 0) {
  console.warn("Portal production check warnings:");
  for (const warning of warnings) console.warn(`- ${warning} not set`);
}

console.log("Portal production check passed.");
