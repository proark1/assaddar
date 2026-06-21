import type { ProjectFile } from "@/lib/portal/types";
import { getBlogHero } from "@/lib/blog-hero/store";
import { readPortalFile } from "@/lib/portal/storage";

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
