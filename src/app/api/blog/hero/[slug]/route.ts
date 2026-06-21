import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type { ProjectFile } from "@/lib/portal/types";
import { deleteBlogHero, getBlogHero } from "@/lib/blog-hero/store";
import { readPortalFile } from "@/lib/portal/storage";
import { getCurrentUser } from "@/lib/portal/auth";
import {
  BlogHeroInputError,
  generateAndSaveBlogHero,
} from "@/lib/blog-hero/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

async function requireAdminJson() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") return null;
  return user;
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

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
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const user = await requireAdminJson();
  if (!user) return jsonError("Nicht autorisiert.", 401);

  let payload: { prompt?: string };
  try {
    payload = await request.json();
  } catch {
    return jsonError("Die Anfrage konnte nicht gelesen werden.");
  }

  const { slug } = await params;

  try {
    const record = await generateAndSaveBlogHero({
      slug,
      prompt: String(payload.prompt ?? ""),
      userId: user.id,
    });
    return NextResponse.json({
      ok: true,
      slug: record.slug,
      generatedAt: record.generatedAt,
      imageUrl: `/api/blog/hero/${record.slug}?v=${encodeURIComponent(
        record.generatedAt,
      )}`,
      provider: record.provider,
    });
  } catch (error) {
    if (error instanceof BlogHeroInputError) {
      return jsonError(error.message);
    }

    const message =
      error instanceof Error ? error.message : "Bildgenerierung fehlgeschlagen.";
    return jsonError(message, 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const user = await requireAdminJson();
  if (!user) return jsonError("Nicht autorisiert.", 401);

  const { slug } = await params;
  await deleteBlogHero(slug);
  revalidatePath(`/de/blog/${slug}`);
  revalidatePath("/de/portal/admin/blog");

  return NextResponse.json({ ok: true, slug });
}
