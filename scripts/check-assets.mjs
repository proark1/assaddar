import { promises as fs } from "fs";
import path from "path";

const root = process.cwd();
const publicDir = path.join(root, "public");
const maxRasterBytes = 900 * 1024;
const warnRasterBytes = 300 * 1024;
const rasterExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"]);

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(fullPath);
      return [fullPath];
    }),
  );
  return files.flat();
}

const failures = [];
const warnings = [];
const files = await walk(publicDir);

for (const file of files) {
  const ext = path.extname(file).toLowerCase();
  if (!rasterExtensions.has(ext)) continue;

  const stat = await fs.stat(file);
  const label = `${path.relative(root, file)} (${Math.round(stat.size / 1024)} KB)`;

  if (stat.size > maxRasterBytes) {
    failures.push(`${label} exceeds ${Math.round(maxRasterBytes / 1024)} KB`);
  } else if (stat.size > warnRasterBytes) {
    warnings.push(`${label} is above ${Math.round(warnRasterBytes / 1024)} KB`);
  }
}

for (const warning of warnings) console.warn(`Asset warning: ${warning}`);

if (failures.length > 0) {
  console.error("Asset check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Asset check passed.");
