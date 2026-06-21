import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/portal/auth";
import { getProjectAccess, readStore } from "@/lib/portal/store";

export const dynamic = "force-dynamic";

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
    const bytes = await fs.readFile(file.storagePath);
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Length": String(file.size),
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          file.name,
        )}"`,
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
