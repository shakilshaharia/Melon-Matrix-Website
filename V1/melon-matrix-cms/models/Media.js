const db = require("../config/db");

const Media = {
  async all() {
    const [rows] = await db.query("SELECT * FROM media ORDER BY created_at DESC, id DESC");
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query("SELECT * FROM media WHERE id = ? LIMIT 1", [id]);
    return rows[0] || null;
  },

  async create({ filename, original_name, mime_type, size, url }) {
    const [result] = await db.query(
      "INSERT INTO media (filename, original_name, mime_type, size, url) VALUES (?, ?, ?, ?, ?)",
      [filename, original_name, mime_type, size, url]
    );
    return result.insertId;
  },

  async remove(id) {
    await db.query("DELETE FROM media WHERE id = ?", [id]);
  },

  async count() {
    const [rows] = await db.query("SELECT COUNT(*) AS total FROM media");
    return rows[0].total;
  },
};

module.exports = Media;
