import { revalidatePath } from "next/cache";
import { getPost } from "@/blog/posts";
import { id } from "@/lib/portal/store";
import { savePortalFile } from "@/lib/portal/storage";
import { generateHeroImage } from "./generate";
import { buildHeroGenerationPrompt } from "./prompts";
import { saveBlogHero, type BlogHeroRecord } from "./store";

export class BlogHeroInputError extends Error {
  constructor(message = "Bitte einen aussagekraeftigen Prompt eingeben.") {
    super(message);
    this.name = "BlogHeroInputError";
  }
}

export async function generateAndSaveBlogHero({
  slug,
  prompt,
  userId,
}: {
  slug: string;
  prompt: string;
  userId: string;
}): Promise<BlogHeroRecord> {
  const cleanSlug = slug.trim();
  const cleanPrompt = prompt.trim();
  const post = getPost(cleanSlug);

  if (!post || cleanPrompt.length < 10) {
    throw new BlogHeroInputError();
  }

  const image = await generateHeroImage(
    buildHeroGenerationPrompt(cleanSlug, cleanPrompt),
  );
  const storagePath = await savePortalFile({
    projectId: "blog-hero",
    fileId: id("hero"),
    filename: `${cleanSlug}.png`,
    bytes: image.bytes,
    contentType: image.contentType,
  });
  const record: BlogHeroRecord = {
    slug: cleanSlug,
    storagePath,
    mimeType: image.contentType,
    width: image.width || 1536,
    height: image.height || 864,
    alt: `Illustration zum Artikel: ${post.title}`,
    prompt: cleanPrompt,
    provider: image.provider,
    size: image.bytes.length,
    createdBy: userId,
    generatedAt: new Date().toISOString(),
  };

  await saveBlogHero(record);
  revalidatePath(`/de/blog/${cleanSlug}`);
  revalidatePath("/de/portal/admin/blog");

  return record;
}
