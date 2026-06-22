import type { ProjectFile } from "@/lib/portal/types";
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { getPost } from "@/blog/posts";
import { getCurrentUser } from "@/lib/portal/auth";
import { id } from "@/lib/portal/store";
import { readPortalFile, savePortalFile } from "@/lib/portal/storage";
import { getBlogHero, saveBlogHero } from "@/lib/blog-hero/store";

// Public: blog hero images are served on public article pages.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const record = await getBlogHero(slug);
  if (!record) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const file = await readPortalFile({
      storagePath: record.storagePath,
      mimeType: record.mimeType,
    } as ProjectFile);
    return new Response(new Uint8Array(file.bytes), {
      headers: {
        "content-type": file.contentType,
        "cache-control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch {
    return new Response("Image unavailable", { status: 502 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json(
      { ok: false, message: "Nicht autorisiert." },
      { status: 401 },
    );
  }

  const { slug } = await params;
  const post = getPost(slug);
  const existing = await getBlogHero(slug);
  if (!post || !existing) {
    return NextResponse.json(
      { ok: false, message: "Hero-Bild wurde nicht gefunden." },
      { status: 404 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!file || typeof file !== "object" || !("arrayBuffer" in file)) {
    return NextResponse.json(
      { ok: false, message: "Keine komprimierte Datei empfangen." },
      { status: 400 },
    );
  }

  const upload = file as File;
  if (!upload.size || !upload.type.startsWith("image/")) {
    return NextResponse.json(
      { ok: false, message: "Datei ist kein Bild." },
      { status: 400 },
    );
  }

  const mimeType = String(form.get("mimeType") || upload.type || "image/webp");
  const extension = mimeType.includes("jpeg") ? "jpg" : "webp";
  const width = Number(form.get("width") || existing.width);
  const height = Number(form.get("height") || existing.height);
  const bytes = Buffer.from(await upload.arrayBuffer());
  const fileId = id("hero");
  const storagePath = await savePortalFile({
    projectId: "blog-hero",
    fileId,
    filename: `${slug}-compressed.${extension}`,
    bytes,
    contentType: mimeType,
  });

  await saveBlogHero({
    ...existing,
    slug,
    storagePath,
    mimeType,
    width: Number.isFinite(width) && width > 0 ? width : existing.width,
    height: Number.isFinite(height) && height > 0 ? height : existing.height,
    alt: existing.alt || `Illustration zum Artikel: ${post.title}`,
    provider: `${existing.provider}+compressed`,
    size: bytes.length,
    createdBy: user.id,
    generatedAt: new Date().toISOString(),
  });

  revalidatePath(`/de/blog/${slug}`);
  revalidatePath("/de/portal/admin/blog");

  return NextResponse.json({
    ok: true,
    size: bytes.length,
  });
}
