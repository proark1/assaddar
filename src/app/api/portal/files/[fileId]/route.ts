import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/portal/auth";
import { getProjectAccess, readStore } from "@/lib/portal/store";
import { streamPortalFile } from "@/lib/portal/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function contentDispositionFilename(name: string, mimeType: string) {
  const withExtension =
    mimeType === "application/pdf" && !name.toLowerCase().endsWith(".pdf")
      ? `${name}.pdf`
      : name;
  const fallback =
    withExtension.replace(/[^\w. -]/g, "_").slice(0, 120) || "download";
  return `attachment; filename="${fallback.replaceAll("\"", "_")}"; filename*=UTF-8''${encodeURIComponent(
    withExtension,
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
    const stored = await streamPortalFile(file);
    const headers = new Headers({
      "Content-Type": stored.contentType,
      "Content-Disposition": contentDispositionFilename(
        file.name,
        stored.contentType,
      ),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    });
    if (stored.size) headers.set("Content-Length", String(stored.size));

    return new NextResponse(stored.body, {
      headers: {
        ...Object.fromEntries(headers.entries()),
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
