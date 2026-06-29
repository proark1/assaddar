const ONE_MIB = 1024 * 1024;
const DEFAULT_PORTAL_MAX_BYTES = 12 * ONE_MIB;
const DEFAULT_BLOG_HERO_MAX_BYTES = 5 * ONE_MIB;

const extensionToMime = new Map<string, string>([
  ["csv", "text/csv"],
  ["doc", "application/msword"],
  [
    "docx",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  ["jpg", "image/jpeg"],
  ["jpeg", "image/jpeg"],
  ["pdf", "application/pdf"],
  ["png", "image/png"],
  ["ppt", "application/vnd.ms-powerpoint"],
  [
    "pptx",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
  ["txt", "text/plain"],
  ["webp", "image/webp"],
  ["xls", "application/vnd.ms-excel"],
  ["xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  ["zip", "application/zip"],
]);

const portalAllowedMimeTypes = new Set([
  "application/msword",
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/zip",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/csv",
  "text/plain",
]);

const imageAllowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export type ValidatedUpload = {
  bytes: Buffer;
  contentType: string;
  safeName: string;
};

type UploadOptions = {
  allowedMimeTypes: Set<string>;
  fallbackName: string;
  maxBytes: number;
};

function envBytes(name: string, fallback: number) {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function portalMaxUploadBytes() {
  return envBytes("PORTAL_MAX_UPLOAD_BYTES", DEFAULT_PORTAL_MAX_BYTES);
}

export function blogHeroMaxUploadBytes() {
  return envBytes("BLOG_HERO_MAX_UPLOAD_BYTES", DEFAULT_BLOG_HERO_MAX_BYTES);
}

function extension(name: string) {
  return name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] ?? "";
}

function normalizeMimeType(value: string) {
  return value.split(";")[0]?.trim().toLowerCase() ?? "";
}

function inferredMimeType(name: string) {
  return extensionToMime.get(extension(name)) ?? "";
}

export function safeUploadFilename(value: string, fallback = "upload.bin") {
  const cleaned = value
    .normalize("NFKD")
    .replace(/[^\w. -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^\.+/, "")
    .slice(0, 120);

  return cleaned || fallback;
}

function uploadContentType(upload: File, allowedMimeTypes: Set<string>) {
  const declared = normalizeMimeType(upload.type);
  const inferred = inferredMimeType(upload.name || "");
  const contentType =
    declared && declared !== "application/octet-stream"
      ? declared
      : inferred || "application/octet-stream";

  if (allowedMimeTypes.has(contentType)) return contentType;
  if (
    (!declared || declared === "application/octet-stream") &&
    inferred &&
    allowedMimeTypes.has(inferred)
  ) {
    return inferred;
  }

  return "";
}

async function validateAndReadUpload(
  upload: File,
  options: UploadOptions,
): Promise<ValidatedUpload> {
  if (!upload.size) throw new Error("UPLOAD_EMPTY");
  if (upload.size > options.maxBytes) throw new Error("UPLOAD_TOO_LARGE");

  const contentType = uploadContentType(upload, options.allowedMimeTypes);
  if (!contentType) throw new Error("UPLOAD_TYPE");

  return {
    bytes: Buffer.from(await upload.arrayBuffer()),
    contentType,
    safeName: safeUploadFilename(upload.name || options.fallbackName, options.fallbackName),
  };
}

export function isFileLike(value: FormDataEntryValue | null): value is File {
  return Boolean(value && typeof value === "object" && "arrayBuffer" in value);
}

export function readPortalUpload(upload: File) {
  return validateAndReadUpload(upload, {
    allowedMimeTypes: portalAllowedMimeTypes,
    fallbackName: "upload.bin",
    maxBytes: portalMaxUploadBytes(),
  });
}

export function readBlogHeroUpload(upload: File) {
  return validateAndReadUpload(upload, {
    allowedMimeTypes: imageAllowedMimeTypes,
    fallbackName: "hero.webp",
    maxBytes: blogHeroMaxUploadBytes(),
  });
}
