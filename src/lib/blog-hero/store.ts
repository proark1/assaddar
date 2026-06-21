import { promises as fs } from "fs";
import path from "path";
import { isPostgresBackendEnabled } from "@/lib/portal/config";
import { getSql } from "@/lib/portal/database";

export type BlogHeroRecord = {
  slug: string;
  storagePath: string;
  mimeType: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  prompt: string;
  provider: string;
  size: number;
  createdBy?: string;
  generatedAt: string;
};

const DATA_DIR = path.join(process.cwd(), ".portal-data");
const STORE_FILE = path.join(DATA_DIR, "blog-hero.json");

let schemaReady = false;
async function ensureSchema(sql: ReturnType<typeof getSql>) {
  if (schemaReady) return;
  await sql`
    create table if not exists blog_hero_images (
      slug text primary key,
      storage_path text not null,
      mime_type text not null default 'image/png',
      width integer not null default 1536,
      height integer not null default 1024,
      alt text not null default '',
      caption text,
      prompt text not null default '',
      provider text not null default 'openai',
      size bigint not null default 0,
      created_by text,
      generated_at timestamptz not null default now()
    )
  `;
  schemaReady = true;
}

function rowToRecord(row: Record<string, unknown>): BlogHeroRecord {
  return {
    slug: String(row.slug),
    storagePath: String(row.storage_path),
    mimeType: String(row.mime_type ?? "image/png"),
    width: Number(row.width ?? 1536),
    height: Number(row.height ?? 1024),
    alt: String(row.alt ?? ""),
    caption: row.caption ? String(row.caption) : undefined,
    prompt: String(row.prompt ?? ""),
    provider: String(row.provider ?? "openai"),
    size: Number(row.size ?? 0),
    createdBy: row.created_by ? String(row.created_by) : undefined,
    generatedAt:
      row.generated_at instanceof Date
        ? row.generated_at.toISOString()
        : String(row.generated_at ?? new Date().toISOString()),
  };
}

async function readLocal(): Promise<Record<string, BlogHeroRecord>> {
  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    return JSON.parse(raw) as Record<string, BlogHeroRecord>;
  } catch {
    return {};
  }
}

async function writeLocal(map: Record<string, BlogHeroRecord>) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(map, null, 2), "utf8");
}

/** All hero records keyed by slug. Never throws (returns {} on error). */
export async function getBlogHeroMap(): Promise<Record<string, BlogHeroRecord>> {
  try {
    if (isPostgresBackendEnabled()) {
      const sql = getSql();
      await ensureSchema(sql);
      const rows = (await sql`select * from blog_hero_images`) as Record<
        string,
        unknown
      >[];
      const map: Record<string, BlogHeroRecord> = {};
      for (const row of rows) map[String(row.slug)] = rowToRecord(row);
      return map;
    }
    return await readLocal();
  } catch {
    return {};
  }
}

/** Hero record for a slug. Never throws (returns null on error/none). */
export async function getBlogHero(slug: string): Promise<BlogHeroRecord | null> {
  try {
    if (isPostgresBackendEnabled()) {
      const sql = getSql();
      await ensureSchema(sql);
      const rows = (await sql`
        select * from blog_hero_images where slug = ${slug} limit 1
      `) as Record<string, unknown>[];
      return rows[0] ? rowToRecord(rows[0]) : null;
    }
    const map = await readLocal();
    return map[slug] ?? null;
  } catch {
    return null;
  }
}

export async function saveBlogHero(record: BlogHeroRecord): Promise<void> {
  if (isPostgresBackendEnabled()) {
    const sql = getSql();
    await ensureSchema(sql);
    await sql`
      insert into blog_hero_images (
        slug, storage_path, mime_type, width, height, alt, caption,
        prompt, provider, size, created_by, generated_at
      )
      values (
        ${record.slug}, ${record.storagePath}, ${record.mimeType}, ${record.width},
        ${record.height}, ${record.alt}, ${record.caption ?? null}, ${record.prompt},
        ${record.provider}, ${record.size}, ${record.createdBy ?? null}, ${record.generatedAt}
      )
      on conflict (slug) do update set
        storage_path = excluded.storage_path,
        mime_type = excluded.mime_type,
        width = excluded.width,
        height = excluded.height,
        alt = excluded.alt,
        caption = excluded.caption,
        prompt = excluded.prompt,
        provider = excluded.provider,
        size = excluded.size,
        created_by = excluded.created_by,
        generated_at = excluded.generated_at
    `;
    return;
  }
  const map = await readLocal();
  map[record.slug] = record;
  await writeLocal(map);
}

export async function deleteBlogHero(slug: string): Promise<void> {
  if (isPostgresBackendEnabled()) {
    const sql = getSql();
    await ensureSchema(sql);
    await sql`delete from blog_hero_images where slug = ${slug}`;
    return;
  }
  const map = await readLocal();
  delete map[slug];
  await writeLocal(map);
}
