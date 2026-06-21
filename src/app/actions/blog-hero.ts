"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/portal/auth";
import {
  BlogHeroInputError,
  generateAndSaveBlogHero,
} from "@/lib/blog-hero/service";
import { deleteBlogHero } from "@/lib/blog-hero/store";

const ADMIN_PATH = "/de/portal/admin/blog";

export async function generateBlogHeroAction(formData: FormData) {
  const user = await requireAdmin("de");

  const slug = String(formData.get("slug") ?? "").trim();
  const prompt = String(formData.get("prompt") ?? "").trim();

  try {
    await generateAndSaveBlogHero({
      slug,
      prompt,
      userId: user.id,
    });
  } catch (error) {
    if (error instanceof BlogHeroInputError) {
      redirect(`${ADMIN_PATH}?error=input`);
    }

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
