const db = require("../config/db");
const slugify = require("../utils/slugify");

const Category = {
  async all() {
    const [rows] = await db.query("SELECT * FROM categories ORDER BY name");
    return rows;
  },

  async allWithCounts() {
    const [rows] = await db.query(
      `SELECT c.*, COUNT(p.id) AS post_count
       FROM categories c
       LEFT JOIN posts p ON p.category_id = c.id AND p.status = 'published'
       GROUP BY c.id
       ORDER BY c.name`
    );
    return rows;
  },

  async findBySlug(slug) {
    const [rows] = await db.query("SELECT * FROM categories WHERE slug = ? LIMIT 1", [slug]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.query("SELECT * FROM categories WHERE id = ? LIMIT 1", [id]);
    return rows[0] || null;
  },

  async create(name) {
    const slug = slugify(name);
    const [result] = await db.query(
      "INSERT INTO categories (name, slug) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)",
      [name.trim(), slug]
    );
    return result.insertId;
  },

  async update(id, name) {
    await db.query("UPDATE categories SET name = ?, slug = ? WHERE id = ?", [name.trim(), slugify(name), id]);
  },

  async remove(id) {
    await db.query("DELETE FROM categories WHERE id = ?", [id]);
  },
};

module.exports = Category;
