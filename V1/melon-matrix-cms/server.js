require("dotenv").config();
const path = require("path");
const express = require("express");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const helmet = require("helmet");

const { locals } = require("./middleware/locals");
const siteRoutes = require("./routes/site");
const blogRoutes = require("./routes/blog");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const isProd = process.env.NODE_ENV === "production";

// Behind a reverse proxy (nginx etc.) trust X-Forwarded-* so secure cookies work.
if (isProd) app.set("trust proxy", 1);

// ---------- Security headers ----------
// CSP is disabled because the theme loads Google Fonts and the admin uses a CDN editor;
// tighten this once you self-host those assets.
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

// ---------- Views ----------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ---------- Static files ----------
const year = 1000 * 60 * 60 * 24 * 365;
app.use(express.static(path.join(__dirname, "public"), { maxAge: isProd ? year : 0 }));
app.use("/uploads", express.static(path.join(__dirname, "uploads"), { maxAge: isProd ? year : 0 }));

// ---------- Body parsing ----------
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(express.json({ limit: "1mb" }));

// ---------- Sessions (stored in MySQL) ----------
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "melon_matrix",
  createDatabaseTable: true,
});

app.use(
  session({
    name: "mm.sid",
    secret: process.env.SESSION_SECRET || "dev-secret-change-me",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      maxAge: 1000 * 60 * 60 * 8, // 8 hours
    },
  })
);

// ---------- Shared locals (settings, flash, site URL) ----------
app.use(locals);

// ---------- Routes ----------
app.use("/", siteRoutes);
app.use("/blog", blogRoutes);
app.use("/admin", adminRoutes);

// ---------- 404 ----------
app.use((req, res) => {
  res.status(404).render("site/404", {
    active: null,
    meta: {
      title: "Page Not Found — Melon Matrix",
      description: "",
      keywords: "",
      canonical: "",
      ogImage: `${res.locals.siteUrl}/assets/logo.png`,
      ogType: "website",
      noindex: true,
    },
  });
});

// ---------- Error handler ----------
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  // Multer / upload errors surface as friendly flashes when possible.
  if (req.session && err && err.message && /image files/i.test(err.message)) {
    req.session.flash = { type: "error", text: err.message };
    return res.redirect(req.get("referer") || "/admin");
  }
  res.status(500);
  if (req.path.startsWith("/admin")) {
    return res.send("Something went wrong. Check the server logs.");
  }
  res.render("site/404", {
    active: null,
    meta: {
      title: "Something went wrong — Melon Matrix",
      description: "",
      keywords: "",
      canonical: "",
      ogImage: `${res.locals.siteUrl || ""}/assets/logo.png`,
      ogType: "website",
      noindex: true,
    },
  });
});

app.listen(PORT, () => {
  console.log(`✔ Melon Matrix running at http://localhost:${PORT}`);
  console.log(`  Admin panel:            http://localhost:${PORT}/admin`);
});
