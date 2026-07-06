const db = require("../config/db");

const Testimonial = {
  async all() {
    const [rows] = await db.query("SELECT * FROM testimonials ORDER BY sort_order, id");
    return rows;
  },

  async allByScope(scope) {
    const [rows] = await db.query(
      "SELECT * FROM testimonials WHERE page_scope = ? OR page_scope = 'all' ORDER BY sort_order, id",
      [scope]
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query("SELECT * FROM testimonials WHERE id = ? LIMIT 1", [id]);
    return rows[0] || null;
  },

  async create({ author_name, author_role, quote, rating, page_scope, avatar_variant, sort_order }) {
    const [result] = await db.query(
      `INSERT INTO testimonials (author_name, author_role, quote, rating, page_scope, avatar_variant, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [author_name, author_role, quote, rating, page_scope, avatar_variant, sort_order]
    );
    return result.insertId;
  },

  async update(id, { author_name, author_role, quote, rating, page_scope, avatar_variant, sort_order }) {
    await db.query(
      `UPDATE testimonials SET author_name = ?, author_role = ?, quote = ?, rating = ?,
       page_scope = ?, avatar_variant = ?, sort_order = ? WHERE id = ?`,
      [author_name, author_role, quote, rating, page_scope, avatar_variant, sort_order, id]
    );
  },

  async remove(id) {
    await db.query("DELETE FROM testimonials WHERE id = ?", [id]);
  },
};

module.exports = Testimonial;
