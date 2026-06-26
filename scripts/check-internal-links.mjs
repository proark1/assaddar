import { promises as fs } from "fs";
import path from "path";

const root = process.cwd();
const srcDir = path.join(root, "src");
const knownHomeAnchors = new Set([
  "angebote",
  "blog",
  "branchen",
  "kontakt",
  "main",
  "methode",
  "readiness-check",
  "ueber-mich",
]);

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(fullPath);
      if (!/\.(tsx?|mdx?)$/.test(entry.name)) return [];
      return [fullPath];
    }),
  );
  return files.flat();
}

function collectLinks(source) {
  const links = [];
  const patterns = [
    /href\s*=\s*["'`]([^"'`]+)["'`]/g,
    /href\s*:\s*["'`]([^"'`]+)["'`]/g,
    /\]\((\/(?:de|en)[^)"]*)\)/g,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      links.push(match[1]);
    }
  }

  return links;
}

const failures = [];
const files = await walk(srcDir);

for (const file of files) {
  const source = await fs.readFile(file, "utf8");
  const links = collectLinks(source);

  for (const link of links) {
    const homeAnchor = link.match(/^\/(?:de|en)#([A-Za-z0-9_-]+)/);
    const samePageAnchor = link.match(/^#([A-Za-z0-9_-]+)/);
    const anchor = homeAnchor?.[1] ?? samePageAnchor?.[1];

    if (anchor && !knownHomeAnchors.has(anchor)) {
      failures.push(`${path.relative(root, file)}: unknown homepage anchor "${link}"`);
    }

    if (link === "/en/blog") {
      failures.push(`${path.relative(root, file)}: /en/blog is not generated`);
    }
  }
}

if (failures.length > 0) {
  console.error("Internal link check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Internal link check passed.");
