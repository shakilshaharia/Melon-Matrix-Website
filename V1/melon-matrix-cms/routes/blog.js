const express = require("express");
const router = express.Router();
const blog = require("../controllers/blogController");

router.get("/", blog.index);
router.get("/api/posts", blog.apiPosts);
router.get("/category/:slug", blog.category);
router.get("/:slug", blog.single);

module.exports = router;
