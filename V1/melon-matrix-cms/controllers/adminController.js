const fs = require("fs");
const path = require("path");
const Post = require("../models/Post");
const Category = require("../models/Category");
const Media = require("../models/Media");
const Page = require("../models/Page");
const Setting = require("../models/Setting");
const Message = require("../models/Message");
const Subscriber = require("../models/Subscriber");
const { invalidateSettingsCache } = require("../middleware/locals");
const mailer = require("../utils/mailer");

const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

function flash(req, type, text) {
  req.session.flash = { type, text };
}

// ---------- Dashboard ----------

exports.dashboard = async (req, res, next) => {
  try {
    const [postCounts, categories, mediaCount, msgCount, unread, subCount, recentPosts, messages] =
      await Promise.all([
        Post.counts(),
        Category.all(),
        Media.count(),
        Message.count(),
        Message.countUnread(),
        Subscriber.count(),
        Post.adminList({}),
        Message.all(),
      ]);
    res.render("admin/dashboard", {
      title: "Dashboard",
      nav: "dashboard",
      stats: {
        posts: postCounts.total || 0,
        published: postCounts.published || 0,
        drafts: postCounts.draft || 0,
        categories: categories.length,
        media: mediaCount,
        messages: msgCount,
        unread,
        subscribers: subCount,
      },
      recentPosts: recentPosts.slice(0, 6),
      recentMessages: messages.slice(0, 5),
    });
  } catch (err) { next(err); }
};

// ---------- Media ----------

exports.media = async (req, res, next) => {
  try {
    const items = await Media.all();
    res.render("admin/media", { title: "Media Library", nav: "media", items });
  } catch (err) { next(err); }
};

exports.mediaJson = async (req, res, next) => {
  try {
    const items = await Media.all();
    res.json(items.map((m) => ({ id: m.id, url: m.url, name: m.original_name })));
  } catch (err) { next(err); }
};

