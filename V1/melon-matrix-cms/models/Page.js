const db = require("../config/db");

function parseContent(row) {
  if (!row) return row;
  try {
    row.content = typeof row.content === "string" ? JSON.parse(row.content || "{}") : (row.content || {});
  } catch {
    row.content = {};
  }
  return row;
}

const Page = {
  async all() {
    const [rows] = await db.query("SELECT * FROM pages ORDER BY id");
    return rows.map(parseContent);
  },

  async findByKey(pageKey) {
    const [rows] = await db.query("SELECT * FROM pages WHERE page_key = ? LIMIT 1", [pageKey]);
    return parseContent(rows[0] || null);
  },

  async update(pageKey, { title, meta_title, meta_description, meta_keywords, canonical_url, content }) {
    await db.query(
      `UPDATE pages SET title = ?, meta_title = ?, meta_description = ?, meta_keywords = ?,
       canonical_url = ?, content = ? WHERE page_key = ?`,
      [title, meta_title, meta_description, meta_keywords, canonical_url, JSON.stringify(content || {}), pageKey]
    );
  },
};

module.exports = Page;
