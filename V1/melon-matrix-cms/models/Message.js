const db = require("../config/db");

const Message = {
  async create({ name, email, phone, company, service, budget, message }) {
    const [result] = await db.query(
      `INSERT INTO contact_messages (name, email, phone, company, service, budget, message)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone, company, service, budget, message]
    );
    return result.insertId;
  },

  async all() {
    const [rows] = await db.query("SELECT * FROM contact_messages ORDER BY created_at DESC, id DESC");
    return rows;
  },

  async markRead(id) {
    await db.query("UPDATE contact_messages SET is_read = 1 WHERE id = ?", [id]);
  },

  async remove(id) {
    await db.query("DELETE FROM contact_messages WHERE id = ?", [id]);
  },

  async countUnread() {
    const [rows] = await db.query("SELECT COUNT(*) AS total FROM contact_messages WHERE is_read = 0");
    return rows[0].total;
  },

  async count() {
    const [rows] = await db.query("SELECT COUNT(*) AS total FROM contact_messages");
    return rows[0].total;
  },
};

module.exports = Message;
