const db = require("../config/db");

const Subscriber = {
  async create(email) {
    await db.query("INSERT IGNORE INTO subscribers (email) VALUES (?)", [email]);
  },

  async all() {
    const [rows] = await db.query("SELECT * FROM subscribers ORDER BY created_at DESC, id DESC");
    return rows;
  },

  async remove(id) {
    await db.query("DELETE FROM subscribers WHERE id = ?", [id]);
  },

  async count() {
    const [rows] = await db.query("SELECT COUNT(*) AS total FROM subscribers");
    return rows[0].total;
  },
};

module.exports = Subscriber;