exports.mediaUpload = async (req, res, next) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    for (const file of files) {
      await Media.create({
        filename: file.filename,
        original_name: file.originalname,
        mime_type: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename}`,
      });
    }
    flash(req, "success", files.length ? `Uploaded ${files.length} file(s).` : "No files selected.");
    res.redirect("/admin/media");
  } catch (err) { next(err); }
};

exports.mediaDestroy = async (req, res, next) => {
  try {
    const item = await Media.findById(req.params.id);
    if (item) {
      await Media.remove(item.id);
      // Best effort: remove the physical file too (only within /uploads).
      const filePath = path.join(UPLOADS_DIR, path.basename(item.filename));
      fs.promises.unlink(filePath).catch(() => {});
    }
    flash(req, "success", "File deleted.");
    res.redirect("/admin/media");
  } catch (err) { next(err); }
};

// ---------- Pages (editable content + SEO) ----------

exports.pages = async (req, res, next) => {
  try {
    const pages = await Page.all();
    res.render("admin/pages", { title: "Pages", nav: "pages", pages });
  } catch (err) { next(err); }
};

exports.pageForm = async (req, res, next) => {
  try {
    const page = await Page.findByKey(req.params.key);
    if (!page) {
      flash(req, "error", "Page not found.");
      return res.redirect("/admin/pages");
    }
    res.render("admin/page-form", { title: `Edit: ${page.title}`, nav: "pages", page });
  } catch (err) { next(err); }
};

exports.pageUpdate = async (req, res, next) => {
  try {
    const page = await Page.findByKey(req.params.key);
    if (!page) {
      flash(req, "error", "Page not found.");
      return res.redirect("/admin/pages");
    }
    // Rebuild the content JSON from fields named content__<key>,
    // keeping only keys that already exist on the page (no arbitrary injection).
    const content = {};
    for (const key of Object.keys(page.content)) {
      const field = `content__${key}`;
      content[key] = field in req.body ? String(req.body[field]) : page.content[key];
    }
    await Page.update(page.page_key, {
      title: String(req.body.title || page.title).trim().slice(0, 255),
      meta_title: String(req.body.meta_title || "").trim().slice(0, 255),
      meta_description: String(req.body.meta_description || "").trim().slice(0, 500),
      meta_keywords: String(req.body.meta_keywords || "").trim().slice(0, 500),
      canonical_url: String(req.body.canonical_url || "").trim().slice(0, 500),
      content,
    });
    flash(req, "success", "Page saved.");
    res.redirect(`/admin/pages/${page.page_key}`);
  } catch (err) { next(err); }
};

// ---------- Settings ----------

exports.settings = async (req, res, next) => {
  try {
    const values = await Setting.all();
    res.render("admin/settings", { title: "Site Settings", nav: "settings", values });
  } catch (err) { next(err); }
};

exports.settingsUpdate = async (req, res, next) => {
  try {
    const allowed = [
      "site_name", "tagline",
      "email_primary", "email_sales", "email_press",
      "phone_primary", "phone_secondary",
      "address_canada", "address_bd",
      "main_office_phone", "main_office_email",
      "footer_about_text", "working_hours",
      "facebook_url", "twitter_url", "instagram_url",
    ];
    const values = {};
    for (const key of allowed) {
      if (key in req.body) values[key] = String(req.body[key]).trim();
    }

    // ----- SMTP -----
    values.smtp_enabled = req.body.smtp_enabled ? "1" : "0";
    values.smtp_secure = req.body.smtp_secure ? "1" : "0";
    values.smtp_debug = req.body.smtp_debug ? "1" : "0";
    values.smtp_host = String(req.body.smtp_host || "").trim().slice(0, 190);
    values.smtp_port = String(Number(req.body.smtp_port) || 587);
    values.smtp_user = String(req.body.smtp_user || "").trim().slice(0, 190);
    values.smtp_from_name = String(req.body.smtp_from_name || "").trim().slice(0, 150);
    values.smtp_from_email = String(req.body.smtp_from_email || "").trim().slice(0, 190);
    // Password field is left blank in the form when a password is already saved
    // (so it never round-trips to the browser). Only overwrite it if the admin typed a new one.
    // Google App Passwords are displayed with spaces for readability — strip them so a
    // copy-paste doesn't silently break auth.
    const newPassword = String(req.body.smtp_password || "").replace(/\s+/g, "");
    if (newPassword) values.smtp_password = newPassword;

    await Setting.setMany(values);
    invalidateSettingsCache();
    mailer.invalidate();
    flash(req, "success", "Settings saved.");
    res.redirect("/admin/settings");
  } catch (err) { next(err); }
};

exports.settingsTestEmail = async (req, res, next) => {
  try {
    const to = String(req.body.test_email || "").trim() || undefined;
    await mailer.verifyAndSendTest(to);
    flash(req, "success", `Test email sent successfully${to ? ` to ${to}` : ""}.`);
  } catch (err) {
    flash(req, "error", `SMTP test failed: ${err.message}`);
  }
  res.redirect("/admin/settings");
};

// ---------- Contact messages ----------

exports.messages = async (req, res, next) => {
  try {
    const items = await Message.all();
    res.render("admin/messages", { title: "Messages", nav: "messages", items });
  } catch (err) { next(err); }
};

exports.messageRead = async (req, res, next) => {
  try {
    await Message.markRead(req.params.id);
    res.redirect("/admin/messages");
  } catch (err) { next(err); }
};

exports.messageDestroy = async (req, res, next) => {
  try {
    await Message.remove(req.params.id);
    flash(req, "success", "Message deleted.");
    res.redirect("/admin/messages");
  } catch (err) { next(err); }
};

// ---------- Subscribers ----------

exports.subscribers = async (req, res, next) => {
  try {
    const items = await Subscriber.all();
    res.render("admin/subscribers", { title: "Subscribers", nav: "subscribers", items });
  } catch (err) { next(err); }
};

exports.subscriberDestroy = async (req, res, next) => {
  try {
    await Subscriber.remove(req.params.id);
    flash(req, "success", "Subscriber removed.");
    res.redirect("/admin/subscribers");
  } catch (err) { next(err); }
};
