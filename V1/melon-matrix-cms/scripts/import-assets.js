/**
 * Registers the site's built-in images (public/assets/**) into the media
 * library so they appear under Admin → Media and in the featured-image picker.
 *
 * Safe to re-run: it skips any asset URL already in the media table.
 *
 *   npm run import-assets
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const db = require("../config/db");

const ASSETS_DIR = path.join(__dirname, "..", "public", "assets");

const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

// Recursively collect image files under public/assets, returning web URLs.
function walk(dir, baseUrl = "/assets") {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const url = `${baseUrl}/${entry.name}`;
    if (entry.isDirectory()) {
      out.push(...walk(full, url));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (MIME[ext]) {
        out.push({ full, url, name: entry.name, ext });
      }
    }
  }
  return out;
}

async function main() {
  if (!fs.existsSync(ASSETS_DIR)) {
    console.error("No public/assets directory found.");
    process.exit(1);
  }

  const files = walk(ASSETS_DIR);
  let added = 0;
  let skipped = 0;

  for (const f of files) {
    const [rows] = await db.query("SELECT id FROM media WHERE url = ? LIMIT 1", [f.url]);
    if (rows.length) {
      skipped++;
      continue;
    }
    const size = fs.statSync(f.full).size;
    await db.query(
      "INSERT INTO media (filename, original_name, mime_type, size, url) VALUES (?, ?, ?, ?, ?)",
      [f.name, f.name, MIME[f.ext], size, f.url]
    );
    added++;
  }

  console.log(`✔ Media import complete — ${added} added, ${skipped} already present, ${files.length} total.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Import failed:", err.message);
  process.exit(1);
});
