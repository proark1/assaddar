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

function startsWith(bytes: Buffer, signature: number[]) {
  return signature.every((value, index) => bytes[index] === value);
}

function isLikelyText(bytes: Buffer) {
  if (bytes.includes(0)) return false;
  return bytes.toString("utf8").includes("\uFFFD") === false;
}

function isZip(bytes: Buffer) {
  return (
    startsWith(bytes, [0x50, 0x4b, 0x03, 0x04]) ||
    startsWith(bytes, [0x50, 0x4b, 0x05, 0x06]) ||
    startsWith(bytes, [0x50, 0x4b, 0x07, 0x08])
  );
}

function isLegacyOffice(bytes: Buffer) {
  return startsWith(bytes, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
}

function hasValidBytesForMime(bytes: Buffer, contentType: string) {
  switch (contentType) {
    case "application/pdf":
      return startsWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d]);
    case "image/jpeg":
      return startsWith(bytes, [0xff, 0xd8, 0xff]);
    case "image/png":
      return startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case "image/webp":
      return (
        bytes.length >= 12 &&
        bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
        bytes.subarray(8, 12).toString("ascii") === "WEBP"
      );
    case "application/zip":
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return isZip(bytes);
    case "application/msword":
    case "application/vnd.ms-excel":
    case "application/vnd.ms-powerpoint":
      return isLegacyOffice(bytes);
    case "text/csv":
    case "text/plain":
      return isLikelyText(bytes);
    default:
      return false;
  }
}

async function validateAndReadUpload(
  upload: File,
  options: UploadOptions,
): Promise<ValidatedUpload> {
  if (!upload.size) throw new Error("UPLOAD_EMPTY");
  if (upload.size > options.maxBytes) throw new Error("UPLOAD_TOO_LARGE");

  const contentType = uploadContentType(upload, options.allowedMimeTypes);
  if (!contentType) throw new Error("UPLOAD_TYPE");
  const bytes = Buffer.from(await upload.arrayBuffer());
  if (!hasValidBytesForMime(bytes, contentType)) {
    throw new Error("UPLOAD_SIGNATURE");
  }

  return {
    bytes,
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
