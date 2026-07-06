const db = require("../config/db");
const slugify = require("../utils/slugify");

const Tag = {
  async all() {
    const [rows] = await db.query(
      `SELECT t.*, COUNT(pt.post_id) AS post_count
       FROM tags t LEFT JOIN post_tags pt ON pt.tag_id = t.id
       GROUP BY t.id ORDER BY t.name`
    );
    return rows;
  },

  // Given "shopify, cro, Growth" return an array of tag ids, creating missing tags.
  async findOrCreateMany(namesCsv) {
    const names = String(namesCsv || "")
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);
    const ids = [];
    for (const name of names) {
      const slug = slugify(name);
      if (!slug) continue;
      const [rows] = await db.query("SELECT id FROM tags WHERE slug = ? LIMIT 1", [slug]);
      if (rows.length) {
        ids.push(rows[0].id);
      } else {
        const [result] = await db.query("INSERT INTO tags (name, slug) VALUES (?, ?)", [name, slug]);
        ids.push(result.insertId);
      }
    }
    return [...new Set(ids)];
  },

  async remove(id) {
    await db.query("DELETE FROM tags WHERE id = ?", [id]);
  },
};

module.exports = Tag;
