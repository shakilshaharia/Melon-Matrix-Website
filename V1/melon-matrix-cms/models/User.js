const db = require("../config/db");

const User = {
  async findByEmail(email) {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.query("SELECT id, name, email, created_at FROM users WHERE id = ? LIMIT 1", [id]);
    return rows[0] || null;
  },

  async create({ name, email, password_hash }) {
    const [result] = await db.query(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, password_hash]
    );
    return result.insertId;
  },

  async updatePassword(id, password_hash) {
    await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [password_hash, id]);
  },
};

module.exports = User;
