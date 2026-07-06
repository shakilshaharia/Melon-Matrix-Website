const path = require("path");
const crypto = require("crypto");
const express = require("express");
const multer = require("multer");
const rateLimit = require("express-rate-limit");

const { requireAuth, guestOnly } = require("../middleware/auth");
const auth = require("../controllers/authController");
const admin = require("../controllers/adminController");
const posts = require("../controllers/adminPostController");

const router = express.Router();

// ---------- Uploads (images only) ----------
const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "uploads"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`);
  },
});
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]);
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter: (req, file, cb) => {
    if (IMAGE_TYPES.has(file.mimetype)) return cb(null, true);
    cb(new Error("Only image files (jpg, png, gif, webp, svg) are allowed."));
  },
});

// ---------- Auth ----------
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many login attempts. Try again in 15 minutes.",
});

router.get("/login", guestOnly, auth.loginForm);
router.post("/login", loginLimiter, guestOnly, auth.login);
router.post("/logout", requireAuth, auth.logout);

// Everything below requires a logged-in admin.
router.use(requireAuth);

// ---------- Dashboard ----------
router.get("/", admin.dashboard);

// ---------- Posts ----------
router.get("/posts", posts.list);
router.get("/posts/new", posts.createForm);
router.post("/posts", upload.single("featured_upload"), posts.create);
router.get("/posts/:id/edit", posts.editForm);
router.post("/posts/:id", upload.single("featured_upload"), posts.update);
router.post("/posts/:id/delete", posts.destroy);

// ---------- Categories & tags ----------
router.get("/categories", posts.categories);
router.post("/categories", posts.categoryCreate);
router.post("/categories/:id", posts.categoryUpdate);
router.post("/categories/:id/delete", posts.categoryDestroy);

router.get("/tags", posts.tags);
router.post("/tags", posts.tagCreate);
router.post("/tags/:id/delete", posts.tagDestroy);

// ---------- Media ----------
router.get("/media", admin.media);
router.get("/media/json", admin.mediaJson);
router.post("/media/upload", upload.array("files", 12), admin.mediaUpload);
router.post("/media/:id/delete", admin.mediaDestroy);

// ---------- Pages ----------
router.get("/pages", admin.pages);
router.get("/pages/:key", admin.pageForm);
router.post("/pages/:key", admin.pageUpdate);

// ---------- Settings ----------
router.get("/settings", admin.settings);
router.post("/settings", admin.settingsUpdate);
router.post("/settings/test-email", admin.settingsTestEmail);

// ---------- Messages & subscribers ----------
router.get("/messages", admin.messages);
router.post("/messages/:id/read", admin.messageRead);
router.post("/messages/:id/delete", admin.messageDestroy);

router.get("/subscribers", admin.subscribers);
router.post("/subscribers/:id/delete", admin.subscriberDestroy);

module.exports = router;
