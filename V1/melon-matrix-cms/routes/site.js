const express = require("express");
const router = express.Router();
const site = require("../controllers/siteController");

router.get("/", site.home);
router.get("/about", site.about);
router.get("/contact", site.contact);
router.post("/contact", site.contactSubmit);
router.post("/subscribe", site.subscribe);
router.get("/sitemap.xml", site.sitemap);
router.get("/robots.txt", site.robots);

module.exports = router;
