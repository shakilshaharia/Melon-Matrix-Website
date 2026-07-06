const Page = require("../models/Page");
const Post = require("../models/Post");
const Category = require("../models/Category");
const Message = require("../models/Message");
const Subscriber = require("../models/Subscriber");
const mailer = require("../utils/mailer");

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Build the meta object every page passes to the head partial.
function pageMeta(page, siteUrl, path) {
  return {
    title: page.meta_title || page.title,
    description: page.meta_description || "",
    keywords: page.meta_keywords || "",
    canonical: page.canonical_url || `${siteUrl}${path}`,
    ogImage: `${siteUrl}/assets/logo.png`,
    ogType: "website",
  };
}

exports.home = async (req, res, next) => {
  try {
    const page = await Page.findByKey("home");
    const meta = pageMeta(page, res.locals.siteUrl, "/");
    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: res.locals.settings.site_name || "Melon Matrix",
      url: res.locals.siteUrl,
      logo: `${res.locals.siteUrl}/assets/logo.png`,
      email: res.locals.settings.email_primary || undefined,
      telephone: res.locals.settings.phone_primary || undefined,
    };
    res.render("site/home", { active: "home", content: page.content, meta, schema });
  } catch (err) { next(err); }
};

exports.about = async (req, res, next) => {
  try {
    const page = await Page.findByKey("about");
    const meta = pageMeta(page, res.locals.siteUrl, "/about");
    res.render("site/about", { active: "about", content: page.content, meta, schema: null });
  } catch (err) { next(err); }
};

exports.contact = async (req, res, next) => {
  try {
    const page = await Page.findByKey("contact");
    const meta = pageMeta(page, res.locals.siteUrl, "/contact");
    res.render("site/contact", { active: "contact", content: page.content, meta, schema: null });
  } catch (err) { next(err); }
};

exports.contactSubmit = async (req, res) => {
  try {
    const { name = "", email = "", phone = "", company = "", service = "", budget = "", message = "" } = req.body;
    if (!name.trim() || !/.+@.+\..+/.test(email) || !message.trim()) {
      return res.status(422).json({ ok: false, error: "Please fill in your name, a valid email, and a message." });
    }
    const clean = {
      name: name.trim().slice(0, 150),
      email: email.trim().slice(0, 190),
      phone: phone.trim().slice(0, 50),
      company: company.trim().slice(0, 150),
      service: service.trim().slice(0, 100),
      budget: budget.trim().slice(0, 100),
      message: message.trim().slice(0, 5000),
    };
    await Message.create(clean);
    res.json({ ok: true });

    // Best-effort notification email — never blocks or fails the response to the visitor.
    const rows = [
      ["Name", clean.name],
      ["Email", clean.email],
      ["Phone", clean.phone],
      ["Company", clean.company],
      ["Service", clean.service],
      ["Budget", clean.budget],
    ].filter(([, v]) => v);
    const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n") + `\n\nMessage:\n${clean.message}`;
    const html =
      `<h2>New contact form submission</h2>` +
      `<table cellpadding="6">${rows.map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${escapeHtml(v)}</td></tr>`).join("")}</table>` +
      `<p><strong>Message:</strong><br />${escapeHtml(clean.message).replace(/\n/g, "<br />")}</p>`;
    mailer
      .sendMail({ subject: `New contact form submission — ${clean.name}`, text, html, replyTo: clean.email })
      .then((result) => {
        if (!result.sent) console.error("contact notification email failed:", result.reason);
      })
      .catch((err) => console.error("contact notification email failed:", err.message));
  } catch (err) {
    console.error("contactSubmit:", err);
    res.status(500).json({ ok: false, error: "Something went wrong. Please try again." });
  }
};

exports.subscribe = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim();
    if (!/.+@.+\..+/.test(email)) {
      return res.status(422).json({ ok: false, error: "Please enter a valid email address." });
    }
    await Subscriber.create(email.slice(0, 190));
    res.json({ ok: true });
  } catch (err) {
    console.error("subscribe:", err);
    res.status(500).json({ ok: false, error: "Something went wrong. Please try again." });
  }
};

exports.sitemap = async (req, res, next) => {
  try {
    const siteUrl = res.locals.siteUrl;
    const staticUrls = [
      { loc: `${siteUrl}/`, priority: "1.0" },
      { loc: `${siteUrl}/about`, priority: "0.8" },
      { loc: `${siteUrl}/contact`, priority: "0.8" },
      { loc: `${siteUrl}/blog`, priority: "0.9" },
    ];
    const categories = await Category.allWithCounts();
    const posts = await Post.findPublished({ limit: 5000, offset: 0 });

    const urls = [
      ...staticUrls,
      ...categories
        .filter((c) => c.post_count > 0)
        .map((c) => ({ loc: `${siteUrl}/blog/category/${c.slug}`, priority: "0.6" })),
      ...posts.map((p) => ({
        loc: `${siteUrl}/blog/${p.slug}`,
        lastmod: (p.updated_at || p.published_at || new Date()).toISOString().slice(0, 10),
        priority: "0.7",
      })),
    ];

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls
        .map((u) => {
          const lastmod = u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : "";
          return `  <url><loc>${u.loc}</loc>${lastmod}<priority>${u.priority}</priority></url>`;
        })
        .join("\n") +
      `\n</urlset>`;

    res.type("application/xml").send(xml);
  } catch (err) { next(err); }
};

exports.robots = (req, res) => {
  res.type("text/plain").send(
    ["User-agent: *", "Disallow: /admin", "", `Sitemap: ${res.locals.siteUrl}/sitemap.xml`, ""].join("\n")
  );
};
