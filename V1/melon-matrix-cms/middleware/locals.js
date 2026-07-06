const Setting = require("../models/Setting");

// Small in-memory cache so we don't hit the settings table on every request.
let cache = null;
let cachedAt = 0;
const TTL = 30 * 1000; // 30s

function invalidateSettingsCache() {
  cache = null;
  cachedAt = 0;
}

async function locals(req, res, next) {
  try {
    if (!cache || Date.now() - cachedAt > TTL) {
      cache = await Setting.all();
      cachedAt = Date.now();
    }
    res.locals.settings = cache;
    res.locals.siteUrl = (process.env.SITE_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
    res.locals.currentPath = req.path;
    res.locals.isAuthed = Boolean(req.session && req.session.userId);

    // Shared date formatter used by blog views/partials.
    res.locals.fmtDate = (d) =>
      d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";

    // one-shot flash messages stored in the session
    res.locals.flash = (req.session && req.session.flash) || null;
    if (req.session && req.session.flash) delete req.session.flash;

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { locals, invalidateSettingsCache };
