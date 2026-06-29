import { createReadStream, promises as fs } from "fs";
import path from "path";
import { Readable } from "stream";
import { portalFileStorage, supabaseStorageConfig } from "./config";
import type { ProjectFile } from "./types";

const SUPABASE_PREFIX = "supabase://";
const UPLOAD_DIR = path.join(process.cwd(), ".portal-data", "uploads");

export type SavePortalFileInput = {
  projectId: string;
  fileId: string;
  filename: string;
  bytes: Buffer;
  contentType: string;
};

export type ReadPortalFileResult = {
  bytes: Buffer;
  contentType: string;
  size: number;
};

export type StreamPortalFileResult = {
  body: BodyInit;
  contentType: string;
  size?: number;
};

function safeStorageSegment(value: string, fallback: string) {
  return (
    value
      .normalize("NFKD")
      .replace(/[^\w.-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 120) || fallback
  );
}

function supabaseObjectPath(projectId: string, fileId: string, filename: string) {
  return `projects/${safeStorageSegment(projectId, "project")}/${safeStorageSegment(fileId, "file")}-${safeStorageSegment(filename, "upload")}`;
}

function parseSupabasePath(storagePath: string) {
  if (!storagePath.startsWith(SUPABASE_PREFIX)) return null;
  const withoutPrefix = storagePath.slice(SUPABASE_PREFIX.length);
  const [bucket, ...objectParts] = withoutPrefix.split("/");
  return { bucket, objectPath: objectParts.join("/") };
}

function toArrayBuffer(buffer: Buffer) {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}

function requireSupabaseStorage() {
  const config = supabaseStorageConfig();
  if (!config.url || !config.serviceRoleKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for Supabase file storage.",
    );
  }
  return config;
}

export async function savePortalFile(input: SavePortalFileInput) {
  if (portalFileStorage() !== "supabase") {
    const projectDir = path.join(
      UPLOAD_DIR,
      safeStorageSegment(input.projectId, "project"),
    );
    const storagePath = path.join(
      projectDir,
      `${safeStorageSegment(input.fileId, "file")}-${safeStorageSegment(input.filename, "upload")}`,
    );
    await fs.mkdir(projectDir, { recursive: true });
    await fs.writeFile(storagePath, input.bytes);
    return storagePath;
  }

  const config = requireSupabaseStorage();
  const objectPath = supabaseObjectPath(
    input.projectId,
    input.fileId,
    input.filename,
  );
  const endpoint = `${config.url.replace(/\/$/, "")}/storage/v1/object/${config.bucket}/${objectPath}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: config.serviceRoleKey,
      authorization: `Bearer ${config.serviceRoleKey}`,
      "content-type": input.contentType,
      "x-upsert": "true",
    },
    body: toArrayBuffer(input.bytes),
  });

  if (!response.ok) {
    throw new Error(`Supabase file upload failed: ${response.status}`);
  }

  return `${SUPABASE_PREFIX}${config.bucket}/${objectPath}`;
}

export async function readPortalFile(file: ProjectFile): Promise<ReadPortalFileResult> {
  const supabasePath = parseSupabasePath(file.storagePath);
  if (!supabasePath) {
    const bytes = await fs.readFile(file.storagePath);
    return {
      bytes,
      contentType: file.mimeType,
      size: bytes.length,
    };
  }

  const config = requireSupabaseStorage();
  const endpoint = `${config.url.replace(/\/$/, "")}/storage/v1/object/${supabasePath.bucket}/${supabasePath.objectPath}`;
  const response = await fetch(endpoint, {
    headers: {
      apikey: config.serviceRoleKey,
      authorization: `Bearer ${config.serviceRoleKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase file download failed: ${response.status}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  return {
    bytes,
    contentType: response.headers.get("content-type") ?? file.mimeType,
    size: bytes.length,
  };
}

export async function streamPortalFile(
  file: Pick<ProjectFile, "storagePath" | "mimeType" | "size">,
): Promise<StreamPortalFileResult> {
  const supabasePath = parseSupabasePath(file.storagePath);
  if (!supabasePath) {
    const stats = await fs.stat(file.storagePath);
    return {
      body: Readable.toWeb(createReadStream(file.storagePath)) as BodyInit,
      contentType: file.mimeType,
      size: stats.size,
    };
  }

  const config = requireSupabaseStorage();
  const endpoint = `${config.url.replace(/\/$/, "")}/storage/v1/object/${supabasePath.bucket}/${supabasePath.objectPath}`;
  const response = await fetch(endpoint, {
    headers: {
      apikey: config.serviceRoleKey,
      authorization: `Bearer ${config.serviceRoleKey}`,
    },
  });

  if (!response.ok || !response.body) {
    throw new Error(`Supabase file stream failed: ${response.status}`);
  }

  const contentLength = Number(response.headers.get("content-length"));
  return {
    body: response.body,
    contentType: response.headers.get("content-type") ?? file.mimeType,
    size: Number.isFinite(contentLength) && contentLength > 0 ? contentLength : file.size,
  };
}
