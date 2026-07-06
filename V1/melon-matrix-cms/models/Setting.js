const db = require("../config/db");

const Setting = {
  // Returns all settings as a flat object: { site_name: "...", email_primary: "..." }
  async all() {
    const [rows] = await db.query("SELECT setting_key, setting_value FROM settings");
    const out = {};
    for (const row of rows) out[row.setting_key] = row.setting_value;
    return out;
  },

  async setMany(obj) {
    const entries = Object.entries(obj);
    if (!entries.length) return;
    const values = entries.map(([k, v]) => [k, v == null ? "" : String(v)]);
    await db.query(
      "INSERT INTO settings (setting_key, setting_value) VALUES ? ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
      [values]
    );
  },
};

module.exports = Setting;
