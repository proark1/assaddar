const required = [
  ["AUTH_SECRET", process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET],
  ["APP_URL", process.env.APP_URL],
  ["PORTAL_DATA_BACKEND=postgres", process.env.PORTAL_DATA_BACKEND === "postgres"],
  ["DATABASE_URL or POSTGRES_URL", process.env.DATABASE_URL || process.env.POSTGRES_URL],
  ["PORTAL_FILE_STORAGE=supabase", process.env.PORTAL_FILE_STORAGE === "supabase"],
  ["SUPABASE_URL", process.env.SUPABASE_URL],
  ["SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY],
  ["SUPABASE_STORAGE_BUCKET", process.env.SUPABASE_STORAGE_BUCKET],
  ["CRON_SECRET", process.env.CRON_SECRET],
];

const recommended = [
  ["RESEND_API_KEY or admin integration setting", process.env.RESEND_API_KEY],
  ["CONTACT_FROM_EMAIL or admin integration setting", process.env.CONTACT_FROM_EMAIL],
  ["RESEND_WEBHOOK_SECRET or admin integration setting", process.env.RESEND_WEBHOOK_SECRET],
  ["GEMINI_API_KEY or admin integration setting", process.env.GEMINI_API_KEY],
  ["GEMINI_MODEL or admin integration setting", process.env.GEMINI_MODEL],
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

const telegramConfigured =
  Boolean(process.env.TELEGRAM_BOT_TOKEN) &&
  Boolean(process.env.TELEGRAM_ADMIN_CHAT_ID);
const whatsappConfigured =
  Boolean(process.env.WHATSAPP_BUSINESS_TOKEN) &&
  Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID) &&
  Boolean(process.env.WHATSAPP_ADMIN_PHONE);
if (!telegramConfigured && !whatsappConfigured) {
  failures.push(
    "TELEGRAM_BOT_TOKEN/TELEGRAM_ADMIN_CHAT_ID or WHATSAPP_BUSINESS_TOKEN/WHATSAPP_PHONE_NUMBER_ID/WHATSAPP_ADMIN_PHONE must be configured",
  );
}

for (const name of [
  "PORTAL_MAX_UPLOAD_BYTES",
  "BLOG_HERO_MAX_UPLOAD_BYTES",
  "BLOG_IMAGE_TIMEOUT_MS",
  "BLOG_IMAGE_MAX_BYTES",
  "WEBSITE_CRAWL_MAX_PAGES",
  "WEBSITE_CRAWL_MAX_DEPTH",
  "WEBSITE_CRAWL_TIMEOUT_MS",
  "WEBSITE_CRAWL_MAX_TEXT_CHARS",
  "WEBSITE_CRAWL_RENDERED_FALLBACK_MIN_WORDS",
]) {
  if (!process.env[name]) continue;
  const value = Number(process.env[name]);
  if (!Number.isFinite(value) || value <= 0) {
    failures.push(`${name} must be a positive byte count`);
  }
}

if (
  process.env.WEBSITE_CRAWL_RENDERED_FALLBACK &&
  !["true", "false"].includes(process.env.WEBSITE_CRAWL_RENDERED_FALLBACK)
) {
  failures.push("WEBSITE_CRAWL_RENDERED_FALLBACK must be true or false");
}

if (
  process.env.WEBSITE_CRAWL_RENDERED_FALLBACK === "true" &&
  !process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
) {
  warnings.push(
    "PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH not set; rendered crawl fallback requires a Chromium runtime",
  );
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
