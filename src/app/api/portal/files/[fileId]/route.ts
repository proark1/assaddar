import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/portal/auth";
import { getProjectAccess, readStore } from "@/lib/portal/store";
import { readPortalFile } from "@/lib/portal/storage";

export const dynamic = "force-dynamic";

function contentDispositionFilename(name: string) {
  const fallback = name.replace(/[^\w. -]/g, "_").slice(0, 120) || "download";
  return `attachment; filename="${fallback.replaceAll("\"", "_")}"; filename*=UTF-8''${encodeURIComponent(
    name,
  )}`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { fileId } = await params;
  const store = await readStore();
  const file = store.files.find((entry) => entry.id === fileId);
  if (!file) return new NextResponse("Not found", { status: 404 });

  if (!getProjectAccess(store, user.id, file.projectId)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  if (user.role !== "admin" && file.visibility !== "customer") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const stored = await readPortalFile(file);
    const body = stored.bytes.buffer.slice(
      stored.bytes.byteOffset,
      stored.bytes.byteOffset + stored.bytes.byteLength,
    ) as ArrayBuffer;
    return new NextResponse(body, {
      headers: {
        "Content-Type": stored.contentType,
        "Content-Length": String(stored.size),
        "Content-Disposition": contentDispositionFilename(file.name),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
