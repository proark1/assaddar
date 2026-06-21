"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/portal/auth";
import { id } from "@/lib/portal/store";
import { savePortalFile } from "@/lib/portal/storage";
import { getPost } from "@/blog/posts";
import { generateHeroImage } from "@/lib/blog-hero/generate";
import { saveBlogHero, deleteBlogHero } from "@/lib/blog-hero/store";

const ADMIN_PATH = "/de/portal/admin/blog";

export async function generateBlogHeroAction(formData: FormData) {
  const user = await requireAdmin("de");

  const slug = String(formData.get("slug") ?? "").trim();
  const prompt = String(formData.get("prompt") ?? "").trim();
  const post = getPost(slug);

  if (!post || prompt.length < 10) {
    redirect(`${ADMIN_PATH}?error=input`);
  }

  try {
    const image = await generateHeroImage(prompt);
    const storagePath = await savePortalFile({
      projectId: "blog-hero",
      fileId: id("hero"),
      filename: `${slug}.png`,
      bytes: image.bytes,
      contentType: image.contentType,
    });
    await saveBlogHero({
      slug,
      storagePath,
      mimeType: image.contentType,
      width: image.width,
      height: image.height,
      alt: `Illustration zum Artikel: ${post.title}`,
      prompt,
      provider: image.provider,
      size: image.bytes.length,
      createdBy: user.id,
      generatedAt: new Date().toISOString(),
    });
    revalidatePath(`/de/blog/${slug}`);
    revalidatePath(ADMIN_PATH);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Bildgenerierung fehlgeschlagen.";
    redirect(`${ADMIN_PATH}?error=${encodeURIComponent(message)}`);
  }

  redirect(`${ADMIN_PATH}?generated=${slug}`);
}

export async function deleteBlogHeroAction(formData: FormData) {
  await requireAdmin("de");
  const slug = String(formData.get("slug") ?? "").trim();
  if (slug) {
    await deleteBlogHero(slug);
    revalidatePath(`/de/blog/${slug}`);
    revalidatePath(ADMIN_PATH);
  }
  redirect(`${ADMIN_PATH}?removed=${slug}`);
}
